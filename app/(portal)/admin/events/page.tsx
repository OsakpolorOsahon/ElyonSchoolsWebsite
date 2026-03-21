'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, Plus, Calendar, MapPin, Clock, Pencil, Trash2 } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string | null
  start_ts: string
  end_ts: string
  location: string | null
  category: string
  created_at: string
}

const categoryColors: Record<string, string> = {
  Academic: 'bg-green-100 text-green-700',
  Sports: 'bg-orange-100 text-orange-700',
  Cultural: 'bg-pink-100 text-pink-700',
  Other: 'bg-gray-100 text-gray-700',
}

export default function AdminEventsPage() {
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchEvents = async () => {
    const res = await fetch('/api/admin/events')
    const data = await res.json()
    setEvents(data.events || [])
    setLoading(false)
  }

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
      setProfile(p)
      await fetchEvents()
    }
    load()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete event "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEvents(prev => prev.filter(e => e.id !== id))
      toast({ title: 'Event deleted', description: `"${title}" has been removed.` })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete event', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Events"
        subtitle={`Welcome back, ${profile?.full_name || 'Administrator'}`}
        role="admin"
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <h2 className="text-xl font-semibold">All Events</h2>
          </div>
          <Link href="/admin/events/new">
            <Button className="gap-2" data-testid="button-new-event">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="mb-4">No events yet</p>
              <Link href="/admin/events/new">
                <Button>Create Your First Event</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map(event => (
              <Card key={event.id} data-testid={`card-event-${event.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge className={categoryColors[event.category] || categoryColors.Other}>
                            {event.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Link href={`/admin/events/${event.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              data-testid={`button-edit-event-${event.id}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(event.id, event.title)}
                            disabled={deletingId === event.id}
                            data-testid={`button-delete-event-${event.id}`}
                          >
                            {deletingId === event.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{event.description}</p>
                      )}
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(event.start_ts).toLocaleDateString('en-NG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
