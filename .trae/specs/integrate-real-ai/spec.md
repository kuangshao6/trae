# 接入真实AI + 项目查漏补缺 Spec

## Why
当前平台所有AI功能（大纲生成、章节生成、续写、扩写、润色、冲突补充、短篇故事、剧本改写等）均使用本地模板拼接，生成内容套路化、重复度高。需要接入真实AI API，让所有AI功能生成高质量、个性化的内容。同时对照参考图查漏补缺，补全缺失页面和功能。

## What Changes
- 接入 OpenAI 兼容 API（支持 DeepSeek、通义千问等国产模型），统一替换所有 AI 生成函数
- 后端新增 AI 服务层，统一管理 API 调用、Prompt 模板、错误处理
- 前端所有 AI 相关功能通过后端 API 调用真实 AI
- 保留本地模板作为 fallback（AI 不可用时降级）
- 补全缺失页面：AI构思工具独立页面（当前 /tools/ideation 错误地指向 ShortStoryGenerator）
- 完善现有页面功能

## Impact
- Affected code: `api/utils/aiGenerator.ts`（核心改造，接入真实AI）
- Affected code: `api/routes/ai.ts`（可能需要新增流式响应）
- Affected code: `api/server.ts`（新增环境变量配置）
- Affected code: `src/App.tsx`（路由修正）
- Affected code: `src/pages/NovelIdeation.tsx`（AI构思工具页面完善）
- 新增文件: `api/utils/aiService.ts`（AI服务层）
- 新增文件: `.env`（API密钥配置）

## ADDED Requirements

### Requirement: 接入真实AI API
系统 SHALL 通过 OpenAI 兼容 API 接入大语言模型，用于所有 AI 内容生成功能。

#### Scenario: AI API 配置
- **WHEN** 管理员在 .env 中配置 AI_API_KEY 和 AI_BASE_URL
- **THEN** 系统使用配置的 API 进行内容生成

#### Scenario: AI 生成大纲
- **WHEN** 用户请求生成大纲
- **THEN** 系统调用 AI API 生成高质量、个性化的大纲内容

#### Scenario: AI 生成章节
- **WHEN** 用户请求生成章节
- **THEN** 系统根据大纲、前文上下文调用 AI API 生成连贯的章节内容

#### Scenario: AI 续写/扩写/润色/冲突补充
- **WHEN** 用户在编辑器中使用 AI 辅助功能
- **THEN** 系统调用 AI API 根据当前内容生成续写/扩写/润色/冲突内容

#### Scenario: AI 生成短篇故事
- **WHEN** 用户使用短篇故事生成器
- **THEN** 系统调用 AI API 根据主题、风格、关键词生成完整短篇故事

#### Scenario: AI 剧本改写
- **WHEN** 用户使用剧本改写工具
- **THEN** 系统调用 AI API 将内容改写为剧本格式

#### Scenario: Fallback 降级
- **WHEN** AI API 不可用（无密钥、网络错误、额度用尽）
- **THEN** 系统降级使用本地模板生成，并提示用户当前为降级模式

### Requirement: AI构思工具独立页面
系统 SHALL 提供独立的 AI 构思工具页面，包含题材大纲生成、分卷框架拆解、爽点节奏设计功能。

#### Scenario: 访问构思工具
- **WHEN** 用户访问 /tools/ideation
- **THEN** 显示独立的 AI 构思工具页面（而非短篇故事生成器）

### Requirement: 环境变量配置
系统 SHALL 支持通过 .env 文件配置 AI 相关参数。

#### Scenario: 配置AI参数
- **WHEN** .env 文件中配置了 AI_API_KEY、AI_BASE_URL、AI_MODEL
- **THEN** 系统使用这些配置调用 AI API
- **WHEN** .env 文件中未配置 AI_API_KEY
- **THEN** 系统自动降级为本地模板模式
