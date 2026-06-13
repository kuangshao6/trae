# 修复角色页面AI生成按钮查漏补缺优先级 Spec

## Why
角色页面的"AI 生成角色"按钮在查漏补缺时，不传世界观设定和章节内容给 AI，也不告诉 AI 已有哪些角色定位（主角/配角/反派），导致 AI 不知道缺主角还一直生成配角。应该基于世界观设定、作品简介、分卷框架和章节内容查漏补缺角色，优先补充主角和反派等重要角色，在重要角色都存在的情况下再考虑生成配角。

## What Changes
- 修改 `NovelCharacters.tsx` 的 `handleAiGenerate` 函数：读取世界观设定、章节内容并传给 AI，传入已有角色的角色定位信息（不仅是名字）
- 修改 `api/utils/aiGenerator.ts` 的 `generateCharacters` 函数：增加 `existingRoles` 和 `chapters` 参数，重写 prompt 要求 AI 基于世界观、简介、分卷框架和章节内容查漏补缺，优先补充主角和反派
- 修改 `api/routes/ai.ts`：传递 existingRoles 和 chapters 参数
- 修改 `src/lib/api.ts`：增加 existingRoles 和 chapters 参数

## Impact
- Affected code: `src/pages/NovelCharacters.tsx`（handleAiGenerate 函数：传世界观 + 章节 + 传角色定位）
- Affected code: `api/utils/aiGenerator.ts`（generateCharacters 函数签名 + prompt）
- Affected code: `api/routes/ai.ts`（路由参数：传递 existingRoles 和 chapters）
- Affected code: `src/lib/api.ts`（API 方法参数：增加 existingRoles 和 chapters）

## ADDED Requirements

### Requirement: AI生成角色时优先补充主角和反派
系统 SHALL 在角色页面点击"AI 生成角色"时，基于世界观设定、作品简介、分卷框架和章节内容查漏补缺角色，优先补充缺失的重要角色（主角、反派），再考虑配角。

#### Scenario: 缺少主角时生成角色
- **WHEN** 已有角色中没有"主角"，用户点击"AI 生成角色"
- **THEN** AI 必须优先从世界观设定、作品简介、分卷框架和章节内容中识别并生成主角
- **THEN** 如果同时缺少反派，也必须生成反派

#### Scenario: 主角和反派都存在时生成角色
- **WHEN** 已有角色中已有"主角"和"反派"，用户点击"AI 生成角色"
- **THEN** AI 可以根据剧情需要补充配角、龙套等角色

#### Scenario: AI 根据故事内容正确判断角色定位
- **WHEN** AI 从世界观设定、作品简介、分卷框架和章节内容中识别角色
- **THEN** AI 根据角色在故事中的核心程度判断：故事核心人物为主角，对立面为反派，重要但非核心为配角

### Requirement: 角色页面AI生成需传入世界观、章节内容和已有角色定位
系统 SHALL 在角色页面调用 AI 生成角色时，将世界观设定、章节内容和已有角色的定位信息传给 AI。

#### Scenario: 传入世界观设定和章节内容
- **WHEN** 作品已有世界观设定和章节内容
- **THEN** AI 生成角色的请求中包含世界观内容和章节内容摘要
- **THEN** AI 可以基于更完整的上下文识别角色和判断定位

#### Scenario: 传入已有角色定位
- **WHEN** 作品已有角色
- **THEN** AI 生成角色的请求中包含每个已有角色的名字和定位（主角/配角/反派/龙套）
- **THEN** AI 可以据此判断哪些重要定位缺失

## MODIFIED Requirements

### Requirement: generateCharacters 支持传入已有角色定位和章节内容
generateCharacters 函数 SHALL 接受已有角色的定位信息和章节内容，并在 prompt 中要求 AI 基于所有上下文查漏补缺，优先补充缺失的重要角色。

#### Scenario: 已有角色包含定位信息
- **WHEN** 调用 generateCharacters 时传入 existingRoles（如 [{name: "张三", role: "配角"}]）
- **THEN** AI prompt 中包含已有角色及其定位
- **THEN** AI 优先补充缺失的定位（如没有主角则必须生成主角）

#### Scenario: 传入章节内容
- **WHEN** 调用 generateCharacters 时传入 chapters 内容
- **THEN** AI prompt 中包含章节内容摘要
- **THEN** AI 可以从章节内容中识别更多角色
