# 第二大脑 - Makefile
# 简化开发工作流

.PHONY: help verify sync sync-work sync-personal clean

# 默认目标
help:
	@echo "第二大脑 - 开发工作流"
	@echo ""
	@echo "可用命令:"
	@echo "  make verify        - 验证项目文件完整性"
	@echo "  make sync          - 同步所有文档到飞书"
	@echo "  make sync-work     - 仅同步工作知识库"
	@echo "  make sync-personal - 仅同步私人知识库"
	@echo "  make init          - 初始化项目结构"
	@echo "  make clean         - 清理临时文件"
	@echo ""

# 初始化项目
init:
	@echo "初始化第二大脑项目..."
	@mkdir -p data
	@mkdir -p logs
	@mkdir -p scripts
	@test -f data/work.md || echo "# 工作知识库\n\n_记录工作相关的知识和灵感_\n" > data/work.md
	@test -f data/personal.md || echo "# 私人知识库\n\n_记录个人生活的知识和灵感_\n" > data/personal.md
	@test -f data/tags.json || echo '{"tags":[]}' > data/tags.json
	@echo "✅ 项目初始化完成"

# 验证
verify:
	@echo "=== 验证项目文件 ==="
	@bash scripts/sync-workflow.sh verify

# 同步所有
sync:
	@echo "=== 同步所有文档到飞书 ==="
	@bash scripts/sync-workflow.sh full

# 仅同步工作知识库
sync-work:
	@echo "=== 同步工作知识库 ==="
	@node scripts/sync-to-feishu.js work

# 仅同步私人知识库
sync-personal:
	@echo "=== 同步私人知识库 ==="
	@node scripts/sync-to-feishu.js personal

# 清理
clean:
	@echo "清理临时文件..."
	@rm -f logs/*.log
	@rm -f /tmp/memory-sync-*.md
	@echo "✅ 清理完成"

# 开发模式（监听文件变化）
dev:
	@echo "启动开发模式..."
	@echo "监听 data/*.md 文件变化..."
	@while true; do \
		inotifywait -e modify data/ 2>/dev/null && make sync; \
	done
