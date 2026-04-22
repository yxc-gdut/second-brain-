# 第二大脑 — 前端代码规范

## 技术栈
- Vue 3 + Composition API + TypeScript
- Vite 7 + PWA
- Tailwind CSS v4（使用 `@import "tailwindcss"` 而非 `@tailwind` 指令）
- Pinia 状态管理

## 代码组织
```
src/
├── api/           # API 请求封装
├── assets/        # 静态资源
├── components/    # 通用组件（大驼峰，如 NoteCard.vue）
├── composables/   # 组合式函数（useXxx.ts）
├── router/        # 路由配置
├── stores/        # Pinia store
├── views/         # 页面组件（大驼峰，如 Home.vue）
└── App.vue
```

## 命名规范
| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase.vue | `NoteCard.vue` |
| 组合式函数 | useCamelCase.ts | `useNotes.ts` |
| Store | useXxxStore.ts | `useAppStore.ts` |
| API 文件 | camelCase.ts | `notes.ts` |
| 变量/函数 | camelCase | `fetchNotes` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_TIMES` |
| CSS 变量 | kebab-case | `--btn-primary-color` |

## TypeScript 规范
- **禁止使用 `any`**（除非明确标记 `// eslint-disable-next-line @typescript-eslint/no-explicit-any`）
- 组件 props 必须定义类型
- API 返回值必须定义接口
- 使用 `interface` 而非 `type` 来定义对象结构（更推荐）

```typescript
// ✅ 正确
interface NoteItem {
  id: string
  content: string
  category: 'work' | 'personal'
}

// ❌ 错误
const note: any = {}
```

## Vue 3 规范
- 使用 `<script setup lang="ts">` 语法
- 组件 emit 必须声明 emits 选项
- 避免在 `setup()` 中直接解构 `props`（会丢失响应式），用 `toRefs()` 或直接访问

```typescript
// ✅ 正确
const props = defineProps<{ id: string }>()
console.log(props.id)

// ❌ 错误（会丢失响应式）
const { id } = defineProps<{ id: string }>()
```

## 样式规范
- 使用 Tailwind CSS 原子类
- 自定义样式写在 `<style scoped>` 中
- 避免全局样式污染

## Git Commit 规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
test: 测试相关
chore: 构建/工具变更
```

示例：
```bash
git commit -m "feat: 新增笔记详情页"
git commit -m "fix: 修复 OCR 预览页标签显示错误"
```

## 提交前必查清单
- [ ] `npm run type-check` 通过
- [ ] `npm run lint` 无 error（warn 可接受）
- [ ] `npm run build` 构建成功
- [ ] 功能本地验证通过
- [ ] 无 console.log / debugger

## AI 辅助开发提示

用 Cursor / AI 写代码时，可以在对话开头加这段：

> "你是一个 Vue 3 + TypeScript 开发者，参考项目根目录的 CLAUDE.md 规范来写代码。"

这样 AI 生成代码会自动遵循以上规范。
