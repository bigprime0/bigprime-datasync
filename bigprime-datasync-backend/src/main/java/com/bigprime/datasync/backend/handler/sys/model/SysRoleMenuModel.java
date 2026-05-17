package com.bigprime.datasync.backend.handler.sys.model;

import com.bigprime.datasync.core.model.BaseModel;
import com.bigprime.datasync.backend.handler.sys.model.proxy.SysRoleMenuModelProxy;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 角色菜单关系
 * @author lyw
 * @version 1.0
 */
@EqualsAndHashCode(callSuper = true)
@Data
@Table("sys_role_menu")
@EntityProxy
public class SysRoleMenuModel extends BaseModel implements ProxyEntityAvailable<SysRoleMenuModel , SysRoleMenuModelProxy> {

    /**
     * 角色ID
     */
    private Long roleId;

    /**
     * 菜单ID
     */
    private Long menuId;

}
