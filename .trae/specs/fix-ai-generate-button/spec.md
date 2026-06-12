# 修复AI生成按钮逻辑 Spec

## Why
"AI生成"按钮当前调用 `/:id/generate-chapter` 端点，该端点会在数据库中创建/更新章节记录，产生副作用。用户期望的流程是：先在编辑器中生成大纲，再根据大纲生成章节正文填入编辑器，最后由用户手动保存。

## What Changes
- 修改 `handleGenerateContent`，改为调用纯AI生成接口而非章节创建端点
- 新增 `/ai/generate-chapter-content` 端点，只返回AI生成的内容，不操作数据库
- 生成前先将当前大纲保存到 summary 字段，生成后用正文替换 content

## Impact
- Affected code: `src/pages/ChapterEditor.tsx`, `api/routes/ai.ts`, `api/utils/aiGenerator.ts`, `src/lib/api.ts`

## MODIFIED Requirements
### Requirement: AI生成按钮
"AI生成"按钮 SHALL 根据编辑器中的大纲内容，调用AI生成章节正文，将结果填入编辑器的content区域，不自动保存到数据库。

#### Scenario: 用户点击AI生成
- **WHEN** 用户点击"AI生成"按钮，且编辑器中有大纲内容
- **THEN** 系统将大纲保存到summary，调用AI根据大纲生成章节正文，将正文填入编辑器content区域
