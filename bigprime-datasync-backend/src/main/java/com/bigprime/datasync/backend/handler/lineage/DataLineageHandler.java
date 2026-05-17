package com.bigprime.datasync.backend.handler.lineage;

import cn.hutool.core.util.StrUtil;
import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.MyPager;
import com.bigprime.datasync.backend.handler.model.lineage.DataLineage;
import com.bigprime.datasync.backend.query.lineage.DataLineageQuery;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 数据血缘Handler
 *
 * @author lyw
 * @version 1.0
 */
@Slf4j
@Component
@AllArgsConstructor
public class DataLineageHandler {
    
    private final BigprimeEntityQuery query;

    /**
     * 插入血缘记录
     */
    public long insert(DataLineage lineage) {
        log.info("插入血缘记录: {} -> {}", 
                 lineage.getSourceTable(), lineage.getTargetTable());
        return query.insertable(lineage).executeRows(true);
    }
    
    /**
     * 保存血缘记录（兼容方法）
     */
    public long save(DataLineage lineage) {
        return insert(lineage);
    }

    /**
     * 查询血缘列表
     */
    public List<DataLineage> list(DataLineageQuery queryParam) {
        return query.queryable(DataLineage.class)
                .where(a -> {
                    if (queryParam != null) {
                        if (StrUtil.isNotBlank(queryParam.getSourceType())) {
                            a.sourceType().eq(queryParam.getSourceType());
                        }
                        if (StrUtil.isNotBlank(queryParam.getSourceDatabase())) {
                            a.sourceDatabase().eq(queryParam.getSourceDatabase());
                        }
                        if (StrUtil.isNotBlank(queryParam.getSourceTable())) {
                            a.sourceTable().eq(queryParam.getSourceTable());
                        }
                        if (StrUtil.isNotBlank(queryParam.getTargetType())) {
                            a.targetType().eq(queryParam.getTargetType());
                        }
                        if (StrUtil.isNotBlank(queryParam.getTargetDatabase())) {
                            a.targetDatabase().eq(queryParam.getTargetDatabase());
                        }
                        if (StrUtil.isNotBlank(queryParam.getTargetTable())) {
                            a.targetTable().eq(queryParam.getTargetTable());
                        }
                        if (StrUtil.isNotBlank(queryParam.getDagExecutionId())) {
                            a.dagExecutionId().eq(queryParam.getDagExecutionId());
                        }
                        if (StrUtil.isNotBlank(queryParam.getDagDefinitionId())) {
                            a.dagDefinitionId().eq(queryParam.getDagDefinitionId());
                        }
                    }
                })
                .toList();
    }
    
    /**
     * 分页查询
     */
    public MyPageResult<DataLineage> getPage(DataLineageQuery queryParam, Integer page, Integer limit) {
        return query.queryable(DataLineage.class)
                .where(a -> {
                    if (queryParam != null) {
                        if (StrUtil.isNotBlank(queryParam.getSourceType())) {
                            a.sourceType().eq(queryParam.getSourceType());
                        }
                        if (StrUtil.isNotBlank(queryParam.getSourceDatabase())) {
                            a.sourceDatabase().eq(queryParam.getSourceDatabase());
                        }
                        if (StrUtil.isNotBlank(queryParam.getSourceTable())) {
                            a.sourceTable().eq(queryParam.getSourceTable());
                        }
                        if (StrUtil.isNotBlank(queryParam.getTargetType())) {
                            a.targetType().eq(queryParam.getTargetType());
                        }
                        if (StrUtil.isNotBlank(queryParam.getTargetDatabase())) {
                            a.targetDatabase().eq(queryParam.getTargetDatabase());
                        }
                        if (StrUtil.isNotBlank(queryParam.getTargetTable())) {
                            a.targetTable().eq(queryParam.getTargetTable());
                        }
                        if (StrUtil.isNotBlank(queryParam.getDagExecutionId())) {
                            a.dagExecutionId().eq(queryParam.getDagExecutionId());
                        }
                    }
                })
                .orderBy(o -> o.createTime().desc())
                .toPageResult(new MyPager<>(page, limit));
    }
    
    /**
     * 根据ID获取
     */
    public DataLineage getById(String id) {
        return query.queryable(DataLineage.class)
                .whereById(id)
                .firstOrNull();
    }
    
    /**
     * 根据ID删除
     */
    public long deleteById(String id) {
        return query.deletable(DataLineage.class)
                .whereById(id)
                .executeRows();
    }
}
