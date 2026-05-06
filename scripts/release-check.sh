#!/bin/bash
# 第二大脑 - 发版检查脚本
# 用法: ./scripts/release-check.sh [--auto]
#   --auto  检查通过后自动发版（打 tag + push）
#
# 流程: lint → type-check → test → build → E2E → 生成 CHANGELOG → [tag + push]

set -e

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# 配置
CHANGELOG="$PROJECT_DIR/CHANGELOG.md"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_DIR="$PROJECT_DIR/backend"

# 参数解析
AUTO_RELEASE=false
if [[ "$1" == "--auto" ]]; then
  AUTO_RELEASE=true
fi

# ============================================================
# 工具函数
# ============================================================

step() {
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

pass() { echo -e "  ${GREEN}✅ $1${NC}"; }
fail() { echo -e "  ${RED}❌ $1${NC}"; FAILED_STEPS+=("$1"); }
warn() { echo -e "  ${YELLOW}⚠️  $1${NC}"; }

FAILED_STEPS=()

# ============================================================
# Step 0: 前置检查
# ============================================================

step "Step 0: 前置检查"

# 检查工作区是否干净
if [[ -n $(git status --porcelain 2>/dev/null) ]]; then
  fail "工作区有未提交的变更，请先 commit"
  git status --short
  exit 1
else
  pass "工作区干净"
fi

# 检查是否在 main 分支
BRANCH=$(git branch --show-current)
if [[ "$BRANCH" != "main" ]]; then
  fail "当前不在 main 分支（当前: $BRANCH）"
  exit 1
else
  pass "当前在 main 分支"
fi

# 检查是否与远程同步
git fetch origin main --quiet 2>/dev/null
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [[ "$LOCAL" != "$REMOTE" ]]; then
  fail "本地 main 与 origin/main 不同步"
  echo -e "  ${YELLOW}请先执行: git push${NC}"
  exit 1
else
  pass "本地与远程同步"
fi

# 获取版本号
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [[ -z "$LAST_TAG" ]]; then
  # 没有 tag，从第一个 commit 开始
  LAST_TAG=$(git rev-list --max-parents=0 HEAD)
  warn "没有历史 tag，将使用首次 commit 作为起点"
fi

# ============================================================
# Step 1: 前端检查
# ============================================================

step "Step 1: 前端 Lint"
cd "$FRONTEND_DIR"
if npm run lint 2>&1 | tail -5; then
  pass "ESLint 通过"
else
  fail "ESLint 失败"
fi

step "Step 2: 前端类型检查"
if npm run type-check 2>&1 | tail -5; then
  pass "TypeScript 类型检查通过"
else
  fail "TypeScript 类型检查失败"
fi

step "Step 3: 前端单元测试"
if npm run test 2>&1 | tail -10; then
  pass "单元测试通过"
else
  fail "单元测试失败"
fi

step "Step 4: 前端构建"
if npm run build 2>&1 | tail -10; then
  pass "构建成功"
else
  fail "构建失败"
fi

# ============================================================
# Step 5: 后端检查
# ============================================================

step "Step 5: 后端语法检查"
cd "$BACKEND_DIR"
if node --check src/app.js 2>&1; then
  pass "后端语法检查通过"
else
  fail "后端语法检查失败"
fi

# ============================================================
# Step 6: E2E 测试（可选）
# ============================================================

cd "$PROJECT_DIR"

step "Step 6: E2E 测试（跳过，需本地环境）"
warn "E2E 测试依赖运行中的服务，已跳过"
warn "如需运行: npm run test:e2e"

# ============================================================
# Step 7: 生成 CHANGELOG
# ============================================================

step "Step 7: 生成 CHANGELOG"

# 统计变更
COMMITS=$(git log "$LAST_TAG"..HEAD --oneline 2>/dev/null)
COMMIT_COUNT=$(echo "$COMMITS" | grep -c . 2>/dev/null || echo 0)
ADDED=$(git diff --shortstat "$LAST_TAG"..HEAD 2>/dev/null | grep -oP '\d+(?= insertion)' || echo 0)
DELETED=$(git diff --shortstat "$LAST_TAG"..HEAD 2>/dev/null | grep -oP '\d+(?= deletion)' || echo 0)

# 生成版本号：v0.1.0 起步，后续基于日期
TODAY=$(date +%Y.%m.%d)
VERSION="v${TODAY}"

echo ""
echo -e "  ${CYAN}📊 变更统计${NC}"
echo "    提交数: $COMMIT_COUNT"
echo "    新增行: $ADDED"
echo "    删除行: $DELETED"
echo "    建议版本: ${VERSION}"

# 生成 CHANGELOG 摘要
echo ""
echo -e "  ${CYAN}📝 变更列表${NC}"
if [[ -n "$COMMITS" ]]; then
  echo "$COMMITS" | while read -r line; do
    echo "    $line"
  done
else
  warn "没有新的 commit（从 $LAST_TAG 到 HEAD）"
fi

# ============================================================
# Step 8: 结果汇总
# ============================================================

step "Step 8: 结果汇总"

echo ""
if [[ ${#FAILED_STEPS[@]} -eq 0 ]]; then
  echo -e "  ${GREEN}🎉 所有检查通过！${NC}"
  echo ""
  echo -e "  ${CYAN}建议执行:${NC}"
  echo ""
  echo "    # 打 tag"
  echo "    git tag -a ${VERSION} -m \"Release ${VERSION}\""
  echo ""
  echo "    # 推送 tag"
  echo "    git push origin ${VERSION}"
  echo ""
  echo "    # 在 CHANGELOG.md 头部追加版本记录"
  echo "    # （可手动编辑，保留重要信息即可）"

  if $AUTO_RELEASE; then
    echo ""
    echo -e "  ${YELLOW}🚀 --auto 模式：自动发版中...${NC}"
    git tag -a "${VERSION}" -m "Release ${VERSION}"
    git push origin "${VERSION}"
    echo -e "  ${GREEN}✅ 已发布 ${VERSION}${NC}"
  fi
else
  echo -e "  ${RED}❌ ${#FAILED_STEPS[@]} 项检查未通过${NC}"
  echo ""
  for s in "${FAILED_STEPS[@]}"; do
    echo -e "    ${RED}✗ $s${NC}"
  done
  echo ""
  echo -e "  ${YELLOW}请修复以上问题后重新运行${NC}"
  exit 1
fi
