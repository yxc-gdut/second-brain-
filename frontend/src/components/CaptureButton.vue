<template>
  <button
    class="capture-btn"
    :class="type"
    @click="handleClick"
  >
    <div class="btn-icon">
      <component :is="icon" class="w-10 h-10" />
    </div>
    <span class="btn-label">{{ label }}</span>
    <span class="btn-desc">{{ description }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CameraIcon, MicrophoneIcon, PencilIcon } from '@heroicons/vue/24/solid'

interface Props {
  type: 'camera' | 'voice' | 'text'
}

const props = defineProps<Props>()

const config = {
  camera: { 
    label: '拍照', 
    icon: CameraIcon, 
    description: 'OCR 文字识别',
  },
  voice: { 
    label: '语音', 
    icon: MicrophoneIcon, 
    description: '语音转文字',
  },
  text: { 
    label: '文字', 
    icon: PencilIcon, 
    description: '快速记录',
  }
}

const selectedConfig = computed(() => config[props.type])
const icon = computed(() => selectedConfig.value.icon)
const label = computed(() => selectedConfig.value.label)
const description = computed(() => selectedConfig.value.description)

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.capture-btn {
  width: 100%;
  max-width: 320px;
  padding: 24px;
  border-radius: var(--kd-radius-lg, 8px);
  border: 1px solid var(--kd-color-line-light, rgba(13,13,13,0.06));
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all var(--kd-time-fast, 120ms) var(--kd-easing-ease);
  background: var(--kd-color-fill-base, #FFFFFF);
}

.capture-btn:hover {
  box-shadow: var(--kd-shadow-md, 0 1px 4px rgba(26,26,26,.14));
  border-color: var(--kd-color-line-regular, rgba(13,13,13,0.12));
}

.capture-btn:active {
  opacity: var(--kd-opacity-disabled, 0.4);
}

.btn-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--kd-radius-full, 999px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.capture-btn.camera .btn-icon {
  background: var(--kd-color-error-light, #FFF0F1);
  color: var(--kd-color-error-normal, #E12F3C);
}

.capture-btn.voice .btn-icon {
  background: var(--kd-color-warning-light, #FEF1EA);
  color: var(--kd-color-warning-normal, #E2651A);
}

.capture-btn.text .btn-icon {
  background: var(--kd-color-info-light, #ECF4FF);
  color: var(--kd-color-info-normal, #0A6CFF);
}

.btn-icon svg {
  width: 24px;
  height: 24px;
}

.btn-label {
  font-size: var(--kd-font-size-large, 18px);
  font-weight: var(--kd-font-weight-bold, 600);
  color: var(--kd-color-text-primary, #0D0D0D);
}

.btn-desc {
  font-size: var(--kd-font-size-small, 12px);
  color: var(--kd-color-text-tertiary, #909090);
}
</style>
