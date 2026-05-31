/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module '*.json' {
  const value: Record<string, unknown>
  export default value
}

declare module '@vicons/material' {
  import type { Component } from 'vue'
  export const DarkModeFilled: Component
  export const LightModeFilled: Component
  export const SunnyOutline: Component
  export const MoonOutline: Component
  export const FormatListBulletedRound: Component
  export const HomeRound: Component
  export const LogInRound: Component
  export const StadiumRound: Component
  export const LeaderboardRound: Component
  export const ShoppingCartFilled: Component
  export const WarningAmberRound: Component
  export const FullscreenRound: Component
  export const FullscreenExitRound: Component
}

declare module 'vue-i18n' {
  import type { Ref, Plugin } from 'vue'

  export interface I18n {
    global: {
      locale: Ref<string>
      t: (key: string, ...args: unknown[]) => string
      availableLocales: string[]
    }
  }

  export function createI18n(config: {
    locale?: string
    fallbackLocale?: string
    messages?: Record<string, Record<string, unknown>>
    numberFormats?: Record<string, Record<string, unknown>>
    datetimeFormats?: Record<string, Record<string, unknown>>
    legacy?: boolean
  }): I18n & Plugin

  export function useI18n(config?: {
    useScope?: 'global' | 'local'
    i18n?: I18n
  }): {
    t: (key: string) => string
    locale: Ref<string>
    availableLocales: string[]
  }
}

declare module '@vueuse/core' {
  export function useStorage<T>(
    key: string,
    defaultValue: T,
    storage?: Storage
  ): import('vue').Ref<T>
  export function onClickOutside(
    target: import('vue').Ref<HTMLElement | null>,
    callback: () => void
  ): void
  export function refDebounced<T>(
    ref: import('vue').Ref<T>,
    delay: number
  ): import('vue').Ref<T>
  export function useTimeoutPoll(
    callback: () => void,
    interval: number
  ): { pause: () => void; resume: () => void }
}
