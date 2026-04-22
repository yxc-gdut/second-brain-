#!/usr/bin/env node
/**
 * 第二大脑 - MCP Context Server
 * 
 * 让 Cursor AI 在生成代码时能查询项目实际状态，
 * 减少 API 路径猜错、组件名写错等幻觉问题。
 * 
 * 协议: MCP (Model Context Protocol) over stdio (JSON-RPC 2.0)
 * 使用方式: npx mcp-context-server 或通过 .cursor/mcp.json 连接
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

// ============ 项目结构探测 ============

function getProjectRoot() {
  // 假设 server 在 scripts/ 目录，project root 是上一级的上一级
  const scriptDir = __dirname
  return path.resolve(scriptDir, '..')
}

function scanComponents(srcDir) {
  const components = []
  const componentsDir = path.join(srcDir, 'components')
  
  if (!fs.existsSync(componentsDir)) return components
  
  const files = fs.readdirSync(componentsDir)
  for (const file of files) {
    if (file.endsWith('.vue')) {
      const filePath = path.join(componentsDir, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      
      // 解析 props
      const propsMatch = content.match(/defineProps<([^>]+)>/)
      const emitsMatch = content.match(/defineEmits<([^>]+)>/)
      
      components.push({
        name: file.replace('.vue', ''),
        file: `components/${file}`,
        props: propsMatch ? propsMatch[1].trim() : null,
        emits: emitsMatch ? emitsMatch[1].trim() : null,
        hasScriptSetup: content.includes('<script setup'),
        description: extractComment(content) || file
      })
    }
  }
  return components
}

function scanViews(srcDir) {
  const views = []
  const viewsDir = path.join(srcDir, 'views')
  
  if (!fs.existsSync(viewsDir)) return views
  
  const files = fs.readdirSync(viewsDir)
  for (const file of files) {
    if (file.endsWith('.vue')) {
      const filePath = path.join(viewsDir, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      
      views.push({
        name: file.replace('.vue', ''),
        file: `views/${file}`,
        hasScriptSetup: content.includes('<script setup'),
        description: extractComment(content) || file
      })
    }
  }
  return views
}

function scanApiFiles(srcDir) {
  const apis = []
  const apiDir = path.join(srcDir, 'api')
  
  if (!fs.existsSync(apiDir)) return apis
  
  const files = fs.readdirSync(apiDir)
  for (const file of files) {
    if (file.endsWith('.ts')) {
      const filePath = path.join(apiDir, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      
      // 提取函数名和导出
      const funcs = []
      const funcMatches = content.matchAll(/export\s+(?:async\s+)?function\s+(\w+)|export\s+(?:const|let|var)\s+(\w+)\s*=/g)
      for (const match of funcMatches) {
        funcs.push(match[1] || match[2])
      }
      
      // 提取接口定义
      const interfaces = []
      const interfaceMatches = content.matchAll(/export\s+interface\s+(\w+)/g)
      for (const match of interfaceMatches) {
        interfaces.push(match[1])
      }
      
      apis.push({
        name: file.replace('.ts', ''),
        file: `api/${file}`,
        functions: funcs,
        interfaces,
        description: extractComment(content) || file
      })
    }
  }
  return apis
}

function scanComposables(srcDir) {
  const composables = []
  const composablesDir = path.join(srcDir, 'composables')
  
  if (!fs.existsSync(composablesDir)) return composables
  
  const files = fs.readdirSync(composablesDir)
  for (const file of files) {
    if (file.endsWith('.ts')) {
      const filePath = path.join(composablesDir, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      
      const funcs = []
      const funcMatches = content.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g)
      for (const match of funcMatches) {
        funcs.push(match[1])
      }
      
      composables.push({
        name: file.replace('.ts', ''),
        file: `composables/${file}`,
        functions: funcs,
        description: extractComment(content) || file
      })
    }
  }
  return composables
}

function scanBackendRoutes(backendDir) {
  const routes = []
  const routesDir = path.join(backendDir, 'src', 'routes')
  
  if (!fs.existsSync(routesDir)) return routes
  
  const files = fs.readdirSync(routesDir)
  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(routesDir, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      
      // 提取路由路径和方法
      const routeInfos = []
      const routeMatches = content.matchAll(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g)
      for (const match of routeMatches) {
        routeInfos.push({ method: match[1].toUpperCase(), path: match[2] })
      }
      
      routes.push({
        name: file.replace('.js', ''),
        file: `routes/${file}`,
        endpoints: routeInfos,
        description: extractComment(content) || file
      })
    }
  }
  return routes
}

function extractComment(content) {
  // 提取文件顶部的注释描述
  const match = content.match(/\/\*\*[\s\S]*?\*\//)
  if (!match) {
    // 尝试单行注释
    const lineMatch = content.match(/\/\/.*?[\n\r]/)
    return lineMatch ? lineMatch[0].replace(/\/\/|[\n\r]/g, '').trim() : null
  }
  // 去掉 /** 和 */ 和 * 前缀
  return match[0]
    .replace(/\/\*\*|\*\//g, '')
    .split('\n')
    .map(l => l.replace(/^\s*\*\s?/, '').trim())
    .filter(l => l)
    .join(' ')
    .trim()
}

function getDataModel() {
  return {
    Note: {
      id: 'string',
      content: 'string',
      source: 'string (optional)',
      category: "'work' | 'personal'",
      tags: 'string[]',
      createdAt: 'string (ISO date)',
      updatedAt: 'string (ISO date)'
    },
    Tag: {
      name: 'string',
      color: 'string (hex color, e.g. "#EF4444")'
    },
    CreateNoteData: {
      content: 'string',
      source: 'string (optional)',
      category: "'work' | 'personal'",
      tags: 'string[] (optional)'
    },
    ApiResponse: {
      success: 'boolean',
      data: 'T (generic)',
      error: 'string (optional)'
    }
  }
}

function getTagColors() {
  return {
    preset: [
      { name: '红', color: '#EF4444' },
      { name: '橙', color: '#F97316' },
      { name: '黄', color: '#EAB308' },
      { name: '绿', color: '#22C55E' },
      { name: '蓝', color: '#3B82F6' },
      { name: '紫', color: '#8B5CF6' },
      { name: '粉', color: '#EC4899' },
      { name: '灰', color: '#6B7280' }
    ]
  }
}

// ============ MCP Server 实现 ============

const PROJECT_ROOT = getProjectRoot()
const FRONTEND_SRC = path.join(PROJECT_ROOT, 'frontend', 'src')
const BACKEND_DIR = path.join(PROJECT_ROOT, 'backend')

// 缓存项目上下文（避免每次请求都重新扫描）
let cachedContext = null

function getContext() {
  if (cachedContext) return cachedContext
  
  cachedContext = {
    components: scanComponents(FRONTEND_SRC),
    views: scanViews(FRONTEND_SRC),
    apiFiles: scanApiFiles(FRONTEND_SRC),
    composables: scanComposables(FRONTEND_SRC),
    backendRoutes: scanBackendRoutes(BACKEND_DIR),
    dataModel: getDataModel(),
    tagColors: getTagColors()
  }
  
  return cachedContext
}

// JSON-RPC 消息处理
function handleRequest(req) {
  const { method, params, id } = req
  
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'second-brain-context',
          version: '1.0.0'
        }
      }
    }
  }
  
  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'list_components',
            description: '列出前端所有 Vue 组件，包含 props、emits 定义',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'list_views',
            description: '列出前端所有页面视图组件',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'list_api_files',
            description: '列出前端 API 封装文件及导出的函数和接口',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'list_composables',
            description: '列出前端所有 composables/hooks',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'list_backend_routes',
            description: '列出后端所有 API 路由和端点',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_data_model',
            description: '获取前后端共用数据模型（Note、Tag 等接口定义）',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_tag_colors',
            description: '获取标签预设颜色池',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_project_summary',
            description: '获取完整项目摘要（所有上下文汇总）',
            inputSchema: { type: 'object', properties: {} }
          }
        ]
      }
    }
  }
  
  if (method === 'tools/call') {
    const ctx = getContext()
    const { name, arguments: args } = params
    
    switch (name) {
      case 'list_components':
        return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(ctx.components, null, 2) }] } }
      case 'list_views':
        return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(ctx.views, null, 2) }] } }
      case 'list_api_files':
        return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(ctx.apiFiles, null, 2) }] } }
      case 'list_composables':
        return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(ctx.composables, null, 2) }] } }
      case 'list_backend_routes':
        return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(ctx.backendRoutes, null, 2) }] } }
      case 'get_data_model':
        return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(ctx.dataModel, null, 2) }] } }
      case 'get_tag_colors':
        return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(ctx.tagColors, null, 2) }] } }
      case 'get_project_summary':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{
              type: 'text',
              text: `【第二大脑项目上下文】

📁 前端组件 (components/):
${ctx.components.map(c => `  - ${c.name} (${c.file})`).join('\n')}

📄 前端页面 (views/):
${ctx.views.map(v => `  - ${v.name} (${v.file})`).join('\n')}

🔌 前端 API 文件 (api/):
${ctx.apiFiles.map(a => `  - ${a.name}.ts: ${a.functions.join(', ')}`).join('\n')}

🪝 Composables:
${ctx.composables.map(c => `  - ${c.name}: ${c.functions.join(', ')}`).join('\n')}

🛠️ 后端 API 路由:
${ctx.backendRoutes.map(r => `  - ${r.name}: ${r.endpoints.map(e => `${e.method} ${e.path}`).join(', ')}`).join('\n')}

📊 数据模型:
${Object.entries(ctx.dataModel).map(([k, v]) => `  - ${k}: ${JSON.stringify(v)}`).join('\n')}

🎨 标签颜色池:
${ctx.tagColors.preset.map(c => `  - ${c.name}: ${c.color}`).join('\n')}
`
            }]
          }
        }
      default:
        return { jsonrpc: '2.0', id, error: { code: -32601, message: `Unknown tool: ${name}` } }
    }
  }
  
  return { jsonrpc: '2.0', id, error: { code: -32601, message: `Unknown method: ${method}` } }
}

// stdin/stdout 模式（MCP 标准模式）
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

let buffer = ''

rl.on('line', (line) => {
  if (!line.trim()) return
  
  try {
    const req = JSON.parse(line)
    const resp = handleRequest(req)
    if (resp) {
      process.stdout.write(JSON.stringify(resp) + '\n')
    }
  } catch (e) {
    process.stderr.write(`[MCP Server] Parse error: ${e.message}\n`)
  }
})

// 处理 HTTP 模式（备用，支持 curl 测试）
if (process.env.MCP_HTTP === 'true') {
  const http = require('http')
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.end(JSON.stringify({ status: 'ok' }))
      return
    }
    
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      try {
        const resp = handleRequest(JSON.parse(body))
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(resp))
      } catch (e) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: e.message }))
      }
    })
  })
  
  const port = process.env.MCP_HTTP_PORT || 3456
  server.listen(port, () => {
    console.error(`[MCP Server] HTTP mode on port ${port}`)
  })
}
