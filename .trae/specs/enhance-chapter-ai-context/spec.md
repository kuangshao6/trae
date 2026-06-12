# 章节AI创作助手完善 Spec

## Why
章节编辑器的四个AI功能（续写、扩写、润色、补充冲突）虽然已接入AI，但都没有传入小说上下文（题材、角色、世界观等），导致生成内容与作品风格不匹配。此外续写返回结果包含了原文，导致追加时重复。

## What Changes
- 修改后端 `continueChapter`、`expandContent`、`polishContent`、`addConflict` 四个函数，增加上下文参数（novelTitle、genre、characters、worldview），在 AI prompt 中加入上下文信息
- 修改后端 AI 路由，接收并传递上下文参数
- 修改前端 `ChapterEditor.tsx`，在调用四个AI功能时传入小说上下文
- 修改 `continueChapter` 返回值：只返回续写部分，不包含原文

## Impact
- Affected code: `api/utils/aiGenerator.ts`（四个函数的签名和 prompt）
- Affected code: `api/routes/ai.ts`（四个路由的参数传递）
- Affected code: `src/lib/api.ts`（四个 API 方法的参数类型）
- Affected code: `src/pages/ChapterEditor.tsx`（调用时传入上下文）

## MODIFIED Requirements

### Requirement: AI创作助手传入小说上下文
四个AI创作功能 SHALL 传入小说的题材、角色、世界观等上下文信息，使生成内容与作品风格一致。

#### Scenario: AI续写时传入上下文
- **WHEN** 用户点击"AI续写"
- **THEN** 系统将小说题材、角色信息、世界观设定作为上下文传入AI
- **THEN** AI返回的续写内容只包含新写部分，不包含原文

#### Scenario: AI扩写/润色/补充冲突时传入上下文
- **WHEN** 用户点击"AI扩写"、"AI润色"或"AI补充冲突"
- **THEN** 系统将小说题材、角色信息、世界观设定作为上下文传入AI
