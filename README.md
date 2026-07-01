# LifeOS · 产品人生系统 v2.0 — 全栈架构版

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | React 18 + Vite 5 + TypeScript | 主流前端开发栈，热更新快，类型安全 |
| **UI** | Tailwind CSS + Shadcn 风格组件 | 原子化 CSS + 可定制组件库 |
| **路由** | React Router v6 | 声明式路由 |
| **图标** | Lucide React | 轻量现代图标库 |
| **后端** | Node.js + Express + TypeScript | RESTful API |
| **数据库** | SQLite (better-sqlite3) | 轻量级文件数据库，无需安装 |
| **开发工具** | tsx (热重载), Vite (HMR) | 开发效率工具 |

## 项目结构

```
lifeos-app/
├── package.json              # 根工作区 (concurrently 同时启动前后端)
├── server/                   # 后端
│   ├── package.json
│   ├── tsconfig.json
│   ├── data/
│   │   └── lifeos.db         # SQLite 数据库文件 (自动生成)
│   └── src/
│       ├── index.ts          # Express 应用入口
│       ├── db.ts             # 数据库初始化 + 种子数据
│       └── routes/
│           └── index.ts      # 所有 API 路由 (CRUD + 特殊端点)
├── client/                   # 前端
│   ├── package.json
│   ├── vite.config.ts        # Vite 配置 (含 API 代理)
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx          # React 入口
│       ├── App.tsx           # 路由 + 布局
│       ├── index.css         # Tailwind + 主题变量
│       ├── types.ts          # TypeScript 类型定义
│       ├── config/
│       │   └── modules.ts    # 10大模块配置 (字段、颜色、图标)
│       ├── lib/
│       │   ├── api.ts        # API 客户端
│       │   ├── utils.ts      # 工具函数
│       │   └── hooks.tsx     # 自定义 Hooks (数据获取、Toast)
│       ├── components/
│       │   ├── Sidebar.tsx   # 侧边栏导航
│       │   ├── EntryForm.tsx  # 通用表单弹窗
│       │   └── ui/           # UI 组件库
│       │       ├── Button.tsx
│       │       ├── Card.tsx
│       │       ├── Input.tsx
│       │       ├── Badge.tsx
│       │       ├── Dialog.tsx
│       │       └── Rating.tsx
│       └── pages/
│           ├── Dashboard.tsx     # 仪表盘
│           ├── GenericListPage.tsx # 通用列表页 (学习/旅行/成就/社交/感悟)
│           ├── MoodPage.tsx      # 心情 (含日历)
│           ├── GoalsPage.tsx     # 目标 (含OKR打卡)
│           ├── HealthPage.tsx    # 健康 (含习惯打卡)
│           └── FinancePage.tsx   # 财务 (含统计图表)
```

## 10 大模块

| 模块 | 路由 | 特色功能 |
|------|------|---------|
| 📊 总览仪表盘 | `/` | 6维统计卡 + 最近动态 + 14天心情热力图 + 目标进度 + 月度收支 |
| 📚 学习成长 | `/learning` | 类型分类 + 状态追踪 + 5星评分 + 收获笔记 |
| ✈️ 旅行日记 | `/travel` | 心情评分 + 高光时刻 + 旅行感悟 |
| 🏆 成就墙 | `/achievements` | 分类标记 + 达成感受 |
| 🌙 心情心态 | `/mood` | **日历热力图** (点击日期直接记录) + 情绪标签 |
| 🎯 目标管理 | `/goals` | **OKR关键结果逐项打卡** + 进度条自动计算 |
| 💪 健康习惯 | `/health` | **7天习惯打卡网格** + 连续天数火焰 + 健康日志表 |
| 💰 财务管理 | `/finance` | 月度收支结余 + **支出分类条形图** + 交易明细 |
| 🤝 社交人脉 | `/social` | 关系分类 + 最近联系日期 |
| 💡 收获感悟 | `/insights` | 按来源分类 + 详细内容 |

## API 端点

### 通用 CRUD (learning, travel, achievements, mood, insights, social, finance)
- `GET    /api/{module}`       — 获取所有记录
- `POST   /api/{module}`       — 创建记录
- `PUT    /api/{module}/:id`   — 更新记录
- `DELETE /api/{module}/:id`   — 删除记录

### 目标管理 (特殊)
- `GET    /api/goals`                  — 获取所有目标
- `POST   /api/goals`                  — 创建目标
- `PUT    /api/goals/:id`              — 更新目标
- `DELETE /api/goals/:id`              — 删除目标
- `PATCH  /api/goals/:id/toggle-kr`    — 切换关键结果完成状态

### 健康习惯 (特殊)
- `GET    /api/health/habits`          — 获取所有习惯 (含打卡记录)
- `POST   /api/health/habits`          — 创建习惯
- `DELETE /api/health/habits/:id`      — 删除习惯
- `POST   /api/health/habits/:id/toggle` — 切换某天打卡
- `GET    /api/health/logs`            — 获取健康日志
- `POST   /api/health/logs`            — 创建健康日志
- `DELETE /api/health/logs/:id`        — 删除健康日志

## 快速启动

```bash
# 1. 安装所有依赖
cd lifeos-app
npm run install:all

# 2. 同时启动前后端开发服务器
npm run dev
# 后端: http://localhost:3001
# 前端: http://localhost:5173

# 3. 生产构建
npm run build
# 然后用后端服务: node server/dist/index.js
```

## 数据库

- 使用 SQLite，数据库文件自动生成在 `server/data/lifeos.db`
- 首次启动自动插入种子数据 (示例记录)
- 无需额外安装数据库软件
