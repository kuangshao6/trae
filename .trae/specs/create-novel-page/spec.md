# 创建作品独立页面 Spec

## Why
当前创建作品使用弹窗（Modal），空间有限、体验不佳。需要改为独立页面，提供更丰富的创作引导和更大的编辑空间。

## What Changes
- 新建 `/novels/create` 独立页面，替代所有弹窗式创建作品入口
- 移除 Dashboard.tsx 和 MyNovelsPage.tsx 中的弹窗代码
- 所有"新建作品"按钮改为跳转到 `/novels/create`

## Impact
- Affected code: `src/pages/Dashboard.tsx`（移除弹窗，按钮改为跳转）
- Affected code: `src/pages/MyNovelsPage.tsx`（移除弹窗，按钮改为跳转）
- Affected code: `src/App.tsx`（新增路由）
- 新增文件: `src/pages/CreateNovelPage.tsx`

## ADDED Requirements

### Requirement: 创建作品独立页面
系统 SHALL 提供独立的创建作品页面 `/novels/create`，替代弹窗式创建。

#### Scenario: 访问创建页面
- **WHEN** 用户点击"新建作品"按钮
- **THEN** 跳转到 `/novels/create` 页面

#### Scenario: 填写作品信息
- **WHEN** 用户在创建页面填写作品信息
- **THEN** 页面提供：作品标题、题材选择（卡片式）、目标字数、标签、作品简介、AI辅助生成简介

#### Scenario: 创建成功
- **WHEN** 用户填写完信息并点击"创建作品"
- **THEN** 创建作品并跳转到作品详情页

#### Scenario: 取消创建
- **WHEN** 用户点击"取消"或返回
- **THEN** 返回上一页

### Requirement: 题材卡片式选择
系统 SHALL 以卡片网格形式展示题材选项，替代下拉框。

#### Scenario: 选择题材
- **WHEN** 用户点击某个题材卡片
- **THEN** 该卡片高亮选中，其他卡片取消选中

### Requirement: AI辅助生成简介
系统 SHALL 提供AI一键生成作品简介功能。

#### Scenario: AI生成简介
- **WHEN** 用户填写标题和题材后点击"AI生成简介"
- **THEN** 系统调用AI根据标题和题材生成简介，填入简介输入框
