# Tasks

- [x] Task 1: 创建 CreateNovelPage.tsx 独立页面
  - [x] SubTask 1.1: 页面布局：左侧表单区域 + 右侧预览区域
  - [x] SubTask 1.2: 作品标题输入
  - [x] SubTask 1.3: 题材卡片式选择（11个题材带emoji图标）
  - [x] SubTask 1.4: 目标字数选择（快捷按钮：20万/50万/100万/自定义）
  - [x] SubTask 1.5: 标签输入
  - [x] SubTask 1.6: 作品简介输入 + AI生成简介按钮
  - [x] SubTask 1.7: 底部操作栏：取消（返回）+ 创建作品按钮
  - [x] SubTask 1.8: 创建成功后跳转到作品详情页

- [x] Task 2: 修改 Dashboard.tsx，移除弹窗，按钮改为跳转
  - [x] SubTask 2.1: 移除 showCreate 状态和弹窗 JSX
  - [x] SubTask 2.2: "开始创作"按钮改为 navigate("/novels/create")

- [x] Task 3: 修改 MyNovelsPage.tsx，移除弹窗，按钮改为跳转
  - [x] SubTask 3.1: 移除 showCreate 状态和弹窗 JSX
  - [x] SubTask 3.2: "新建作品"按钮改为 navigate("/novels/create")

- [x] Task 4: 在 App.tsx 添加路由
  - [x] SubTask 4.1: 添加 import CreateNovelPage
  - [x] SubTask 4.2: 添加路由 /novels/create（在 /novels/:id 之前）

# Task Dependencies
- Task 2, 3, 4 依赖 Task 1
