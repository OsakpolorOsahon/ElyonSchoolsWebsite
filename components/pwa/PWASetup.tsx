'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWASetup() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return null
}

export function PWAInstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('pwa-banner-dismissed')) {
      setDismissed(true)
      return
    }

    const isIOSDevice = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as any).standalone === true)

    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    setIsIOS(isIOSDevice)

    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setPromptEvent(null)
  }

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-banner-dismissed', '1')
    setDismissed(true)
  }

  if (dismissed || isInstalled) return null

  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-border bg-background shadow-lg p-4 flex items-start gap-3 animate-fade-up">
        <img src="/logo.png" alt="Elyon Schools" className="h-10 w-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">Install Elyon Schools</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong> to install this app on your device.
          </p>
        </div>
        <button onClick={handleDismiss} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  if (!promptEvent) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-border bg-background shadow-lg p-4 flex items-center gap-3 animate-fade-up">
      <img src="/logo.png" alt="Elyon Schools" className="h-10 w-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">Install Elyon Schools</p>
        <p className="text-xs text-muted-foreground mt-0.5">Add to your home screen for quick access — works like an app.</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button size="sm" onClick={handleInstall} className="gap-1.5 h-8 text-xs">
          <Download className="h-3.5 w-3.5" />
          Install
        </Button>
        <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
