# Tasks
- [x] Task 1: 修改 ChapterEditor.tsx 中 AI 扩写的交互流程
  - [x] handleExpand 改为：如果 aiInput 为空，只设置 activeTool="expand" 展开输入区域，不调用 AI 也不弹 alert
  - [x] 在输入区域（activeTool === "expand" 时显示的 textarea 下方）添加"开始扩写"按钮
  - [x] 点击"开始扩写"按钮时检查 aiInput 是否为空，为空则提示，否则调用 AI 扩写接口
  - [x] AI 加载中时"开始扩写"按钮显示加载状态

# Task Dependencies
无
