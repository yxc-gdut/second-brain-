<template>
  <div class="category-selector">
    <label class="selector-label">分类</label>
    <div class="category-options">
      <button
        class="category-btn"
        :class="{ active: modelValue === 'work' }"
        @click="$emit('update:modelValue', 'work')"
      >
        <span class="category-icon">💼</span>
        <span class="category-text">工作</span>
      </button>
      <button
        class="category-btn"
        :class="{ active: modelValue === 'personal' }"
        @click="$emit('update:modelValue', 'personal')"
      >
        <span class="category-icon">🏠</span>
        <span class="category-text">私人</span>
      </button>
    </div>
    <p v-if="aiSuggestion" class="ai-suggestion">
      AI 建议: {{ aiSuggestion.category === 'work' ? '工作' : '私人' }}
      （置信度 {{ Math.round(aiSuggestion.confidence * 100) }}%）
    </p>
  </div>
</template>

<script setup lang="ts">
interface AISuggestion {
  category: 'work' | 'personal'
  confidence: number
  reason: string
}

defineProps<{
  modelValue: 'work' | 'personal'
  aiSuggestion?: AISuggestion
}>()

defineEmits<{
  'update:modelValue': [value: 'work' | 'personal']
}>()
</script>

<style scoped>
.category-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selector-label {
  font-family: var(--font-text);
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-large);
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.category-btn.active {
  background: rgba(0, 113, 227, 0.15);
  border-color: var(--color-apple-blue);
}

.category-icon {
  font-size: 20px;
}

.category-text {
  font-family: var(--font-text);
  font-size: 16px;
  font-weight: 500;
  color: var(--color-white);
}

.ai-suggestion {
  font-family: var(--font-text);
  font-size: 13px;
  color: var(--color-apple-blue);
  margin-top: 4px;
}
</style>
