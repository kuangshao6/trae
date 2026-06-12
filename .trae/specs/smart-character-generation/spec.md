# 基于故事内容智能生成角色 Spec

## Why
当前创建作品时固定生成3个角色（主角、配角、反派），但故事简介和分卷框架中提到的角色名可能不止这些，导致部分角色没有设定。需要改为：先从故事简介和分卷框架中提取所有角色名并生成设定，再适当补充其他角色。

## What Changes
- 新增后端 AI 接口 `/ai/generate-characters`，接收故事简介、分卷框架、已有角色名，一次性提取角色名并批量生成角色设定
- 修改 `CreateNovelPage.tsx` 的角色生成逻辑：先等大纲生成分卷框架完成，再调用新接口批量生成角色
- 删除原来串行生成3个角色的逻辑

## Impact
- Affected code: `src/pages/CreateNovelPage.tsx`（角色生成流程）
- Affected code: `api/utils/aiGenerator.ts`（新增 `generateCharacters` 函数）
- Affected code: `api/routes/ai.ts`（新增路由）
- Affected code: `src/lib/api.ts`（新增 `aiApi.generateCharacters` 方法）

## MODIFIED Requirements

### Requirement: 基于故事内容智能生成角色
系统 SHALL 在创建作品时，基于故事简介和分卷框架中出现的角色名批量生成角色设定，确保故事中提到的角色都有对应设定，并适当补充其他角色。

#### Scenario: 故事中出现多个角色名
- **WHEN** 用户创建作品，故事简介和分卷框架中提到了角色A、角色B、角色C等
- **THEN** 系统提取所有提到的角色名，为每个角色生成完整的角色设定
- **THEN** 系统根据分卷框架和故事简介适当补充未提及但重要的角色（如反派等）
- **THEN** 所有角色不重名

#### Scenario: 故事中未提到任何角色名
- **WHEN** 故事简介和分卷框架中没有明确提到角色名
- **THEN** 系统根据题材和故事内容，生成主角、反派等核心角色

#### Scenario: 角色生成依赖大纲结果
- **WHEN** 系统生成角色时
- **THEN** 必须先完成大纲（故事简介+分卷框架）的生成，再基于大纲内容生成角色
