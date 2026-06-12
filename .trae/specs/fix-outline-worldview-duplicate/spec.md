# 修复大纲页面世界观保存重复 Spec

## Why
大纲页面保存世界观时使用英文 title "worldview"，而创建作品时生成的世界观条目 title 为"世界观设定"，导致查找失败后创建了重复条目。用户在世界观页面看到两个条目：一个叫"世界观设定"，一个叫"worldview"（英文）。

## What Changes
- 修改 OutlinePage.tsx 的 handleSave 中世界观的查找和保存逻辑：将 `title: "worldview"` 改为 `title: "世界观设定"`，与 CreateNovelPage 保持一致

## Impact
- Affected code: `src/pages/OutlinePage.tsx`（handleSave 函数中世界观数据的查找和创建）

## MODIFIED Requirements

### Requirement: 大纲页面世界观保存一致性
大纲页面保存世界观数据时 SHALL 使用与创建作品时一致的 title "世界观设定"，确保更新已有条目而非创建重复条目。

#### Scenario: 用户在大纲页面保存世界观
- **WHEN** 用户在大纲页面编辑世界观并点击保存
- **THEN** 系统查找 title 为"世界观设定"的已有世界观条目并更新
- **THEN** 如果不存在则创建新条目，title 为"世界观设定"
- **THEN** 不会出现重复的世界观条目
