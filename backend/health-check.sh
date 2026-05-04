#!/bin/bash
# 第二大脑健康检查脚本
# 检查后端是否存活，挂了则重启并通知

API_URL="http://localhost:3000/api/chat/status"
APP_NAME="second-brain-backend"
LOG_FILE="/root/.openclaw/workspace/second-brain/backend/health.log"

check_and_restart() {
    echo "[$(date)] 检测到后端宕机，重启中..." >> "$LOG_FILE"
    pm2 restart "$APP_NAME" >> "$LOG_FILE" 2>&1
    echo "[$(date)] 重启完成" >> "$LOG_FILE"
}

# 检查后端状态
if curl -sf --max-time 5 "$API_URL" > /dev/null 2>&1; then
    echo "[$(date)] OK" >> "$LOG_FILE"
else
    check_and_restart
fi
