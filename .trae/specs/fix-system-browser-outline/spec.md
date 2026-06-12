# 修复系统浏览器"生成大纲"崩溃问题 Spec

## Why
在系统浏览器中点击"生成大纲"按钮后，页面显示 ErrorBoundary 的"页面出错了"页面。当前 ErrorBoundary 没有显示具体错误信息，无法定位崩溃原因。同时 Layout 组件中的 `useEffect` 会在 `isAuthenticated` 为 false 时强制跳转到登录页，可能在 API 请求过程中触发不必要的导航。

## What Changes
- 增强 ErrorBoundary，捕获并显示具体错误信息和堆栈，便于调试
- 移除 Layout 组件中不必要的 `isAuthenticated` 检查和强制跳转（App.tsx 已有路由保护）
- 修复 `handleGenerateOutline` 中重复 API 调用问题：使用组件已加载的状态数据替代重新请求

## Impact
- Affected code: `src/App.tsx`, `src/components/Layout.tsx`, `src/pages/ChapterEditor.tsx`

## ADDED Requirements

### Requirement: ErrorBoundary 显示错误详情
系统 SHALL 在 ErrorBoundary 捕获到错误时，显示具体的错误信息和堆栈跟踪，便于开发者定位问题。

#### Scenario: 渲染崩溃
- **WHEN** React 组件渲染时抛出错误
- **THEN** ErrorBoundary 页面显示错误消息和堆栈信息

### Requirement: 移除 Layout 中冗余的鉴权跳转
系统 SHALL 移除 Layout 组件中的 `useEffect` 鉴权检查，因为 App.tsx 的路由保护已经处理了未登录用户的跳转。

#### Scenario: API 请求过程中鉴权状态变化
- **WHEN** 组件内 API 请求导致鉴权状态临时变化
- **THEN** Layout 不会强制跳转到登录页

### Requirement: handleGenerateOutline 使用组件已加载数据
系统 SHALL 在 `handleGenerateOutline` 中使用组件已加载的状态数据（worldSettings、characters），避免重复请求需要鉴权的 API。

#### Scenario: 生成大纲时获取世界观和角色数据
- **WHEN** 用户点击"生成大纲"按钮
- **THEN** 世界观和角色信息从组件状态获取，不再调用 worldApi.list 和 characterApi.list
