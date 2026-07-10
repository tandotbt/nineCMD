/**
 * Logger Types – Type definitions for NineCMD logging system
 *
 * Logger helps debugging with:
 * - Unified module prefix
 * - Log level filtering (debug/info/warn/error)
 * - Log history stored in memory (displayed in Settings tab)
 * - Format: [HH:MM:SS] [module] LEVEL: message
 */

/** Log levels – from lowest to highest */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/** Numeric log levels for comparison */
export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

/** Log entry stored in history */
export interface LogEntry {
  /** Timestamp in ms (Date.now()) */
  timestamp: number
  /** Module name */
  module: string
  /** Log level */
  level: LogLevel
  /** Log message(s) */
  messages: unknown[]
}

/** Logger configuration */
export interface LoggerConfig {
  /** Module name: 'appSettings', 'configURL', 'blockPolling', etc. */
  module: string
  /** Minimum level to output (default: 'debug') */
  level?: LogLevel
  /** Master switch – set false to disable all logs */
  enabled?: boolean
}

/** Logger instance interface */
export interface Logger {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}

/** Global logger history config */
export interface LoggerHistoryConfig {
  /** Max entries to keep in history (default: 200) */
  maxEntries: number
}
