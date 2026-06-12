# Tasks

- [ ] Task 1: 增强 ErrorBoundary 显示错误详情
  - [ ] 在 ErrorBoundary 中添加 componentDidCatch 生命周期，捕获 error 和 errorInfo
  - [ ] 在错误页面中显示错误消息和堆栈信息（可折叠）
- [ ] Task 2: 移除 Layout 中冗余的鉴权跳转
  - [ ] 删除 Layout.tsx 中 useEffect 里的 isAuthenticated 检查和 navigate("/login") 逻辑
- [ ] Task 3: 修改 handleGenerateOutline 使用组件已加载数据
  - [ ] 将 worldApi.list(id) 替换为使用 worldSettings 状态
  - [ ] 将 characterApi.list(id) 替换为使用 characters 状态
  - [ ] 将 chapterApi.list(id) 替换为使用 loadData 中已加载的章节数据（需新增 chapters 状态）
  - [ ] 在 loadData 中将 chapterApi.list(id) 结果保存到新增的 chapters 状态
- [ ] Task 4: 修改 handleGenerateContent 使用组件已加载数据
  - [ ] 将 chapterApi.list(id) 替换为使用 chapters 状态

# Task Dependencies
- Task 1、Task 2 独立，可并行
- Task 3 需先新增 chapters 状态
- Task 4 依赖 Task 3 中的 chapters 状态
