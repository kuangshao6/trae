# 修复AI扩写不凭空捏造 Spec

## Why
当前AI扩写功能要求"扩写后字数应为原文的1.5-2倍"，且降级模板是凭空捏造的内容，导致扩写结果偏离原文、凭空编造。应该只基于给定内容适度扩展细节，不凭空捏造。

## What Changes
- 修改 `expandContent` 的 AI prompt：要求只基于给定内容适度扩展，不添加原文未提及的新情节或新元素
- 修改降级模板：基于原文内容进行简单扩展，而非返回固定捏造文本

## Impact
- Affected code: `api/utils/aiGenerator.ts`（`expandContent` 函数）

## MODIFIED Requirements

### Requirement: AI扩写只基于原文适度扩展
AI 扩写 SHALL 只基于用户给定的内容适度扩展细节，不凭空捏造新情节。

#### Scenario: 用户输入一段内容进行扩写
- **WHEN** 用户输入内容并点击"开始扩写"
- **THEN** AI 只在原文基础上扩展细节（如环境描写、心理活动、动作细节等）
- **THEN** 不添加原文未提及的新角色、新事件或新情节
