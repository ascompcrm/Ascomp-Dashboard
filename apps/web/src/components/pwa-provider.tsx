'use client'

import { useEffect } from 'react'

export function PwaProvider() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    const register = () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .catch((error) => console.error('[PWA] Service worker registration failed:', error))
    }

    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register)
    }

    return () => {
      window.removeEventListener('load', register)
    }
  }, [])

  return null
}

