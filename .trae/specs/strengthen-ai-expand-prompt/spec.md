# 强化AI扩写按大纲生成 Spec

## Why
"AI生成"按钮生成的内容完全没按大纲写。原因有两个：1) 本地降级模板完全忽略大纲内容，生成固定模板文本；2) AI prompt需要更强调逐条展开大纲。

## What Changes
- 修复本地降级模板，基于大纲内容生成而非固定模板
- 强化AI prompt，要求逐条展开大纲中的每个情节点
- 不改按钮名称，保持"AI生成"

## Impact
- Affected code: `api/utils/aiGenerator.ts`

## MODIFIED Requirements
### Requirement: AI生成按钮
"AI生成"按钮 SHALL 严格基于编辑器中的大纲内容生成章节正文。大纲内容会被生成的正文替换。

#### Scenario: 用户点击AI生成
- **WHEN** 用户点击"AI生成"按钮
- **THEN** AI将编辑器中的大纲逐条扩写为完整的章节正文，大纲内容被正文替换

