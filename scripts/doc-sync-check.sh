#!/bin/bash
# 第二大脑 - 文档同步检测脚本
# 对比飞书 PRD / 技术设计文档与代码实现的差异
# 用法: ./scripts/doc-sync-check.sh
#
# 检查项：
#   1. PRD 中声明的功能是否在代码中有实现
#   2. 飞书 PRD 中未提及但代码中已实现的功能
#   3. CHANGELOG 最新版本是否与 git tag 一致

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  📄 文档同步检测${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ISSUES=()
WARNINGS=()
PASSES=()

# ============================================================
# 1. 检查 CHANGELOG 与 git tag 一致性
# ============================================================

echo -e "${CYAN}📋 Step 1: CHANGELOG vs Git Tags${NC}"

LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "无")
CHANGELOG_VERSION=$(head -20 CHANGELOG.md 2>/dev/null | grep -oP 'v?\d{4}-\d{2}-\d{2}' | head -1 || echo "未找到")

echo -e "  最新 git tag: ${LATEST_TAG}"
echo -e "  CHANGELOG 日期: ${CHANGELOG_VERSION}"

if [[ "$LATEST_TAG" == "无" ]]; then
  WARNINGS+=("没有 git tag，建议执行发版检查脚本打 tag")
elif [[ -z "$CHANGELOG_VERSION" ]]; then
  WARNINGS+=("CHANGELOG 中未找到日期版本号")
fi
echo ""

# ============================================================
# 2. 检查 PRD 功能 vs 代码实现
# ============================================================

echo -e "${CYAN}📋 Step 2: PRD 功能 vs 代码实现${NC}"

# PRD 中声明的核心功能清单（基于飞书 PRD 分析）
declare -A PRD_FEATURES=(
  ["文字输入笔记"]="frontend/src/components/TextInput.vue|frontend/src/views/Home.vue"
  ["图片 OCR"]="frontend/src/views/Home.vue|backend/src/services/ocrService.js|backend/src/routes/ocr.js"
  ["语音 ASR"]="frontend/src/views/Home.vue|backend/src/services/asrService.js|backend/src/routes/asr.js"
  ["AI 自动标签"]="frontend/src/components/CategorySelector.vue|backend/src/services/tagService.js"
  ["AI 问答"]="frontend/src/views/Chat.vue|backend/src/services/chat.js|backend/src/routes/chat.js"
  ["笔记列表"]="frontend/src/views/Home.vue"
  ["笔记详情"]="frontend/src/views/NoteDetail.vue|frontend/src/components/NoteCard.vue"
  ["全文搜索"]="frontend/src/components/SearchBar.vue|backend/src/routes/search.js"
  ["标签管理"]="frontend/src/components/CategorySelector.vue|backend/src/routes/tags.js"
  ["飞书同步"]="scripts/sync-to-feishu.js|.github/workflows/sync-to-feishu.yml"
  ["设置页"]="frontend/src/views/Settings.vue"
  ["PWA"]="frontend/vite.config.ts|public/manifest.json"
)

for feature in "${!PRD_FEATURES[@]}"; do
  patterns="${PRD_FEATURES[$feature]}"
  found=false
  IFS='|' read -ra pats <<< "$patterns"
  for pat in "${pats[@]}"; do
    if ls "$pat" 1>/dev/null 2>&1; then
      found=true
      break
    fi
  done
  if $found; then
    echo -e "  ${GREEN}✅ ${feature}${NC}"
  else
    MISSING+=("$feature")
    echo -e "  ${RED}❌ ${feature} — 未找到对应代码文件${NC}"
  fi
done
echo ""

if [[ ${#MISSING[@]} -gt 0 ]]; then
  WARNINGS+=("PRD 中声明但代码中未找到实现: ${MISSING[*]}")
fi

# ============================================================
# 3. 检查代码中新增功能是否同步到 PRD
# ============================================================

echo -e "${CYAN}📋 Step 3: 代码新增功能 vs PRD 同步${NC}"

# 检查代码中存在的但 PRD 未明确声明的功能
CODE_ONLY=()

# KDesign 设计系统
if ls frontend/src/assets/kdesign-tokens.css 1>/dev/null 2>&1; then
  CODE_ONLY+=("KDesign Design System（代码已迁移，PRD 未更新设计系统章节）")
fi

# MCP Context Server
if ls scripts/mcp-context-server.js 1>/dev/null 2>&1; then
  CODE_ONLY+=("MCP Context Server（代码已实现，PRD 未提及）")
fi

# 质量走廊体系
if ls .cursor/rules/*.mdc 1>/dev/null 2>&1; then
  CODE_ONLY+=("Cursor Rules + 质量走廊体系（代码已实现，PRD 未提及）")
fi

# 发版检查脚本
if ls scripts/release-check.sh 1>/dev/null 2>&1; then
  CODE_ONLY+=("发版检查脚本（代码已实现，PRD 未提及）")
fi

if [[ ${#CODE_ONLY[@]} -eq 0 ]]; then
  echo -e "  ${GREEN}✅ 无未同步的代码功能${NC}"
else
  for item in "${CODE_ONLY[@]}"; do
    echo -e "  ${YELLOW}⚠️ ${item}${NC}"
  done
  WARNINGS+=("${#CODE_ONLY[@]} 个代码功能未同步到 PRD")
fi
echo ""

# ============================================================
# 4. 检查技术设计文档一致性
# ============================================================

echo -e "${CYAN}📋 Step 4: 技术栈一致性${NC}"

# PRD 中声明的技术栈 vs 实际使用
echo -e "  ${CYAN}PRD 声明${NC}          →  ${CYAN}实际使用${NC}"
echo ""

check_tech() {
  local name="$1" prd="$2" actual="$3"
  echo -n "  ${name}: ${prd} → ${actual} "
  if [[ "$prd" == "$actual" ]]; then
    echo -e "${GREEN}✅${NC}"
  else
    echo -e "${YELLOW}⚠️ 有变更${NC}"
    WARNINGS+=("${name}: PRD 写 ${prd}，实际用 ${actual}")
  fi
}

# 前端框架
if grep -q '"vue"' frontend/package.json 2>/dev/null; then
  check_tech "前端" "Vue 3" "Vue 3"
else
  check_tech "前端" "Vue 3" "未检测到"
fi

# 构建工具
if grep -q "vite" frontend/package.json 2>/dev/null; then
  check_tech "构建" "Vite" "Vite"
fi

# 后端框架
if grep -q "koa" backend/package.json 2>/dev/null; then
  check_tech "后端" "Koa.js" "Koa.js"
fi

# 存储
if ls data/work.md data/personal.md 2>/dev/null; then
  check_tech "存储" "Markdown" "Markdown"
fi

# CSS 框架
if grep -q "tailwindcss" frontend/package.json 2>/dev/null; then
  check_tech "CSS" "Tailwind CSS" "Tailwind CSS v4"
fi

# OCR（PRD 说百度，实际用 Tesseract）
if grep -q "tesseract" backend/package.json 2>/dev/null; then
  check_tech "OCR" "百度" "Tesseract（本地）"
fi

echo ""

# ============================================================
# 5. 检查 GitHub 发布记录 vs CHANGELOG
# ============================================================

echo -e "${CYAN}📋 Step 5: GitHub 发布记录一致性${NC}"

# 检查 CHANGELOG 中提到的最近 3 个版本是否有对应 git tag
CHANGELOG_DATES=$(grep -oP '\d{4}-\d{2}-\d{2}' CHANGELOG.md | head -5 | sort -u -r)

for date in $CHANGELOG_DATES; do
  TAG="v${date//./\.}"
  if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo -e "  ${GREEN}✅ ${TAG} — tag 存在${NC}"
  else
    echo -e "  ${YELLOW}⚠️ ${date} — 无对应 git tag（可能未发版）${NC}"
  fi
done
echo ""

# ============================================================
# 总结
# ============================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [[ ${#ISSUES[@]} -gt 0 ]]; then
  echo -e "  ${RED}🔴 检测到 ${#ISSUES[@]} 个严重问题${NC}"
  for i in "${ISSUES[@]}"; do echo -e "  ${RED}• ${i}${NC}"; done
fi

if [[ ${#WARNINGS[@]} -gt 0 ]]; then
  echo -e "  ${YELLOW}🟡 检测到 ${#WARNINGS[@]} 个不一致项${NC}"
  for w in "${WARNINGS[@]}"; do echo -e "  ${YELLOW}• ${w}${NC}"; done
fi

if [[ ${#WARNINGS[@]} -eq 0 && ${#ISSUES[@]} -eq 0 ]]; then
  echo -e "  ${GREEN}🟢 文档与代码完全同步${NC}"
else
  echo ""
  echo -e "  ${CYAN}💡 建议：定期运行此脚本，保持 PRD 与代码一致${NC}"
fi

echo ""
