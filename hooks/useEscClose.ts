import { useEffect } from 'react'

/**
 * Wire ESC to a close handler while `enabled` is true.
 * No-op when disabled, so safe to mount in components that toggle visibility.
 */
export function useEscClose(onClose: () => void, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onClose])
}
