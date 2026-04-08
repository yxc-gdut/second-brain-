import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Preview from '@/views/Preview.vue'
import Chat from '@/views/Chat.vue'
import Settings from '@/views/Settings.vue'
import NoteDetail from '@/views/NoteDetail.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/preview',
      name: 'preview',
      component: Preview
    },
    {
      path: '/chat',
      name: 'chat',
      component: Chat
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    },
    {
      path: '/note/:id',
      name: 'note-detail',
      component: NoteDetail
    }
  ]
})

export default router
