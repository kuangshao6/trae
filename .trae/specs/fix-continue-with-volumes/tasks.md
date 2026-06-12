# Tasks
- [x] Task 1: 修改 `api/utils/aiGenerator.ts` 中 `continueChapter` 函数
  - [x] 增加 volumes 和 chapterInfo 参数
  - [x] AI prompt 中加入分卷框架和当前章节信息，要求根据分卷框架合理安排续写内容

- [x] Task 2: 修改 `api/routes/ai.ts` 中 `/ai/continue` 路由
  - [x] 接收并传递 volumes 和 chapterInfo 参数

- [x] Task 3: 修改 `src/lib/api.ts` 中 `continueChapter` 方法
  - [x] 增加 volumes 和 chapterInfo 可选参数

- [x] Task 4: 修改 `src/pages/ChapterEditor.tsx` 中 `handleContinue` 函数
  - [x] 传入 volumesData（分卷框架）和当前章节信息（章节序号+标题）

# Task Dependencies
- Task 2 depends on Task 1
- Task 4 depends on Task 3
