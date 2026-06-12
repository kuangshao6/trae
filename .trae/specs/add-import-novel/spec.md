# 导入TXT作品功能 Spec

## Why
作者已有未完成的小说作品（TXT格式），需要快速导入平台继续创作。当前"导入作品"按钮是空壳，无法实际使用。通过AI解析TXT内容，自动将文本分配到作品简介、分卷框架、角色、章节、世界观设定和伏笔等模块，大幅降低迁移成本。

## What Changes
- 在 Dashboard 页面为"导入作品"按钮添加点击事件，触发文件选择和导入流程
- 新增后端 `/api/ai/parse-novel` 接口，使用AI解析TXT内容并返回结构化数据
- 前端新增导入流程：选择文件 → AI解析 → 预览确认 → 创建作品
- 解析结果按作品结构分配：简介、分卷框架、角色、章节、世界观设定、伏笔

## Impact
- Affected code: `src/pages/Dashboard.tsx`, `api/routes/ai.ts`, `api/utils/aiGenerator.ts`, `src/lib/api.ts`

## ADDED Requirements

### Requirement: 导入TXT文件功能
系统 SHALL 允许用户通过"导入作品"按钮选择TXT文件，读取文件内容并使用AI解析为结构化作品数据。

#### Scenario: 选择TXT文件
- **WHEN** 用户点击"导入作品"按钮
- **THEN** 弹出文件选择对话框，仅允许选择 .txt 文件

#### Scenario: AI解析TXT内容
- **WHEN** 用户选择TXT文件后
- **THEN** 系统将文件内容发送给AI进行解析，AI返回结构化数据，包含：title（标题）、genre（题材）、description（简介）、volumes（分卷框架）、characters（角色列表）、chapters（章节列表，含标题和内容）、worldview（世界观设定列表）、foreshadowing（伏笔列表）

#### Scenario: 解析结果预览与确认
- **WHEN** AI解析完成
- **THEN** 显示预览弹窗，展示解析出的标题、题材、简介、章节数、角色数等信息，用户可确认或取消

#### Scenario: 确认导入创建作品
- **WHEN** 用户确认导入
- **THEN** 系统创建新作品，并将解析出的简介、分卷框架、角色、章节、世界观设定、伏笔分别保存到对应模块

#### Scenario: AI不可用时降级
- **WHEN** AI服务不可用
- **THEN** 系统将整个TXT内容作为单章节创建作品，标题取文件名

### Requirement: 后端AI解析接口
系统 SHALL 提供 `/api/ai/parse-novel` POST 接口，接收TXT文本内容，返回结构化作品数据。

#### Scenario: 正常解析
- **WHEN** 接口收到TXT文本内容
- **THEN** AI分析文本，返回JSON格式：{ title, genre, description, volumes, characters, chapters, worldview, foreshadowing }

#### Scenario: AI不可用
- **WHEN** AI服务不可用
- **THEN** 返回降级结果：title取前20字，genre为"其他"，整篇内容作为单个chapter
