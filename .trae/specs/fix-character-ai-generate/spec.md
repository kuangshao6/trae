# 角色页面AI生成查漏补缺 Spec

## Why
角色页面的"AI 生成角色"按钮当前只是随机生成一个角色，没有基于作品简介和分卷框架来查漏补缺。应该读取作品简介和分卷框架，找出其中提到但尚未创建设定的角色，只为缺失的角色生成设定；如果没有缺失角色，则生成2个除主角外的随机角色。

## What Changes
- 修改 `NovelCharacters.tsx` 的 `handleAiGenerate` 函数：读取作品简介和分卷框架，收集已有角色名，调用 `aiApi.generateCharacters` 进行查漏补缺
- 修改 `api/utils/aiGenerator.ts` 的 `generateCharacters` 函数的 AI prompt：当已有角色名列表非空时，明确要求只补充故事中提到但尚未有设定的角色，以及适当补充重要角色；如果故事中提到的角色都已有设定，则生成2个除主角外的随机角色

## Impact
- Affected code: `src/pages/NovelCharacters.tsx`（handleAiGenerate 函数）
- Affected code: `api/utils/aiGenerator.ts`（generateCharacters 函数的 AI prompt）

## MODIFIED Requirements

### Requirement: 角色页面AI生成查漏补缺
角色页面的"AI 生成角色"按钮 SHALL 基于作品简介和分卷框架进行查漏补缺，而非随机生成单个角色。

#### Scenario: 故事中有角色尚未创建设定
- **WHEN** 用户点击"AI 生成角色"按钮，且作品简介或分卷框架中提到了尚未有角色设定的名字
- **THEN** 系统只为这些缺失的角色生成设定并保存
- **THEN** 不会重复生成已有角色

#### Scenario: 故事中所有角色都已有设定
- **WHEN** 用户点击"AI 生成角色"按钮，且作品简介和分卷框架中提到的角色都已有设定
- **THEN** 系统生成2个除主角外的随机角色（配角/反派/龙套）

#### Scenario: 已有角色名传入AI
- **WHEN** 调用AI生成角色时
- **THEN** 将所有已有角色名传入AI，确保不重名且不重复生成
