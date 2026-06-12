# 角色生成去重 Spec

## Why
创建作品时三个角色（主角、配角、反派）并行生成，AI每次独立调用不知道其他角色叫什么，容易产生重名。

## What Changes
- 将三个角色生成从并行改为串行，每次生成时传入已有角色名列表
- 修改 `generateChapter` 的AI prompt，加入"不要与已有角色重名"的约束
- 修改 `CreateNovelPage.tsx` 中的角色生成逻辑为串行

## Impact
- Affected code: `src/pages/CreateNovelPage.tsx`, `api/utils/aiGenerator.ts`

## MODIFIED Requirements
### Requirement: 角色生成
角色生成 SHALL 串行执行，每次生成时传入已有角色名列表，确保同一部小说内角色不重名。

#### Scenario: 生成多个角色
- **WHEN** 系统依次生成主角、配角、反派
- **THEN** 每次生成时将已生成的角色名传入AI prompt，AI不会生成与已有角色同名的角色
