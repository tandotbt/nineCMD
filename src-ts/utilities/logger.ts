/**
 * Logger Utility – Unified logging system for NineCMD
 *
 * Replaces direct console.log/warn/error with structured logger.
 *
 * Features:
 * - Module prefix: [appSettings], [configURL], [blockPolling], ...
 * - Log level filtering: debug < info < warn < error
 * - Log history stored in ref (max 200 entries) – displayed in Settings tab
 * - Format: [HH:MM:SS] [module] LEVEL: message
 * - Dev mode: all levels; Prod mode: warn + error only
 *
 * Usage:
 *   import { createLogger } from '../utilities/logger'
 *   const logger = createLogger({ module: 'configURL' })
 *   logger.info('Fetched planets:', data.map(p => p.name).join(', '))
 *   logger.error('Failed to fetch:', message)
 */

import { ref, readonly } from 'vue'
import { type LogLevel, type LogEntry, type Logger, type LoggerConfig, type LoggerHistoryConfig, LOG_LEVEL_PRIORITY } from '../types/logger'

// Re-export LogLevel for consumers (e.g. appSettings.ts)
export type { LogLevel } from '../types/logger'

// ============================================================
// Global Log History
// ============================================================

/** Default max entries in history */
const DEFAULT_MAX_HISTORY = 200

/** Global log history – shared across all logger instances */
const logHistory = ref<LogEntry[]>([])

/** History config */
const historyConfig: LoggerHistoryConfig = { maxEntries: DEFAULT_MAX_HISTORY }

/** Minimum log level for production mode */
const PROD_MIN_LEVEL: LogLevel = 'warn'

/** Current environment detection */
function isDevMode(): boolean {
  try {
    return import.meta.env?.DEV ?? true
  } catch {
    return true
  }
}

// ============================================================
// Helpers
// ============================================================

/**
 * Format timestamp to HH:MM:SS
 */
function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

/**
 * Pad level to fixed width for alignment
 */
function padLevel(level: LogLevel): string {
  return level.toUpperCase().padEnd(5)
}

/**
 * Check if a level should be output based on minimum level
 */
function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minLevel]
}

/**
 * Format log args into a single string for console output
 */
function formatArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === 'string') return arg
      try {
        return JSON.stringify(arg, null, 2)
      } catch {
        return String(arg)
      }
    })
    .join(' ')
}

/**
 * Add entry to global log history
 */
function addToHistory(entry: LogEntry): void {
  const updated = [...logHistory.value, entry]
  logHistory.value = updated.length > historyConfig.maxEntries
    ? updated.slice(-historyConfig.maxEntries)
    : updated
}

// ============================================================
// Create Logger
// ============================================================

/**
 * Create a logger instance for a specific module.
 *
 * @param config - Logger configuration
 * @returns Logger instance with debug/info/warn/error methods
 *
 * @example
 * ```typescript
 * const logger = createLogger({ module: 'configURL' })
 * logger.info('Fetched planets:', data)
 * logger.warn('Using fallback data')
 * logger.error('Fetch failed:', error.message)
 * ```
 */
export function createLogger(config: LoggerConfig): Logger {
  const module = config.module
  const enabled = config.enabled ?? true
  const devMode = isDevMode()

  // In production, default to 'warn' level; in dev, 'debug'
  const minLevel: LogLevel = config.level ?? (devMode ? 'debug' : PROD_MIN_LEVEL)

  function log(level: LogLevel, args: unknown[]): void {
    // Check enabled
    if (!enabled) return

    // Check level threshold
    if (!shouldLog(level, minLevel)) return

    // Add to history
    addToHistory({
      timestamp: Date.now(),
      module,
      level,
      messages: [...args]
    })

    // Output to console
    const prefix = `[${formatTime(Date.now())}] [${module}] ${padLevel(level)}:`
    const message = formatArgs(args)

    switch (level) {
      case 'debug':
        console.debug(prefix, message)
        break
      case 'info':
        console.info(prefix, message)
        break
      case 'warn':
        console.warn(prefix, message)
        break
      case 'error':
        console.error(prefix, message)
        break
    }
  }

  return {
    debug: (...args: unknown[]) => log('debug', args),
    info: (...args: unknown[]) => log('info', args),
    warn: (...args: unknown[]) => log('warn', args),
    error: (...args: unknown[]) => log('error', args)
  }
}

// ============================================================
// History Management (for Settings tab / Log Viewer)
// ============================================================

/**
 * Get read-only reference to log history
 */
export function useLogHistory() {
  return readonly(logHistory)
}

/**
 * Get current log history as plain array
 */
export function getLogHistory(): readonly LogEntry[] {
  return logHistory.value
}

/**
 * Clear all log history
 */
export function clearLogHistory(): void {
  logHistory.value = []
}

/**
 * Get log history filtered by level
 */
export function getLogHistoryByLevel(level: LogLevel): LogEntry[] {
  return logHistory.value.filter((entry) => entry.level === level)
}

/**
 * Get log history filtered by module
 */
export function getLogHistoryByModule(module: string): LogEntry[] {
  return logHistory.value.filter((entry) => entry.module === module)
}

/**
 * Configure log history settings
 */
export function configureLoggerHistory(config: Partial<LoggerHistoryConfig>): void {
  if (config.maxEntries !== undefined) {
    historyConfig.maxEntries = config.maxEntries
    // Trim existing history if needed
    if (logHistory.value.length > config.maxEntries) {
      logHistory.value = logHistory.value.slice(-config.maxEntries)
    }
  }
}

/**
 * Get list of unique modules that have logged entries
 */
export function getLoggedModules(): string[] {
  const modules = new Set(logHistory.value.map((e) => e.module))
  return Array.from(modules).sort()
}
