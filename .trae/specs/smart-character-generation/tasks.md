# Tasks
- [x] Task 1: 在 `api/utils/aiGenerator.ts` 中新增 `generateCharacters` 函数
  - [x] 接收参数：title、genre、description（故事简介）、volumes（分卷框架JSON字符串）、existingNames（已有角色名）
  - [x] AI prompt 要求：从故事简介和分卷框架中提取所有角色名，为每个角色生成设定，再适当补充重要角色
  - [x] 返回角色数组，每个角色包含 name、role、age、appearance、personality、background、motivation、relationship
  - [x] 降级方案：返回3个默认角色（主角、配角、反派）

- [x] Task 2: 在 `api/routes/ai.ts` 中新增 `/ai/generate-characters` 路由
  - [x] 接收 title、genre、description、volumes、existingNames 参数
  - [x] 调用 `generateCharacters` 并返回结果

- [x] Task 3: 在 `src/lib/api.ts` 中新增 `aiApi.generateCharacters` 方法
  - [x] 调用 `/api/ai/generate-characters` 接口

- [x] Task 4: 修改 `src/pages/CreateNovelPage.tsx` 的角色生成逻辑
  - [x] 删除原来串行生成3个角色的代码
  - [x] 改为先等大纲结果（outlineResult）完成，再调用 `aiApi.generateCharacters` 传入故事简介和分卷框架
  - [x] 将返回的角色数组逐个保存到 characterApi

# Task Dependencies
- Task 2 depends on Task 1
- Task 4 depends on Task 2 and Task 3
