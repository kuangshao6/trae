# 修复伏笔页面显示世界观数据 Spec

## Why
伏笔页面显示了世界观数据。原因是 NovelModule 组件的 `useEffect` 依赖只有 `[id]`，当用户从世界观页面导航到伏笔页面时（id 不变），不会重新加载数据，导致伏笔页面显示的是世界观的旧数据。

## What Changes
- 将 NovelModule.tsx 中 `useEffect` 的依赖从 `[id]` 改为 `[id, type]`，确保切换页面类型时重新加载数据

## Impact
- Affected code: `src/pages/NovelModule.tsx`

## MODIFIED Requirements
### Requirement: NovelModule 数据加载
NovelModule 组件 SHALL 在 `id` 或 `type` 变化时重新加载数据，确保世界观、伏笔、约束页面各自显示正确的数据。

#### Scenario: 用户从世界观页面导航到伏笔页面
- **WHEN** 用户从 `/novels/:id/world` 导航到 `/novels/:id/foreshadow`
- **THEN** 伏笔页面调用 `foreshadowApi.list(id)` 加载伏笔数据，而非显示之前的世界观数据
