# 修复创建作品生成两个故事和角色全是配角问题 Spec

## Why
创建作品时点击"生成大纲"按钮，存在两个严重问题：1）系统生成了两个不同的故事内容——第一次 `generateOutline` 生成的大纲与用户输入无关，第二次用 `generateOutline` 生成世界观时反而生成了与用户输入相关的故事，用户看到两个完全不同的故事交替出现；2）生成的角色全是配角，用户简介中明确提到的主角未被生成。

## What Changes
- 修改 `CreateNovelPage.tsx` 的 `handleCreate` 流程：将世界观生成从 `aiApi.generateOutline` 改为 `aiApi.worldviewCategories`，只生成世界观设定，不再重复生成故事
- 修改 `generateOutline` 的 AI prompt：强化对用户 description 的引用，确保生成的故事紧扣用户输入
- 修改 `generateCharacters` 的 AI prompt：强制要求从作品简介中提取角色，必须识别主角，主角 role 必须为"主角"
- 修改 `generateCharacters` 降级逻辑：降级时第一个角色必须为"主角"

## Impact
- Affected code: `src/pages/CreateNovelPage.tsx`（handleCreate 世界观生成逻辑）
- Affected code: `api/utils/aiGenerator.ts`（generateOutline prompt + generateCharacters prompt + 降级逻辑）

## ADDED Requirements

### Requirement: 角色生成必须从简介中提取且包含主角
系统 SHALL 在创建作品生成角色时，从生成的作品简介中提取角色，确保主角一定被生成。

#### Scenario: 简介中明确提到主角名
- **WHEN** 生成的作品简介中提到了主角名字（如"少年林风"）
- **THEN** 系统必须识别并生成该主角的角色设定，role 为"主角"
- **THEN** 其他从简介和分卷中提取的角色按实际定位分配角色类型

#### Scenario: 简介中未明确提到角色名
- **WHEN** 简介中没有明确的角色名
- **THEN** 系统根据题材和故事内容推断并生成主角
- **THEN** 主角的 role 必须为"主角"，不能全部为配角

### Requirement: 创建作品只生成一次故事，世界观用专用接口
系统 SHALL 在创建作品时只调用一次 `generateOutline` 生成故事大纲，世界观使用 `generateWorldviewCategories` 接口。

#### Scenario: 点击"生成大纲"按钮
- **WHEN** 用户点击"生成大纲"按钮创建作品
- **THEN** 系统只调用一次 `generateOutline` 生成故事大纲（含分卷框架）
- **THEN** 世界观使用 `aiApi.worldviewCategories` 接口生成，不再复用 `generateOutline`
- **THEN** 世界观结果按分类逐条存入 worldApi
- **THEN** 用户不会看到两个不同的故事内容交替出现

## MODIFIED Requirements

### Requirement: generateOutline prompt 紧扣用户输入
AI prompt SHALL 明确要求以用户的 description 为核心生成故事，不能偏离用户输入。

#### Scenario: 用户提供了简介
- **WHEN** 用户在简介中写了一句话（如"少年林风在山中发现一块神秘玉佩"）
- **THEN** 生成的大纲必须围绕这句话展开，不能生成与用户输入无关的故事

### Requirement: generateCharacters prompt 强化主角识别
AI prompt SHALL 明确要求从简介中提取角色，先识别主角，再补充其他角色，且主角 role 必须为"主角"。

#### Scenario: AI 生成角色
- **WHEN** AI 被要求生成角色
- **THEN** prompt 中必须包含"从作品简介中提取所有角色"的指令
- **THEN** prompt 中必须包含"先识别主角"的指令
- **THEN** prompt 中必须强调"主角的 role 必须填'主角'，不能填'配角'"
