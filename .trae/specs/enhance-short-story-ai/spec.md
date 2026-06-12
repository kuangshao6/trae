# 短篇故事AI生成器增强 Spec

## Why
当前短篇故事生成器（`generateShortStory`）生成的内容是固定的模板文本，无论用户输入什么主题、风格、关键词，生成的故事内容几乎完全一样。需要让内置 AI 根据用户输入的参数动态生成不同的故事内容。

## What Changes
- 重写 `generateShortStory` 函数，根据 theme、style、keywords 参数动态组合生成不同的故事
- 每种风格（散文、现代诗、古风、悬疑、奇幻、现实、意识流）有独立的叙事模板和语言风格
- 故事标题根据主题动态生成，而非固定格式
- 故事内容根据关键词展开，不同关键词产生不同的情节走向
- 同一参数多次生成也应有随机变化

## Impact
- Affected code: `api/utils/aiGenerator.ts`（generateShortStory 函数）
- Affected code: `src/pages/ShortStoryGenerator.tsx`（前端页面，无需改动）

## ADDED Requirements

### Requirement: 基于参数的动态故事生成
系统 SHALL 根据用户输入的主题(theme)、风格(style)、关键词(keywords)动态生成不同的短篇故事内容。

#### Scenario: 不同主题生成不同故事
- **WHEN** 用户输入主题"都市孤独"和关键词"深夜, 地铁, 陌生人"
- **THEN** 生成的故事应围绕都市、深夜、地铁等元素展开
- **WHEN** 用户输入主题"奇幻冒险"和关键词"森林, 魔法, 龙"
- **THEN** 生成的故事应围绕奇幻、森林、魔法等元素展开

#### Scenario: 不同风格生成不同文风
- **WHEN** 用户选择"散文"风格
- **THEN** 生成的故事应具有散文的抒情、意境特点
- **WHEN** 用户选择"悬疑"风格
- **THEN** 生成的故事应具有悬疑的紧张、推理特点
- **WHEN** 用户选择"古风"风格
- **THEN** 生成的故事应具有古风的文言、意境特点

#### Scenario: 相同参数多次生成有随机变化
- **WHEN** 用户使用相同参数多次点击"开始创作"
- **THEN** 每次生成的故事内容应有不同的细节和走向

### Requirement: 动态标题生成
系统 SHALL 根据主题动态生成故事标题，而非使用固定的"《XX之章》"格式。

#### Scenario: 标题反映主题
- **WHEN** 用户输入主题"都市孤独"
- **THEN** 生成的标题应与"都市孤独"主题相关，如"深夜地铁的最后一班"
