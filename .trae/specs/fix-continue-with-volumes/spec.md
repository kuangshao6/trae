# AI续写根据分卷框架合理安排内容 Spec

## Why
当前AI续写功能只根据已有内容续写，不考虑分卷框架和章节规划，导致续写内容可能与整体故事规划脱节。应该根据分卷框架和当前章节位置合理安排续写内容。

## What Changes
- 修改 `continueChapter` 函数，增加 volumes（分卷框架）和 chapterInfo（当前章节序号/标题）参数
- AI prompt 中加入分卷框架和当前章节信息，要求根据分卷框架合理安排每章内容
- 修改后端路由传递新参数
- 修改前端 API 方法参数类型
- 修改前端 ChapterEditor.tsx 传入分卷框架和章节信息

## Impact
- Affected code: `api/utils/aiGenerator.ts`（continueChapter 函数）
- Affected code: `api/routes/ai.ts`（/ai/continue 路由）
- Affected code: `src/lib/api.ts`（continueChapter 方法）
- Affected code: `src/pages/ChapterEditor.tsx`（handleContinue 函数）

## MODIFIED Requirements

### Requirement: AI续写根据分卷框架安排内容
AI 续写 SHALL 根据分卷框架和当前章节位置合理安排续写内容。

#### Scenario: 用户点击AI续写
- **WHEN** 用户点击"AI续写"
- **THEN** 系统将分卷框架和当前章节信息传入AI
- **THEN** AI根据分卷框架中当前章节的定位来续写，确保内容符合整体规划
