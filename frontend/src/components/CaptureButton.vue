<template>
  <button
    class="capture-btn"
    :class="type"
    @click="handleClick"
    :style="{ backgroundColor: bgColor }"
  >
    <component :is="icon" class="w-8 h-8 mb-2" />
    <span class="text-lg font-medium">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CameraIcon, MicrophoneIcon, PencilIcon } from '@heroicons/vue/24/outline'

interface Props {
  type: 'camera' | 'voice' | 'text'
}

const props = defineProps<Props>()

const config = {
  camera: { label: '拍照', icon: CameraIcon, color: '#EF4444' },
  voice: { label: '语音', icon: MicrophoneIcon, color: '#F59E0B' },
  text: { label: '文字', icon: PencilIcon, color: '#3B82F6' }
}

const { label, icon, color: bgColor } = computed(() => config[props.type]).value

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.capture-btn {
  width: 60%;
  max-width: 280px;
  padding: 32px 24px;
  border-radius: 16px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.capture-btn:active {
  transform: scale(0.95);
}
</style>
