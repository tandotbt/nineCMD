import { describe, it, expect } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

// Route name -> menu key mapping (mirrors PlaceholderMenuLeft.vue)
const routeToMenuKey: Record<string, string> = {
  'home': 'home',
  'login': 'login'
}

// Define routes inline for testing (same as router/index.ts)
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
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundPage.vue')
  }
]

function createTestRouter(initialRoute: string = '/') {
  return createRouter({
    history: createMemoryHistory(),
    routes
  })
}

describe('Vue Router Configuration', () => {
  it('should have home route at "/"', () => {
    const router = createTestRouter()
    const resolved = router.resolve('/')
    expect(resolved.name).toBe('home')
    expect(resolved.path).toBe('/')
  })

  it('should have login route at "/login"', () => {
    const router = createTestRouter()
    const resolved = router.resolve('/login')
    expect(resolved.name).toBe('login')
    expect(resolved.path).toBe('/login')
  })

  it('should have not-found catch-all route', () => {
    const router = createTestRouter()
    const resolved = router.resolve('/any-random-path')
    expect(resolved.name).toBe('not-found')
  })

  it('should resolve 404 for unknown paths', () => {
    const router = createTestRouter()
    const unknownPaths = [
      '/nonexistent',
      '/arena/something',
      '/random/123/abc',
      '/this-does-not-exist'
    ]

    for (const path of unknownPaths) {
      const resolved = router.resolve(path)
      expect(resolved.name).toBe('not-found')
    }
  })

  it('should have transition meta on login route', () => {
    const router = createTestRouter()
    const resolved = router.resolve('/login')
    expect(resolved.meta.transition).toBe('fade')
  })

  it('should have all required routes defined', () => {
    const router = createTestRouter()
    const routeNames = routes.flatMap((r) =>
      r.children
        ? r.children.map((c) => c.name)
        : [r.name]
    )
    expect(routeNames).toContain('home')
    expect(routeNames).toContain('login')
    expect(routeNames).toContain('not-found')
  })

  it('home route should use MainLayout as parent component', () => {
    const router = createTestRouter()
    const resolved = router.resolve('/')
    // home is a child of MainLayout route
    expect(resolved.matched.length).toBe(2) // MainLayout + HomePage
    expect(resolved.matched[0].components?.default).toBe(MainLayout)
  })
})

describe('Sidebar Menu Key ↔ Route Name Sync', () => {
  it('should map route name "home" to menu key "home"', () => {
    expect(routeToMenuKey['home']).toBe('home')
  })

  it('should map route name "login" to menu key "login"', () => {
    expect(routeToMenuKey['login']).toBe('login')
  })

  it('should return undefined for unknown route names', () => {
    expect(routeToMenuKey['not-found']).toBeUndefined()
    expect(routeToMenuKey['unknown-route']).toBeUndefined()
  })

  it('should select "login" menu key when navigating from "/" to "/login"', async () => {
    const router = createTestRouter()
    await router.push('/')
    await router.isReady()

    // Initially on home route → menu key should be "home"
    let menuKey = routeToMenuKey[router.currentRoute.value.name as string]
    expect(menuKey).toBe('home')

    // Navigate to login → menu key should change to "login"
    await router.push('/login')
    menuKey = routeToMenuKey[router.currentRoute.value.name as string]
    expect(menuKey).toBe('login')
  })

  it('should select "home" menu key when navigating back from "/login" to "/"', async () => {
    const router = createTestRouter()
    await router.push('/login')
    await router.isReady()

    // Initially on login route → menu key should be "login"
    let menuKey = routeToMenuKey[router.currentRoute.value.name as string]
    expect(menuKey).toBe('login')

    // Navigate back to home → menu key should change to "home"
    await router.push('/')
    menuKey = routeToMenuKey[router.currentRoute.value.name as string]
    expect(menuKey).toBe('home')
  })

  it('should return undefined menu key for 404 route', async () => {
    const router = createTestRouter()
    await router.push('/some-unknown-path')
    await router.isReady()

    const menuKey = routeToMenuKey[router.currentRoute.value.name as string]
    expect(menuKey).toBeUndefined()
  })
})
