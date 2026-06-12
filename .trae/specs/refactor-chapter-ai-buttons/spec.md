# 章节编辑器AI按钮重构 Spec

## Why
当前章节编辑器只有一个"一键生成新章节"按钮，功能单一。用户需要两个更精细的AI功能：一个根据大纲生成章节内容，另一个根据分卷框架生成当前章节的大纲。

## What Changes
- 将"AI 生成新章节"卡片替换为两个独立按钮："生成大纲"和"AI生成"
- **生成大纲**：根据分卷框架（volumes数据）和当前章节号，用AI生成当前章节的大纲/摘要，并随机生成小标题。第一章基于大纲生成，后续章节基于前一章内容继续
- **AI生成**：根据已生成的章节大纲（summary字段）来生成章节正文内容
- 新增后端API `/ai/chapter-outline` 用于生成章节大纲
- 修改 `generateChapter` 函数，使其基于大纲内容生成章节正文
- 移除原有的"描述本章大纲"textarea输入框

## Impact
- Affected code: `src/pages/ChapterEditor.tsx`, `api/utils/aiGenerator.ts`, `api/routes/ai.ts`, `src/lib/api.ts`

## ADDED Requirements
### Requirement: 生成大纲按钮
系统 SHALL 提供"生成大纲"按钮，点击后根据分卷框架数据和当前章节号，用AI生成当前章节的大纲。

#### Scenario: 第一章生成大纲
- **WHEN** 用户点击"生成大纲"按钮，且当前为第一章
- **THEN** 系统从worldApi加载volumes数据，找到第一章所属的卷，基于该卷的coreConflict和description生成章节大纲，并随机生成小标题填充到标题栏

#### Scenario: 后续章节生成大纲
- **WHEN** 用户点击"生成大纲"按钮，且当前不是第一章
- **THEN** 系统加载前一章的内容作为上下文，结合分卷框架数据，用AI生成当前章节的大纲，并随机生成小标题

### Requirement: AI生成按钮
系统 SHALL 提供"AI生成"按钮，点击后根据当前章节的大纲（summary）生成分章节正文内容。

#### Scenario: 有大纲时AI生成
- **WHEN** 用户点击"AI生成"按钮，且章节摘要(summary)不为空
- **THEN** 系统基于summary内容，用AI生成章节正文，填充到编辑器中

#### Scenario: 无大纲时AI生成
- **WHEN** 用户点击"AI生成"按钮，且章节摘要为空
- **THEN** 提示用户先生成大纲

## MODIFIED Requirements
### Requirement: 章节编辑器AI工具区
章节编辑器右侧的"AI 生成新章节"卡片 SHALL 替换为"章节AI工具"卡片，包含"生成大纲"和"AI生成"两个按钮，不再包含textarea输入框。
