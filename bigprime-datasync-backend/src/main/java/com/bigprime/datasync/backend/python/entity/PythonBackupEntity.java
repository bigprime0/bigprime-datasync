package com.bigprime.datasync.backend.python.entity;

import com.bigprime.datasync.backend.python.entity.proxy.PythonBackupEntityProxy;
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
 * Python 版本备份实体
 *
 * @author bigprime
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("data_python_backup")
public class PythonBackupEntity implements ProxyEntityAvailable<PythonBackupEntity, PythonBackupEntityProxy> {

    /**
     * 备份ID
     */
    @Column(primaryKey = true)
    private String id;

    /**
     * Workspace ID
     */
    private String workspaceId;

    /**
     * 备注说明
     */
    private String remark;

    /**
     * 备份文件路径
     */
    private String backupPath;

    /**
     * 备份文件数量
     */
    private Integer fileCount;

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
     * 逻辑删除标识(0-未删除, 1-已删除)
     */
    private Integer deleted;
}
