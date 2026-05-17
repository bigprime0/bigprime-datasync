package com.bigprime.datasync.backend.handler.model;

import com.bigprime.datasync.core.model.BaseModel;
import com.bigprime.datasync.backend.handler.model.proxy.TestModelProxy;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 测试类
 *
 * @author lyw
 * @version 1.0
 */
@EqualsAndHashCode(callSuper = true)
@Data
@Table("api_test")
@EntityProxy
public class TestModel extends BaseModel implements ProxyEntityAvailable<TestModel , TestModelProxy> {


    /**
     * 名称
     */
    private String chineseName;

}
