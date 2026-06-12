# 修复"生成大纲"按钮白屏问题 Spec

## Why
点击章节编辑器中的"生成大纲"按钮会导致整个页面白屏崩溃。根本原因是应用缺少 React ErrorBoundary，任何未捕获的渲染错误都会导致整个组件树卸载。同时 `handleGenerateOutline` 函数中存在多个潜在的错误处理漏洞，可能触发未捕获异常。

## What Changes
- 在 App.tsx 中添加全局 React ErrorBoundary，防止未捕获错误导致白屏
- 修复 `handleGenerateOutline` 中 `chapterApi.list(id)` 调用缺少独立 try/catch 的问题
- 增强 `request()` 函数的 JSON 解析容错能力
- 为 `handleGenerateContent` 添加同样的错误处理改进

## Impact
- Affected code: `src/App.tsx`, `src/pages/ChapterEditor.tsx`, `src/lib/api.ts`

## ADDED Requirements

### Requirement: 全局 ErrorBoundary
系统 SHALL 在应用根组件提供 React ErrorBoundary，当任何子组件抛出未捕获错误时，显示友好的错误提示页面而非白屏。

#### Scenario: 组件渲染崩溃
- **WHEN** 任何 React 组件在渲染过程中抛出未捕获错误
- **THEN** 应用显示错误提示页面，包含"重新加载"按钮，而非白屏

### Requirement: handleGenerateOutline 错误处理
系统 SHALL 对 `handleGenerateOutline` 中所有 API 调用提供独立的 try/catch 错误处理，确保单个 API 失败不会导致整个函数崩溃。

#### Scenario: chapterApi.list 调用失败
- **WHEN** `chapterApi.list(id)` 调用失败（如网络错误、401等）
- **THEN** 函数继续执行，使用空字符串作为 previousContent，不崩溃

#### Scenario: 任何辅助数据加载失败
- **WHEN** worldApi / characterApi / foreshadowApi 任一调用失败
- **THEN** 函数继续执行，使用已成功加载的数据，不崩溃

### Requirement: request 函数容错
系统 SHALL 在 `request()` 函数中对 JSON.parse 进行 try/catch 保护，防止服务端返回非 JSON 内容时崩溃。

#### Scenario: 服务端返回非 JSON 响应
- **WHEN** API 返回非 JSON 格式的响应体
- **THEN** request 函数抛出包含原始响应信息的友好错误，而非 SyntaxError
