import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomeMain.vue'
const routes = [
  { path: '/', name: 'home-route', component: Home },
  { path: '/home', redirect: '/' },
  { path: '/login', name: 'login-route', component: () => import('@/views/LoginMain.vue') },
  { path: '/arena', name: 'arena-route', component: () => import('@/views/ArenaMain.vue') },
  {
    path: '/arena/:agentAddress',
    name: 'arena-leaderboard-route',
    component: () => import('@/views/ArenaLeaderboard.vue')
  },
  {
    path: '/arena/:agentAddress/attack/:agentEmeny',
    name: 'arena-before-attack-route',
    component: () => import('@/views/ArenaBeforeAttack.vue')
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
