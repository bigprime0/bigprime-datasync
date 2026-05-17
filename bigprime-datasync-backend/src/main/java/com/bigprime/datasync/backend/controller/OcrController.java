package com.bigprime.datasync.backend.controller;

import com.bigprime.action.impl.ocr.*;
import com.bigprime.datasync.core.model.Result;
import com.jiajia.common_object.Box;
import com.jiajia.common_object.Layout;
import com.jiajia.common_object.TableResult;
import com.jiajia.common_object.Text;
import com.jiajia.core.JiaJiaOCR;
import com.jiajia.common_object.PdfConvert;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

/**
 * OCR文档解析接口
 * 基于JiaJiaOCR，提供文件上传即时识别能力（所见即得UI使用）
 * 支持通用OCR、手写OCR、版面检测、表格识别、PDF识别
 *
 * @author bigprime
 */
@Slf4j
@RestController
@RequestMapping("/ocr")
@Tag(name = "OCR文档解析")
public class OcrController {

    /** 临时文件上传目录 */
    @Value("${ocr.upload.tmp-dir:${user.dir}/data/ocr-tmp}")
    private String tmpDir;

    // ========================= 通用OCR识别 =========================

    /**
     * 上传图片，执行通用OCR文字识别（印刷体）
     */
    @PostMapping("/recognize")
    @Operation(summary = "通用OCR文字识别", description = "上传图片（jpg/png/bmp/tiff），返回识别文本及坐标")
    public Result<?> recognize(
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "JSON") String outputFormat) {

        Path tmpFile = null;
        try {
            tmpFile = saveUploadedFile(file);
            JiaJiaOCR jiaJiaOCR = JiaJiaOCR.builder();
            List<Pair<Text, Box>> resultList = jiaJiaOCR.recognizeGeneralText(tmpFile.toString());
            return Result.ok(buildOcrResult(resultList, outputFormat));
        } catch (Exception e) {
            log.error("[OCR] 识别异常", e);
            return Result.error("OCR识别失败: " + e.getMessage());
        } finally {
            deleteTmpFile(tmpFile);
        }
    }

    /**
     * 上传图片，执行手写OCR识别
     */
    @PostMapping("/recognize/handwritten")
    @Operation(summary = "手写OCR识别", description = "上传手写图片，返回识别文本及坐标")
    public Result<?> recognizeHandwritten(
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "JSON") String outputFormat) {

        Path tmpFile = null;
        try {
            tmpFile = saveUploadedFile(file);
            JiaJiaOCR jiaJiaOCR = JiaJiaOCR.builder();
            List<Pair<Text, Box>> resultList = jiaJiaOCR.recognizeHandwrittenText(tmpFile.toString());
            return Result.ok(buildOcrResult(resultList, outputFormat));
        } catch (Exception e) {
            log.error("[OCR] 手写识别异常", e);
            return Result.error("手写OCR识别失败: " + e.getMessage());
        } finally {
            deleteTmpFile(tmpFile);
        }
    }

    // ========================= 表格识别 =========================

    /**
     * 上传图片，执行表格检测+识别（一站式）
     */
    @PostMapping("/table-extract")
    @Operation(summary = "表格检测与识别", description = "从图片中检测并识别表格，输出HTML格式结构化数据")
    public Result<?> tableExtract(
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "HTML") String outputFormat) {

        Path tmpFile = null;
        try {
            tmpFile = saveUploadedFile(file);
            JiaJiaOCR jiaJiaOCR = JiaJiaOCR.builder();
            List<TableResult> tableResults = jiaJiaOCR.recognizeTables(tmpFile.toString());

            if (tableResults == null || tableResults.isEmpty()) {
                return Result.ok(Map.of("tableCount", 0, "tables", List.of()));
            }

            List<Map<String, Object>> tables = new ArrayList<>();
            for (TableResult tr : tableResults) {
                Map<String, Object> table = new LinkedHashMap<>();
                table.put("htmlContent", tr.getHtml());
                List<float[]> cellBoxes = tr.getCellBoxes();
                if (cellBoxes != null) {
                    table.put("cellCount", cellBoxes.size());
                }
                tables.add(table);
            }

            if ("HTML".equalsIgnoreCase(outputFormat)) {
            StringBuilder sb = new StringBuilder();
                for (Map<String, Object> t : tables) {
                    sb.append(t.get("htmlContent")).append("\n");
                }
                return Result.ok(sb.toString().trim());
            }

            return Result.ok(Map.of("tableCount", tables.size(), "tables", tables));

        } catch (Exception e) {
            log.error("[TABLE] 提取异常", e);
            return Result.error("表格识别失败: " + e.getMessage());
        } finally {
            deleteTmpFile(tmpFile);
        }
    }

    // ========================= 版面分析 =========================

    /**
     * 上传图片，执行版面分析（识别标题、段落、图片、表格等版面元素）
     */
    @PostMapping("/layout-analysis")
    @Operation(summary = "文档版面分析", description = "分析图片版面结构，识别标题、段落、表格等元素及坐标")
    public Result<?> layoutAnalysis(@RequestPart("file") MultipartFile file) {
        Path tmpFile = null;
        try {
            tmpFile = saveUploadedFile(file);
            JiaJiaOCR jiaJiaOCR = JiaJiaOCR.builder();
            List<Layout> layoutList = jiaJiaOCR.detectLayout(tmpFile.toString());

            if (layoutList == null || layoutList.isEmpty()) {
                return Result.ok(Map.of("elementCount", 0, "elements", List.of()));
            }

            List<Map<String, Object>> elements = new ArrayList<>();
            for (Layout layout : layoutList) {
                Map<String, Object> element = new LinkedHashMap<>();
                element.put("label", layout.getLabel());
                element.put("confidence", layout.getConfidence());
                float[] bbox = layout.getBbox();
                if (bbox != null && bbox.length >= 4) {
                    element.put("bbox", Map.of("x1", bbox[0], "y1", bbox[1], "x2", bbox[2], "y2", bbox[3]));
                }
                elements.add(element);
            }

            return Result.ok(Map.of("elementCount", elements.size(), "elements", elements));

        } catch (Exception e) {
            log.error("[LAYOUT] 分析异常", e);
            return Result.error("版面分析失败: " + e.getMessage());
        } finally {
            deleteTmpFile(tmpFile);
        }
    }

    // ========================= PDF识别 =========================

    /**
     * 上传PDF文件，每页转图片后OCR识别
     */
    @PostMapping("/recognize/pdf")
    @Operation(summary = "PDF文字识别", description = "上传PDF文件，逐页转图片后进行OCR识别")
    public Result<?> recognizePdf(
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "JSON") String outputFormat) {

        Path tmpFile = null;
        Path pdfImgDir = null;
        try {
            tmpFile = saveUploadedFile(file, ".pdf");
            // PDF转图片临时目录
            pdfImgDir = Files.createTempDirectory(Paths.get(tmpDir), "pdf_imgs_");

            List<String> imgPaths = PdfConvert.convertPdfToImages(
                    tmpFile.toString(), pdfImgDir.toString());

            if (imgPaths == null || imgPaths.isEmpty()) {
                return Result.error("PDF转换图片失败，请确认PDF文件是否有效");
            }

            JiaJiaOCR jiaJiaOCR = JiaJiaOCR.builder();
            List<Map<String, Object>> pages = new ArrayList<>();
            StringBuilder fullText = new StringBuilder();

            for (int i = 0; i < imgPaths.size(); i++) {
                List<Pair<Text, Box>> resultList = jiaJiaOCR.recognizeGeneralText(imgPaths.get(i));
                Map<String, Object> page = new LinkedHashMap<>();
                page.put("page", i + 1);
                Object pageData = buildOcrResult(resultList, outputFormat);
                if (pageData instanceof Map) {
                    page.putAll((Map<String, Object>) pageData);
                    fullText.append(((Map<?, ?>) pageData).get("text")).append("\n");
                } else {
                    page.put("text", pageData);
                    fullText.append(pageData).append("\n");
                }
                pages.add(page);
            }

            if ("TEXT".equalsIgnoreCase(outputFormat)) {
                return Result.ok(fullText.toString().trim());
            }
            return Result.ok(Map.of("pageCount", pages.size(), "fullText", fullText.toString().trim(), "pages", pages));

        } catch (Exception e) {
            log.error("[PDF OCR] 识别异常", e);
            return Result.error("PDF识别失败: " + e.getMessage());
        } finally {
            deleteTmpFile(tmpFile);
            deleteTmpDir(pdfImgDir);
        }
    }

    // ========================= 工具方法 =========================

    private Object buildOcrResult(List<Pair<Text, Box>> resultList, String outputFormat) {
        if (resultList == null || resultList.isEmpty()) {
            return Map.of("text", "", "blocks", List.of());
        }
        StringBuilder fullText = new StringBuilder();
        List<Map<String, Object>> blocks = new ArrayList<>();
        for (Pair<Text, Box> pair : resultList) {
            Text text = pair.getLeft();
            Box box = pair.getRight();
            fullText.append(text.getText()).append("\n");
            Map<String, Object> block = new LinkedHashMap<>();
            block.put("text", text.getText());
            // Text类只提供getText()，无置信度字段
            if (box != null) {
                block.put("box", box.toString());
            }
            blocks.add(block);
        }
        if ("TEXT".equalsIgnoreCase(outputFormat)) {
            return fullText.toString().trim();
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("text", fullText.toString().trim());
        result.put("blocks", blocks);
        result.put("blockCount", blocks.size());
        return result;
    }

    private Path saveUploadedFile(MultipartFile file) throws IOException {
        return saveUploadedFile(file, null);
    }

    private Path saveUploadedFile(MultipartFile file, String forceExt) throws IOException {
        String originalName = file.getOriginalFilename();
        String ext = forceExt != null ? forceExt : "";
        if (ext.isEmpty() && originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
        }
        Files.createDirectories(Paths.get(tmpDir));
        Path tmpFile = Files.createTempFile(Paths.get(tmpDir), "ocr_", ext);
        file.transferTo(tmpFile.toFile());
        return tmpFile;
    }

    private void deleteTmpFile(Path path) {
        if (path != null) {
            try { Files.deleteIfExists(path); } catch (IOException e) {
                log.warn("[OCR] 临时文件删除失败: {}", path);
            }
        }
    }

    private void deleteTmpDir(Path dir) {
        if (dir != null) {
            try {
                Files.walk(dir)
                    .sorted(Comparator.reverseOrder())
                    .forEach(p -> { try { Files.deleteIfExists(p); } catch (IOException ignored) {} });
            } catch (IOException e) {
                log.warn("[OCR] 临时目录删除失败: {}", dir);
            }
        }
    }
}
