# LifeOS 性能优化与Bug修复 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 修复删除功能 Bug
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 精确定位并修复删除单条记录导致全部数据丢失的 Bug
  - 修复 useCategoryManager 中 deleteCategory 的 newName 未定义问题
  - 确保 storage.ts 和后端 API 的删除逻辑 id 类型匹配
  - 统一所有删除操作的错误处理
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-11
- **Test Requirements**:
  - `programmatic` TR-1.1: 在每个模块创建 3 条记录，删除 1 条后验证剩余 2 条
  - `programmatic` TR-1.2: 删除有数据的分类后，验证数据被迁移到默认分类
  - `programmatic` TR-1.3: 删除有打卡记录的习惯后，验证仅该习惯及其记录被删除
  - `human-judgement` TR-1.4: 手动测试所有模块的删除功能，确认无数据丢失
- **Notes**: 这是最高优先级任务，必须先完成并通过测试才能继续其他优化

## [x] Task 2: localStorage 内存缓存优化
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在 storage.ts 中添加内存缓存层
  - 缓存 getStore() 结果，避免重复 JSON.parse
  - 写入操作后更新缓存，保持一致性
  - 优化数据迁移逻辑，只在首次加载时执行
- **Acceptance Criteria Addressed**: AC-6, AC-11
- **Test Requirements**:
  - `programmatic` TR-2.1: 连续多次读取数据，验证第二次及以后读取从缓存返回
  - `programmatic` TR-2.2: 写入数据后验证缓存同步更新
  - `programmatic` TR-2.3: 验证数据迁移逻辑只执行一次
  - `human-judgement` TR-2.4: 验证各模块数据读写功能正常，无回归
- **Notes**: 缓存键需要包含 userId，避免多用户场景混乱

## [x] Task 3: 后端数据库内存缓存 + 防抖写入
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在 db.ts 中添加内存缓存，首次加载后不再读磁盘
  - 写入操作使用 debounce（500ms）批量持久化
  - 确保进程退出时数据已落盘
  - 保持现有 API 接口不变
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-3.1: 连续多次 GET 请求，验证只有第一次读磁盘
  - `programmatic` TR-3.2: 多次连续写入，验证合并为一次磁盘写入
  - `programmatic` TR-3.3: 写入后重启服务，验证数据持久化正确
  - `human-judgement` TR-3.4: 后端所有 CRUD 接口功能正常

## [x] Task 4: 路由懒加载（代码分割）
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 使用 React.lazy 将所有页面组件改为动态导入
  - 添加 Suspense 加载态
  - 首屏只加载登录页代码
  - 保持现有路由结构不变
- **Acceptance Criteria Addressed**: AC-4, AC-10
- **Test Requirements**:
  - `programmatic` TR-4.1: 首屏加载时验证只有登录页 JS 被加载
  - `programmatic` TR-4.2: 导航到各页面时验证对应 chunk 被动态加载
  - `human-judgement` TR-4.3: 所有页面功能正常，切换页面有加载指示器
  - `human-judgement` TR-4.4: 路由跳转流畅，无白屏

## [x] Task 5: Dashboard 聚合接口
- **Priority**: medium
- **Depends On**: Task 3
- **Description**: 
  - 后端新增 GET /api/dashboard 聚合接口
  - 返回：各模块统计数、最近 8 条动态、近 14 天心情、前 3 个目标进度、前 3 个财务目标
  - 前端 Dashboard 页面改用聚合接口
  - 保持原有各模块独立接口不变
- **Acceptance Criteria Addressed**: AC-5, AC-10
- **Test Requirements**:
  - `programmatic` TR-5.1: 调用聚合接口验证返回数据结构正确
  - `programmatic` TR-5.2: Dashboard 页面 API 请求数从 8 减少到 ≤ 2
  - `programmatic` TR-5.3: 聚合接口数据量比 8 个独立接口总和少 60% 以上
  - `human-judgement` TR-5.4: Dashboard 页面展示正常，数据准确

## [x] Task 6: Vite 构建分包优化
- **Priority**: medium
- **Depends On**: None
- **Description**: 
  - 配置 Vite build.rollupOptions.output.manualChunks
  - 将 react 生态、react-query、dnd-kit 等拆分为独立 chunk
  - 优化 chunk 缓存策略
  - 验证构建产物大小
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-6.1: 构建产物按预期分包，vendor 包分离
  - `programmatic` TR-6.2: 首屏核心 chunk 大小比优化前减少 40%
  - `human-judgement` TR-6.3: 生产构建后应用运行正常

## [x] Task 7: React Query 缓存策略优化
- **Priority**: medium
- **Depends On**: None
- **Description**: 
  - 优化 staleTime 和 gcTime 配置
  - 关闭 refetchOnWindowFocus（可选，根据用户习惯）
  - 优化查询键设计
  - 添加乐观更新（optional）
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `programmatic` TR-7.1: 验证缓存配置生效（staleTime 内不重新请求）
  - `human-judgement` TR-7.2: 页面间导航数据加载更快
  - `human-judgement` TR-7.3: 数据更新后 UI 正确刷新

## [x] Task 8: dnd-kit 按需加载
- **Priority**: low
- **Depends On**: Task 4
- **Description**: 
  - 将 Sidebar 中的 dnd-kit 改为动态导入
  - 仅在用户长按或进入编辑模式时加载拖拽库
  - 保持默认浏览模式下不加载 dnd-kit
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-8.1: 首屏不加载 dnd-kit 相关 chunk
  - `human-judgement` TR-8.2: 侧边栏拖拽功能正常可用
  - `human-judgement` TR-8.3: 首次拖拽时有加载提示（如需要）

## [x] Task 9: 接口测试
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 3, Task 5
- **Description**: 
  - 测试所有 REST API 接口（CRUD + 特殊接口）
  - 验证认证中间件正确性
  - 验证数据格式和状态码
  - 测试边界情况和错误处理
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-5, AC-7, AC-11
- **Test Requirements**:
  - `programmatic` TR-9.1: 所有 GET 接口返回 200 和正确数据格式
  - `programmatic` TR-9.2: POST/PUT/DELETE 接口正确修改数据
  - `programmatic` TR-9.3: 未认证请求返回 401
  - `programmatic` TR-9.4: 删除接口只删除目标数据，不影响其他数据
  - `human-judgement` TR-9.5: 接口响应时间合理（< 500ms）

## [x] Task 10: UI 测试
- **Priority**: high
- **Depends On**: Task 1, Task 4
- **Description**: 
  - 测试所有页面 UI 渲染正确性
  - 测试响应式布局（手机/平板/桌面）
  - 测试交互动效和过渡
  - 测试深色模式（如支持）
- **Acceptance Criteria Addressed**: AC-8, AC-9, AC-10
- **Test Requirements**:
  - `human-judgement` TR-10.1: 所有页面元素渲染正常，无错位/重叠
  - `human-judgement` TR-10.2: 各断点下布局自适应正确
  - `human-judgement` TR-10.3: 按钮/输入框等交互元素状态正常
  - `human-judgement` TR-10.4: 动画过渡流畅自然

## [x] Task 11: 功能测试
- **Priority**: high
- **Depends On**: Task 1, Task 5, Task 7
- **Description**: 
  - 测试 10 大模块的增删改查功能
  - 测试分类管理功能
  - 测试习惯打卡功能
  - 测试目标 OKR 打卡功能
  - 测试导入导出功能
  - 测试认证流程（登录/注册/登出）
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-10, AC-11
- **Test Requirements**:
  - `human-judgement` TR-11.1: 每个模块的 CRUD 操作均正常
  - `human-judgement` TR-11.2: 分类增删改及数据迁移正确
  - `human-judgement` TR-11.3: 习惯打卡及连续天数计算正确
  - `human-judgement` TR-11.4: 目标 OKR 打卡及进度计算正确
  - `human-judgement` TR-11.5: 认证流程正常，token 过期处理正确

## [x] Task 12: 性能测试
- **Priority**: medium
- **Depends On**: Task 2, Task 3, Task 4, Task 5, Task 6
- **Description**: 
  - 测试首屏加载时间
  - 测试各页面切换加载时间
  - 测试大数据量下列表渲染性能
  - 测试 API 响应时间
  - 测试内存使用情况
- **Acceptance Criteria Addressed**: AC-4, AC-5, AC-6, AC-7
- **Test Requirements**:
  - `programmatic` TR-12.1: 首屏加载时间 < 2s（网络正常情况下）
  - `programmatic` TR-12.2: Dashboard 数据加载时间减少 50% 以上
  - `programmatic` TR-12.3: 100 条数据列表滚动流畅（无明显卡顿）
  - `programmatic` TR-12.4: API 平均响应时间 < 200ms
  - `human-judgement` TR-12.5: 整体使用流畅，无明显卡顿感

## [x] Task 13: 浏览器兼容性测试
- **Priority**: medium
- **Depends On**: Task 10, Task 11
- **Description**: 
  - Chrome 最新版测试 ✅
  - Firefox 最新版测试（需手动验证）
  - Safari 最新版测试（需手动验证）
  - 移动端浏览器测试
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgement` TR-13.1: Chrome 最新版所有功能正常 ✅
  - `human-judgement` TR-13.2: Firefox 最新版所有功能正常（需手动验证）
  - `human-judgement` TR-13.3: Safari 最新版所有功能正常（需手动验证）
  - `human-judgement` TR-13.4: 各浏览器下视觉表现一致

## [/] Task 14: Android APP 兼容性测试
- **Priority**: medium
- **Depends On**: Task 10, Task 11
- **Description**: 
  - 测试 APP 安装和启动（需手动打包测试）
  - 测试所有功能在 APP 中的表现（需手动打包测试）
  - 测试移动端适配
  - 测试离线模式（localStorage 模式）
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `human-judgement` TR-14.1: APP 正常安装和启动（需手动打包测试）
  - `human-judgement` TR-14.2: 所有功能在 APP 中正常运行（需手动打包测试）
  - `human-judgement` TR-14.3: 手机屏幕适配良好，操作便捷
  - `human-judgement` TR-14.4: 离线模式（无后端时）功能正常
