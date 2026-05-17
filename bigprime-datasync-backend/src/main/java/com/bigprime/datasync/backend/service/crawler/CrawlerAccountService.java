package com.bigprime.datasync.backend.service.crawler;

import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.MyPager;
import com.bigprime.datasync.backend.handler.model.crawler.CrawlerAccountEntity;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

/**
 * 爬虫账号管理服务
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Service
@AllArgsConstructor
public class CrawlerAccountService {

    private final BigprimeEntityQuery proxy;

    /**
     * 创建账号
     */
    @Transactional(rollbackFor = Exception.class)
    public String createAccount(CrawlerAccountEntity account) {
        log.info("创建爬虫账号: name={}, platform={}", account.getName(), account.getPlatform());

        if (StrUtil.isBlank(account.getName())) {
            throw new IllegalArgumentException("账号名称不能为空");
        }
        if (StrUtil.isBlank(account.getPlatform())) {
            throw new IllegalArgumentException("平台不能为空");
        }

        account.setId(IdUtil.getSnowflakeNextIdStr());
        account.setCreateTime(new Date());
        account.setUpdateTime(new Date());
        
        if (account.getStatus() == null) {
            account.setStatus("ACTIVE");
        }
        if (account.getPriority() == null) {
            account.setPriority(50);
        }
        if (account.getUseCount() == null) {
            account.setUseCount(0L);
        }
        if (account.getSuccessCount() == null) {
            account.setSuccessCount(0L);
        }
        if (account.getFailureCount() == null) {
            account.setFailureCount(0L);
        }

        proxy.insertable(account).executeRows();
        return account.getId();
    }

    /**
     * 更新账号
     */
    @Transactional(rollbackFor = Exception.class)
    public void updateAccount(CrawlerAccountEntity account) {
        log.info("更新爬虫账号: id={}", account.getId());

        if (StrUtil.isBlank(account.getId())) {
            throw new IllegalArgumentException("账号ID不能为空");
        }

        CrawlerAccountEntity existing = getAccountById(account.getId());
        if (existing == null) {
            throw new IllegalArgumentException("账号不存在: " + account.getId());
        }

        account.setUpdateTime(new Date());
        proxy.updatable(account).executeRows();
    }

    /**
     * 删除账号
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteAccount(String id) {
        log.info("删除爬虫账号: id={}", id);

        CrawlerAccountEntity account = getAccountById(id);
        if (account == null) {
            throw new IllegalArgumentException("账号不存在: " + id);
        }

        proxy.deletable(CrawlerAccountEntity.class)
                .where(a -> a.id().eq(id))
                .executeRows();
    }

    /**
     * 获取账号详情
     */
    public CrawlerAccountEntity getAccountById(String id) {
        return proxy.queryable(CrawlerAccountEntity.class)
                .where(a -> a.id().eq(id))
                .firstOrNull();
    }

    /**
     * 分页查询账号列表
     */
    public MyPageResult<CrawlerAccountEntity> getAccountList(String search, String status, Integer page, Integer limit) {
        log.debug("查询账号列表: search={}, status={}, page={}, limit={}", search, status, page, limit);

        if (page == null || page < 1) {
            page = 1;
        }
        if (limit == null || limit < 1) {
            limit = 20;
        }

        var query = proxy.queryable(CrawlerAccountEntity.class);

        // 搜索条件
        if (StrUtil.isNotBlank(search)) {
            query.where(a -> a.or(() -> {
                a.name().like(search);
                a.platform().like(search);
                a.username().like(search);
            }));
        }

        // 状态筛选
        if (StrUtil.isNotBlank(status)) {
            query.where(a -> a.status().eq(status));
        }

        // 排序：优先级降序，创建时间降序
        query.orderBy(a -> {
            a.priority().desc();
            a.createTime().desc();
        });

        return query.toPageResult(new MyPager<>(page, limit));
    }

    /**
     * 切换账号状态
     */
    @Transactional(rollbackFor = Exception.class)
    public void toggleAccountStatus(String id, String status) {
        log.info("切换账号状态: id={}, status={}", id, status);

        CrawlerAccountEntity account = getAccountById(id);
        if (account == null) {
            throw new IllegalArgumentException("账号不存在: " + id);
        }

        account.setStatus(status);
        account.setUpdateTime(new Date());
        proxy.updatable(account).executeRows();
    }
}
