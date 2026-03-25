import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Preview from '@/views/Preview.vue'
import Chat from '@/views/Chat.vue'
import Settings from '@/views/Settings.vue'

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
    }
  ]
})

export default router
