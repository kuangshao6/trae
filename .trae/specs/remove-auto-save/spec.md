# 移除章节编辑器自动保存 Spec

## Why
用户不希望章节编辑器自动保存，只保留手动"保存"按钮。自动保存可能导致用户在编辑过程中意外覆盖内容。

## What Changes
- 移除章节编辑器中的自动保存 useEffect（3秒防抖）
- 移除 placeholder 中关于自动保存的提示文字
- 保留手动"保存"按钮和 `doSave`/`handleSaveNow` 逻辑

## Impact
- Affected code: `src/pages/ChapterEditor.tsx`

## MODIFIED Requirements
### Requirement: 章节编辑器保存机制
章节编辑器 SHALL 仅通过用户手动点击"保存"按钮来保存内容，不再自动保存。用户编辑内容后，需主动点击保存按钮才会将更改写入后端。

#### Scenario: 用户编辑内容后不点击保存
- **WHEN** 用户修改了标题、正文、摘要或状态
- **THEN** 内容不会自动保存，仅保存在本地状态中

#### Scenario: 用户手动点击保存
- **WHEN** 用户点击"保存"按钮
- **THEN** 内容保存到后端，显示"已保存"时间戳
