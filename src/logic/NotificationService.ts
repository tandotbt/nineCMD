/**
 * @file logic/NotificationService.ts
 * @description Service to manage Web Notifications and permissions in the UI.
 */

import { CHARACTER_LOGIC_CONSTANTS } from '@/constants'

export class NotificationService {
  /**
   * Requests permission for Web Notifications if not already granted.
   */
  public static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[NotificationService] This browser does not support desktop notification')
      return false
    }

    console.log('[NotificationService] Current permission status:', Notification.permission)
    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      console.log('[NotificationService] Requesting permission...')
      try {
        // Support both promise-based and callback-based requestPermission
        const permission = await new Promise<NotificationPermission>((resolve) => {
          const result = Notification.requestPermission(resolve)
          if (result) {
            result.then(resolve)
          }
        })
        console.log('[NotificationService] Permission request result:', permission)
        return permission === 'granted'
      } catch (err) {
        console.error('[NotificationService] Error requesting permission:', err)
        return false
      }
    }

    return false
  }

  /**
   * Shows a simple notification.
   */
  public static show(title: string, options?: NotificationOptions): void {
    console.log('[NotificationService] show() called with:', { title, options })
    console.log('[NotificationService] Permission state:', Notification.permission)
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: CHARACTER_LOGIC_CONSTANTS.NOTIFICATION.DEFAULT_ICON,
          badge: CHARACTER_LOGIC_CONSTANTS.NOTIFICATION.DEFAULT_ICON,
          ...options,
        })
        console.log('[NotificationService] Notification object created successfully')
      } catch (err) {
        console.error('[NotificationService] Error creating notification:', err)
      }
    } else {
      console.warn(
        '[NotificationService] Cannot show notification: Permission is',
        Notification.permission,
      )
    }
  }
}
