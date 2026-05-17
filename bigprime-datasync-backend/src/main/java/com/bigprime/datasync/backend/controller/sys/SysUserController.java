package com.bigprime.datasync.backend.controller.sys;

import cn.hutool.core.util.StrUtil;
import com.bigprime.datasync.core.cache.TokenStoreCache;
import com.bigprime.datasync.core.model.*;
import com.bigprime.datasync.backend.service.sys.SysUserService;
import com.bigprime.datasync.backend.vo.sys.SysUserPasswordVO;
import com.bigprime.datasync.backend.vo.sys.SysUserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * @author lyw
 * @version 1.0
 */
@RestController
@RequestMapping("user")
@Tag(name="用户管理")
@AllArgsConstructor
public class SysUserController {
    private final SysUserService dataService;
    private final PasswordEncoder passwordEncoder;
    private final TokenStoreCache tokenStoreCache;

    @PostMapping("page")
    @Operation(summary = "根据条件获取分页数据")
    public Result<MyPageResult<SysUserVO>> page(@RequestBody BaseQuery query){
        return Result.ok(dataService.getPage(query));
    }

    @GetMapping("list")
    @Operation(summary = "获取全部")
    public Result<List<SysUserVO>> getList(){
        return Result.ok(dataService.getList());
    }

    @PutMapping("password")
    @Operation(summary = "修改密码")
    public Result<Boolean> password(@RequestBody SysUserPasswordVO vo) {
        // 原密码不正确
        UserDetail user = SecurityUser.getUser();
        if (!passwordEncoder.matches(vo.getPassword(), user.getPassword())) {
            return Result.ok(false);
        }
        return Result.ok(dataService.updatePassword(user.getId(), passwordEncoder.encode(vo.getNewPassword())) > 0);
    }

    @PostMapping("save")
    @Operation(summary = "保存数据")
    public Result<Boolean> save(@RequestBody SysUserVO vo){
        if (StrUtil.isBlank(vo.getPassword())) {
            vo.setPassword("123456");
        }
        //密码加密
        vo.setPassword(passwordEncoder.encode(vo.getPassword()));
        return Result.ok(dataService.save(vo) > 0);
    }

    @PostMapping("update")
    @Operation(summary = "更新数据")
    public Result<Boolean> update(@RequestBody SysUserVO vo){
        return Result.ok(dataService.update(vo) > 0);
    }

    @DeleteMapping("{id}")
    @Operation(summary = "根据ID删除数据")
    public Result<Boolean> delete(@PathVariable("id") Long id)
    {
        return Result.ok(dataService.delete(id) > 0);
    }

    @GetMapping("{id}")
    @Operation(summary = "根据Id获取数据")
    public Result<SysUserVO> getById(@PathVariable("id") Long id){
        return Result.ok(dataService.getById(id));
    }

    @GetMapping("username/{name}")
    @Operation(summary = "根据UserName获取数据")
    public UserDetail getByUserName(@PathVariable("name") String name){
        return dataService.getByUserName(name);
    }

    @GetMapping("token/{token}")
    @Operation(summary = "根据UserName获取数据")
    public UserDetail getByToken(@PathVariable("token") String token){
        UserDetail user = tokenStoreCache.getUser(token);
        return user;
    }
}
