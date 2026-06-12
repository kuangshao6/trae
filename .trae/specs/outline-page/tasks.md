# Tasks

- [x] Task 1: 创建 OutlinePage.tsx 大纲生成页面
  - [x] SubTask 1.1: 页面布局：顶部作品信息 + Tab切换（分卷框架/角色/世界观）
  - [x] SubTask 1.2: 作品标题和简介展示（可编辑）
  - [x] SubTask 1.3: 分卷框架Tab：展示AI生成的分卷列表，每卷含卷名、核心冲突、预计章节数（可编辑）
  - [x] SubTask 1.4: 角色Tab：展示AI生成的角色列表，每个角色含姓名、类型、简介（可编辑）
  - [x] SubTask 1.5: 世界观Tab：展示AI生成的世界观设定（可编辑）
  - [x] SubTask 1.6: 底部"确认并开始创作"按钮，保存所有内容并跳转到作品详情页
  - [x] SubTask 1.7: 接收URL参数中的novelId，从API加载作品数据

- [x] Task 2: 修改 CreateNovelPage.tsx 的"生成大纲"按钮逻辑
  - [x] SubTask 2.1: 点击后先创建作品
  - [x] SubTask 2.2: 创建成功后并行调用AI生成分卷框架、3个角色、世界观
  - [x] SubTask 2.3: 将AI生成的内容保存到作品数据中
  - [x] SubTask 2.4: 跳转到 /novels/outline?novelId=xxx 页面
  - [x] SubTask 2.5: 显示生成进度（loading状态）

- [x] Task 3: 在 App.tsx 添加路由
  - [x] SubTask 3.1: 添加 /novels/outline 路由指向 OutlinePage

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3 独立
