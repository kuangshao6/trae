# Tasks
- [x] Task 1: 修改后端 `aiGenerator.ts` 中四个函数，增加上下文参数
  - [x] `continueChapter` 增加 novelTitle、genre、characters、worldview 参数，prompt 中加入上下文；返回值只返回续写部分（不含原文）
  - [x] `expandContent` 增加 novelTitle、genre、characters、worldview 参数，prompt 中加入上下文
  - [x] `polishContent` 增加 novelTitle、genre、characters、worldview 参数，prompt 中加入上下文
  - [x] `addConflict` 增加 novelTitle、genre、characters、worldview 参数，prompt 中加入上下文

- [x] Task 2: 修改后端 `ai.ts` 路由，传递上下文参数
  - [x] `/ai/continue` 路由接收并传递 novelTitle、genre、characters、worldview
  - [x] `/ai/expand` 路由接收并传递 novelTitle、genre、characters、worldview
  - [x] 删除 `/ai/polish` 路由（用户要求删除润色功能）
  - [x] `/ai/conflict` 路由接收并传递 novelTitle、genre、characters、worldview

- [x] Task 3: 修改前端 `api.ts` 中四个 API 方法的参数类型
  - [x] `continueChapter` 增加 novelTitle、genre、characters、worldview 可选参数
  - [x] `expandContent` 增加 novelTitle、genre、characters、worldview 可选参数
  - [x] `polishContent` 增加 novelTitle、genre、characters、worldview 可选参数
  - [x] `addConflict` 增加 novelTitle、genre、characters、worldview 可选参数

- [x] Task 4: 修改前端 `ChapterEditor.tsx`，调用时传入上下文
  - [x] 在组件加载时获取角色和世界观信息
  - [x] 三个 handle 函数调用时传入 novelTitle、genre、characters、worldview
  - [x] 修复续写结果：`continueChapter` 现在只返回续写部分，`handleContinue` 直接设置 `aiOutput`
  - [x] 删除 AI 润色功能（handlePolish 函数和 UI 按钮）

# Task Dependencies
- Task 2 depends on Task 1
- Task 4 depends on Task 3
