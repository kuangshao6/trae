# Tasks
- [x] Task 1: 新增后端章节大纲生成API
  - [x] 在 `aiGenerator.ts` 中新增 `generateChapterOutline` 函数，接收小说标题、题材、分卷框架数据、当前章节号、前一章内容，用AI生成章节大纲和小标题
  - [x] 在 `ai.ts` 路由中新增 `POST /ai/chapter-outline` 端点
  - [x] 在 `api.ts` 前端API中新增 `aiApi.generateChapterOutline` 方法
- [x] Task 2: 修改 generateChapter 函数，基于大纲生成正文
  - [x] 修改 `aiGenerator.ts` 中的 `generateChapter`，使其基于summary/outline生成正文内容
  - [x] 修改 `novels.ts` 中 `/:id/generate-chapter` 路由，传入前一章内容作为上下文
- [x] Task 3: 重构 ChapterEditor.tsx 的AI工具区
  - [x] 将"AI 生成新章节"卡片替换为"章节AI工具"卡片
  - [x] 添加"生成大纲"按钮，点击后加载volumes数据，调用 `generateChapterOutline` API，将结果填入summary和title
  - [x] 添加"AI生成"按钮，点击后基于summary调用 `generateChapter` API，将正文填入content
  - [x] 移除原有的textarea输入框

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
