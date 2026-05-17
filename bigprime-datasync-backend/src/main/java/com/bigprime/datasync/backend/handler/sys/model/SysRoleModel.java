package com.bigprime.datasync.backend.handler.sys.model;

import com.bigprime.datasync.core.model.BaseModel;
import com.bigprime.datasync.backend.handler.sys.model.proxy.SysRoleModelProxy;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 角色管理
 * @author lyw
 * @version 1.0
 */
@EqualsAndHashCode(callSuper = true)
@Data
@Table("sys_role")
@EntityProxy
public class SysRoleModel extends BaseModel implements ProxyEntityAvailable<SysRoleModel , SysRoleModelProxy> {


    /**
     * 角色名称
     */
    private String name;

    /**
     * 备注
     */
    private String remark;

}
