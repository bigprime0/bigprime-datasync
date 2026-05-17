package com.bigprime.datasync.backend.service.crawler;

import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.MyPager;
import com.bigprime.datasync.backend.handler.model.crawler.CrawlerProxyEntity;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

/**
 * 爬虫代理管理服务
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Service
@AllArgsConstructor
public class CrawlerProxyService {

    private final BigprimeEntityQuery proxy;

    /**
     * 创建代理
     */
    @Transactional(rollbackFor = Exception.class)
    public String createProxy(CrawlerProxyEntity proxy) {
        log.info("创建爬虫代理: name={}, host={}", proxy.getName(), proxy.getHost());

        if (StrUtil.isBlank(proxy.getName())) {
            throw new IllegalArgumentException("代理名称不能为空");
        }
        if (StrUtil.isBlank(proxy.getHost())) {
            throw new IllegalArgumentException("代理地址不能为空");
        }

        proxy.setId(IdUtil.getSnowflakeNextIdStr());
        proxy.setCreateTime(new Date());
        proxy.setUpdateTime(new Date());
        
        if (proxy.getStatus() == null) {
            proxy.setStatus("ACTIVE");
        }
        if (proxy.getPriority() == null) {
            proxy.setPriority(50);
        }
        if (proxy.getSuccessCount() == null) {
            proxy.setSuccessCount(0L);
        }
        if (proxy.getFailureCount() == null) {
            proxy.setFailureCount(0L);
        }

        this.proxy.insertable(proxy).executeRows();
        return proxy.getId();
    }

    /**
     * 更新代理
     */
    @Transactional(rollbackFor = Exception.class)
    public void updateProxy(CrawlerProxyEntity proxy) {
        log.info("更新爬虫代理: id={}", proxy.getId());

        if (StrUtil.isBlank(proxy.getId())) {
            throw new IllegalArgumentException("代理ID不能为空");
        }

        CrawlerProxyEntity existing = getProxyById(proxy.getId());
        if (existing == null) {
            throw new IllegalArgumentException("代理不存在: " + proxy.getId());
        }

        proxy.setUpdateTime(new Date());
        this.proxy.updatable(proxy).executeRows();
    }

    /**
     * 删除代理
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteProxy(String id) {
        log.info("删除爬虫代理: id={}", id);

        CrawlerProxyEntity proxy = getProxyById(id);
        if (proxy == null) {
            throw new IllegalArgumentException("代理不存在: " + id);
        }

        this.proxy.deletable(CrawlerProxyEntity.class)
                .where(p -> p.id().eq(id))
                .executeRows();
    }

    /**
     * 获取代理详情
     */
    public CrawlerProxyEntity getProxyById(String id) {
        return proxy.queryable(CrawlerProxyEntity.class)
                .where(p -> p.id().eq(id))
                .firstOrNull();
    }

    /**
     * 分页查询代理列表
     */
    public MyPageResult<CrawlerProxyEntity> getProxyList(String search, String status, Integer page, Integer limit) {
        log.debug("查询代理列表: search={}, status={}, page={}, limit={}", search, status, page, limit);

        if (page == null || page < 1) {
            page = 1;
        }
        if (limit == null || limit < 1) {
            limit = 20;
        }

        var query = proxy.queryable(CrawlerProxyEntity.class);

        // 搜索条件
        if (StrUtil.isNotBlank(search)) {
            query.where(p -> p.or(() -> {
                p.name().like(search);
                p.host().like(search);
            }));
        }

        // 状态筛选
        if (StrUtil.isNotBlank(status)) {
            query.where(p -> p.status().eq(status));
        }

        // 排序：优先级降序，创建时间降序
        query.orderBy(p -> {
            p.priority().desc();
            p.createTime().desc();
        });

        return query.toPageResult(new MyPager<>(page, limit));
    }

    /**
     * 切换代理状态
     */
    @Transactional(rollbackFor = Exception.class)
    public void toggleProxyStatus(String id, String status) {
        log.info("切换代理状态: id={}, status={}", id, status);

        CrawlerProxyEntity proxy = getProxyById(id);
        if (proxy == null) {
            throw new IllegalArgumentException("代理不存在: " + id);
        }

        proxy.setStatus(status);
        proxy.setUpdateTime(new Date());
        this.proxy.updatable(proxy).executeRows();
    }
}
