# 修复AI扩写交互流程 Spec

## Why
当前"AI 扩写"按钮的交互流程有缺陷：点击后如果输入框为空会弹出 alert，但输入框只在点击后才出现，且没有提交按钮。用户不清楚在哪里输入内容以及如何触发扩写。

## What Changes
- 点击"AI 扩写"按钮时，如果输入框为空，只展开输入区域，不弹出 alert
- 在输入区域添加"开始扩写"提交按钮
- 点击"开始扩写"时才调用 AI 接口

## Impact
- Affected code: `src/pages/ChapterEditor.tsx`（handleExpand 函数和 UI）

## MODIFIED Requirements

### Requirement: AI扩写交互流程优化
AI 扩写功能 SHALL 提供清晰的输入和提交流程。

#### Scenario: 用户点击AI扩写按钮
- **WHEN** 用户点击"AI 扩写"按钮
- **THEN** 展开输入区域，不弹出 alert
- **THEN** 输入区域有"开始扩写"按钮

#### Scenario: 用户输入内容后点击开始扩写
- **WHEN** 用户在输入框中输入内容并点击"开始扩写"
- **THEN** 调用 AI 扩写接口
- **THEN** 如果输入为空，弹出提示
