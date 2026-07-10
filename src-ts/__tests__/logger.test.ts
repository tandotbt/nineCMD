/**
 * Logger Tests – Tests for the logging system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createLogger,
  getLogHistory,
  clearLogHistory,
  getLogHistoryByLevel,
  getLogHistoryByModule,
  getLoggedModules,
  useLogHistory
} from '../utilities/logger'
import type { LogLevel } from '../types/logger'

describe('Logger Utility', () => {
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    clearLogHistory()
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ============================================================
  // createLogger
  // ============================================================

  describe('createLogger', () => {
    it('should create a logger with debug/info/warn/error methods', () => {
      const logger = createLogger({ module: 'test' })
      expect(typeof logger.debug).toBe('function')
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
    })

    it('should log debug messages in dev mode', () => {
      const logger = createLogger({ module: 'test', level: 'debug' })
      logger.debug('hello debug')
      expect(consoleDebugSpy).toHaveBeenCalledOnce()
    })

    it('should log info messages', () => {
      const logger = createLogger({ module: 'test', level: 'debug' })
      logger.info('hello info')
      expect(consoleInfoSpy).toHaveBeenCalledOnce()
    })

    it('should log warn messages', () => {
      const logger = createLogger({ module: 'test', level: 'debug' })
      logger.warn('hello warn')
      expect(consoleWarnSpy).toHaveBeenCalledOnce()
    })

    it('should log error messages', () => {
      const logger = createLogger({ module: 'test', level: 'debug' })
      logger.error('hello error')
      expect(consoleErrorSpy).toHaveBeenCalledOnce()
    })

    it('should include module name in log output', () => {
      const logger = createLogger({ module: 'configURL', level: 'debug' })
      logger.info('test message')
      const call = consoleInfoSpy.mock.calls[0]
      expect(call[0]).toContain('[configURL]')
    })

    it('should include level in log output', () => {
      const logger = createLogger({ module: 'test', level: 'debug' })
      logger.warn('warning test')
      const call = consoleWarnSpy.mock.calls[0]
      expect(call[0]).toContain('WARN')
    })

    it('should format timestamp as HH:MM:SS', () => {
      const logger = createLogger({ module: 'test', level: 'debug' })
      logger.info('timestamp test')
      const call = consoleInfoSpy.mock.calls[0]
      // Format: [HH:MM:SS]
      expect(call[0]).toMatch(/\[\d{2}:\d{2}:\d{2}\]/)
    })
  })

  // ============================================================
  // Log Level Filtering
  // ============================================================

  describe('Log Level Filtering', () => {
    it('should filter debug when level is info', () => {
      const logger = createLogger({ module: 'test', level: 'info' })
      logger.debug('should not appear')
      logger.info('should appear')
      expect(consoleDebugSpy).not.toHaveBeenCalled()
      expect(consoleInfoSpy).toHaveBeenCalledOnce()
    })

    it('should filter debug and info when level is warn', () => {
      const logger = createLogger({ module: 'test', level: 'warn' })
      logger.debug('no')
      logger.info('no')
      logger.warn('yes')
      logger.error('yes')
      expect(consoleDebugSpy).not.toHaveBeenCalled()
      expect(consoleInfoSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).toHaveBeenCalledOnce()
      expect(consoleErrorSpy).toHaveBeenCalledOnce()
    })

    it('should only show errors when level is error', () => {
      const logger = createLogger({ module: 'test', level: 'error' })
      logger.debug('no')
      logger.info('no')
      logger.warn('no')
      logger.error('yes')
      expect(consoleDebugSpy).not.toHaveBeenCalled()
      expect(consoleInfoSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledOnce()
    })
  })

  // ============================================================
  // Enabled/Disabled
  // ============================================================

  describe('Enabled/Disabled', () => {
    it('should not log when enabled is false', () => {
      const logger = createLogger({ module: 'test', enabled: false })
      logger.debug('no')
      logger.info('no')
      logger.warn('no')
      logger.error('no')
      expect(consoleDebugSpy).not.toHaveBeenCalled()
      expect(consoleInfoSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })
  })

  // ============================================================
  // Log History
  // ============================================================

  describe('Log History', () => {
    it('should add entries to history', () => {
      const logger = createLogger({ module: 'test', level: 'debug' })
      logger.info('message 1')
      logger.warn('message 2')

      const history = getLogHistory()
      expect(history.length).toBe(2)
      expect(history[0].module).toBe('test')
      expect(history[0].level).toBe('info')
      expect(history[0].messages).toEqual(['message 1'])
      expect(history[1].level).toBe('warn')
    })

    it('should clear history', () => {
      const logger = createLogger({ module: 'test', level: 'debug' })
      logger.info('message 1')
      clearLogHistory()
      expect(getLogHistory().length).toBe(0)
    })

    it('should filter by level', () => {
      const logger = createLogger({ module: 'test', level: 'debug' })
      logger.info('info msg')
      logger.warn('warn msg')
      logger.error('error msg')
      logger.debug('debug msg')

      expect(getLogHistoryByLevel('info').length).toBe(1)
      expect(getLogHistoryByLevel('warn').length).toBe(1)
      expect(getLogHistoryByLevel('error').length).toBe(1)
      expect(getLogHistoryByLevel('debug').length).toBe(1)
    })

    it('should filter by module', () => {
      const loggerA = createLogger({ module: 'moduleA', level: 'debug' })
      const loggerB = createLogger({ module: 'moduleB', level: 'debug' })
      loggerA.info('from A')
      loggerB.info('from B')
      loggerA.warn('from A again')

      expect(getLogHistoryByModule('moduleA').length).toBe(2)
      expect(getLogHistoryByModule('moduleB').length).toBe(1)
    })

    it('should get unique logged modules', () => {
      const loggerA = createLogger({ module: 'alpha', level: 'debug' })
      const loggerB = createLogger({ module: 'beta', level: 'debug' })
      loggerA.info('a1')
      loggerB.info('b1')
      loggerA.info('a2')

      const modules = getLoggedModules()
      expect(modules).toEqual(['alpha', 'beta'])
    })

    it('should cap history at max entries (default 200)', () => {
      const logger = createLogger({ module: 'test', level: 'debug' })
      for (let i = 0; i < 250; i++) {
        logger.info(`message ${i}`)
      }
      expect(getLogHistory().length).toBe(200)
      // Oldest entries should be trimmed
      expect((getLogHistory()[0] as unknown as { messages: string[] }).messages[0]).toBe('message 50')
    })

    it('should store timestamp in each entry', () => {
      const logger = createLogger({ module: 'test', level: 'debug' })
      const before = Date.now()
      logger.info('timestamped')
      const after = Date.now()

      const history = getLogHistory()
      expect(history[0].timestamp).toBeGreaterThanOrEqual(before)
      expect(history[0].timestamp).toBeLessThanOrEqual(after)
    })
  })

  // ============================================================
  // useLogHistory (readonly ref)
  // ============================================================

  describe('useLogHistory', () => {
    it('should return a readonly ref', () => {
      const history = useLogHistory()
      expect(history.value).toBeDefined()
      expect(Array.isArray(history.value)).toBe(true)
    })
  })

  // ============================================================
  // Multiple Modules
  // ============================================================

  describe('Multiple Modules', () => {
    it('should track entries from different modules separately', () => {
      const loggerA = createLogger({ module: 'appSettings', level: 'debug' })
      const loggerB = createLogger({ module: 'configURL', level: 'debug' })
      const loggerC = createLogger({ module: 'blockPolling', level: 'debug' })

      loggerA.info('appSettings msg')
      loggerB.info('configURL msg')
      loggerC.info('blockPolling msg')

      expect(getLogHistoryByModule('appSettings').length).toBe(1)
      expect(getLogHistoryByModule('configURL').length).toBe(1)
      expect(getLogHistoryByModule('blockPolling').length).toBe(1)
      expect(getLoggedModules()).toEqual(['appSettings', 'blockPolling', 'configURL'])
    })
  })
})
