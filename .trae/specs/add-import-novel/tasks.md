# Tasks

- [x] Task 1: 后端新增 AI 解析TXT接口 `/api/ai/parse-novel`
  - [x] 在 `api/utils/aiGenerator.ts` 中新增 `parseNovelFromText` 函数，使用AI解析TXT内容返回结构化JSON
  - [x] 在 `api/routes/ai.ts` 中新增 POST `/parse-novel` 路由
  - [x] AI不可用时降级：title取前20字，genre为"其他"，整篇内容作为单个chapter
- [x] Task 2: 前端新增 `aiApi.parseNovel` 方法
  - [x] 在 `src/lib/api.ts` 中添加 `parseNovel` API方法
- [x] Task 3: Dashboard 页面实现导入流程
  - [x] 为"导入作品"按钮添加点击事件，触发隐藏的 file input
  - [x] 读取TXT文件内容，调用 `aiApi.parseNovel` 解析
  - [x] 新增导入预览弹窗组件，展示解析结果（标题、题材、简介、章节数、角色数等）
  - [x] 用户确认后，调用 novelApi.create 创建作品，然后依次创建角色、章节、世界观、伏笔、分卷框架
  - [x] 创建完成后跳转到作品详情页

# Task Dependencies
- Task 1 需先完成
- Task 2 依赖 Task 1
- Task 3 依赖 Task 2
