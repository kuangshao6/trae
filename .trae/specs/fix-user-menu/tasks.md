# Tasks

- [x] Task 1: 修复 Layout.tsx 用户下拉菜单交互逻辑
  - [x] SubTask 1.1: 重写用户菜单按钮的点击事件处理，确保菜单能正确打开/关闭
  - [x] SubTask 1.2: 下拉菜单只保留"个人中心"和"退出登录"两个按钮，移除"升级会员"
  - [x] SubTask 1.3: "个人中心"按钮点击后跳转到 `/profile` 并关闭菜单
  - [x] SubTask 1.4: "退出登录"按钮点击后清除登录状态并跳转到 `/login`
  - [x] SubTask 1.5: 点击菜单外部区域自动关闭菜单

- [x] Task 2: 确认个人中心页面 `/profile` 功能完整
  - [x] SubTask 2.1: 确认 ProfilePage.tsx 已正确展示用户信息（头像、用户名、笔名、邮箱、简介）
  - [x] SubTask 2.2: 确认个人信息编辑和保存功能正常
  - [x] SubTask 2.3: 确认路由 `/profile` 已在 App.tsx 中配置

# Task Dependencies
- Task 2 依赖 Task 1（菜单跳转需要先修复）
