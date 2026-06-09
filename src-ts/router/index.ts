import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomePage.vue')
      },
      {
        path: 'login',
        name: 'login',
        meta: { transition: 'fade' },
        component: () => import('@/views/LoginPage.vue')
      },
      {
        path: 'arena-lookup',
        name: 'arena-lookup',
        meta: { transition: 'fade' },
        component: () => import('@/views/ArenaLookupPage.vue')
      },
      {
        path: 'csv-data',
        name: 'csv-data',
        meta: { transition: 'fade' },
        component: () => import('@/views/CsvDataView.vue')
      },
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        meta: { transition: 'fade' },
        component: () => import('@/views/NotFoundPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
