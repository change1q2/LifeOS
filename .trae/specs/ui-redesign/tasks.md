# LifeOS 整体UI设计优化 - 实现计划

## [ ] Task 1: 安装 Lucide React 图标库
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 安装 lucide-react 图标库
  - 确保与现有项目兼容
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-1.1: lucide-react 安装成功，版本正确
  - `human-judgement` TR-1.2: 可以在项目中导入并使用 Lucide 图标
- **Notes**: 安装命令：npm install lucide-react

## [ ] Task 1.1: 创建统一图标映射系统
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 更新 icons.tsx，扩展 MODULE_ICONS 和 MOOD_ICONS 映射
  - 更新 CategoryIcon.tsx，扩展 CATEGORY_ICON_MAP，覆盖所有分类图标
  - 添加更多 Lucide 图标导入（Users, Users2, Home, Map, Compass, Tent, Mountain, Building, Castle, Sunrise, Globe, CloudSun）
- **Acceptance Criteria Addressed**: AC-2, AC-2.1, AC-2.2, AC-2.3
- **Test Requirements**:
  - `programmatic` TR-1.1.1: 所有图标映射正确导出，无编译错误
  - `human-judgement` TR-1.1.2: 图标映射完整，覆盖所有现有 emoji 图标
- **Notes**: 需要覆盖的图标包括：💼, 📈, 🚀, 🎨, 🔧, 📖, 🧠, 🗣️, 💻, 🎵, ✍️, 🛟, 🏦, 🏖️, ✨, 📦, 🌱, 🏠, ⏰, 📝, 💭, 👫, 🏥, 🧘, 🌏, 🌍, 🌎, 🚗, 🗺️, ⛺, 🏔️, 🏛️, 🛕, 🗼, 🌤️, 🏃, 🥗, 😴, ⚖️

## [ ] Task 2: 创建设计系统 - 更新 index.css
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 更新 Tailwind CSS 主题变量，创建丰富的颜色系统（主色：indigo、purple、emerald、orange、rose；辅色：cyan、pink、amber、teal；语义色：success、warning、error、info；中性色：10级灰度；渐变色：5组）
  - 添加自定义样式（滚动条、动画、全局样式）
  - 优化浅色/深色模式对比，确保对比度达标
  - 添加主题切换过渡动画样式
- **Acceptance Criteria Addressed**: AC-1, AC-10, NFR-3, NFR-6, NFR-7
- **Test Requirements**:
  - `programmatic` TR-2.1: CSS 编译成功，无错误
  - `human-judgement` TR-2.2: 页面颜色统一，对比度达标，颜色系统丰富完整
- **Notes**: 使用 ui-ux-pro-max 推荐的设计规范，创建专业级配色方案

## [ ] Task 3: 创建主题切换上下文 (ThemeContext)
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 创建 ThemeContext 组件，管理深色/浅色模式状态
  - 实现系统偏好检测功能
  - 实现 localStorage 持久化主题偏好
  - 提供 useTheme 钩子供其他组件使用
- **Acceptance Criteria Addressed**: AC-8, AC-9, NFR-7
- **Test Requirements**:
  - `programmatic` TR-3.1: ThemeContext 正确导入和使用
  - `human-judgement` TR-3.2: 主题切换平滑，系统偏好检测生效，偏好持久化
- **Notes**: 使用 React Context API，配合 Tailwind CSS 的 dark 类

## [ ] Task 4: 优化 Sidebar 组件 - 替换图标和视觉
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 3
- **Description**: 
  - 替换所有 emoji 图标为 Lucide React 图标
  - 优化悬停效果和过渡动画
  - 增强当前页面高亮样式
  - 优化 Logo 和用户信息展示
  - 添加主题切换按钮（浅色/深色模式切换）
- **Acceptance Criteria Addressed**: AC-3, AC-8, NFR-1, NFR-2
- **Test Requirements**:
  - `programmatic` TR-4.1: 无 emoji 图标，使用 Lucide 图标
  - `human-judgement` TR-4.2: 导航交互流畅，视觉效果专业，主题切换按钮可用
- **Notes**: 使用 Lucide 图标替换 🌱, 📚, ✈️, 🌙, 🎯, 💪, 💰, 🤝, 💡, 🏆, 🚩, 🚪

## [ ] Task 5: 优化 Dashboard 页面
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 4
- **Description**: 
  - 替换统计卡片的 emoji 图标为 Lucide 图标
  - 优化卡片布局和间距
  - 增强进度条和数据可视化效果
  - 添加加载状态和空状态设计
- **Acceptance Criteria Addressed**: AC-4, NFR-1, NFR-2
- **Test Requirements**:
  - `programmatic` TR-4.1: 无 emoji 图标
  - `human-judgement` TR-4.2: Dashboard 视觉层次分明，数据展示直观
- **Notes**: 重点优化统计卡片、心情热力图、目标进度、财务目标四个区域

## [ ] Task 6: 优化认证页面 (AuthPage)
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 3
- **Description**: 
  - 替换 Logo emoji 为 Lucide 图标
  - 优化表单样式和交互
  - 增强错误/成功提示样式
  - 优化按钮和输入框样式
- **Acceptance Criteria Addressed**: AC-5, NFR-1, NFR-2
- **Test Requirements**:
  - `programmatic` TR-5.1: 无 emoji 图标
  - `human-judgement` TR-5.2: 认证页面现代美观，交互流畅
- **Notes**: 保持玻璃拟态效果，增强视觉层次

## [ ] Task 7: 替换 types.ts 和 App.tsx 中的图标定义
- **Priority**: high
- **Depends On**: Task 1.1
- **Description**: 
  - 更新 types.ts 中 ACHIEVEMENT_MODULES 的 icon 字段，使用 Lucide 图标名称
  - 更新 App.tsx 中 social 和 insights 模块的分类图标配置，使用 Lucide 图标名称
- **Acceptance Criteria Addressed**: AC-2, AC-2.1
- **Test Requirements**:
  - `programmatic` TR-7.1: types.ts 和 App.tsx 中无 emoji 图标定义
  - `human-judgement` TR-7.2: 模块图标显示正确
- **Notes**: 确保与 CategoryIcon 组件兼容

## [ ] Task 7.1: 替换 LearningPage 和 FinancePage 中的分类图标
- **Priority**: high
- **Depends On**: Task 7
- **Description**: 
  - 更新 LearningPage 的 useCategoryManager 图标配置，使用 Lucide 图标名称
  - 更新 FinancePage 的 FINANCE_CATEGORY_CONFIG 图标配置，使用 Lucide 图标名称
  - 替换页面中的 emoji 提示文字（如 '记录成功！🎉'）
- **Acceptance Criteria Addressed**: AC-2, AC-2.2
- **Test Requirements**:
  - `programmatic` TR-7.1.1: LearningPage 和 FinancePage 中无 emoji 图标
  - `human-judgement` TR-7.1.2: 分类卡片图标显示正确
- **Notes**: 涉及学习分类和财务目标分类的图标

## [ ] Task 7.2: 替换 HealthPage 和 GoalsPage 中的分类图标
- **Priority**: high
- **Depends On**: Task 7
- **Description**: 
  - 更新 HealthPage 的 useCategoryManager 图标配置，使用 Lucide 图标名称
  - 更新 GoalsPage 的 useCategoryManager 图标配置，使用 Lucide 图标名称
  - 替换页面中的 emoji 提示文字
- **Acceptance Criteria Addressed**: AC-2, AC-2.2
- **Test Requirements**:
  - `programmatic` TR-7.2.1: HealthPage 和 GoalsPage 中无 emoji 图标
  - `human-judgement` TR-7.2.2: 分类卡片图标显示正确
- **Notes**: HealthPage 使用 HEALTH_CATEGORY_ICONS 数组，需要同步更新

## [ ] Task 7.3: 替换 MoodPage 中的心情和分类图标
- **Priority**: high
- **Depends On**: Task 7
- **Description**: 
  - 更新 MoodPage 的 useCategoryManager 图标配置，使用 Lucide 图标名称
  - 替换 moodEmojis 数组为 Lucide 图标组件
  - 替换空状态和提示中的 emoji 图标
- **Acceptance Criteria Addressed**: AC-2, AC-2.2, AC-2.3
- **Test Requirements**:
  - `programmatic` TR-7.3.1: MoodPage 中无 emoji 图标
  - `human-judgement` TR-7.3.2: 心情评分图标和分类图标显示正确
- **Notes**: 心情评分使用 Frown(1-2)、Meh(3)、Smile(4)、Heart(5)

## [ ] Task 7.4: 替换 AchievementsPage 中的模块图标
- **Priority**: high
- **Depends On**: Task 7
- **Description**: 
  - 更新 MODULE_ICONS 常量，使用 Lucide 图标组件而非 emoji 字符串
  - 替换 MOOD_EMOJIS 数组为 Lucide 图标组件
  - 替换页面中所有 emoji 图标（空状态、徽章等）
- **Acceptance Criteria Addressed**: AC-2, AC-2.4
- **Test Requirements**:
  - `programmatic` TR-7.4.1: AchievementsPage 中无 emoji 图标
  - `human-judgement` TR-7.4.2: 模块分组和成就项图标显示正确
- **Notes**: 成就墙是图标使用最密集的页面，需要仔细检查

## [ ] Task 7.5: 替换 TravelPage 和 Dashboard 中的图标
- **Priority**: medium
- **Depends On**: Task 7
- **Description**: 
  - 更新 TravelPage 的 useCategoryManager 图标配置，使用 Lucide 图标名称
  - 替换 Dashboard 中的 emoji 图标（如星级评分）
- **Acceptance Criteria Addressed**: AC-2, AC-2.2
- **Test Requirements**:
  - `programmatic` TR-7.5.1: TravelPage 和 Dashboard 中无 emoji 图标
  - `human-judgement` TR-7.5.2: 旅行分类和统计卡片图标显示正确
- **Notes**: Dashboard 的星级评分使用 '⭐' 需要替换为 Star 图标

## [ ] Task 7.6: 优化通用列表页面组件
- **Priority**: medium
- **Depends On**: Task 1, Task 2, Task 7.x
- **Description**: 
  - 优化卡片组件样式
  - 增强编辑/删除按钮交互
  - 统一列表布局和间距
- **Acceptance Criteria Addressed**: AC-6, NFR-1
- **Test Requirements**:
  - `human-judgement` TR-7.6.1: 列表页面布局统一，交互一致
- **Notes**: 涉及 LearningPage, FinancePage, GoalsPage, HealthPage, TravelPage, AchievementsPage, MoodPage, MilestonesPage, GenericListPage

## [ ] Task 8: 添加统一的加载状态和空状态
- **Priority**: medium
- **Depends On**: Task 2
- **Description**: 
  - 创建统一的 Loading 组件
  - 创建统一的 Empty 状态组件
  - 在所有数据获取场景中使用
- **Acceptance Criteria Addressed**: AC-7, NFR-2
- **Test Requirements**:
  - `human-judgement` TR-7.1: 数据加载时有加载指示器，无数据时有友好的空状态提示
- **Notes**: 使用 shadcn/ui 的 Skeleton 组件或自定义加载动画

## [ ] Task 9: 优化响应式设计
- **Priority**: medium
- **Depends On**: Task 2
- **Description**: 
  - 优化移动端布局（375px）
  - 优化平板端布局（768px）
  - 确保无水平滚动
  - 优化侧边栏在小屏幕的显示
- **Acceptance Criteria Addressed**: AC-8, NFR-4
- **Test Requirements**:
  - `human-judgement` TR-8.1: 在 375px、768px、1024px 断点布局正常，无水平滚动
- **Notes**: 使用 Tailwind CSS 的响应式工具类

## [ ] Task 10: 统一组件样式 - Button, Card, Input
- **Priority**: medium
- **Depends On**: Task 2
- **Description**: 
  - 优化 Button 组件样式（渐变、悬停效果、尺寸）
  - 优化 Card 组件样式（阴影、圆角、边框）
  - 优化 Input 组件样式（边框、聚焦效果、占位符）
- **Acceptance Criteria Addressed**: AC-1, NFR-1, NFR-2
- **Test Requirements**:
  - `human-judgement` TR-9.1: 组件样式统一，交互一致
- **Notes**: 基于 shadcn/ui 组件进行自定义

## [ ] Task 11: 验证和测试
- **Priority**: high
- **Depends On**: 所有其他任务
- **Description**: 
  - 全局搜索确认无 emoji 图标残留
  - 测试所有页面的交互和视觉效果
  - 验证响应式设计
  - 检查控制台无错误
- **Acceptance Criteria Addressed**: 所有 AC
- **Test Requirements**:
  - `programmatic` TR-10.1: grep 确认无 emoji 图标
  - `programmatic` TR-10.2: 控制台无 React 警告和错误
  - `human-judgement` TR-10.3: 所有页面视觉效果良好，交互流畅
- **Notes**: 使用浏览器控制台和 grep 工具验证