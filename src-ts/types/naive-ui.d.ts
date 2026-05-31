/**
 * Type declarations for naive-ui
 * naive-ui 2.44.1 doesn't export an `exports` field in package.json,
 * which causes moduleResolution: "bundler" to fail resolving its types.
 * This file provides ambient type declarations for the parts we use.
 */

declare module 'naive-ui' {
  import type { Component, Ref } from 'vue'

  // Theme
  export const darkTheme: Record<string, unknown>
  export const lightTheme: Record<string, unknown>
  export function createTheme(theme: Record<string, unknown>): Record<string, unknown>

  export interface GlobalTheme {
    [key: string]: unknown
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface GlobalThemeOverrides {}

  // Locales
  export const enUS: NLocale
  export const viVN: NLocale
  export const dateEnUS: NDateLocale
  export const dateViVN: NDateLocale

  export interface NLocale {
    name: string
    locale: Record<string, unknown>
  }

  export interface NDateLocale {
    name: string
    locale: Record<string, unknown>
  }

  // Component types
  export interface MenuOption {
    label?: string | (() => import('vue').VNode)
    key?: string | number
    icon?: () => import('vue').VNode
    children?: MenuOption[]
    disabled?: boolean
    type?: 'group' | 'divider'
    props?: Record<string, unknown>
  }

  export interface SelectOption {
    label: string
    value: string | number
    disabled?: boolean
    [key: string]: unknown
  }

  export interface SelectGroupOption {
    type: 'group'
    label: string
    children: SelectOption[]
    [key: string]: unknown
  }

  export interface FormInst {
    validate(callback?: (errors?: Array<{ field: string; message: string }>) => void): void
    restoreValidation(): void
  }

  export interface FormRules {
    [path: string]: FormItemRule | FormItemRule[]
  }

  export interface FormItemRule {
    required?: boolean
    message?: string
    trigger?: string | string[]
    min?: number
    max?: number
    pattern?: RegExp
    validator?: (rule: FormItemRule, value: unknown) => boolean | Error
    [key: string]: unknown
  }

  // Components (Vue components used in templates)
  export const NIcon: Component
  export const NAvatar: Component
  export const NText: Component
  export const NCard: Component
  export const NTag: Component
  export const NDivider: Component
  export const NSpace: Component
  export const NConfigProvider: Component
  export const NLayout: Component
  export const NLayoutHeader: Component
  export const NLayoutSider: Component
  export const NLayoutFooter: Component
  export const NMenu: Component
  export const NLoadingBarProvider: Component
  export const NModalProvider: Component
  export const NMessageProvider: Component
  export const NScrollbar: Component
  export const NSwitch: Component
  export const NSelect: Component
  export const NGlobalStyle: Component
  export const NForm: Component
  export const NFormItem: Component
  export const NInput: Component
  export const NButton: Component
  export const NResult: Component
  export const NFloatButton: Component
  export const NBadge: Component
  export const NEllipsis: Component
  export const NDrawer: Component
  export const NDrawerContent: Component
  export const NTabs: Component
  export const NTabPane: Component
  export const NFlex: Component
  export const NGradientText: Component
  export const NPopconfirm: Component
  export const NProgress: Component
  export const NGrid: Component
  export const NGridItem: Component
  export const NCarousel: Component
  export const NCarouselItem: Component

  // Utilities
  export function useThemeVars(): Record<string, Ref<string>>
  export function useDialog(): {
    warning: (options: Record<string, unknown>) => { destroy: () => void }
    error: (options: Record<string, unknown>) => { destroy: () => void }
    success: (options: Record<string, unknown>) => { destroy: () => void }
    info: (options: Record<string, unknown>) => { destroy: () => void }
    create: (options: Record<string, unknown>) => { destroy: () => void }
  }
  export function useMessage(): {
    success: (message: string, options?: Record<string, unknown>) => void
    error: (message: string, options?: Record<string, unknown>) => void
    warning: (message: string, options?: Record<string, unknown>) => void
    info: (message: string, options?: Record<string, unknown>) => void
    loading: (message: string, options?: Record<string, unknown>) => { destroy: () => void }
    create: (options: Record<string, unknown>) => { destroy: () => void }
  }
  export function useNotification(): {
    success: (options: Record<string, unknown>) => void
    error: (options: Record<string, unknown>) => void
    warning: (options: Record<string, unknown>) => void
    info: (options: Record<string, unknown>) => void
  }
  export function useLoadingBar(): {
    start: () => void
    finish: () => void
    error: () => void
    success: () => void
  }

  // Default export
  const naive: {
    install: (app: import('vue').App) => void
  }
  export default naive
  export const version: string
}
