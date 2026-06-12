# 修复世界观AI分类完善逻辑 Spec

## Why
世界观页面的"AI分类完善"按钮当前是凭空重新生成世界观，应该基于大纲生成时已有的世界观数据来分类拆分，保留原始内容。

## What Changes
- 修改 NovelModule.tsx 的 handleCategorize 逻辑：收集现有世界观条目的内容作为上下文，让AI基于这些内容按分类重新组织，而不是凭空生成
- 伏笔页面和世界观页面数据是分开的（不同API），确认无数据混淆

## Impact
- Affected code: `src/pages/NovelModule.tsx`（handleCategorize 函数）

## MODIFIED Requirements

### Requirement: 世界观AI分类完善基于现有数据
系统 SHALL 在AI分类完善时，基于现有世界观条目的内容进行分类拆分，而不是凭空重新生成。

#### Scenario: 点击AI分类完善
- **WHEN** 用户在世界观页面点击"AI分类完善"按钮
- **THEN** 系统收集所有现有世界观条目的内容（包括被过滤的outline条目）
- **THEN** AI基于这些已有内容按分类重新组织，保留原始信息
- **THEN** 删除旧条目，创建新的分类条目
