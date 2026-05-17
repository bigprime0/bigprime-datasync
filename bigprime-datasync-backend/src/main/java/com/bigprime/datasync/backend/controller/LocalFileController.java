package com.bigprime.datasync.backend.controller;

import com.bigprime.datasync.core.model.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 本地文件管理接口
 * 为 SeaTunnel LocalFile Source/Sink 提供文件上传与目录查询支持
 *
 * 使用场景：
 * 1. 用户上传数据文件（CSV/Excel/JSON 等）到服务器 uploadfile 目录
 * 2. 在 SeaTunnel LocalFile Source 配置中填入 uploadfile 目录路径
 * 3. SeaTunnel 从该目录读取数据
 *
 * @author bigprime
 */
@Slf4j
@RestController
@RequestMapping("/api/localfile")
@Tag(name = "本地文件管理", description = "SeaTunnel LocalFile Source/Sink 文件上传管理")
public class LocalFileController {

    /**
     * 文件上传目录（服务器绝对路径）
     * 默认：${APP_HOME}/backend/data/uploadfile
     * 可通过 application.yml 的 bigprime.localfile.upload-dir 配置覆盖
     */
    @Value("${bigprime.localfile.upload-dir:${bigprime.data.path:${user.dir}/data}/uploadfile}")
    private String uploadDir;

    /**
     * 上传文件到服务器 uploadfile 目录
     *
     * 文件将保存为：{uploadDir}/{originalFilename}
     * 同名文件直接覆盖（保证路径可预测，方便 SeaTunnel 配置）
     */
    @PostMapping("/upload")
    @Operation(summary = "上传文件到 uploadfile 目录",
               description = "文件上传后可在 SeaTunnel LocalFile Source 中使用该目录路径读取数据")
    public Result<?> uploadFile(@RequestPart("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Result.error("上传文件不能为空");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            return Result.error("文件名不能为空");
        }

        // 安全过滤：防止路径穿越
        String safeName = Paths.get(originalFilename).getFileName().toString();

        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            Path destFile = uploadPath.resolve(safeName);
            file.transferTo(destFile.toFile());

            log.info("[LocalFile] 文件上传成功: {}", destFile.toAbsolutePath());

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("fileName", safeName);
            data.put("filePath", destFile.toAbsolutePath().toString());
            data.put("uploadDir", uploadPath.toAbsolutePath().toString());
            data.put("fileSize", Files.size(destFile));

            return Result.ok(data);

        } catch (IOException e) {
            log.error("[LocalFile] 文件上传失败: {}", safeName, e);
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }

    /**
     * 获取 uploadfile 目录路径
     * 前端在配置 LocalFile Source 时调用此接口获取服务器目录路径，自动填入 path 字段
     */
    @GetMapping("/uploaddir")
    @Operation(summary = "获取 uploadfile 目录路径",
               description = "返回服务器 uploadfile 目录的绝对路径，用于 SeaTunnel LocalFile Source 的 path 参数")
    public Result<?> getUploadDir() {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            Files.createDirectories(uploadPath);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("uploadDir", uploadPath.toString());

            // 同时列出当前目录下的文件
            List<Map<String, Object>> files = new ArrayList<>();
            if (Files.exists(uploadPath)) {
                try (Stream<Path> stream = Files.list(uploadPath)) {
                    files = stream
                            .filter(Files::isRegularFile)
                            .sorted(Comparator.comparing(p -> p.getFileName().toString()))
                            .map(p -> {
                                Map<String, Object> f = new LinkedHashMap<>();
                                f.put("name", p.getFileName().toString());
                                try {
                                    f.put("size", Files.size(p));
                                    f.put("lastModified", Files.getLastModifiedTime(p).toMillis());
                                } catch (IOException ignored) {}
                                return f;
                            })
                            .collect(Collectors.toList());
                }
            }
            data.put("files", files);
            data.put("fileCount", files.size());

            return Result.ok(data);

        } catch (IOException e) {
            log.error("[LocalFile] 获取上传目录失败", e);
            return Result.error("获取上传目录失败: " + e.getMessage());
        }
    }

    /**
     * 解析 CSV 文件的标题行，自动推断字段类型生成 SeaTunnel schema 字符串
     *
     * 返回格式：{ schemaFields: "id:int,name:string,amount:double" }
     * 类型推断顺序：尝试 int → long → double → 默认 string
     */
    @GetMapping("/parse-schema")
    @Operation(summary = "解析 CSV 标题生成 schema",
               description = "读取 uploadfile 目录下指定 CSV 文件的标题行，自动推断字段类型")
    public Result<?> parseCsvSchema(@RequestParam("fileName") String fileName,
                                    @RequestParam(value = "encoding", defaultValue = "UTF-8") String encoding) {
        String safeName = Paths.get(fileName).getFileName().toString();
        Path filePath = Paths.get(uploadDir).resolve(safeName);

        if (!Files.exists(filePath)) {
            return Result.error("文件不存在: " + safeName);
        }

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(Files.newInputStream(filePath),
                        encoding.isBlank() ? StandardCharsets.UTF_8 : java.nio.charset.Charset.forName(encoding)))) {

            // 读取标题行
            String headerLine = reader.readLine();
            if (headerLine == null || headerLine.isBlank()) {
                return Result.error("文件为空或没有标题行");
            }

            // 读取数据行（第二行）用于类型推断
            String dataLine = reader.readLine();

            // 自动检测分隔符
            String delimiter = detectDelimiter(headerLine);
            String[] headers = headerLine.split(delimiter, -1);
            String[] dataValues = dataLine != null ? dataLine.split(delimiter, -1) : new String[0];

            List<String> schemaList = new ArrayList<>();
            for (int i = 0; i < headers.length; i++) {
                String col = headers[i].trim().replaceAll("^\"|\"$", ""); // 去除可能的引号
                if (col.isEmpty()) continue;
                // 将列名中的空格替换为下划线
                String safCol = col.replaceAll("[^a-zA-Z0-9_\u4e00-\u9fa5]", "_");
                String type = "string";
                if (i < dataValues.length) {
                    type = inferType(dataValues[i].trim().replaceAll("^\"|\"$", ""));
                }
                schemaList.add(safCol + ":" + type);
            }

            String schemaFields = String.join(",", schemaList);
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("schemaFields", schemaFields);
            data.put("delimiter", delimiter);
            data.put("columnCount", headers.length);

            log.info("[LocalFile] 解析 CSV schema: {} -> {}", safeName, schemaFields);
            return Result.ok(data);

        } catch (Exception e) {
            log.error("[LocalFile] 解析 CSV schema 失败: {}", safeName, e);
            return Result.error("解析失败: " + e.getMessage());
        }
    }

    /** 自动检测 CSV 分隔符（逗号、分号、Tab） */
    private String detectDelimiter(String line) {
        int commas = countOccurrences(line, ',');
        int semicolons = countOccurrences(line, ';');
        int tabs = countOccurrences(line, '\t');
        if (tabs >= commas && tabs >= semicolons) return "\t";
        if (semicolons > commas) return ";";
        return ",";
    }

    private int countOccurrences(String s, char c) {
        int count = 0;
        for (char ch : s.toCharArray()) if (ch == c) count++;
        return count;
    }

    /** 类型推断： int → long → double → string */
    private String inferType(String value) {
        if (value == null || value.isEmpty()) return "string";
        try { Integer.parseInt(value); return "int"; } catch (NumberFormatException ignored) {}
        try { Long.parseLong(value); return "long"; } catch (NumberFormatException ignored) {}
        try { Double.parseDouble(value); return "double"; } catch (NumberFormatException ignored) {}
        return "string";
    }

    /**
     * 删除 uploadfile 目录下的指定文件
     */
    @DeleteMapping("/upload/{fileName}")
    @Operation(summary = "删除已上传文件", description = "删除 uploadfile 目录下的指定文件")
    public Result<?> deleteFile(@PathVariable String fileName) {
        // 安全过滤：防止路径穿越
        String safeName = Paths.get(fileName).getFileName().toString();

        try {
            Path targetFile = Paths.get(uploadDir).resolve(safeName);
            if (!Files.exists(targetFile)) {
                return Result.error("文件不存在: " + safeName);
            }

            Files.delete(targetFile);
            log.info("[LocalFile] 文件删除成功: {}", targetFile.toAbsolutePath());
            return Result.ok("文件删除成功");

        } catch (IOException e) {
            log.error("[LocalFile] 文件删除失败: {}", safeName, e);
            return Result.error("文件删除失败: " + e.getMessage());
        }
    }
}
