'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Notification {
  id: string
  message: string
  read: boolean
  created_at: string
}

export default function ParentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [dismissing, setDismissing] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/parent/notifications')
      .then(r => r.json())
      .then(data => setNotifications(data.notifications || []))
      .catch(() => {})
  }, [])

  async function dismiss(id: string) {
    setDismissing(id)
    try {
      await fetch('/api/parent/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch {
      // silently fail
    } finally {
      setDismissing(null)
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="space-y-3 mb-6" data-testid="parent-notifications">
      {notifications.map(n => (
        <Alert
          key={n.id}
          className="border-primary/30 bg-primary/5 flex items-start gap-3 pr-3"
          data-testid={`notification-${n.id}`}
        >
          <Bell className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <AlertDescription className="flex-1 text-sm text-foreground">
            {n.message}
            <span className="block text-xs text-muted-foreground mt-0.5">
              {new Date(n.created_at).toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => dismiss(n.id)}
            disabled={dismissing === n.id}
            data-testid={`button-dismiss-notification-${n.id}`}
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </Alert>
      ))}
    </div>
  )
}
