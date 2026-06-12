# 生成大纲按钮增加上下文数据 Spec

## Why
"生成大纲"按钮目前只读取分卷框架数据，生成的大纲缺乏世界观、角色和伏笔的上下文，导致大纲与已有设定脱节。

## What Changes
- 修改 `generateChapterOutline` 函数，新增 `worldview`、`characters`、`foreshadowing` 参数
- 修改AI prompt，将世界观、角色、伏笔信息作为上下文传入
- 修改 ChapterEditor.tsx 的 `handleGenerateOutline`，加载世界观、角色、伏笔数据并传入API
- 修改后端路由和前端API，传递新增参数

## Impact
- Affected code: `api/utils/aiGenerator.ts`, `api/routes/ai.ts`, `src/lib/api.ts`, `src/pages/ChapterEditor.tsx`

## MODIFIED Requirements
### Requirement: 生成大纲按钮
"生成大纲"按钮 SHALL 读取分卷框架、世界观、角色和伏笔数据，综合这些信息生成章节大纲。

#### Scenario: 用户点击生成大纲
- **WHEN** 用户点击"生成大纲"按钮
- **THEN** 系统加载分卷框架、世界观设定、角色信息和伏笔数据，综合传入AI生成章节大纲
