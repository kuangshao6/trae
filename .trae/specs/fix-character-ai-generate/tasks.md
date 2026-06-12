# Tasks
- [x] Task 1: 修改 `api/utils/aiGenerator.ts` 中 `generateCharacters` 的 AI prompt
  - [x] 当 existingNames 非空时，prompt 改为：先从故事简介和分卷框架中找出已有角色名列表中不存在的角色名（查漏补缺），只为缺失的角色生成设定；如果故事中提到的角色都已有设定，则生成2个除主角外的随机角色（配角/反派/龙套）
  - [x] 当 existingNames 为空时，保持原有逻辑（首次生成所有角色）

- [x] Task 2: 修改 `src/pages/NovelCharacters.tsx` 的 `handleAiGenerate` 函数
  - [x] 读取作品的简介（novel.description）和分卷框架（从 worldApi 获取 title 为 "volumes" 的条目）
  - [x] 收集已有角色名列表
  - [x] 调用 `aiApi.generateCharacters` 传入 title、genre、description、volumes、existingNames
  - [x] 将返回的角色逐个保存到 characterApi
  - [x] 刷新角色列表

# Task Dependencies
- Task 2 depends on Task 1
