# LifeOS - 里程碑时间轴与侧边栏优化 - 实施计划

## [x] Task 1: 创建时间轴数据聚合 hook
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 创建 `useTimelineData` hook，并发请求所有模块的数据
  - 从各模块数据中提取统一的时间轴条目格式（日期、模块、标题、摘要、id）
  - 按时间倒序排列所有条目
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: hook 返回的数据包含所有模块的条目
  - `programmatic` TR-1.2: 条目按时间倒序排列
  - `human-judgement` TR-1.3: 每个条目包含日期、模块图标、标题和摘要

## [x] Task 2: 重构里程碑页面为时间轴模式
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 重写 `MilestonesPage.tsx`，使用时间轴布局
  - 显示垂直时间轴，按日期分组
  - 每个时间轴条目显示模块图标、标题、摘要和日期
  - 点击条目跳转到对应模块页面
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `human-judgement` TR-2.1: 页面显示垂直时间轴布局
  - `human-judgement` TR-2.2: 条目按日期分组显示
  - `human-judgement` TR-2.3: 点击条目跳转到对应模块
  - `human-judgement` TR-2.4: 模块图标和颜色正确显示

## [x] Task 3: 实现侧边栏拖拽排序
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 使用 @dnd-kit 实现侧边栏导航项的拖拽排序
  - 添加拖拽视觉反馈（阴影、占位符、透明度变化）
  - 排序结果保存到 localStorage
  - 加载时从 localStorage 读取自定义排序
- **Acceptance Criteria Addressed**: AC-4, AC-5
- **Test Requirements**:
  - `human-judgement` TR-3.1: 导航项可拖拽移动
  - `human-judgement` TR-3.2: 拖拽时有视觉反馈
  - `programmatic` TR-3.3: 排序后 localStorage 包含排序数据
  - `programmatic` TR-3.4: 刷新页面后排序保持

## [x] Task 4: 将里程碑移到侧边栏最底部
- **Priority**: medium
- **Depends On**: Task 3
- **Description**: 
  - 修改默认侧边栏排序，将里程碑放在最后
  - 更新 SIDEBAR_ITEMS 的默认顺序
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgement` TR-4.1: 默认状态下里程碑在侧边栏最底部

## [x] Task 5: 构建验证
- **Priority**: high
- **Depends On**: Task 1, 2, 3, 4
- **Description**: 
  - 运行 `npm run build` 验证代码无错误
  - 启动开发服务器测试功能
- **Acceptance Criteria Addressed**: 全部
- **Test Requirements**:
  - `programmatic` TR-5.1: 构建成功无错误
  - `human-judgement` TR-5.2: 页面可正常访问
