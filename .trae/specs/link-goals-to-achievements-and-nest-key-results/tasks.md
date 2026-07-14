# 目标关联成就与关键结果无限层级 — 实施计划

## [x] Task 1: 扩展目标数据模型与模块配置
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在 `shared/schemas.ts` 的 `GoalSchema` 中新增 `linked_achievement_id: z.number().nullable().optional()`。
  - 在 `client/src/config/modules.ts` 的 `goals` 字段配置中新增「关联成就」字段，类型为自定义成就选择器（或 select），用于后续在表单中渲染成就选择器。
- **Acceptance Criteria Addressed**: 目标可关联成就
- **Test Requirements**: 
  - `programmatic` TR-1.1: Goal 类型包含 `linked_achievement_id`
  - `programmatic` TR-1.2: `npm run build` 通过

## [x] Task 2: 后端目标路由支持成就关联与自动解锁
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 修改 `server/src/routes/goals.ts`，在创建/更新目标时保存 `linked_achievement_id`。
  - 新增或复用解锁逻辑：当目标关键结果全部完成（进度 100%）且 `linked_achievement_id` 存在时，把对应成就的 `locked` 设为 `false`，`date` 设为今天。
  - 改造 `PATCH /api/goals/:id/toggle-kr`，接受路径数组 `path: number[]` 来定位任意深度的关键结果节点。
- **Acceptance Criteria Addressed**: 目标可关联成就、关键结果无限层级
- **Test Requirements**: 
  - `programmatic` TR-2.1: toggle-kr 接口支持 3 层以上路径
  - `programmatic` TR-2.2: 目标进度 100% 时关联成就 `locked` 变为 false

## [x] Task 3: localStorage fallback 同步改造
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 在 `client/src/lib/storage.ts` 中，`toggleKR` 改为接受路径数组 `path: number[]`。
  - 在 localStorage 模式下也实现父节点自动完成逻辑：切换节点后向上传播，若父节点的所有子节点都完成，则父节点完成。
  - 在 localStorage 模式下实现目标达成时自动解锁关联成就。
- **Acceptance Criteria Addressed**: 关键结果无限层级、目标可关联成就
- **Test Requirements**: 
  - `programmatic` TR-3.1: 无后端时切换深层 KR 成功
  - `programmatic` TR-3.2: 无后端时父节点自动完成逻辑正确
  - `programmatic` TR-3.3: 无后端时目标达成自动解锁成就

## [x] Task 4: 前端 API 层适配路径数组
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 修改 `client/src/lib/api.ts` 中的 `toggleKR`，签名改为 `(id: number, path: number[]) => Promise<any>`，并把 `path` 发送给后端。
  - fallback 到 `storageApi.toggleKR(id, path)`。
- **Acceptance Criteria Addressed**: 关键结果无限层级
- **Test Requirements**: 
  - `programmatic` TR-4.1: API 层正确传递路径数组

## [x] Task 5: 目标表单支持关联成就与无限层级关键结果
- **Priority**: high
- **Depends On**: Task 1, Task 4
- **Description**: 
  - 在 `client/src/components/EntryForm.tsx` 中新增「关联成就」选择器组件：从 achievements 列表加载手动成就，按模块分组并按父子树缩进展示；选择父成就后若存在子成就，动态显示子层级选择器。
  - 重构关键结果编辑区：把目前写死的三层逻辑替换为递归组件 `KeyResultEditor`，支持任意深度的添加、编辑、删除、完成切换，并实现父级自动完成。
- **Acceptance Criteria Addressed**: 目标可关联成就、关键结果无限层级
- **Test Requirements**: 
  - `human-judgment` TR-5.1: 表单中可选择带子层级的成就
  - `human-judgment` TR-5.2: 表单中可添加超过三层的子关键结果
  - `human-judgment` TR-5.3: 表单中子节点全完成后父节点自动完成

## [x] Task 6: 目标页面展示与交互改造
- **Priority**: high
- **Depends On**: Task 4, Task 5
- **Description**: 
  - 在 `client/src/pages/GoalsPage.tsx` 中重构关键结果展示为递归组件 `KeyResultTree`，支持任意深度渲染。
  - 更新 `toggleKR` 调用，使用路径数组定位节点。
  - 目标卡片与详情中显示「关联成就」信息。
  - 保持并完善创建目标后自动在关联模块创建记录、以及向学习成长/财务管理同步进度的逻辑。
- **Acceptance Criteria Addressed**: 关键结果无限层级、创建目标后自动在关联模块创建记录
- **Test Requirements**: 
  - `human-judgment` TR-6.1: 目标页面正确渲染任意深度关键结果
  - `human-judgment` TR-6.2: 点击深层子节点后父节点按规则自动完成
  - `programmatic` TR-6.3: 关联模块记录的进度随目标进度更新

## [x] Task 7: 构建验证
- **Priority**: high
- **Depends On**: 所有任务
- **Description**: 
  - 运行 `npm run build` 验证前后端无类型错误。
  - 启动开发服务器，手动验证目标创建、关联成就、关键结果无限层级、自动解锁、进度同步。
- **Acceptance Criteria Addressed**: 全部
- **Test Requirements**: 
  - `programmatic` TR-7.1: `npm run build` 成功
  - `human-judgment` TR-7.2: 主要流程可正常使用

## [x] Task 8: 修复关联成就选择器按模块分组展示
- **Priority**: high
- **Depends On**: Task 5
- **Description**: 
  - 修改 `client/src/components/EntryForm.tsx` 中的「关联成就」选择器，将手动成就按所属 `module` 字段分组展示（例如使用 `<optgroup>` 或分组标题）。
  - 在保持父子层级缩进的同时，确保每个模块的成就出现在对应分组下。
  - 当选择带子成就的父成就后，子层级选择器同样按对应模块/层级展示。
- **Acceptance Criteria Addressed**: 目标可关联成就
- **Test Requirements**: 
  - `human-judgment` TR-8.1: 表单中「关联成就」下拉按模块分组显示
  - `human-judgment` TR-8.2: 同一模块内仍按父子层级缩进

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 4 depends on Task 2
- Task 5 depends on Task 1, Task 4
- Task 6 depends on Task 4, Task 5
- Task 7 depends on 所有任务
- Task 8 depends on Task 5
