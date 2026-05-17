package com.bigprime.datasync.backend.controller.sys;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.handler.sys.model.SysOrgModel;
import com.bigprime.datasync.backend.service.sys.SysOrgService;
import com.bigprime.datasync.backend.vo.sys.SysOrgVO;
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
@RequestMapping("org")
@Tag(name="组织管理")
@AllArgsConstructor
public class SysOrgController {
    private final SysOrgService dataService;

    @GetMapping("get-list")
    @Operation(summary = "列表")
    public Result<List<SysOrgVO>> getList() {
        return Result.ok(dataService.getList());
    }

    @GetMapping("get-all")
    @Operation(summary = "所有数据")
    public Result<List<SysOrgModel>> getAll() {
        return Result.ok(dataService.getAll());
    }


    @PostMapping("save")
    @Operation(summary = "保存数据")
    public Result<Boolean> save(@RequestBody SysOrgVO vo){
        return Result.ok(dataService.save(vo) > 0);
    }

    @PostMapping("update")
    @Operation(summary = "更新数据")
    public Result<Boolean> update(@RequestBody SysOrgVO vo){
        return Result.ok(dataService.update(vo) > 0);
    }

    @DeleteMapping("{id}")
    @Operation(summary = "根据ID删除数据")
    public Result<Boolean> delete(@PathVariable("id") Long id){
        return Result.ok(dataService.delete(id) > 0);
    }
}
