'use client'

import { usePwa } from './pwa-provider'
import { Button } from './ui/button'
import { X, Download } from 'lucide-react'

export function PwaInstallBanner() {
  const { showInstallPrompt, installApp, dismissPrompt } = usePwa()

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black text-white p-4 shadow-lg border-t-2 border-white sm:hidden">
      <div className="flex items-center gap-3 max-w-md mx-auto">
        <div className="flex-1">
          <p className="text-sm font-semibold">Install Ascomp App</p>
          <p className="text-xs text-gray-300">Add to home screen for quick access</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={installApp}
            size="sm"
            className="bg-white text-black hover:bg-gray-100 font-semibold"
          >
            <Download className="h-4 w-4 mr-1" />
            Install
          </Button>
          <button
            onClick={dismissPrompt}
            className="p-1 hover:bg-gray-800 rounded"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

