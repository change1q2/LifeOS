# LifeOS - 图标系统升级产品需求文档

## Overview
- **Summary**: 将当前UI中使用的emoji图标替换为Lucide React专业SVG图标库，提升产品专业感和视觉一致性。
- **Purpose**: 解决当前UI使用emoji作为图标导致的专业感不足、跨平台显示不一致、可定制性差等问题。
- **Target Users**: 所有LifeOS用户，提升整体产品体验和品牌形象。

## Goals
- 将所有页面中的emoji图标替换为Lucide React专业图标
- 创建统一的图标映射系统，方便后续维护和扩展
- 确保图标在不同平台和主题模式下显示一致
- 提升产品的专业感和视觉质量

## Non-Goals (Out of Scope)
- 不改变页面布局和功能逻辑
- 不添加新的页面或功能模块
- 不修改后端API接口

## Background & Context
- 当前项目使用emoji作为图标，存在以下问题：
  - 跨平台显示效果不一致
  - 缺乏专业感，影响品牌形象
  - 无法自定义颜色和大小
  - 在深色模式下显示效果不佳
- 项目已使用lucide-react库，需要建立统一的图标映射系统

## Functional Requirements
- **FR-1**: 创建统一图标映射组件 CategoryIcon，支持emoji和图标名称两种方式映射
- **FR-2**: 更新Sidebar导航图标为Lucide图标
- **FR-3**: 更新Dashboard页面所有emoji图标为Lucide图标
- **FR-4**: 更新LearningPage学习页面图标为Lucide图标
- **FR-5**: 更新FinancePage财务页面图标为Lucide图标
- **FR-6**: 更新HealthPage健康页面图标为Lucide图标
- **FR-7**: 更新GoalsPage目标页面图标为Lucide图标
- **FR-8**: 更新MoodPage心情页面图标为Lucide图标
- **FR-9**: 更新TravelPage旅行页面图标为Lucide图标
- **FR-10**: 更新AchievementsPage成就页面图标为Lucide图标
- **FR-11**: 更新模块配置文件中的图标定义

## Non-Functional Requirements
- **NFR-1**: 保持现有布局不变，仅替换图标
- **NFR-2**: 图标颜色与模块主题色保持一致
- **NFR-3**: 图标大小与原emoji保持协调
- **NFR-4**: 构建过程无TypeScript错误

## Constraints
- **Technical**: 使用lucide-react库，不引入新的图标库依赖
- **Dependencies**: 需要确保lucide-react版本支持所需图标

## Assumptions
- lucide-react库已安装并可用
- 项目使用React + TypeScript技术栈
- 现有代码结构保持不变

## Acceptance Criteria

### AC-1: 统一图标映射系统
- **Given**: 需要显示分类图标时
- **When**: 使用CategoryIcon组件传入emoji或图标名称
- **Then**: 组件正确渲染对应的Lucide图标
- **Verification**: `programmatic`

### AC-2: Sidebar导航图标更新
- **Given**: 用户打开侧边栏
- **When**: 查看导航菜单
- **Then**: 所有导航项使用Lucide图标，无emoji显示
- **Verification**: `human-judgment`

### AC-3: Dashboard页面图标更新
- **Given**: 用户访问Dashboard页面
- **When**: 查看页面内容
- **Then**: 财务目标卡片、心情记录、统计图表等使用Lucide图标
- **Verification**: `human-judgment`

### AC-4: 学习页面图标更新
- **Given**: 用户访问学习成长页面
- **When**: 查看技能树分类和学习记录
- **Then**: 分类图标和统计卡片使用Lucide图标
- **Verification**: `human-judgment`

### AC-5: 财务页面图标更新
- **Given**: 用户访问财务管理页面
- **When**: 查看财务目标和统计
- **Then**: 目标卡片和分类图标使用Lucide图标
- **Verification**: `human-judgment`

### AC-6: 健康页面图标更新
- **Given**: 用户访问健康习惯页面
- **When**: 查看健康记录和习惯打卡
- **Then**: 健康分类和记录图标使用Lucide图标
- **Verification**: `human-judgment`

### AC-7: 目标页面图标更新
- **Given**: 用户访问目标管理页面
- **When**: 查看目标列表和进度
- **Then**: 目标分类和进度图标使用Lucide图标
- **Verification**: `human-judgment`

### AC-8: 心情页面图标更新
- **Given**: 用户访问心情记录页面
- **When**: 查看心情评分和记录
- **Then**: 心情表情和分类图标使用Lucide图标
- **Verification**: `human-judgment`

### AC-9: 旅行页面图标更新
- **Given**: 用户访问旅行日记页面
- **When**: 查看旅行分类和记录
- **Then**: 旅行分类图标使用Lucide图标
- **Verification**: `human-judgment`

### AC-10: 成就页面图标更新
- **Given**: 用户访问成就墙页面
- **When**: 查看成就树和统计
- **Then**: 模块图标和成就徽章使用Lucide图标
- **Verification**: `human-judgment`

### AC-11: 构建验证
- **Given**: 执行npm run build命令
- **When**: 构建项目
- **Then**: 构建成功，无TypeScript错误
- **Verification**: `programmatic`

## Open Questions
- [ ] 暂无未解决问题
