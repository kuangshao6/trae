# Tasks

- [ ] Task 1: 后端 - 新增 VolumeRecord 数据模型和 volumeStore
  - [ ] 在 storage.ts 中新增 VolumeRecord 接口（id, novelId, title, description, chapterCount, coreConflict, createdAt）
  - [ ] 在 DataStore 中新增 volumes 字段
  - [ ] 新增 volumeStore（CRUD: findByNovelId, create, update, delete）
  - [ ] 在 initializeStore 中初始化 volumes 数组
  - [ ] 在 novelStore.delete 中级联删除 volumes

- [ ] Task 2: 后端 - 新增分卷框架路由
  - [ ] 在 novels.ts 中新增 GET /:id/volumes 路由（获取分卷列表）
  - [ ] 新增 POST /:id/volumes 路由（创建分卷）
  - [ ] 新增 PUT /:id/volumes/:volId 路由（更新分卷）
  - [ ] 新增 DELETE /:id/volumes/:volId 路由（删除分卷）
  - [ ] 新增 POST /:id/volumes/batch 路由（批量保存分卷框架，用于创建作品时一次性保存）

- [ ] Task 3: 后端 - 数据迁移逻辑
  - [ ] 在 storage.ts 的 loadStore 中添加迁移逻辑：将 worldSettings 中 title="volumes" 的数据迁移到 volumes 存储，并删除旧条目

- [ ] Task 4: 前端 - 新增 volumeApi
  - [ ] 在 api.ts 中新增 volumeApi（list, create, update, delete, batchSave）
  - [ ] 定义 VolumeItem 类型

- [ ] Task 5: 前端 - 修改 CreateNovelPage.tsx
  - [ ] 将分卷框架保存从 worldApi.create 改为 volumeApi.batchSave

- [ ] Task 6: 前端 - 修改 OutlinePage.tsx
  - [ ] 分卷框架加载从 volumeApi.list 获取，而非从 worldApi.list 中查找 title="volumes"
  - [ ] 分卷框架保存改为 volumeApi.batchSave，而非 worldApi.update/create

- [ ] Task 7: 前端 - 修改 NovelModule.tsx
  - [ ] 移除世界观页面中 `title === "volumes"` 的过滤逻辑

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 5 depends on Task 4
- Task 6 depends on Task 4
- Task 4 depends on Task 2
