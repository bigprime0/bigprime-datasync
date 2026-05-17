package com.bigprime.datasync.backend.vo.sys;

import com.bigprime.datasync.core.utils.DateUtils;
import com.bigprime.datasync.core.utils.TreeNode;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * @author lyw
 * @version 1.0
 */
@EqualsAndHashCode(callSuper = true)
@Data
@Schema(description = "机构管理返回参数")
public class SysOrgVO extends TreeNode<SysOrgVO> {
    @Schema(description = "机构名称", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "机构名称不能为空")
    private String name;

    @Schema(description = "排序", requiredMode = Schema.RequiredMode.REQUIRED)
    @Min(value = 0, message = "排序值不能小于0")
    private Integer sort;

    @Schema(description = "创建时间")
    @JsonFormat(pattern = DateUtils.DATE_TIME_PATTERN)
    private Date createTime;

    @Schema(description = "上级名称")
    private String parentName;
}
