# Tasks

- [x] Task 1: 修改 CreateNovelPage handleCreate 流程，简介过短时自动扩写
  - [x] SubTask 1.1: 在调用 `generateOutline` 之前，检测 description 长度，如果 < 100字且非空，调用 `aiApi.generateOutline` 扩写简介（theme 设为"请将以下简短描述扩写为200-300字的故事简介，保留原始意图"）
  - [x] SubTask 1.2: 将扩写后的 mainOutline 调用 `novelApi.update` 写入作品简介
  - [x] SubTask 1.3: 将扩写后的内容赋值给 description 变量，供后续大纲生成使用
  - [x] SubTask 1.4: 添加进度提示"正在扩写简介..."

# Task Dependencies
- 无外部依赖
