# Tasks
- [x] Task 1: 新增纯AI生成章节内容端点
  - [x] 在 `aiGenerator.ts` 中确保 `generateChapter` 函数可被独立调用（已存在）
  - [x] 在 `ai.ts` 路由中新增 `POST /ai/generate-chapter-content` 端点，只调用AI生成，不操作数据库
  - [x] 在 `api.ts` 前端API中新增 `aiApi.generateChapterContent` 方法
- [x] Task 2: 修改 ChapterEditor.tsx 的 handleGenerateContent
  - [x] 将 `aiApi.generateChapter` 替换为 `aiApi.generateChapterContent`
  - [x] 生成前先将大纲内容保存到 summary
  - [x] 生成后将正文填入 content
