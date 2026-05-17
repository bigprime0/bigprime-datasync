package com.bigprime.datasync.backend.python.entity;

import com.bigprime.datasync.backend.python.entity.proxy.PythonServiceEntityProxy;
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
 * Python 发布服务实体
 *
 * @author bigprime
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("data_python_service")
public class PythonServiceEntity implements ProxyEntityAvailable<PythonServiceEntity, PythonServiceEntityProxy> {

    /**
     * 服务ID
     */
    @Column(primaryKey = true)
    private String id;

    /**
     * Workspace ID
     */
    private String workspaceId;

    /**
     * 脚本文件名（如 main.py）
     */
    private String scriptName;

    /**
     * 服务名称（显示用）
     */
    private String serviceName;

    /**
     * 服务描述
     */
    private String description;

    /**
     * API Key（调用时需在 X-API-Key Header 中传递）
     */
    private String apiKey;

    /**
     * 状态：ACTIVE(有效)/INACTIVE(停用)
     */
    private String status;

    /**
     * 生效开始时间（null 表示立即生效）
     */
    private Date effectiveStart;

    /**
     * 生效结束时间（null 表示永久有效）
     */
    private Date effectiveEnd;

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

    /**
     * 是否发布为 MCP 工具（0=否 1=是）
     */
    private Integer publishAsMcp;

    /**
     * MCP 工具名（英文，如 process_data，publishAsMcp=1 时必填）
     */
    private String mcpToolName;
}
