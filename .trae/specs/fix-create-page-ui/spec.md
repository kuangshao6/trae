# 创建作品页面UI修复 Spec

## Why
创建作品页面有三个UI问题需要修复：AI生成简介按钮未正确连接AI、底部按钮文案需修改、导航栏有多余链接。

## What Changes
- "AI 生成简介"按钮：根据所选题材调用内置AI生成简短故事简介，自动填入作品简介输入框
- "创建作品"按钮改为"生成大纲"（功能不变，只是文案修改）
- 移除导航栏中的"构思工具"链接

## Impact
- Affected code: `src/pages/CreateNovelPage.tsx`
- Affected code: `src/components/Layout.tsx`

## ADDED Requirements

### Requirement: AI生成简介功能
系统 SHALL 根据用户选择的题材和输入的标题，调用内置AI生成简短故事简介并填入输入框。

#### Scenario: AI生成简介
- **WHEN** 用户选择了题材并点击"AI 生成简介"
- **THEN** 系统调用AI根据题材和标题生成100-200字的简短简介，填入作品简介输入框

## MODIFIED Requirements

### Requirement: 底部按钮文案
"创建作品"按钮文案改为"生成大纲"。

### Requirement: 导航栏精简
移除顶部导航栏中的"构思工具"链接。
