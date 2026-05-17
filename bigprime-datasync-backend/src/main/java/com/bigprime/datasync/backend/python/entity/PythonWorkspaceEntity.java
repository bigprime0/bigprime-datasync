package com.bigprime.datasync.backend.python.entity;

import com.bigprime.datasync.backend.python.entity.proxy.PythonWorkspaceEntityProxy;
import com.easy.query.core.annotation.Column;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Python Workspace 实体
 *
 * @author bigprime
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("data_python_workspace")
public class PythonWorkspaceEntity implements ProxyEntityAvailable<PythonWorkspaceEntity, PythonWorkspaceEntityProxy> {

    /**
     * Workspace ID
     */
    @Column(primaryKey = true)
    private String id;

    /**
     * 用户ID
     */
    private String userId;

    /**
     * Workspace 名称
     */
    private String name;

    /**
     * 描述
     */
    private String description;

    /**
     * 工作目录路径
     */
    private String workspacePath;

    /**
     * Kernel ID（启动后填充）
     */
    private String kernelId;

    /**
     * 状态：ACTIVE(运行中)/INACTIVE(未启动)/ERROR(异常)
     */
    private String status;

    /**
     * KernelGateway 地址
     */
    private String kernelGatewayUrl;

    /**
     * 创建者ID
     */
    private String creator;

    /**
     * 创建者名称
     */
    private String creatorName;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新者ID
     */
    private String updater;

    /**
     * 更新者名称
     */
    private String updaterName;

    /**
     * 更新时间
     */
    private Date updateTime;

    /**
     * 逻辑删除标识(0-未删除, 1-已删除)
     */
    private Integer deleted;
}
