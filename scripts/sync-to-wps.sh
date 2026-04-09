#!/bin/bash
# 第二大脑 - 金山文档同步脚本
# 每周定期同步 personal.md 和 work.md 到金山文档

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== 第二大脑 - 金山文档同步 ==="
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 加载环境变量
source /etc/profile.d/wps-client.sh

# 同步 personal.md
echo "📄 同步 personal.md..."
if [ -f "$PROJECT_DIR/backend/data/personal.md" ]; then
    wps-doc import "$PROJECT_DIR/backend/data/personal.md" --title "私人知识库-$(date '+%Y-%m-%d')" 2>&1
    echo "✅ personal.md 同步完成"
else
    echo "⚠️ personal.md 不存在，跳过"
fi

echo ""

# 同步 work.md
echo "📄 同步 work.md..."
if [ -f "$PROJECT_DIR/backend/data/work.md" ]; then
    wps-doc import "$PROJECT_DIR/backend/data/work.md" --title "工作知识库-$(date '+%Y-%m-%d')" 2>&1
    echo "✅ work.md 同步完成"
else
    echo "⚠️ work.md 不存在，跳过"
fi

echo ""
echo "=== 同步完成 ==="
