<template>
  <div class="sync-status">
    <div 
      class="status-dot"
      :class="{ syncing: isSyncing, success: lastSuccess, error: lastError }"
    ></div>
    <span v-if="lastTime" class="sync-time">
      同步: {{ formatTime(lastTime) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isSyncing = ref(false);
const lastSuccess = ref(false);
const lastError = ref(false);
const lastTime = ref<string | null>(null);

function formatTime(time: string): string {
  return new Date(time).toLocaleTimeString('zh-CN');
}
</script>

<style scoped>
.sync-status {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9CA3AF;
}
.status-dot.syncing {
  background: #F59E0B;
  animation: pulse 1s infinite;
}
.status-dot.success {
  background: #22C55E;
}
.status-dot.error {
  background: #EF4444;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.sync-time {
  font-size: 12px;
  color: #6B7280;
}
</style>
