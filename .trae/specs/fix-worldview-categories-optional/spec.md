# 世界观AI分类完善不强制全分类 Spec

## Why
"AI分类完善"按钮当前强制要求AI按8个固定分类（地点、历史、势力、功法、物品、种族、规则、概念设定）生成世界观，导致没有相关内容的分类也被凭空编造。应该只生成世界观中实际有内容的分类，没有的分类可以省略。

## What Changes
- 修改 `generateWorldviewByCategories` 的 AI prompt：不再列出固定分类要求每个都写，而是让AI根据已有内容自行判断需要哪些分类，只生成有实际内容的分类
- 修改降级模板：不再为所有8个分类都生成占位内容，只返回空数组或基于已有内容生成

## Impact
- Affected code: `api/utils/aiGenerator.ts`（`generateWorldviewByCategories` 函数）

## MODIFIED Requirements

### Requirement: 世界观AI分类完善按需生成分类
"AI分类完善" SHALL 只为世界观中实际有内容的分类生成条目，不强制生成所有预设分类。

#### Scenario: 世界观中只包含部分分类的内容
- **WHEN** 用户点击"AI分类完善"，且世界观内容只涉及地点和势力
- **THEN** 系统只为地点和势力生成分类条目，不生成其他无内容的分类

#### Scenario: 世界观中包含所有分类的内容
- **WHEN** 世界观内容涉及多个分类
- **THEN** 系统为每个有内容的分类生成条目
