#!/bin/bash
export LLM_API_KEY=sk-NY9PPJB0hmHfScvJ7y2hzscHTfkWCqdGOX5dnwFBtLaPdglT
export LLM_API_URL=https://api.moonshot.cn/v1/chat/completions
export LLM_MODEL=kimi-k2.5
cd /root/.openclaw/workspace/second-brain/backend
pm2 start src/app.js --name second-brain
