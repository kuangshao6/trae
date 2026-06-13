# 分卷框架独立存储 Spec

## Why
分卷框架目前通过 `worldApi` 存储在 `worldSettings` 中（title="volumes"，category="outline"），与世界观设定混在同一个存储里。分卷框架是独立的概念，不应归属于世界观设定，需要将其独立存储。

## What Changes
- 在 `DataStore` 中新增 `volumes` 独立存储（`VolumeRecord[]`）
- 新增 `volumeStore` 数据存储模块（CRUD 操作）
- 新增后端路由 `/novels/:id/volumes`（GET/POST/PUT/DELETE）
- 前端新增 `volumeApi`，替代通过 `worldApi` 存储分卷框架的方式
- 修改 `CreateNovelPage.tsx`：分卷框架保存到 `volumeApi` 而非 `worldApi`
- 修改 `OutlinePage.tsx`：分卷框架从 `volumeApi` 加载和保存
- 修改 `NovelModule.tsx`：世界观页面移除对 `title === "volumes"` 的过滤逻辑
- 数据迁移：将现有 `worldSettings` 中 `title="volumes"` 的数据迁移到新的 `volumes` 存储

## Impact
- Affected specs: 分卷框架存储、世界观设定过滤
- Affected code: `storage.ts`、`novels.ts`（路由）、`api.ts`（前端API）、`CreateNovelPage.tsx`、`OutlinePage.tsx`、`NovelModule.tsx`

## ADDED Requirements

### Requirement: 分卷框架独立存储
系统 SHALL 提供独立的分卷框架存储，与世界观设定分离。

#### Scenario: 创建作品时保存分卷框架
- **WHEN** 用户在创建作品页面点击"生成大纲"
- **THEN** 分卷框架数据保存到独立的 `volumes` 存储，而非 `worldSettings`

#### Scenario: 大纲页面加载分卷框架
- **WHEN** 用户打开大纲页面
- **THEN** 分卷框架从独立的 `volumeApi` 加载，而非从 `worldApi` 中查找 title="volumes"

#### Scenario: 世界观页面不再显示分卷框架
- **WHEN** 用户打开世界观设定页面
- **THEN** 不再需要过滤 title="volumes" 的条目，因为分卷框架已独立存储

### Requirement: 数据迁移
系统 SHALL 在启动时自动将旧的 `worldSettings` 中 `title="volumes"` 的数据迁移到新的 `volumes` 存储。

#### Scenario: 旧数据迁移
- **WHEN** 系统启动时检测到 `worldSettings` 中存在 `title="volumes"` 的条目
- **THEN** 自动将该数据迁移到 `volumes` 存储，并删除旧的 worldSettings 条目

## MODIFIED Requirements

### Requirement: 分卷框架存储方式
分卷框架 SHALL 使用独立的 `volumeStore` 和 `volumeApi` 进行存储和访问，不再通过 `worldSettingStore` 和 `worldApi`。

## REMOVED Requirements

### Requirement: 世界观设定中过滤 volumes 条目
**Reason**: 分卷框架已独立存储，世界观设定中不再包含 volumes 条目
**Migration**: 移除 NovelModule.tsx 中 `title === "volumes"` 的过滤逻辑
