import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/blocks',
      name: 'blocks',
      component: () => import('../views/BlocksView.vue'),
    },
    {
      path: '/settings/planets',
      name: 'planet-settings',
      component: () => import('../views/PlanetSettingsView.vue'),
    },
    {
      path: '/settings/apis',
      name: 'api-settings',
      component: () => import('../views/ApiSettingsView.vue'),
    },
    {
      path: '/data-explorer',
      name: 'csv-explorer',
      component: () => import('../views/CsvDataView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

export default router
