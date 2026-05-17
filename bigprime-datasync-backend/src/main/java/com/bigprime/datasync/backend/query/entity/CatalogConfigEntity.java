package com.bigprime.datasync.backend.query.entity;

import com.easy.query.core.annotation.Column;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.annotation.UpdateIgnore;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import com.bigprime.datasync.backend.query.entity.proxy.CatalogConfigEntityProxy;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Catalog配置实体
 * 
 * @author bigprime
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("ds_catalog_config")
public class CatalogConfigEntity implements ProxyEntityAvailable<CatalogConfigEntity, CatalogConfigEntityProxy> {
    
    /**
     * 主键ID
     */
    @Column(primaryKey = true)
    private Long id;
    
    /**
     * Catalog名称
     */
    private String catalogName;
    
    /**
     * StarRocks连接器ID
     */
    private String starRocksConnectorId;
    
    /**
     * 数据源类型 (MySQL/Oracle/PostgreSQL/Hive等)
     */
    private String dataSourceType;
    
    /**
     * 数据源连接器ID
     */
    private String dataSourceConnectorId;
    
    /**
     * 状态 (ACTIVE/ERROR/DELETED)
     */
    private String status;
    
    /**
     * 创建者ID
     */
    @UpdateIgnore
    private String creator;
    
    /**
     * 创建者名称
     */
    @UpdateIgnore
    private String creatorName;
    
    /**
     * 创建时间
     */
    @UpdateIgnore
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
}
