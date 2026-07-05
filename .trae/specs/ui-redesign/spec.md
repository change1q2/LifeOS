# LifeOS 整体UI设计优化 - 产品需求文档

## Overview
- **Summary**: 对 LifeOS 个人生活管理系统进行全面的 UI/UX 设计优化，包括设计系统重构、组件升级、图标替换、交互增强和视觉一致性提升
- **Purpose**: 通过专业的设计系统，提升用户体验和视觉品质，使产品更加现代化、专业且易用
- **Target Users**: 个人用户，希望通过系统化方式管理学习、健康、财务、目标等生活各个方面

## Goals
- 创建完整的设计系统（丰富的颜色系统、排版、间距、阴影、圆角等）
- 替换所有 emoji 图标为专业的 SVG 图标（Lucide）
- 优化全局布局和响应式设计
- 提升交互体验（悬停效果、过渡动画、加载状态）
- 确保视觉一致性和专业感
- 添加深色/浅色模式切换功能，支持系统偏好检测

## Non-Goals (Out of Scope)
- 不修改后端 API 接口逻辑
- 不改变现有功能模块的业务逻辑
- 不添加新的功能模块
- 不修改数据模型

## Background & Context
- 当前项目使用 React + TypeScript + Tailwind CSS
- 已集成 shadcn/ui 组件库
- 当前 UI 使用 emoji 作为图标，缺乏专业感
- 颜色系统基本但不够丰富，需要扩展为专业级配色方案（包含主色、辅色、语义色、中性色等完整色系）
- 需要遵循 ui-ux-pro-max 的设计原则
- 用户需要深色/浅色模式切换功能，支持系统偏好自动检测

## Functional Requirements
- **FR-1**: 创建完整的设计系统规范，包含丰富的颜色系统（主色、辅色、语义色、中性色、渐变色）、排版、间距、阴影、圆角
- **FR-2**: 替换所有 emoji 图标为 Lucide React SVG 图标
- **FR-3**: 优化 Sidebar 导航组件的视觉效果和交互，添加主题切换按钮
- **FR-4**: 优化 Dashboard 页面的卡片布局和数据展示
- **FR-5**: 优化登录/注册页面的视觉设计，支持深色/浅色模式
- **FR-6**: 优化通用列表页面的布局和交互
- **FR-7**: 添加统一的过渡动画和加载状态
- **FR-8**: 优化响应式设计，确保移动端体验
- **FR-9**: 添加深色/浅色模式切换功能，支持系统偏好检测和 localStorage 持久化

## Non-Functional Requirements
- **NFR-1**: 所有可点击元素必须有 `cursor-pointer` 和悬停反馈
- **NFR-2**: 过渡动画时间控制在 150-300ms 之间
- **NFR-3**: 浅色模式文本对比度不低于 4.5:1，深色模式对比度不低于 4.5:1
- **NFR-4**: 响应式断点：375px（移动端）、768px（平板）、1024px（桌面）
- **NFR-5**: 不使用 emoji 作为 UI 图标
- **NFR-6**: 颜色系统包含完整色系：主色（5个色系）、辅色（4个色系）、语义色（成功、警告、错误、信息）、中性色（10级灰度）、渐变色（5组）
- **NFR-7**: 主题切换无闪烁，使用 CSS 过渡实现平滑切换

## Constraints
- **Technical**: React 18+, TypeScript, Tailwind CSS 3+, shadcn/ui
- **Business**: 保持现有功能不变，仅优化视觉和交互
- **Dependencies**: 需要安装 lucide-react 图标库

## Assumptions
- 用户已安装 Node.js 和 npm
- 项目已配置 Tailwind CSS 和 shadcn/ui
- 默认主题跟随系统偏好，支持手动切换为深色或浅色模式
- 用户希望拥有完整的颜色系统，包含主色、辅色、语义色、中性色和渐变色

## Acceptance Criteria

### AC-1: 设计系统规范
- **Given**: 用户查看项目样式
- **When**: 检查颜色、排版、间距等设计规范
- **Then**: 所有页面使用统一的设计规范
- **Verification**: `human-judgment`

### AC-2: 图标替换
- **Given**: 浏览应用
- **When**: 查看任何页面的图标
- **Then**: 所有图标使用 SVG（Lucide），无 emoji 图标
- **Verification**: `programmatic`

### AC-2.1: 模块图标统一
- **Given**: 查看各模块页面头部
- **When**: 检查模块图标
- **Then**: 每个模块使用统一的 Lucide 图标（学习: BookOpen, 旅行: Plane, 目标: Target, 健康: Dumbbell, 财务: Wallet, 社交: Users, 感悟: Lightbulb, 成就: Trophy, 心情: Moon）
- **Verification**: `human-judgment`

### AC-2.2: 分类图标系统
- **Given**: 查看分类管理卡片
- **When**: 检查各分类图标
- **Then**: 每个分类使用对应的 Lucide 图标，图标与分类语义匹配
- **Verification**: `human-judgment`

### AC-2.3: 心情表情图标
- **Given**: 查看心情记录页面
- **When**: 检查心情评分图标
- **Then**: 使用 Lucide 的 Frown(1-2分)、Meh(3分)、Smile(4分)、Heart(5分) 图标
- **Verification**: `human-judgment`

### AC-2.4: 成就墙图标
- **Given**: 查看成就墙页面
- **When**: 检查模块分组和成就项图标
- **Then**: 使用 Lucide 图标替代 emoji，保持视觉一致性
- **Verification**: `human-judgment`

### AC-3: Sidebar 优化
- **Given**: 用户打开应用
- **When**: 查看侧边栏导航
- **Then**: 导航有专业图标、悬停效果、当前状态高亮
- **Verification**: `human-judgment`

### AC-4: Dashboard 优化
- **Given**: 用户访问首页
- **When**: 查看 Dashboard 内容
- **Then**: 卡片布局清晰、数据展示直观、视觉层次分明
- **Verification**: `human-judgment`

### AC-5: 认证页面优化
- **Given**: 用户访问登录/注册页面
- **When**: 查看页面设计
- **Then**: 页面现代美观、表单交互流畅、反馈清晰
- **Verification**: `human-judgment`

### AC-6: 交互体验
- **Given**: 用户与应用交互
- **When**: 点击、悬停、加载数据
- **Then**: 有平滑过渡、清晰反馈、加载状态指示
- **Verification**: `human-judgment`

### AC-7: 响应式设计
- **Given**: 在不同设备上访问应用
- **When**: 调整屏幕尺寸
- **Then**: 布局自适应，无水平滚动，移动端体验良好
- **Verification**: `human-judgment`

### AC-8: 深色/浅色模式切换
- **Given**: 用户访问应用
- **When**: 点击主题切换按钮
- **Then**: 主题在深色和浅色之间平滑切换，偏好保存在 localStorage
- **Verification**: `human-judgment`

### AC-9: 系统偏好检测
- **Given**: 用户首次访问应用
- **When**: 浏览器系统偏好为深色/浅色模式
- **Then**: 应用自动使用对应的主题
- **Verification**: `human-judgment`

### AC-10: 颜色系统丰富性
- **Given**: 查看应用样式
- **When**: 检查颜色使用
- **Then**: 使用完整的颜色系统（主色、辅色、语义色、中性色、渐变色）
- **Verification**: `human-judgment`

## Open Questions
- [x] 用户是否需要浅色模式支持？✅ 需要
- [x] 是否需要添加深色/浅色模式切换功能？✅ 需要