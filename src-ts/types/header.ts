/**
 * Types for Header components
 */

/** Props for HeaderProgress */
export interface HeaderProgressItem {
  label: string
  percentage: number
  color?: string
  text?: string
  processing?: boolean
}

/** Props for HeaderBanner */
export interface HeaderBannerItem {
  imageUrl: string
  link: string
  priority: number
}
