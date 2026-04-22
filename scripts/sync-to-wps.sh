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

# 检查OAuth token是否有效
TOKEN_FILE="${WPS_TOKEN_PATH:-/root/.wps-agent/tokens-cli-user.json}"
if [ ! -s "$TOKEN_FILE" ] || [ "$(cat "$TOKEN_FILE")" = "{}" ]; then
    echo "⚠️ 未找到有效的WPS OAuth token，跳过同步"
    echo "   请手动运行 'wps-doc auth' 完成授权"
    exit 0
fi

# 定义同步函数
sync_document() {
    local file_path="$1"
    local title="$2"
    
    if [ -f "$file_path" ]; then
        echo "📄 同步 $title..."
        if timeout 60 wps-doc import "$file_path" --title "$title" 2>&1; then
            echo "✅ $title 同步完成"
        else
            echo "❌ $title 同步失败"
        fi
    else
        echo "⚠️ $title 不存在，跳过"
    fi
}

# 同步文档
sync_document "$PROJECT_DIR/backend/data/personal.md" "私人知识库-$(date '+%Y-%m-%d')"
echo ""
sync_document "$PROJECT_DIR/backend/data/work.md" "工作知识库-$(date '+%Y-%m-%d')"

echo ""
echo "=== 同步完成 ==="
