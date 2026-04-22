# 第二大脑 - 协作开发指南

## 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/yxc-gdut/second-brain-.git
cd second-brain-
```

### 2. 启动后端
```bash
cd backend
npm install
npm run dev
# 后端跑在 http://localhost:3000
```

### 3. 启动前端
```bash
cd frontend
npm install
npm run dev
# 前端跑在 http://localhost:5173
```

---

## 开发规范

### 代码规范
- 使用 **ESLint + Prettier** 自动格式化
- 使用 **TypeScript strict** 类型检查
- 提交前必须通过：`npm run lint` 和 `npm run type-check`

### 提交规范
```bash
# 格式
git commit -m "<type>: <description>"

# type 可选值
feat:   新功能
fix:    修复 bug
docs:   文档更新
style:  代码格式（不影响功能）
refactor: 重构
test:   测试相关
chore:  构建/工具变更
```

### 分支管理
- `main` — 主分支受保护，禁止直接推送
- `feature/xxx` — 功能分支，从 main 创建
- 所有变更通过 **Pull Request** 合并

---

## AI 辅助开发

产品同学可用 Cursor 等工具辅助开发，AI 会自动参考项目根目录的 `CLAUDE.md` 规范。

提交前运行检查：
```bash
cd frontend
npm run lint     # 检查代码风格
npm run type-check  # 检查 TypeScript 类型
npm run build    # 验证构建
```

---

## 环境要求
- Node.js >= 20.19.0
- npm >= 10.x
