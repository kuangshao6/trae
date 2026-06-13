# Tasks

- [ ] Task 1: 修改 generateCharacters 的 prompt（首次生成场景，existingNames 为空时）
  - [ ] 将"先识别角色"改为"基于已生成的标题、简介、分卷框架、世界观等所有内容，识别其中提到的角色"
  - [ ] 强调角色信息必须基于已有内容推断，不得脱离原文编造
  - [ ] 保留"不足3个时补充，保证至少3个角色"

- [ ] Task 2: 修改 generateCharacters 的 prompt（查漏补缺场景，existingNames 不为空时）
  - [ ] 同样改为"基于已生成的所有内容识别角色"
  - [ ] 从已有内容中找出尚未在已有角色列表中的角色
  - [ ] 提取完后不足3个再补充

# Task Dependencies
- 无依赖，两个 task 可并行
