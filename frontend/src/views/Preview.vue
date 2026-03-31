<template>
  <div class="preview">
    <header class="header">
      <button class="back-btn" @click="goBack">
        <ArrowLeftIcon class="w-6 h-6" />
      </button>
      <h1 class="title">预览确认</h1>
      <div class="w-6"></div>
    </header>

    <main class="content">
      <!-- 图片上传区域（拍照模式） -->
      <div v-if="type === 'camera'" class="field">
        <label class="label">图片：</label>
        <div class="upload-area" @click="selectImage">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onImageSelected"
          />
          <div v-if="!imagePreview" class="upload-placeholder">
            <CameraIcon class="w-12 h-12 text-gray-400 mb-2" />
            <span class="text-gray-500">点击上传图片</span>
          </div>
          <img v-else :src="imagePreview" class="uploaded-image" />
        </div>
        <button v-if="imagePreview && !recognizing" class="retry-btn" @click="recognize">
          🔍 识别图片
        </button>
        <div v-if="recognizing" class="recognizing">识别中...</div>
      </div>

      <!-- 来源 -->
      <div class="field">
        <label class="label">来源：</label>
        <input
          v-model="source"
          type="text"
          class="input"
          placeholder="请输入来源..."
        />
      </div>

      <!-- 内容 -->
      <div class="field">
        <label class="label">内容：</label>
        <textarea
          v-model="content"
          class="textarea"
          rows="6"
          placeholder="识别的内容..."
        ></textarea>
        <button v-if="type !== 'text' && !recognizing" class="retry-btn" @click="retry">
          🔄 重新识别
        </button>
      </div>

      <!-- 分类 -->
      <CategorySelector
        v-model="category"
        :ai-suggestion="aiSuggestion"
      />

      <!-- 标签推荐 -->
      <div class="field">
        <label class="label">标签：</label>
        <div class="tags-area">
          <div v-if="suggestingTags" class="suggesting">推荐中...</div>
          <div v-else-if="suggestedTags.length > 0" class="suggested-tags">
            <span class="tags-label">推荐：</span>
            <button
              v-for="tag in suggestedTags"
              :key="tag.name"
              class="tag-btn"
              :class="{ selected: selectedTags.includes(tag.name) }"
              :style="{ borderColor: tag.color, color: selectedTags.includes(tag.name) ? '#fff' : tag.color, backgroundColor: selectedTags.includes(tag.name) ? tag.color : 'transparent' }"
              @click="toggleTag(tag.name)"
            >
              {{ tag.name }}
            </button>
          </div>
          <div class="custom-tag">
            <input
              v-model="customTagInput"
              type="text"
              class="input tag-input"
              placeholder="添加自定义标签..."
              @keyup.enter="addCustomTag"
            />
            <button class="add-tag-btn" @click="addCustomTag">+</button>
          </div>
          <div v-if="selectedTags.length > 0" class="selected-tags">
            <span v-for="tag in selectedTags" :key="tag" class="selected-tag">
              {{ tag }}
              <button class="remove-tag" @click="removeTag(tag)">×</button>
            </span>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">{{ error }}</div>

      <!-- 保存按钮 -->
      <div class="actions">
        <button class="btn-cancel" @click="goBack" :disabled="saving">取消</button>
        <button class="btn-save" @click="save" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon, CameraIcon } from '@heroicons/vue/24/outline'
import CategorySelector from '@/components/CategorySelector.vue'
import { createNote, suggestTags, recognizeImage, type Tag, type OCRResult } from '@/api/notes'

const route = useRoute()
const router = useRouter()

const type = ref(route.query.type as string || 'text')
const source = ref('')
const content = ref('')
const category = ref<'work' | 'personal'>('personal')
const aiSuggestion = ref<{
  category: 'work' | 'personal'
  confidence: number
  reason: string
} | undefined>(undefined)
const saving = ref(false)
const error = ref('')

// 图片相关
const fileInput = ref<HTMLInputElement | null>(null)
const imagePreview = ref('')
const imageBase64 = ref<string>('')
const recognizing = ref(false)

// 标签相关
const suggestedTags = ref<Tag[]>([])
const selectedTags = ref<string[]>([])
const customTagInput = ref('')
const suggestingTags = ref(false)

onMounted(() => {
  // 模拟 AI 建议（文字/语音模式）
  if (type.value === 'voice') {
    content.value = '今天开会讨论了产品迭代计划...'
    source.value = '会议记录'
    aiSuggestion.value = {
      category: 'work',
      confidence: 0.72,
      reason: '会议相关内容'
    }
    category.value = 'work'
  }
  
  // 内容变化时推荐标签
  watch(content, (newContent) => {
    if (newContent.length > 10) {
      debounceSuggestTags(newContent)
    }
  }, { immediate: true })
})

// 防抖推荐标签
let suggestTimeout: ReturnType<typeof setTimeout> | null = null
function debounceSuggestTags(text: string) {
  if (suggestTimeout) clearTimeout(suggestTimeout)
  suggestTimeout = setTimeout(() => {
    fetchSuggestedTags(text)
  }, 500)
}

async function fetchSuggestedTags(text: string) {
  suggestingTags.value = true
  try {
    const tags = await suggestTags(text)
    suggestedTags.value = tags
  } catch (err) {
    console.error('推荐标签失败:', err)
  } finally {
    suggestingTags.value = false
  }
}

// 图片上传
function selectImage() {
  fileInput.value?.click()
}

function onImageSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string | undefined
    if (!result) return
    imagePreview.value = result
    const base64Parts = result.split(',')
    imageBase64.value = base64Parts.length > 1 ? base64Parts[1]! : ''
  }
  reader.readAsDataURL(file)
}

// 识别图片
async function recognize() {
  if (!imageBase64.value || imageBase64.value === '') return
  
  recognizing.value = true
  error.value = ''
  
  try {
    // 调用 OCR API
    const result = await recognizeImage(imageBase64.value, 'upload.png')
    content.value = result.text
    source.value = '图片识别'
    
    // AI 分类建议
    aiSuggestion.value = {
      category: 'work',
      confidence: 0.85,
      reason: '图片识别内容'
    }
    category.value = 'work'
  } catch (err) {
    error.value = err instanceof Error ? err.message : '识别失败'
  } finally {
    recognizing.value = false
  }
}

const goBack = () => router.back()

const retry = () => {
  if (type.value === 'camera' && imageBase64.value) {
    recognize()
  } else {
    // 重新识别语音（模拟）
    content.value = '重新识别的内容...'
  }
}

// 标签操作
function toggleTag(tagName: string) {
  const idx = selectedTags.value.indexOf(tagName)
  if (idx >= 0) {
    selectedTags.value.splice(idx, 1)
  } else {
    selectedTags.value.push(tagName)
  }
}

function addCustomTag() {
  const tag = customTagInput.value.trim()
  if (tag && !selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
    customTagInput.value = ''
  }
}

function removeTag(tag: string) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx >= 0) {
    selectedTags.value.splice(idx, 1)
  }
}

// 保存
const save = async () => {
  if (!content.value.trim()) {
    error.value = '内容不能为空'
    return
  }
  
  saving.value = true
  error.value = ''
  
  try {
    await createNote({
      content: content.value,
      source: source.value,
      category: category.value,
      tags: selectedTags.value
    })
    router.push('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败'
    saving.value = false
  }
}
</script>

<style scoped>
.preview {
  min-height: 100vh;
  background: white;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.back-btn {
  color: #111827;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.content {
  padding: 16px;
}

.field {
  margin-bottom: 20px;
}

.label {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
  display: block;
}

.input,
.textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
}

.textarea {
  resize: vertical;
  min-height: 120px;
}

.retry-btn {
  margin-top: 8px;
  font-size: 14px;
  color: #3B82F6;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
}

.btn-cancel {
  background: #F3F4F6;
  color: #6B7280;
}

.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-save {
  background: #3B82F6;
  color: white;
}

.btn-save:disabled {
  background: #93C5FD;
  cursor: not-allowed;
}

.error-message {
  color: #EF4444;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 12px;
  background: #FEF2F2;
  border-radius: 8px;
}

/* 图片上传 */
.upload-area {
  border: 2px dashed #E5E7EB;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-area:hover {
  border-color: #3B82F6;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.uploaded-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

.hidden {
  display: none;
}

.recognizing {
  margin-top: 8px;
  font-size: 14px;
  color: #3B82F6;
}

/* 标签 */
.tags-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggesting {
  font-size: 14px;
  color: #6B7280;
}

.suggested-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tags-label {
  font-size: 14px;
  color: #6B7280;
}

.tag-btn {
  padding: 6px 12px;
  border: 2px solid;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.tag-btn.selected {
  color: white;
}

.custom-tag {
  display: flex;
  gap: 8px;
}

.tag-input {
  flex: 1;
}

.add-tag-btn {
  padding: 0 16px;
  background: #3B82F6;
  color: white;
  border-radius: 8px;
  font-size: 20px;
  font-weight: 500;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #3B82F6;
  color: white;
  border-radius: 16px;
  font-size: 14px;
}

.remove-tag {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  font-size: 14px;
}
</style>
