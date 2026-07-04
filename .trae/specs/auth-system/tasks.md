# 人生系统 - 用户认证与多账号数据隔离 - 实现计划

## [x] Task 1: 修改系统名称为"人生系统"
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改 index.html 中的页面标题
  - 修改系统内部所有相关文案
  - 修改 Sidebar 组件中的系统标题
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `human-judgement` TR-1.1: 页面标题显示"人生系统"
  - `human-judgement` TR-1.2: 侧边栏显示"人生系统"标题

## [x] Task 2: 后端添加用户表和认证相关依赖
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在 server/package.json 中添加 bcrypt、jsonwebtoken 依赖
  - 在 db.ts 中创建 users 表（id, email, password_hash, created_at）
  - 创建认证工具函数（generateToken, verifyToken, hashPassword）
- **Acceptance Criteria Addressed**: [AC-2, NFR-1, NFR-2]
- **Test Requirements**:
  - `programmatic` TR-2.1: users 表创建成功
  - `programmatic` TR-2.2: bcrypt 和 jsonwebtoken 依赖安装成功

## [x] Task 3: 后端添加注册登录接口
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 创建 auth 路由文件（server/src/routes/auth.ts）
  - 实现 POST /api/auth/register（邮箱+密码注册）
  - 实现 POST /api/auth/login（邮箱+密码登录，返回 JWT）
  - 实现 POST /api/auth/logout（清除 token）
- **Acceptance Criteria Addressed**: [AC-2, AC-3, NFR-3]
- **Test Requirements**:
  - `programmatic` TR-3.1: POST /api/auth/register 返回 201 状态码
  - `programmatic` TR-3.2: POST /api/auth/login 返回 JWT token
  - `programmatic` TR-3.3: 重复邮箱注册返回错误

## [x] Task 4: 后端业务数据表添加 user_id 字段
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 修改 db.ts 中所有业务表，添加 user_id 字段和外键约束
  - 修改 seedData 函数，为测试用户生成初始数据
  - 添加数据库迁移逻辑
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `programmatic` TR-4.1: 所有业务表包含 user_id 字段
  - `programmatic` TR-4.2: 外键约束创建成功

## [x] Task 5: 后端业务 API 添加用户隔离逻辑
- **Priority**: high
- **Depends On**: Task 3, Task 4
- **Description**: 
  - 创建认证中间件，从 Authorization 头获取并验证 JWT token
  - 修改所有业务路由，查询和写入数据时带上 user_id
  - 更新 seedData 函数，为默认用户生成测试数据
- **Acceptance Criteria Addressed**: [AC-5, NFR-3]
- **Test Requirements**:
  - `programmatic` TR-5.1: 未登录访问业务 API 返回 401
  - `programmatic` TR-5.2: 登录后只能访问自己的数据

## [x] Task 6: 前端添加认证状态管理
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 创建 AuthProvider 组件，管理登录状态
  - 创建 useAuth hook 供其他组件使用
  - 在 localStorage 中保存/读取 JWT token
- **Acceptance Criteria Addressed**: [AC-3, AC-4, NFR-4]
- **Test Requirements**:
  - `human-judgement` TR-6.1: 登录后 token 保存在 localStorage
  - `human-judgement` TR-6.2: 刷新页面后保持登录状态

## [x] Task 7: 前端添加登录/注册页面
- **Priority**: high
- **Depends On**: Task 6
- **Description**: 
  - 创建 AuthPage 组件，包含登录和注册表单
  - 实现注册、登录、密码验证逻辑
  - 添加错误提示样式
- **Acceptance Criteria Addressed**: [AC-2, AC-3]
- **Test Requirements**:
  - `human-judgement` TR-7.1: 登录页面显示正常
  - `human-judgement` TR-7.2: 注册页面显示正常
  - `human-judgement` TR-7.3: 错误提示显示正常

## [ ] Task 8: 前端路由添加登录保护
- **Priority**: high
- **Depends On**: Task 6, Task 7
- **Description**: 
  - 修改 App.tsx，添加 AuthProvider
  - 创建 ProtectedRoute 组件，未登录时重定向到登录页面
  - 在 Sidebar 中添加登出按钮
- **Acceptance Criteria Addressed**: [AC-4, AC-6]
- **Test Requirements**:
  - `human-judgement` TR-8.1: 未登录访问 /dashboard 重定向到登录页
  - `human-judgement` TR-8.2: 登录后可以正常访问所有页面
  - `human-judgement` TR-8.3: 登出后重定向到登录页

## [x] Task 8: localStorage 模式支持多用户数据隔离
- **Priority**: medium
- **Depends On**: Task 6
- **Description**: 
  - 修改 storage.ts，按用户 ID 隔离存储数据
  - 修改 api.ts，在 localStorage 模式下使用当前用户的数据
- **Acceptance Criteria Addressed**: [FR-10]
- **Test Requirements**:
  - `human-judgement` TR-9.1: localStorage 模式下多用户数据隔离
  - `human-judgement` TR-9.2: 切换用户后数据正确切换

## [ ] Task 10: 构建验证和测试
- **Priority**: high
- **Depends On**: 所有任务
- **Description**: 
  - 构建前端项目验证无错误
  - 启动后端服务验证 API 正常
  - 测试完整的注册、登录、数据操作流程
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4, AC-5, AC-6]
- **Test Requirements**:
  - `programmatic` TR-10.1: 前端构建成功
  - `human-judgement` TR-10.2: 完整流程测试通过
