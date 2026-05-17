package com.bigprime.datasync.backend.python.entity;

import com.bigprime.datasync.backend.python.entity.proxy.PythonScriptEntityProxy;
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
 * Python 脚本文件实体
 *
 * @author bigprime
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("data_python_script")
public class PythonScriptEntity implements ProxyEntityAvailable<PythonScriptEntity, PythonScriptEntityProxy> {

    /**
     * 脚本ID
     */
    @Column(primaryKey = true)
    private String id;

    /**
     * Workspace ID
     */
    private String workspaceId;

    /**
     * 脚本名称
     */
    private String name;

    /**
     * 文件相对路径
     */
    private String filePath;

    /**
     * 脚本内容（可选，主要存文件）
     */
    private String content;

    /**
     * 是否已发布为服务
     */
    private Integer isPublished;

    /**
     * 发布后的 endpoint 路径
     */
    private String publishEndpoint;

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
