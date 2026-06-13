# Tasks

- [x] Task 1: 修改 generateCharacters 函数增加世界观参数和重写 prompt
  - [x] SubTask 1.1: 修改 `api/utils/aiGenerator.ts` 中 `generateCharacters` 函数签名，增加 `worldview` 参数
  - [x] SubTask 1.2: 重写 prompt：要求 AI 先从简介/分卷/世界观中识别所有角色，根据故事定位判断类型（主角/配角/反派/龙套），角色不足时再根据剧情补充
  - [x] SubTask 1.3: 在 prompt 中加入【世界观设定】段落
  - [x] SubTask 1.4: 修改返回值映射中 `role` 的默认值，不再一律默认"配角"，如果 AI 没返回 role 则保留空字符串

- [x] Task 2: 修改后端路由和前端 API 层传递世界观参数
  - [x] SubTask 2.1: 修改 `api/routes/ai.ts` 中 generate-characters 路由，从 req.body 取 worldview 传给 generateCharacters
  - [x] SubTask 2.2: 修改 `src/lib/api.ts` 中 generateCharacters 方法，增加 worldview 参数

- [x] Task 3: 修改 CreateNovelPage 调用流程
  - [x] SubTask 3.1: 调整 handleCreate 流程顺序为：大纲 → 世界观 → 角色（当前是 大纲 → 角色 → 世界观）
  - [x] SubTask 3.2: 将世界观内容传给 generateCharacters 调用

# Task Dependencies
- Task 2 依赖 Task 1（需要先修改函数签名）
- Task 3 依赖 Task 1 和 Task 2（需要前后端都支持 worldview 参数）
