package com.bigprime.datasync.backend.controller.log;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.log.api.dto.LogExportRequest;
import com.bigprime.log.api.dto.LogMaskRuleDTO;
import com.bigprime.log.core.service.LogExportService;
import com.bigprime.log.core.service.LogMaskService;
import com.bigprime.log.storage.entity.LogMaskRuleEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 日志增强功能控制器
 * 提供日志导出、脱敏、追踪集成等高级功能
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/log/enhancement")
@Tag(name = "日志增强功能", description = "日志导出、脱敏、追踪集成")
@AllArgsConstructor
public class LogEnhancementController {

    private final LogExportService logExportService;
    private final LogMaskService logMaskService;

    /**
     * 导出日志
     */
    @PostMapping("/export")
    @Operation(summary = "导出日志", description = "支持JSON/TXT/CSV格式导出")
    public ResponseEntity<byte[]> exportLogs(@RequestBody LogExportRequest request) {
        try {
            byte[] exportData = logExportService.exportLogs(request);
            
            // 设置文件名
            String format = request.getFormat().toLowerCase();
            String filename = "logs_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + "." + format;
            
            // 设置Content-Type
            MediaType mediaType;
            switch (format) {
                case "json":
                    mediaType = MediaType.APPLICATION_JSON;
                    break;
                case "csv":
                    mediaType = MediaType.parseMediaType("text/csv");
                    break;
                default:
                    mediaType = MediaType.TEXT_PLAIN;
            }
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(mediaType)
                    .body(exportData);
                    
        } catch (Exception e) {
            log.error("导出日志失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 获取所有脱敏规则
     */
    @GetMapping("/mask-rules")
    @Operation(summary = "获取所有脱敏规则")
    public Result<List<LogMaskRuleDTO>> getMaskRules() {
        try {
            List<LogMaskRuleEntity> entities = logMaskService.getAllMaskRules();
            List<LogMaskRuleDTO> dtos = entities.stream().map(entity -> {
                LogMaskRuleDTO dto = new LogMaskRuleDTO();
                BeanUtils.copyProperties(entity, dto);
                return dto;
            }).collect(Collectors.toList());
            
            return Result.ok(dtos);
        } catch (Exception e) {
            log.error("获取脱敏规则失败", e);
            return Result.error("获取脱敏规则失败: " + e.getMessage());
        }
    }

    /**
     * 保存脱敏规则
     */
    @PostMapping("/mask-rules")
    @Operation(summary = "保存脱敏规则")
    public Result<Long> saveMaskRule(@RequestBody LogMaskRuleDTO dto) {
        try {
            LogMaskRuleEntity entity = LogMaskRuleEntity.builder()
                    .id(dto.getId())
                    .ruleName(dto.getRuleName())
                    .ruleType(dto.getRuleType())
                    .matchPattern(dto.getMatchPattern())
                    .replaceType(dto.getReplaceType())
                    .replaceValue(dto.getReplaceValue())
                    .enabled(dto.getEnabled())
                    .sortOrder(dto.getSortOrder())
                    .description(dto.getDescription())
                    .createTime(LocalDateTime.now())
                    .updateTime(LocalDateTime.now())
                    .build();
            
            Long result = logMaskService.saveMaskRule(entity);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("保存脱敏规则失败", e);
            return Result.error("保存脱敏规则失败: " + e.getMessage());
        }
    }

    /**
     * 删除脱敏规则
     */
    @DeleteMapping("/mask-rules/{id}")
    @Operation(summary = "删除脱敏规则")
    public Result<Long> deleteMaskRule(@PathVariable Long id) {
        try {
            Long result = logMaskService.deleteMaskRule(id);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("删除脱敏规则失败: id={}", id, e);
            return Result.error("删除脱敏规则失败: " + e.getMessage());
        }
    }

    /**
     * 测试脱敏规则
     */
    @PostMapping("/mask-rules/test")
    @Operation(summary = "测试脱敏规则", description = "测试脱敏规则对示例文本的效果")
    public Result<String> testMaskRule(@RequestBody Map<String, Object> request) {
        try {
            String testContent = (String) request.get("content");
            Map<String, Object> ruleMap = (Map<String, Object>) request.get("rule");
            
            LogMaskRuleEntity rule = LogMaskRuleEntity.builder()
                    .ruleName((String) ruleMap.get("ruleName"))
                    .ruleType((String) ruleMap.get("ruleType"))
                    .matchPattern((String) ruleMap.get("matchPattern"))
                    .replaceType((String) ruleMap.get("replaceType"))
                    .replaceValue((String) ruleMap.get("replaceValue"))
                    .build();
            
            String maskedContent = logMaskService.testMaskRule(testContent, rule);
            return Result.ok(maskedContent);
        } catch (Exception e) {
            log.error("测试脱敏规则失败", e);
            return Result.error("测试脱敏规则失败: " + e.getMessage());
        }
    }

    /**
     * 对文本内容进行脱敏
     */
    @PostMapping("/mask-content")
    @Operation(summary = "对文本内容进行脱敏")
    public Result<String> maskContent(@RequestBody Map<String, String> request) {
        try {
            String content = request.get("content");
            String maskedContent = logMaskService.maskLogContent(content);
            return Result.ok(maskedContent);
        } catch (Exception e) {
            log.error("脱敏失败", e);
            return Result.error("脱敏失败: " + e.getMessage());
        }
    }
}
