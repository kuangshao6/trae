# 修复角色生成全部为配角的问题 Spec

## Why
创建作品时生成角色，AI 经常把所有角色都标为"配角"，不区分主角/配角/反派。原因是：1）缺少世界观设定作为上下文；2）prompt 没有要求 AI 先从内容中识别角色再判断类型；3）返回的 JSON 中 role 字段默认值是"配角"；4）CreateNovelPage 流程顺序错误，角色生成在世界观之前，导致 AI 无法获取世界观上下文。

## What Changes
- 修改 `CreateNovelPage.tsx`：调整流程顺序为 大纲 → 世界观 → 角色，将世界观内容传给 generateCharacters
- 修改 `api/utils/aiGenerator.ts` 中 `generateCharacters`：增加 worldview 参数，重写 prompt 要求 AI 先从简介/分卷/世界观中识别角色并判断类型，先生成这些角色，不足时再根据剧情补充
- 修改 `api/routes/ai.ts`：generate-characters 路由增加 worldview 参数
- 修改 `src/lib/api.ts`：generateCharacters 方法增加 worldview 参数
- 修改 `generateCharacters` 返回值中 role 的默认值处理

## Impact
- Affected code: `src/pages/CreateNovelPage.tsx`（流程顺序 + 传参）
- Affected code: `api/utils/aiGenerator.ts`（函数签名 + prompt + 默认值）
- Affected code: `api/routes/ai.ts`（路由参数）
- Affected code: `src/lib/api.ts`（API 方法参数）

## ADDED Requirements

### Requirement: 角色生成必须区分主角、配角、反派
系统 SHALL 在生成角色时，由内置 AI 从作品简介、分卷框架和世界观设定中识别角色，并正确标注角色类型。

#### Scenario: AI 从内容中识别角色
- **WHEN** AI 被要求生成角色
- **THEN** AI 先从作品简介、分卷框架和世界观设定中找出所有提到的角色
- **THEN** 确保先生成这些从内容中识别出的角色（优先级最高）
- **THEN** AI 根据角色在故事中的定位判断类型：主角、配角、反派、龙套
- **THEN** 返回的角色列表中必须至少有1个"主角"
- **THEN** 如果内容中暗示了反派，必须生成至少1个"反派"

#### Scenario: 角色数量不足时补充
- **WHEN** 从内容中识别出的角色数量不足
- **THEN** AI 根据剧情需要补充其他角色（如反派、关键配角等）
- **THEN** 补充的角色也必须有明确的角色类型标注

### Requirement: 角色生成需包含世界观上下文
系统 SHALL 在生成角色时将世界观设定作为上下文传给 AI。

#### Scenario: 有世界观设定时生成角色
- **WHEN** 作品已有世界观设定
- **THEN** 角色生成的 prompt 中包含世界观内容
- **THEN** AI 可以基于世界观设定更准确地识别角色和判断类型

### Requirement: 创建作品流程顺序必须为 大纲 → 世界观 → 角色
系统 SHALL 在创建作品时先生成大纲和世界观，再生成角色，确保角色生成时能获取世界观上下文。

#### Scenario: 创建作品时生成顺序
- **WHEN** 用户点击"生成大纲"按钮
- **THEN** 系统按顺序执行：1）生成大纲 2）生成世界观 3）生成角色
- **THEN** 角色生成时，世界观内容作为参数传入 generateCharacters

## MODIFIED Requirements

### Requirement: generateCharacters prompt 先识别角色再判断类型
AI prompt SHALL 要求 AI 先从简介/分卷/世界观中识别出所有角色，先生成这些角色，再根据故事定位判断每个角色是主角/配角/反派/龙套。识别出的角色不足时，根据剧情需要补充。

#### Scenario: AI 返回角色数据
- **WHEN** AI 返回角色 JSON
- **THEN** 如果某个角色的 role 为空或无效，不应默认填"配角"，而应保留空值让前端处理
