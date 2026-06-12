# Tasks

- [x] Task 1: 创建 AI 服务层 (api/utils/aiService.ts)
  - [x] SubTask 1.1: 安装 openai npm 包
  - [x] SubTask 1.2: 创建 aiService.ts，封装 OpenAI 兼容 API 调用
  - [x] SubTask 1.3: 支持通过 .env 配置 AI_API_KEY、AI_BASE_URL、AI_MODEL
  - [x] SubTask 1.4: 实现统一调用函数 callAI(prompt, systemPrompt)，含错误处理和超时
  - [x] SubTask 1.5: 无 API Key 时自动降级到本地模板

- [x] Task 2: 为每个 AI 功能编写 Prompt 模板
  - [x] SubTask 2.1: 大纲生成 Prompt
  - [x] SubTask 2.2: 章节生成 Prompt
  - [x] SubTask 2.3: 续写 Prompt
  - [x] SubTask 2.4: 扩写 Prompt
  - [x] SubTask 2.5: 润色 Prompt
  - [x] SubTask 2.6: 冲突补充 Prompt
  - [x] SubTask 2.7: 短篇故事 Prompt
  - [x] SubTask 2.8: 剧本改写 Prompt
  - [x] SubTask 2.9: 角色生成 Prompt
  - [x] SubTask 2.10: 爽点设计 Prompt

- [x] Task 3: 改造 aiGenerator.ts，优先调用 AI API，fallback 到本地模板
  - [x] SubTask 3.1: 改造 generateOutline 函数
  - [x] SubTask 3.2: 改造 generateChapter 函数
  - [x] SubTask 3.3: 改造 continueChapter 函数
  - [x] SubTask 3.4: 改造 expandContent 函数
  - [x] SubTask 3.5: 改造 polishContent 函数
  - [x] SubTask 3.6: 改造 addConflict 函数
  - [x] SubTask 3.7: 改造 generateShortStory 函数
  - [x] SubTask 3.8: 改造 convertToScript 函数
  - [x] SubTask 3.9: 改造 generateCharacter 函数
  - [x] SubTask 3.10: 改造 generateHighlights 函数

- [x] Task 4: 创建 .env 配置文件和加载逻辑
  - [x] SubTask 4.1: 创建 .env.example 示例文件
  - [x] SubTask 4.2: 在 server.ts 中加载 dotenv
  - [x] SubTask 4.3: 在 .gitignore 中添加 .env

- [x] Task 5: 修复 AI 构思工具路由和页面
  - [x] SubTask 5.1: 修复 /tools/ideation 路由
  - [x] SubTask 5.2: 完善 IdeationTool.tsx 页面

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3 依赖 Task 1 + Task 2
- Task 4 独立
- Task 5 独立
