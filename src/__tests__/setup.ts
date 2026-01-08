import 'fake-indexeddb/auto'
import { vi } from 'vitest'

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
