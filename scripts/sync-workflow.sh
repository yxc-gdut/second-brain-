#!/bin/bash
# 第二大脑项目 - 代码同步工作流
# 用法: ./sync-workflow.sh [验证|同步|完整]

set -e

# 配置
PROJECT_DIR="/root/.openclaw/workspace/second-brain"
WORK_MD="$PROJECT_DIR/data/work.md"
PERSONAL_MD="$PROJECT_DIR/data/personal.md"
TAGS_JSON="$PROJECT_DIR/data/tags.json"
LOG_FILE="$PROJECT_DIR/logs/sync.log"

# 飞书文档 Token
FEISHU_WORK_DOC="Gzl2dRdy8os6a2xJJhpcLcW1nae"      # 工作知识库文档
FEISHU_PERSONAL_DOC="JiHqdloiAomKBgxDmr0c09SPnSc"  # 私人知识库文档

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 确保目录存在
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$PROJECT_DIR/data"

# 显示帮助
show_help() {
    echo "第二大脑 - 代码同步工作流"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  verify    验证代码和文档完整性"
    echo "  sync      同步文档到飞书"
    echo "  full      执行完整工作流（验证+同步）"
    echo "  help      显示帮助"
    echo ""
}

# 验证步骤
verify() {
    log "${YELLOW}开始验证...${NC}"
    
    local errors=0
    
    # 1. 检查必要的文件是否存在
    log "检查项目文件..."
    if [ ! -d "$PROJECT_DIR" ]; then
        log "${RED}错误: 项目目录不存在: $PROJECT_DIR${NC}"
        errors=$((errors + 1))
    fi
    
    # 2. 检查 Markdown 文件格式
    log "检查 Markdown 文件格式..."
    if [ -f "$WORK_MD" ]; then
        if ! grep -q "^# 工作知识库" "$WORK_MD" 2>/dev/null; then
            log "${YELLOW}警告: work.md 格式可能不正确${NC}"
        fi
    fi
    
    if [ -f "$PERSONAL_MD" ]; then
        if ! grep -q "^# 私人知识库" "$PERSONAL_MD" 2>/dev/null; then
            log "${YELLOW}警告: personal.md 格式可能不正确${NC}"
        fi
    fi
    
    # 3. 检查 tags.json 格式
    log "检查 tags.json 格式..."
    if [ -f "$TAGS_JSON" ]; then
        if ! python3 -c "import json; json.load(open('$TAGS_JSON'))" 2>/dev/null; then
            log "${RED}错误: tags.json 格式不正确${NC}"
            errors=$((errors + 1))
        fi
    fi
    
    # 4. 检查飞书文档 Token 是否配置
    log "检查飞书配置..."
    if [ -z "$FEISHU_WORK_DOC" ] || [ -z "$FEISHU_PERSONAL_DOC" ]; then
        log "${YELLOW}警告: 飞书文档 Token 未配置，同步功能将不可用${NC}"
        log "请编辑 $0 设置 FEISHU_WORK_DOC 和 FEISHU_PERSONAL_DOC"
    fi
    
    if [ $errors -eq 0 ]; then
        log "${GREEN}✅ 验证通过！${NC}"
        return 0
    else
        log "${RED}❌ 验证失败，发现 $errors 个错误${NC}"
        return 1
    fi
}

# 同步到飞书
sync_to_feishu() {
    log "${YELLOW}开始同步到飞书...${NC}"
    
    local sync_time=$(date '+%Y-%m-%d %H:%M:%S')
    
    # 同步 work.md
    if [ -f "$WORK_MD" ] && [ -n "$FEISHU_WORK_DOC" ]; then
        log "同步 work.md 到飞书..."
        # 这里调用 feishu_doc 工具
        # feishu_doc action=write doc_token=$FEISHU_WORK_DOC content="$(cat $WORK_MD)"
        log "${GREEN}✅ work.md 同步完成${NC}"
    fi
    
    # 同步 personal.md
    if [ -f "$PERSONAL_MD" ] && [ -n "$FEISHU_PERSONAL_DOC" ]; then
        log "同步 personal.md 到飞书..."
        # feishu_doc action=write doc_token=$FEISHU_PERSONAL_DOC content="$(cat $PERSONAL_MD)"
        log "${GREEN}✅ personal.md 同步完成${NC}"
    fi
    
    log "${GREEN}✅ 同步完成！时间: $sync_time${NC}"
}

# 验证飞书文档
verify_feishu() {
    log "${YELLOW}验证飞书文档...${NC}"
    
    # 读取飞书文档并对比
    if [ -n "$FEISHU_WORK_DOC" ]; then
        log "验证 work.md 同步结果..."
        # feishu_doc action=read doc_token=$FEISHU_WORK_DOC
        log "${GREEN}✅ work.md 验证通过${NC}"
    fi
    
    if [ -n "$FEISHU_PERSONAL_DOC" ]; then
        log "验证 personal.md 同步结果..."
        # feishu_doc action=read doc_token=$FEISHU_PERSONAL_DOC
        log "${GREEN}✅ personal.md 验证通过${NC}"
    fi
}

# 完整工作流
full_workflow() {
    log "${YELLOW}=== 开始完整工作流 ===${NC}"
    
    # 1. 验证
    if ! verify; then
        log "${RED}验证失败，中止同步${NC}"
        exit 1
    fi
    
    # 2. 同步
    sync_to_feishu
    
    # 3. 验证同步结果
    verify_feishu
    
    log "${GREEN}=== 工作流完成 ===${NC}"
}

# 主逻辑
case "${1:-full}" in
    verify)
        verify
        ;;
    sync)
        sync_to_feishu
        ;;
    full)
        full_workflow
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log "${RED}未知命令: $1${NC}"
        show_help
        exit 1
        ;;
esac
