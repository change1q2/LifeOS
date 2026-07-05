# LifeOS - 图标系统升级实现计划

## [x] Task 1: 创建统一图标映射组件
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 更新CategoryIcon.tsx组件，添加LUCIDE_ICON_MAP支持图标名称映射
  - 确保支持emoji到Lucide图标的向后兼容映射
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: CategoryIcon组件能正确渲染Lucide图标
  - `human-judgment` TR-1.2: 组件支持emoji和图标名称两种方式

## [x] Task 2: 更新Sidebar导航图标
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 更新modules.ts中SIDEBAR_ITEMS的icon字段为图标名称
  - 更新Sidebar.tsx使用Lucide图标组件
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-2.1: 侧边栏所有导航项显示Lucide图标
  - `human-judgment` TR-2.2: 图标颜色与模块主题色一致

## [x] Task 3: 更新Dashboard页面图标
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 替换财务目标卡片中的emoji图标
  - 替换心情记录中的emoji评分显示
  - 替换统计图表中的emoji图标
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-3.1: Dashboard页面无emoji图标显示
  - `human-judgment` TR-3.2: 图标大小与布局协调

## [x] Task 4: 更新LearningPage学习页面图标
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 更新useCategoryManager配置中的icons数组为图标名称
  - 替换分类卡片中的图标展示方式
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-4.1: 学习分类图标显示Lucide图标
  - `human-judgment` TR-4.2: 统计卡片图标显示正确

## [x] Task 5: 更新FinancePage财务页面图标
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 更新财务目标分类配置中的icons数组
  - 替换目标卡片和统计图标
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgment` TR-5.1: 财务目标卡片显示Lucide图标
  - `human-judgment` TR-5.2: 完成状态显示Trophy图标

## [x] Task 6: 更新HealthPage健康页面图标
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 更新健康分类配置中的icons数组
  - 替换健康记录和习惯打卡图标
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgment` TR-6.1: 健康分类图标显示Lucide图标
  - `human-judgment` TR-6.2: 习惯打卡图标显示正确

## [x] Task 7: 更新GoalsPage目标页面图标
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 更新目标分类配置中的icons数组
  - 替换目标进度和分类图标
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `human-judgment` TR-7.1: 目标分类图标显示Lucide图标
  - `human-judgment` TR-7.2: 进度条和状态图标显示正确

## [x] Task 8: 更新MoodPage心情页面图标
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 替换心情评分图标（Frown/Meh/Smile/Heart）
  - 更新心情分类配置中的icons数组
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgment` TR-8.1: 心情评分显示Lucide表情图标
  - `human-judgment` TR-8.2: 心情分类图标显示正确

## [x] Task 9: 更新TravelPage旅行页面图标
- **Priority**: medium
- **Depends On**: Task 1
- **Description**: 
  - 更新旅行分类配置中的icons数组
  - 替换旅行分类图标（Home/Globe/Map等）
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `human-judgment` TR-9.1: 旅行分类图标显示Lucide图标
  - `human-judgment` TR-9.2: 图标与分类语义匹配

## [x] Task 10: 更新AchievementsPage成就页面图标
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 更新MODULE_ICONS映射为Lucide图标组件
  - 替换成就树中的模块图标
  - 替换统计徽章中的emoji图标
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `human-judgment` TR-10.1: 成就树模块图标显示Lucide图标
  - `human-judgment` TR-10.2: 统计徽章图标显示正确

## [x] Task 11: 全局验证与构建测试
- **Priority**: high
- **Depends On**: Tasks 2-10
- **Description**: 
  - 运行npm run build验证构建
  - 搜索项目中残留的emoji图标
  - 修复构建错误
- **Acceptance Criteria Addressed**: AC-11
- **Test Requirements**:
  - `programmatic` TR-11.1: npm run build构建成功
  - `programmatic` TR-11.2: 无TypeScript编译错误

## Notes
- 所有页面的图标颜色应与模块主题色保持一致
- 图标大小应与原emoji显示效果协调（通常w-5 h-5或w-4 h-4）
- 保持向后兼容性，旧数据中的emoji仍能通过CategoryIcon正确渲染
