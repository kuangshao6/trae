# Tasks

- [x] Task 1: 修复创建作品时世界观生成复用 generateOutline 导致生成两个故事的问题
  - [x] SubTask 1.1: 修改 `src/pages/CreateNovelPage.tsx` 的 `handleCreate` 函数，将第168行的 `aiApi.generateOutline` 替换为 `aiApi.worldviewCategories`
  - [x] SubTask 1.2: 将世界观结果按分类逐条存入 worldApi，而非存为单条"世界观设定"

- [x] Task 2: 修复 generateOutline 生成内容与用户输入无关的问题
  - [x] SubTask 2.1: 修改 `api/utils/aiGenerator.ts` 中 `generateOutline` 的 AI prompt，强化对用户 description 的引用，要求必须围绕用户输入展开故事

- [x] Task 3: 修复角色生成全是配角的问题
  - [x] SubTask 3.1: 修改 `api/utils/aiGenerator.ts` 中 `generateCharacters` 的 AI prompt，增加"从作品简介中提取所有角色"的强制指令
  - [x] SubTask 3.2: 增加"先识别主角"和"主角 role 必须填'主角'"的强制指令
  - [x] SubTask 3.3: 修改降级逻辑，确保降级时第一个角色为"主角"（已确认无需修改，roles 数组第一个已是"主角"）

# Task Dependencies
- Task 2 应在 Task 3 之前完成（角色提取依赖大纲质量）
- Task 1 和 Task 2 相互独立，可并行执行
