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
    gradient: 'linear-gradient(135deg, #ff3b30 0%, #ff6b5b 100%)'
  },
  voice: { 
    label: '语音', 
    icon: MicrophoneIcon, 
    description: '语音转文字',
    gradient: 'linear-gradient(135deg, #ff9500 0%, #ffb347 100%)'
  },
  text: { 
    label: '文字', 
    icon: PencilIcon, 
    description: '快速记录',
    gradient: 'linear-gradient(135deg, #0071e3 0%, #5ac8fa 100%)'
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
  padding: 28px 24px;
  border-radius: var(--radius-large);
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.capture-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.capture-btn:hover::before {
  opacity: 1;
}

.capture-btn:active {
  transform: scale(0.97);
}

.capture-btn.camera {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
}

.capture-btn.camera::before {
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.15) 0%, rgba(255, 107, 91, 0.15) 100%);
}

.capture-btn.voice {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
}

.capture-btn.voice::before {
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.15) 0%, rgba(255, 179, 71, 0.15) 100%);
}

.capture-btn.text {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
}

.capture-btn.text::before {
  background: linear-gradient(135deg, rgba(0, 113, 227, 0.15) 0%, rgba(90, 200, 250, 0.15) 100%);
}

.btn-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.capture-btn.camera .btn-icon {
  background: linear-gradient(135deg, #ff3b30 0%, #ff6b5b 100%);
  box-shadow: 0 8px 32px rgba(255, 59, 48, 0.3);
}

.capture-btn.voice .btn-icon {
  background: linear-gradient(135deg, #ff9500 0%, #ffb347 100%);
  box-shadow: 0 8px 32px rgba(255, 149, 0, 0.3);
}

.capture-btn.text .btn-icon {
  background: linear-gradient(135deg, #0071e3 0%, #5ac8fa 100%);
  box-shadow: 0 8px 32px rgba(0, 113, 227, 0.3);
}

.btn-icon svg {
  color: white;
}

.btn-label {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.374px;
  position: relative;
  z-index: 1;
}

.btn-desc {
  font-family: var(--font-text);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 1;
}
</style>
