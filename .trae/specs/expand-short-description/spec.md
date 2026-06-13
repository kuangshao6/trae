# 简介过短时自动扩写 Spec

## Why
用户创建作品时简介可能只有几行字，直接传给 AI 生成大纲效果差，需要先用内置 AI 扩写简介，扩写后的内容直接写入作品简介。

## What Changes
- 修改 `CreateNovelPage.tsx` 的 `handleCreate` 流程：在生成大纲前，如果简介过短（< 100字），先用 `aiApi.generateOutline` 扩写简介，将扩写后的 mainOutline 写入作品简介

## Impact
- Affected code: `src/pages/CreateNovelPage.tsx`（handleCreate 流程增加简介扩写步骤）

## ADDED Requirements

### Requirement: 过短简介自动扩写
系统 SHALL 在创建作品生成大纲前，检测用户简介长度，如果过短则用内置 AI 扩写并写入作品简介。

#### Scenario: 简介内容充足（≥100字）
- **WHEN** 用户输入的作品简介大于等于100字
- **THEN** 系统直接使用用户原始简介生成大纲，不做扩写

#### Scenario: 简介内容过短（<100字且非空）
- **WHEN** 用户输入的作品简介少于100字且不为空
- **THEN** 系统调用 `aiApi.generateOutline` 扩写简介
- **THEN** 将返回的 mainOutline 直接写入作品简介（调用 `novelApi.update`）
- **THEN** 使用扩写后的简介作为后续大纲生成的输入

#### Scenario: 简介为空
- **WHEN** 用户没有输入简介
- **THEN** 系统直接使用 AI 生成大纲（现有逻辑，不扩写）
