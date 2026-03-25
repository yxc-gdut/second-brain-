<template>
  <div class="category-selector">
    <label class="label">分类：</label>
    <div class="options">
      <button
        class="option"
        :class="{ active: model === 'work' }"
        @click="model = 'work'"
      >
        <span class="icon">💼</span>
        <span>工作</span>
      </button>
      <button
        class="option"
        :class="{ active: model === 'personal' }"
        @click="model = 'personal'"
      >
        <span class="icon">🏠</span>
        <span>私人</span>
      </button>
    </div>
    <p v-if="aiSuggestion" class="suggestion">
      AI 建议：{{ aiSuggestion.category === 'work' ? '工作' : '私人' }}
      （置信度 {{ Math.round(aiSuggestion.confidence * 100) }}%）
    </p>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<'work' | 'personal'>('modelValue')

defineProps<{
  aiSuggestion?: {
    category: 'work' | 'personal'
    confidence: number
    reason: string
  }
}>()
</script>

<style scoped>
.category-selector {
  padding: 16px 0;
}

.label {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
  display: block;
}

.options {
  display: flex;
  gap: 12px;
}

.option {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid #E5E7EB;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.option.active {
  border-color: #3B82F6;
  background: #EFF6FF;
}

.icon {
  font-size: 20px;
}

.suggestion {
  margin-top: 8px;
  font-size: 13px;
  color: #3B82F6;
}
</style>
