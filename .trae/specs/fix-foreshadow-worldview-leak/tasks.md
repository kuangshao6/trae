# Tasks
- [x] Task 1: 修复 NovelModule.tsx 中 useEffect 依赖，加入 type
  - [x] 将 `useEffect(() => { ... }, [id])` 的依赖改为 `[id, type]`
