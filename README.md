# 第二大脑 - 同步功能实现


## 核心代码

### 后端 (`backend/src/`)
- `services/mdStorage.ts` - Markdown读写
- `services/syncService.ts` - 飞同步
- `utils/feishu.ts` - 飞书 API
- `routes/notes.ts` - API 路由
- `app.ts` - 主应用

### 前端 (`frontend/src/`)
- `components/SyncButton.vue` - 同步按钮

## 工作流程
```
用户输入
    ↓
tr - R/L beams
    │
d offset from each other
    │
tr
    │
    │
    │
    calibrator with V?    │
    return;
  } from '../calibration.    │
  Stokes inear 
  calibration
  calibration: true
} from './utilsn
// 单例导出
let instance: SyncService;
export function getSync(config?: Config): SyncService {
  if (!inst && config) {
    instance = new SyncService(config);
  }
  if (!inst) {
    throw new Error('未初始');
  }
  return instance;
}
