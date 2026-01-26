import 'fake-indexeddb/auto'
import { vi, beforeAll, afterEach, afterAll } from 'vitest'
import { ref } from 'vue'
import { server } from './helpers/mswServer'

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Reset handlers after each test (important for test isolation)
afterEach(() => server.resetHandlers())

// Close server after all tests
afterAll(() => server.close())

// Mock for Navigator and Service Worker
const mockServiceWorker = {
  controller: {
    postMessage: vi.fn(),
  },
  ready: Promise.resolve(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

if (typeof navigator !== 'undefined') {
  // JSDOM environment
  if (!navigator.serviceWorker) {
    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      configurable: true,
      writable: true,
    })
  }
  // Essential for naive-ui and other browser-dependent libs
  Object.defineProperty(navigator, 'userAgent', {
    value:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    configurable: true,
    writable: true,
  })
} else {
  // Node environment fallback
  Object.defineProperty(global, 'navigator', {
    value: {
      serviceWorker: mockServiceWorker,
      userAgent: 'Mozilla/5.0 (test)',
      onLine: true,
    },
    writable: true,
    configurable: true,
  })
}

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: ref('en'),
    t: (key: string) => key,
    n: (n: number) => String(n),
    d: (d: Date) => d.toISOString(),
  }),
  createI18n: () => ({
    install: () => {},
    global: {
      locale: { value: 'en' },
      t: (key: string) => key,
    },
  }),
}))

// Mock Web Worker for Vitest
class MockWorker {
  onmessage: ((ev: MessageEvent) => void) | null = null
  postMessage(message: unknown) {
    // Basic mock implementation
    // If it's a CSV parser message, simulate success response
    const msg = message as { sheetName?: string; keyMain?: string }
    if (msg && msg.sheetName && this.onmessage) {
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage({
            data: {
              sheetName: msg.sheetName,
              data: {
                name: msg.sheetName,
                headers: ['id'],
                rows: [{ id: 1 }],
                mappedData: { '1': { id: 1 } },
                keyMain: msg.keyMain || 'id',
              },
            },
          } as MessageEvent)
        }
      }, 0)
    }
  }
  terminate() {}
}

if (typeof global !== 'undefined') {
  // @ts-expect-error - Mocking global Worker for Node environment
  global.Worker = MockWorker
}

if (typeof window !== 'undefined') {
  // @ts-expect-error - Mocking window Worker for JSDOM environment
  window.Worker = MockWorker
}

// Mock matchMedia if needed by UI components
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}
