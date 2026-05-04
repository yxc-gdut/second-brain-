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
  gap: 8px;
}

.selector-label {
  font-size: var(--kd-font-size-base, 14px);
  font-weight: var(--kd-font-weight-regular, 400);
  color: var(--kd-color-text-secondary, #6B6B6B);
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
  gap: 8px;
  padding: 12px;
  background: var(--kd-color-fill-base, #fff);
  border: 1px solid var(--kd-color-line-regular, rgba(13,13,13,0.12));
  border-radius: var(--kd-radius-md, 6px);
  cursor: pointer;
  transition: background var(--kd-time-fast, 120ms) var(--kd-easing-ease),
              border-color var(--kd-time-fast, 120ms) var(--kd-easing-ease);
}

.category-btn:hover {
  background: var(--kd-color-state-hover, rgba(0,0,0,0.04));
}

.category-btn.active {
  background: var(--kd-color-public-light, #ECF4FF);
  border-color: var(--kd-color-public-normal, #0A6CFF);
}

.category-icon {
  font-size: var(--kd-font-size-middle, 16px);
}

.category-text {
  font-size: var(--kd-font-size-sub-base, 13px);
  font-weight: var(--kd-font-weight-regular, 400);
  color: var(--kd-color-text-primary, #0D0D0D);
}

.ai-suggestion {
  font-size: var(--kd-font-size-small, 12px);
  color: var(--kd-color-text-public, #0A6CFF);
  margin-top: 4px;
}
</style>
