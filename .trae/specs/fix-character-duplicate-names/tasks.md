# Tasks
- [x] Task 1: 修改 generateCharacter 函数，接受已有角色名列表
  - [x] 在 `aiGenerator.ts` 的 `generateCharacter` 函数签名中新增 `existingNames?: string[]` 参数
  - [x] 在AI prompt中加入"不要与以下已有角色重名：xxx"的约束
  - [x] 在本地降级模板中也避免重名
- [x] Task 2: 修改 CreateNovelPage.tsx 角色生成为串行
  - [x] 将三个并行 Promise 改为串行 await
  - [x] 每次生成后收集角色名，传给下一次生成
