#!/bin/bash
# 第二大脑 - Code Review 脚本
# 用法: ./scripts/code-review.sh [PR号|分支名|commit范围]
#   无参数时，对比 origin/main 与 HEAD（未 push 的变更）
#   PR号: 对比 main 与 PR 分支
#   分支名: 对比 main 与指定分支
#   commit范围: 直接传 git 范围，如 HEAD~3..HEAD
#
# 输出结构化 Review 报告，支持推送到飞书

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================================
# 确定对比范围
# ============================================================

if [[ -z "$1" ]]; then
  # 默认：未 push 的变更
  BASE="origin/main"
  HEAD_REF="HEAD"
  SCOPE="未推送的变更"
elif [[ "$1" =~ ^[0-9]+$ ]]; then
  # PR 号
  PR_NUM="$1"
  echo -e "${CYAN}Fetching PR #${PR_NUM} info...${NC}"
  PR_DATA=$(gh pr view "$PR_NUM" --json baseRefName,headRefName,title,author 2>/dev/null || echo "")
  if [[ -z "$PR_DATA" ]]; then
    echo -e "${RED}❌ 无法获取 PR #${PR_NUM}，请检查 gh CLI 是否已登录${NC}"
    exit 1
  fi
  BASE=$(echo "$PR_DATA" | jq -r '.baseRefName')
  HEAD_REF=$(echo "$PR_DATA" | jq -r '.headRefName')
  PR_TITLE=$(echo "$PR_DATA" | jq -r '.title')
  PR_AUTHOR=$(echo "$PR_DATA" | jq -r '.author.login')
  SCOPE="PR #${PR_NUM}: ${PR_TITLE} (by ${PR_AUTHOR})"
elif [[ "$1" == *..* ]]; then
  # commit 范围
  RANGE="$1"
  BASE="${RANGE%%..*}"
  HEAD_REF="${RANGE##*..}"
  SCOPE="Commit range: ${RANGE}"
else
  # 分支名
  BASE="origin/main"
  HEAD_REF="$1"
  SCOPE="Branch: $1 vs main"
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  🔍 Code Review${NC}"
echo -e "${CYAN}  ${SCOPE}${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 获取 diff
DIFF=$(git diff "${BASE}".."${HEAD_REF}" 2>/dev/null)
if [[ -z "$DIFF" ]]; then
  echo -e "${YELLOW}⚠️ 没有差异内容${NC}"
  exit 0
fi

# 变更文件列表
FILES=$(git diff --name-status "${BASE}".."${HEAD_REF}" 2>/dev/null)
FILE_COUNT=$(echo "$FILES" | grep -c . 2>/dev/null || echo 0)

# 统计
STATS=$(git diff --shortstat "${BASE}".."${HEAD_REF}" 2>/dev/null)
COMMITS=$(git log --oneline "${BASE}".."${HEAD_REF}" 2>/dev/null)
COMMIT_COUNT=$(echo "$COMMITS" | grep -c . 2>/dev/null || echo 0)

echo -e "  📊 ${COMMIT_COUNT} commits, ${FILE_COUNT} files changed"
echo -e "  📈 ${STATS}"
echo ""

# ============================================================
# 检查项
# ============================================================

ISSUES=()
WARNINGS=()
PASSES=()

# --- 1. console.log 检查 ---
CONSOLE_COUNT=$(echo "$DIFF" | grep -c '^+.*console\.\(log\|debug\|info\)' 2>/dev/null || echo 0)
# 排除 diff header 行
CONSOLE_COUNT=$((CONSOLE_COUNT - $(echo "$DIFF" | grep '^+++' | grep -c 'console\.' 2>/dev/null || echo 0)))
if [[ $CONSOLE_COUNT -gt 0 ]]; then
  WARNINGS+=("发现 ${CONSOLE_COUNT} 处 console.log/debug/info，请确认是否需要移除")
else
  PASSES+=("无 console.log/debug/info 遗留")
fi

# --- 2. any 类型检查 ---
ANY_COUNT=$(echo "$DIFF" | grep -c '^+.*:\s*any\b' 2>/dev/null || echo 0)
ANY_COUNT=$((ANY_COUNT - $(echo "$DIFF" | grep '^+++' | grep -c ': any' 2>/dev/null || echo 0)))
if [[ $ANY_COUNT -gt 0 ]]; then
  ISSUES+=("发现 ${ANY_COUNT} 处 any 类型，违反 TypeScript 规范（用 unknown 或具体类型替代）")
else
  PASSES+=("TypeScript 无 any 类型")
fi

# --- 3. @ts-ignore 检查 ---
TS_IGNORE=$(echo "$DIFF" | grep -c '^+.*@ts-ignore' 2>/dev/null || echo 0)
if [[ $TS_IGNORE -gt 0 ]]; then
  ISSUES+=("发现 ${TS_IGNORE} 处 @ts-ignore，应使用 @ts-expect-error 并说明原因")
else
  PASSES+=("无 @ts-ignore 滥用")
fi

# --- 4. debugger 检查 ---
DEBUGGER=$(echo "$DIFF" | grep -c '^+.*debugger' 2>/dev/null || echo 0)
if [[ $DEBUGGER -gt 0 ]]; then
  ISSUES+=("发现 ${DEBUGGER} 处 debugger 语句")
else
  PASSES+=("无 debugger 遗留")
fi

# --- 5. 硬编码 token/secret 检查 ---
SECRETS=$(echo "$DIFF" | grep -cE '^\+.*(password|secret|token|api_key|apikey)\s*[:=].*["\x27][^"\x27]{8,}' 2>/dev/null || echo 0)
SECRETS=$((SECRETS - $(echo "$DIFF" | grep '^+++' | grep -ciE '(password|secret|token|api_key)' 2>/dev/null || echo 0)))
if [[ $SECRETS -gt 0 ]]; then
  ISSUES+=("🔴 发现 ${SECRETS} 处疑似硬编码敏感信息，请检查")
else
  PASSES+=("无硬编码敏感信息")
fi

# --- 6. eval 检查 ---
EVAL=$(echo "$DIFF" | grep -cE '^\+.*(eval|new Function)' 2>/dev/null || echo 0)
EVAL=$((EVAL - $(echo "$DIFF" | grep '^+++' | grep -ciE '(eval|Function)' 2>/dev/null || echo 0)))
if [[ $EVAL -gt 0 ]]; then
  ISSUES+=("🔴 发现 ${EVAL} 处 eval/new Function，安全红线违反")
else
  PASSES+=("无 eval/new Function")
fi

# --- 7. v-html 检查 ---
VHTML=$(echo "$DIFF" | grep -cE '^\+.*v-html' 2>/dev/null || echo 0)
if [[ $VHTML -gt 0 ]]; then
  WARNINGS+=("发现 ${VHTML} 处 v-html 使用，请确认内容来源可信或已消毒")
else
  PASSES+=("无 v-html 使用")
fi

# --- 8. KDesign Token 一致性检查 ---
# 检查前端文件是否有直接写颜色值而非使用 CSS 变量
CSS_RAW_COLORS=$(echo "$DIFF" | grep -cE '^\+.*(#[0-9a-fA-F]{3,8}|rgb|rgba|hsl|hsla)' 2>/dev/null || echo 0)
CSS_RAW_COLORS=$((CSS_RAW_COLORS - $(echo "$DIFF" | grep '^+++' | grep -cE '#[0-9a-fA-F]' 2>/dev/null || echo 0)))
if [[ $CSS_RAW_COLORS -gt 0 ]]; then
  WARNINGS+=("发现 ${CSS_RAW_COLORS} 处直接颜色值，建议使用 KDesign Design Token CSS 变量")
else
  PASSES+=("KDesign Token 风格一致")
fi

# --- 9. 魔法数字检查 ---
MAGIC_NUMBERS=$(echo "$DIFF" | grep -cE '^\+.*(if|while|for).*[<>!=].*\b[0-9]{2,}\b' 2>/dev/null || echo 0)
MAGIC_NUMBERS=$((MAGIC_NUMBERS - $(echo "$DIFF" | grep '^+++' | grep -cE '[0-9]{2,}' 2>/dev/null || echo 0)))
if [[ $MAGIC_NUMBERS -gt 2 ]]; then
  WARNINGS+=("发现 ${MAGIC_NUMBERS} 处可能的魔法数字，建议提取为常量")
else
  PASSES+=("无明显魔法数字")
fi

# --- 10. 测试覆盖检查 ---
TEST_FILES=$(echo "$FILES" | grep -cE '\.(test|spec)\.(ts|js)' 2>/dev/null || echo 0)
SRC_FILES=$(echo "$FILES" | grep -cE 'frontend/src/.*\.(vue|ts)$' 2>/dev/null || echo 0)
if [[ $SRC_FILES -gt 0 && $TEST_FILES -eq 0 ]]; then
  WARNINGS+=("修改了 ${SRC_FILES} 个源文件但未添加测试，建议补充")
else
  PASSES+=("测试覆盖合理")
fi

# --- 11. E2E 覆盖检查 ---
NEW_E2E=$(echo "$FILES" | grep -c 'e2e/' 2>/dev/null || echo 0)
AFFECTED_VIEWS=$(echo "$FILES" | grep -oP 'frontend/src/views/\K[^/]+' 2>/dev/null | sort -u)
if [[ -n "$AFFECTED_VIEWS" && $NEW_E2E -eq 0 ]]; then
  for view in $AFFECTED_VIEWS; do
    E2E_EXISTS=$(ls e2e/tests/*${view,,}* 2>/dev/null | wc -l)
    if [[ $E2E_EXISTS -eq 0 ]]; then
      WARNINGS+=("页面 ${view} 被修改但无 E2E 用例覆盖")
    fi
  done
fi

# ============================================================
# 输出报告
# ============================================================

echo -e "${CYAN}📋 变更文件${NC}"
echo "$FILES" | head -20
if [[ $FILE_COUNT -gt 20 ]]; then
  echo -e "${YELLOW}  ... 还有 $((FILE_COUNT - 20)) 个文件${NC}"
fi
echo ""

echo -e "${CYAN}📝 Commits${NC}"
echo "$COMMITS" | head -15
if [[ $COMMIT_COUNT -gt 15 ]]; then
  echo -e "${YELLOW}  ... 还有 $((COMMIT_COUNT - 15)) 个 commits${NC}"
fi
echo ""

# 通过项
if [[ ${#PASSES[@]} -gt 0 ]]; then
  echo -e "${GREEN}✅ 通过项 (${#PASSES[@]})${NC}"
  for p in "${PASSES[@]}"; do
    echo -e "  ${GREEN}• ${p}${NC}"
  done
  echo ""
fi

# 警告项
if [[ ${#WARNINGS[@]} -gt 0 ]]; then
  echo -e "${YELLOW}⚠️ 警告 (${#WARNINGS[@]})${NC}"
  for w in "${WARNINGS[@]}"; do
    echo -e "  ${YELLOW}• ${w}${NC}"
  done
  echo ""
fi

# 问题项
if [[ ${#ISSUES[@]} -gt 0 ]]; then
  echo -e "${RED}❌ 问题 (${#ISSUES[@]})${NC}"
  for i in "${ISSUES[@]}"; do
    echo -e "  ${RED}• ${i}${NC}"
  done
  echo ""
fi

# ============================================================
# 总结
# ============================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [[ ${#ISSUES[@]} -gt 0 ]]; then
  echo -e "  ${RED}🔴 Review 结论：有问题需要修复${NC}"
  echo -e "  ${RED}   ${#ISSUES[@]} 个问题, ${#WARNINGS[@]} 个警告${NC}"
  echo ""
  echo -e "  ${YELLOW}建议：修复以上问题后重新提交 Review${NC}"
  exit 1
elif [[ ${#WARNINGS[@]} -gt 0 ]]; then
  echo -e "  ${YELLOW}🟡 Review 结论：通过（有警告）${NC}"
  echo -e "  ${YELLOW}   ${#WARNINGS[@]} 个警告需要关注${NC}"
  echo ""
  echo -e "  ${YELLOW}建议：确认警告项是否需要处理${NC}"
  exit 0
else
  echo -e "  ${GREEN}🟢 Review 结论：全部通过${NC}"
  echo -e "  ${GREEN}   ${#PASSES[@]} 项检查全部通过，可以合并${NC}"
  exit 0
fi
