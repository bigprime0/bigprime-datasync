package com.bigprime.datasync.backend.python.controller;

import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.python.entity.PythonWorkspaceEntity;
import com.bigprime.datasync.backend.python.service.PythonWorkspaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
/**
 * Python Workspace 管理 API 控制器
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/python/workspace")
@Tag(name = "Python Workspace 管理")
@AllArgsConstructor
public class PythonWorkspaceController {

    private final PythonWorkspaceService workspaceService;

    /**
     * 创建 Workspace
     */
    @PostMapping("/create")
    @Operation(summary = "创建 Workspace")
    public Result<PythonWorkspaceEntity> createWorkspace(@RequestBody Map<String, Object> params) {
        try {
            String name = params.getOrDefault("name", "").toString();
            String description = params.getOrDefault("description", "").toString();

            if (name.isEmpty()) {
                return Result.error("Workspace 名称不能为空");
            }

            PythonWorkspaceEntity workspace = workspaceService.createWorkspace(name, description);
            return Result.ok(workspace);
        } catch (Exception e) {
            log.error("创建 Workspace 失败", e);
            return Result.error("创建 Workspace 失败: " + e.getMessage());
        }
    }

    /**
     * 更新 Workspace
     */
    @PostMapping("/update")
    @Operation(summary = "更新 Workspace")
    public Result<PythonWorkspaceEntity> updateWorkspace(@RequestBody Map<String, Object> params) {
        try {
            String id = params.getOrDefault("id", "").toString();
            String name = params.getOrDefault("name", "").toString();
            String description = params.getOrDefault("description", "").toString();

            if (id.isEmpty()) {
                return Result.error("Workspace ID 不能为空");
            }
            if (name.isEmpty()) {
                return Result.error("Workspace 名称不能为空");
            }

            PythonWorkspaceEntity workspace = workspaceService.updateWorkspace(id, name, description);
            return Result.ok(workspace);
        } catch (Exception e) {
            log.error("更新 Workspace 失败", e);
            return Result.error("更新 Workspace 失败: " + e.getMessage());
        }
    }

    /**
     * 删除 Workspace
     */
    @DeleteMapping("/delete/{id}")
    @Operation(summary = "删除 Workspace")
    public Result<Long> deleteWorkspace(@PathVariable String id) {
        try {
            workspaceService.deleteWorkspace(id);
            return Result.ok(1L);
        } catch (Exception e) {
            log.error("删除 Workspace 失败", e);
            return Result.error("删除 Workspace 失败: " + e.getMessage());
        }
    }

    /**
     * 获取 Workspace 详情
     */
    @GetMapping("/get/{id}")
    @Operation(summary = "获取 Workspace 详情")
    public Result<PythonWorkspaceEntity> getWorkspace(@PathVariable String id) {
        try {
            PythonWorkspaceEntity workspace = workspaceService.getWorkspace(id);
            return Result.ok(workspace);
        } catch (Exception e) {
            log.error("获取 Workspace 详情失败", e);
            return Result.error("获取 Workspace 详情失败: " + e.getMessage());
        }
    }

    /**
     * 分页查询 Workspace 列表
     */
    @PostMapping("/list")
    @Operation(summary = "分页查询 Workspace 列表")
    public Result<MyPageResult<PythonWorkspaceEntity>> listWorkspaces(@RequestBody Map<String, Object> params) {
        try {
            String search = params.getOrDefault("search", "").toString();
            Integer page = 1;
            Integer limit = 10;

            try {
                page = Integer.parseInt(params.getOrDefault("page", 1).toString());
                limit = Integer.parseInt(params.getOrDefault("pageSize", 10).toString());
            } catch (NumberFormatException e) {
                log.warn("分页参数无效，使用默认值: page=1, pageSize=10");
            }

            MyPageResult<PythonWorkspaceEntity> result = workspaceService.listWorkspaces(search, page, limit);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("获取 Workspace 列表失败", e);
            return Result.error("获取 Workspace 列表失败: " + e.getMessage());
        }
    }

    /**
     * 查询所有 Workspace（不分页）
     */
    @GetMapping("/listAll")
    @Operation(summary = "查询所有 Workspace")
    public Result<List<PythonWorkspaceEntity>> listAllWorkspaces() {
        try {
            List<PythonWorkspaceEntity> list = workspaceService.listAllWorkspaces();
            return Result.ok(list);
        } catch (Exception e) {
            log.error("获取 Workspace 列表失败", e);
            return Result.error("获取 Workspace 列表失败: " + e.getMessage());
        }
    }

    /**
     * 保存代码到 Workspace 文件
     */
    @PostMapping("/save-code/{workspaceId}")
    @Operation(summary = "保存代码")
    public Result<String> saveCode(@PathVariable String workspaceId,
                                   @RequestBody Map<String, Object> params) {
        try {
            String filename = params.getOrDefault("filename", "main.py").toString();
            String content = params.getOrDefault("content", "").toString();
            workspaceService.saveCode(workspaceId, filename, content);
            return Result.ok("保存成功");
        } catch (Exception e) {
            log.error("保存代码失败: workspaceId={}", workspaceId, e);
            return Result.error("保存代码失败: " + e.getMessage());
        }
    }

    /**
     * 从 Workspace 文件加载代码
     */
    @GetMapping("/load-code/{workspaceId}")
    @Operation(summary = "加载代码")
    public Result<String> loadCode(@PathVariable String workspaceId,
                                   @RequestParam(defaultValue = "main.py") String filename) {
        try {
            String content = workspaceService.loadCode(workspaceId, filename);
            return Result.ok(content);
        } catch (Exception e) {
            log.error("加载代码失败: workspaceId={}", workspaceId, e);
            return Result.error("加载代码失败: " + e.getMessage());
        }
    }

    /**
     * 删除 Workspace 下的代码文件
     */
    @DeleteMapping("/delete-code/{workspaceId}")
    @Operation(summary = "删除代码文件")
    public Result<String> deleteCode(@PathVariable String workspaceId,
                                     @RequestParam String filename) {
        try {
            workspaceService.deleteCode(workspaceId, filename);
            return Result.ok("删除成功");
        } catch (Exception e) {
            log.error("删除代码文件失败: workspaceId={}", workspaceId, e);
            return Result.error("删除文件失败: " + e.getMessage());
        }
    }

    /**
     * 重命名 Workspace 下的代码文件
     */
    @PostMapping("/rename-code/{workspaceId}")
    @Operation(summary = "重命名代码文件")
    public Result<String> renameCode(@PathVariable String workspaceId,
                                     @RequestBody Map<String, Object> params) {
        try {
            String oldName = params.getOrDefault("oldName", "").toString();
            String newName = params.getOrDefault("newName", "").toString();
            if (oldName.isEmpty() || newName.isEmpty()) {
                return Result.error("文件名不能为空");
            }
            workspaceService.renameCode(workspaceId, oldName, newName);
            return Result.ok("重命名成功");
        } catch (Exception e) {
            log.error("重命名代码文件失败: workspaceId={}", workspaceId, e);
            return Result.error("重命名失败: " + e.getMessage());
        }
    }

    /**
     * 列出 Workspace 下的文件树
     */
    @GetMapping("/list-files/{workspaceId}")
    @Operation(summary = "列出文件树")
    public Result<List<Map<String, Object>>> listFiles(@PathVariable String workspaceId) {
        try {
            return Result.ok(workspaceService.listFiles(workspaceId));
        } catch (Exception e) {
            log.error("列出文件失败: workspaceId={}", workspaceId, e);
            return Result.error("列出文件失败: " + e.getMessage());
        }
    }

    /**
     * 在 Workspace 下创建新 .py 文件
     */
    @PostMapping("/create-file/{workspaceId}")
    @Operation(summary = "创建文件")
    public Result<String> createFile(@PathVariable String workspaceId,
                                     @RequestBody Map<String, Object> params) {
        try {
            String path = params.getOrDefault("path", "").toString();
            if (path.isEmpty()) return Result.error("路径不能为空");
            workspaceService.createFile(workspaceId, path);
            return Result.ok("创建成功");
        } catch (Exception e) {
            log.error("创建文件失败: workspaceId={}", workspaceId, e);
            return Result.error("创建文件失败: " + e.getMessage());
        }
    }

    /**
     * 在 Workspace 下创建 Python 包（目录 + __init__.py）
     */
    @PostMapping("/create-package/{workspaceId}")
    @Operation(summary = "创建 Python 包")
    public Result<String> createPackage(@PathVariable String workspaceId,
                                        @RequestBody Map<String, Object> params) {
        try {
            String path = params.getOrDefault("path", "").toString();
            if (path.isEmpty()) return Result.error("包名不能为空");
            workspaceService.createPackage(workspaceId, path);
            return Result.ok("创建成功");
        } catch (Exception e) {
            log.error("创建包失败: workspaceId={}", workspaceId, e);
            return Result.error("创建包失败: " + e.getMessage());
        }
    }
}
