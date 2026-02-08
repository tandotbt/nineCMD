import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
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
      path: '/settings/game',
      name: 'game-settings',
      component: () => import('../views/GameSettingsView.vue'),
    },
    {
      path: '/settings/pwa',
      name: 'pwa-status',
      component: () => import('../views/PwaStatusView.vue'),
    },
    {
      path: '/data-explorer',
      name: 'csv-explorer',
      component: () => import('../views/CsvDataView.vue'),
    },
    {
      path: '/info-all-avatar-address',
      name: 'info-all-avatar-address',
      component: () => import('../views/infoAllAvatarAddress.vue'),
    },
    {
      path: '/info-all-avatar-address/:avatarAddress',
      name: 'avatar-detail',
      component: () => import('../views/AvatarDetailView.vue'),
      props: true,
    },
    {
      path: '/automation',
      name: 'automation',
      component: () => import('../views/AutomationView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const { useSettingsStore } = await import('@/stores/useSettingsStore')
  const settingsStore = useSettingsStore()

  // Ensure settings are loaded
  if (!settingsStore.agentAddress) {
    await settingsStore.loadSettings()
  }

  const publicPages = ['/login', '/settings/apis']
  const authRequired = !publicPages.includes(to.path)

  if (authRequired && !settingsStore.isLoggedIn) {
    return next('/login')
  }

  if (to.path === '/login' && settingsStore.isLoggedIn) {
    return next('/')
  }

  next()
})

export default router
