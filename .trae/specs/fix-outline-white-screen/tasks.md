# Tasks

- [x] Task 1: 在 App.tsx 中添加全局 ErrorBoundary 组件
  - [x] 创建 ErrorBoundary class 组件，捕获渲染错误并显示友好提示页面
  - [x] 在 App.tsx 中用 ErrorBoundary 包裹 Routes
- [x] Task 2: 修复 handleGenerateOutline 中 chapterApi.list 缺少独立 try/catch 的问题
  - [x] 将 chapterApi.list(id) 调用包裹在独立 try/catch 中
  - [x] 同样修复 handleGenerateContent 中的 chapterApi.list 调用
- [x] Task 3: 增强 request() 函数的 JSON 解析容错
  - [x] 在 JSON.parse 外添加 try/catch，捕获 SyntaxError 并抛出友好错误信息

# Task Dependencies
- Task 1 独立，可并行执行
- Task 2 和 Task 3 独立，可并行执行
