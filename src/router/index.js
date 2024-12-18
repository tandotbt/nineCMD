import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomeMain.vue'
const routes = [
  { path: '/', name: 'home-route', component: Home },
  { path: '/home', redirect: '/' },
  { path: '/login', name: 'login-route', component: () => import('@/views/LoginMain.vue') },
  {
    path: '/arena',
    name: 'arena-route',
    meta: { transition: 'slide-right' },
    component: () => import('@/views/ArenaMain.vue')
  },
  {
    path: '/arena/:champId/:roundId',
    name: 'arena-leaderboard-route',
    meta: { transition: 'slide-right' },
    component: () => import('@/views/ArenaLeaderboard.vue')
  },
  {
    path: '/arena/:champId/:roundId/attack/:agentEmeny',
    name: 'arena-before-attack-route',
    meta: { transition: 'slide-right' },
    component: () => import('@/views/ArenaBeforeAttack.vue')
  },
  {
    path: '/shop',
    name: 'shop-route',
    meta: { transition: 'slide-right' },
    component: () => import('@/views/ShopMain.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found-route',
    component: () => import('@/views/NotFound.vue')
  }
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
