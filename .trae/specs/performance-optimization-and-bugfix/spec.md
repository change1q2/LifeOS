# LifeOS 性能优化与Bug修复 - Product Requirement Document

## Overview
- **Summary**: 对 LifeOS 全栈应用进行性能优化，修复全局删除功能导致数据全部丢失的严重 Bug，并完成全方位测试验证（接口、UI、功能、性能、兼容性）。
- **Purpose**: 提升应用加载速度和运行流畅度，修复致命的数据丢失 Bug，确保产品在浏览器和移动端 APP 上的稳定性和用户体验。
- **Target Users**: LifeOS 的所有终端用户（Web 端和 Android APP 端）

## Goals
- 修复删除功能导致全部数据丢失的严重 Bug
- 首屏加载时间减少 40% 以上
- Dashboard 页面加载数据量减少 60% 以上
- localStorage 数据操作性能提升 50% 以上
- 完成接口、UI、功能、性能、兼容性五维测试全覆盖
- 确保浏览器和 Android APP 两端功能一致且稳定

## Non-Goals (Out of Scope)
- 不重构整体架构（保持 React + Express 技术栈）
- 不替换数据库（保持 JSON 文件存储，不引入真正的 SQLite）
- 不新增业务功能模块
- 不做 UI 视觉重设计
- 不实现服务端渲染 (SSR)
- 不做自动化测试框架搭建（本次以手动测试为主）

## Background & Context
- LifeOS 是一个全栈人生管理系统，包含 10 大功能模块
- 前端使用 React 18 + Vite 5 + TypeScript + Tailwind CSS
- 后端使用 Express + JSON 文件数据库
- 支持 Web 浏览器和 Android APP (Capacitor) 双端
- 当前存在删除操作可能导致全部数据丢失的严重 Bug
- Dashboard 一次性请求 8 个模块完整数据，加载慢且浪费资源
- localStorage 每次操作都 JSON.parse 全量数据，性能差
- 路由未懒加载，首屏加载所有页面代码
- 后端每次请求都读写磁盘，无内存缓存

## Functional Requirements

### Bug 修复
- **FR-1**: 修复删除单条记录时导致整个模块数据全部丢失的 Bug
- **FR-2**: 修复删除分类时的相关问题（数据迁移逻辑错误）
- **FR-3**: 确保所有删除操作（记录删除、习惯删除、分类删除、目标删除）都只删除目标数据
- **FR-4**: 添加删除操作的二次确认和防误触机制

### 性能优化
- **FR-5**: 实现路由级别的代码分割（React.lazy + Suspense）
- **FR-6**: 实现 Dashboard 聚合接口，一次返回统计数据+最近动态
- **FR-7**: localStorage 添加内存缓存，避免重复 JSON.parse
- **FR-8**: 后端数据库添加内存缓存，避免每次请求读磁盘
- **FR-9**: 后端写入操作添加 debounce，减少磁盘写入次数
- **FR-10**: Vite 构建优化（manualChunks 分包策略）
- **FR-11**: React Query 缓存策略优化
- **FR-12**: dnd-kit 按需加载（仅在编辑模式下加载拖拽库）

## Non-Functional Requirements

- **NFR-1 (性能)**: 首屏 JS 体积减少 40% 以上
- **NFR-2 (性能)**: Dashboard 页面 API 请求数从 8 个减少到 2 个以内
- **NFR-3 (性能)**: localStorage 读取操作耗时减少 50% 以上（缓存命中时）
- **NFR-4 (稳定性)**: 删除操作 100% 准确，无数据误删
- **NFR-5 (兼容性)**: Chrome、Safari、Firefox 最新版浏览器均正常运行
- **NFR-6 (兼容性)**: Android 8.0 以上设备 APP 正常运行
- **NFR-7 (安全性)**: 后端 API 都经过鉴权验证
- **NFR-8 (可维护性)**: 代码改动遵循现有代码风格和架构

## Constraints
- **技术**: 必须使用现有技术栈（React 18, Vite 5, Express, TypeScript）
- **技术**: 不能引入会破坏现有 API 接口兼容性的变更
- **业务**: 所有现有功能必须保持可用，不能因优化导致功能退化
- **依赖**: 只能添加必要的依赖，优先使用现有依赖
- **时间**: 优化和测试需在合理范围内完成

## Assumptions
- 删除 Bug 的根本原因是 id 类型不匹配或分类删除逻辑错误（待验证）
- 用户主要在现代浏览器环境使用（Chrome / Safari）
- 移动端 APP 主要在 Android 平台运行
- 数据量在单机应用范围内（单用户 < 10000 条记录）
- 后端服务为单实例部署，无需考虑分布式缓存一致性

## Acceptance Criteria

### AC-1: 删除功能正确性验证
- **Given**: 用户在任意模块（学习/旅行/目标/健康/财务等）有 N 条记录
- **When**: 用户删除其中 1 条记录
- **Then**: 该模块剩余 N-1 条记录，其他模块数据不受影响
- **Verification**: `programmatic`
- **Notes**: 需测试所有模块的删除功能

### AC-2: 分类删除数据迁移正确性
- **Given**: 某个分类下有 M 条记录
- **When**: 用户删除该分类
- **Then**: 该分类下的 M 条记录被迁移到默认分类，数据不丢失
- **Verification**: `programmatic`

### AC-3: 习惯删除级联正确性
- **Given**: 一个习惯有 N 天打卡记录
- **When**: 用户删除该习惯
- **Then**: 该习惯及其所有打卡记录被删除，其他习惯不受影响
- **Verification**: `programmatic`

### AC-4: 路由懒加载
- **Given**: 用户首次访问登录页
- **When**: 页面加载完成
- **Then**: 只加载登录页相关代码，不加载其他页面代码
- **Verification**: `programmatic`
- **Notes**: 通过浏览器 DevTools Network 面板验证

### AC-5: Dashboard 性能优化
- **Given**: 用户访问 Dashboard 页面
- **When**: 页面加载数据
- **Then**: API 请求数 ≤ 2，且数据量比优化前减少 60% 以上
- **Verification**: `programmatic`

### AC-6: localStorage 性能优化
- **Given**: 本地存储有 100KB 以上数据
- **When**: 连续多次读取同一模块数据
- **Then**: 第二次及以后读取耗时 < 1ms（内存缓存命中）
- **Verification**: `programmatic`

### AC-7: 后端性能优化
- **Given**: 后端服务运行中
- **When**: 连续多次同一请求
- **Then**: 后续请求从内存缓存读取，不读磁盘
- **Verification**: `programmatic`

### AC-8: 浏览器兼容性
- **Given**: 使用 Chrome / Safari / Firefox 最新版浏览器
- **When**: 访问应用并执行核心操作
- **Then**: 所有功能正常运行，无视觉错乱
- **Verification**: `human-judgment`

### AC-9: 移动端兼容性
- **Given**: 使用 Android 手机安装 APP
- **When**: 使用 APP 执行核心操作
- **Then**: 所有功能正常运行，适配手机屏幕
- **Verification**: `human-judgment`

### AC-10: 功能完整性
- **Given**: 优化和修复完成后
- **When**: 遍历所有 10 大模块的增删改查操作
- **Then**: 所有功能正常，无回归 Bug
- **Verification**: `human-judgment`

### AC-11: 无数据丢失
- **Given**: 优化前后各模块有测试数据
- **When**: 完成所有操作测试后
- **Then**: 数据一致性得到验证，无意外数据丢失
- **Verification**: `programmatic`

## Open Questions
- [ ] 删除 Bug 的具体触发条件和场景是什么？（将在实施阶段通过测试确认）
- [ ] 用户主要使用哪些浏览器？（假设为 Chrome/Safari/Firefox 最新版）
- [ ] 移动端 APP 最低支持的 Android 版本是多少？（假设为 Android 8.0+）
- [ ] 是否需要在优化后提供数据导出/备份功能以防万一？（本次不包含）
