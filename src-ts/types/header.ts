/**
 * Types cho Header components
 */

/** Props cho HeaderAvatar */
export interface HeaderAvatarProps {
  avatarAddress?: string
  portraitId?: number
  level?: number
}

/** Props cho HeaderProgress */
export interface HeaderProgressItem {
  label: string
  percentage: number
  color?: string
  text?: string
  processing?: boolean
}

/** Props cho HeaderBanner */
export interface HeaderBannerItem {
  imageUrl: string
  link: string
  priority: number
}

/** Settings từ localStorage */
export interface HeaderSettings {
  isDarkMode: boolean
  lang: string
  lastPlanet?: string
  selectedNode?: string
}
