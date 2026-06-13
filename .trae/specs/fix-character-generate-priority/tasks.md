# Tasks

- [x] Task 1: 修改 generateCharacters 函数支持传入已有角色定位和章节内容
  - [x] SubTask 1.1: 修改 `api/utils/aiGenerator.ts` 中 `generateCharacters` 函数签名，增加 `existingRoles` 参数（格式：`{name: string, role: string}[]`）和 `chapters` 参数（格式：`string`，章节内容摘要）
  - [x] SubTask 1.2: 重写已有角色时的 prompt：要求 AI 基于世界观设定、作品简介、分卷框架和章节内容查漏补缺，先检查哪些重要角色定位缺失（主角、反派），优先补充缺失的重要角色，再考虑配角
  - [x] SubTask 1.3: prompt 中明确列出已有角色及其定位，让 AI 知道缺什么定位
  - [x] SubTask 1.4: prompt 中包含章节内容摘要，让 AI 从章节中识别更多角色

- [x] Task 2: 修改后端路由和前端 API 层传递新参数
  - [x] SubTask 2.1: 修改 `api/routes/ai.ts` 中 generate-characters 路由，从 req.body 取 existingRoles 和 chapters 传给 generateCharacters
  - [x] SubTask 2.2: 修改 `src/lib/api.ts` 中 generateCharacters 方法，增加 existingRoles 和 chapters 参数

- [x] Task 3: 修改 NovelCharacters 页面传参
  - [x] SubTask 3.1: 读取世界观设定内容（从 worldApi 获取 title 为 "世界观设定" 的条目），传给 generateCharacters 的 worldview 参数
  - [x] SubTask 3.2: 读取章节内容摘要（从 chapterApi 获取已有章节的 summary 或内容前200字），传给 generateCharacters 的 chapters 参数
  - [x] SubTask 3.3: 收集已有角色的名字和定位信息，传给 generateCharacters 的 existingRoles 参数

# Task Dependencies
- Task 2 依赖 Task 1（需要先修改函数签名）
- Task 3 依赖 Task 1 和 Task 2（需要前后端都支持新参数）
