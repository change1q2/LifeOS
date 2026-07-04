# 人生系统 - 用户认证与多账号数据隔离

## Overview
- **Summary**: 将现有"产品人生系统"重命名为"人生系统"，并添加完整的用户注册登录逻辑，实现数据按账号隔离存储。
- **Purpose**: 支持多用户使用同一系统，每个用户拥有独立的数据空间，提升系统的安全性和用户体验。
- **Target Users**: 使用人生系统记录个人生活数据的用户。

## Goals
- 将系统名称从"产品人生系统"改为"人生系统"
- 实现用户注册功能（邮箱+密码）
- 实现用户登录/登出功能（JWT token认证）
- 所有业务数据按用户隔离存储
- 前端未登录时显示登录/注册页面
- 支持 localStorage 模式下的多用户数据隔离

## Non-Goals (Out of Scope)
- 第三方 OAuth 登录（如微信、Google）
- 用户密码重置功能
- 用户头像和个人资料编辑
- 数据共享/协作功能
- 管理员后台

## Background & Context
当前系统仅支持单用户模式，所有数据存储在统一的数据库表中，没有用户隔离。前端使用 localStorage 作为 API 的 fallback，同样没有用户概念。

## Functional Requirements
- **FR-1**: 修改系统标题和相关文案，将"产品人生系统"改为"人生系统"
- **FR-2**: 后端添加用户表（users），存储邮箱、密码哈希等信息
- **FR-3**: 后端添加注册接口（POST /api/auth/register），支持邮箱+密码注册
- **FR-4**: 后端添加登录接口（POST /api/auth/login），返回 JWT token
- **FR-5**: 后端所有业务数据表添加 user_id 字段，关联到用户表
- **FR-6**: 后端所有业务 API 修改为按用户查询数据
- **FR-7**: 前端添加登录/注册页面
- **FR-8**: 前端添加认证状态管理（AuthProvider）
- **FR-9**: 前端未登录时重定向到登录页面
- **FR-10**: localStorage 模式支持多用户数据隔离

## Non-Functional Requirements
- **NFR-1**: 密码使用 bcrypt 哈希存储，禁止明文存储
- **NFR-2**: JWT token 设置合理的过期时间（如24小时）
- **NFR-3**: API 请求携带 Authorization 头，后端验证 token
- **NFR-4**: 登录状态持久化，刷新页面后保持登录
- **NFR-5**: 前端 localStorage 按用户隔离存储数据

## Constraints
- **Technical**: 使用 JWT 进行无状态认证，后端使用 SQLite 数据库，前端使用 React + Vite
- **Dependencies**: 需要安装 bcrypt、jsonwebtoken 等依赖

## Assumptions
- 后端服务能够正常运行（需要安装 Python 环境编译 better-sqlite3）
- 用户使用邮箱作为登录凭证
- 每个用户的数据完全独立，不共享

## Acceptance Criteria

### AC-1: 系统名称修改
- **Given**: 系统已部署
- **When**: 用户访问首页
- **Then**: 页面标题显示"人生系统"，系统内部文案统一为"人生系统"
- **Verification**: `human-judgment`

### AC-2: 用户注册
- **Given**: 用户未登录
- **When**: 用户填写邮箱和密码并点击注册
- **Then**: 创建新用户记录，返回成功消息
- **Verification**: `programmatic`

### AC-3: 用户登录
- **Given**: 用户已注册
- **When**: 用户填写正确的邮箱和密码并点击登录
- **Then**: 返回 JWT token，前端保存 token，进入系统首页
- **Verification**: `programmatic`

### AC-4: 用户登出
- **Given**: 用户已登录
- **When**: 用户点击登出按钮
- **Then**: 删除本地 token，重定向到登录页面
- **Verification**: `human-judgment`

### AC-5: 数据隔离
- **Given**: 两个不同用户登录系统
- **When**: 每个用户查看和修改数据
- **Then**: 用户A只能看到自己的数据，用户B只能看到自己的数据
- **Verification**: `human-judgment`

### AC-6: 未登录访问控制
- **Given**: 用户未登录
- **When**: 用户尝试直接访问系统页面（如 /dashboard）
- **Then**: 自动重定向到登录页面
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要支持用户密码找回功能？
- [ ] 是否需要添加用户头像功能？
