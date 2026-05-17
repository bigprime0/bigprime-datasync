package com.bigprime.datasync.backend.controller.sys;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.core.model.SecurityUser;
import com.bigprime.datasync.core.model.SysMenuVO;
import com.bigprime.datasync.backend.service.sys.SysMenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * @author lyw
 * @version 1.0
 */
@RestController
@RequestMapping("menu")
@Tag(name = "菜单管理")
@AllArgsConstructor
public class SysMenuController {
    private final SysMenuService dataService;

    @GetMapping("get-menus/{type}")
    @Operation(summary = "菜单")
    public Result<List<SysMenuVO>> getMenus(@PathVariable("type") Integer type) {
        return Result.ok(dataService.getUserMenuList(SecurityUser.getUser(), type));
    }

    @PostMapping("save")
    @Operation(summary = "保存数据")
    public Result<Boolean> save(@RequestBody SysMenuVO vo) {
        return Result.ok(dataService.save(vo) > 0);
    }

    @PostMapping("update")
    @Operation(summary = "更新数据")
    public Result<Boolean> update(@RequestBody SysMenuVO vo) {
        return Result.ok(dataService.update(vo) > 0);
    }

    @DeleteMapping("{id}")
    @Operation(summary = "删除")
    public Result<Boolean> delete(@PathVariable("id") Long id) {
        return Result.ok(dataService.delete(id) > 0);
    }
}
