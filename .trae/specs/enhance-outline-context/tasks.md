# Tasks
- [x] Task 1: 修改 generateChapterOutline 函数和AI prompt
  - [x] 新增 worldview、characters、foreshadowing 参数
  - [x] 在AI prompt中加入世界观、角色、伏笔信息作为上下文
- [x] Task 2: 修改后端路由和前端API
  - [x] 修改 `ai.ts` 路由，传递新增参数
  - [x] 修改 `api.ts` 前端API，传递新增参数
- [x] Task 3: 修改 ChapterEditor.tsx 的 handleGenerateOutline
  - [x] 加载世界观（worldApi）、角色（characterApi）、伏笔（foreshadowApi）数据
  - [x] 将数据传入 aiApi.generateChapterOutline
