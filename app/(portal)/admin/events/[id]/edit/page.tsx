'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

function toDatetimeLocal(ts: string) {
  if (!ts) return ''
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EditEventPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_ts: '',
    end_ts: '',
    location: '',
    category: 'Academic',
  })

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/admin/events')
      const data = await res.json()
      const event = (data.events || []).find((e: any) => e.id === id)
      if (!event) {
        toast({ title: 'Event not found', variant: 'destructive' })
        router.push('/admin/events')
        return
      }
      setFormData({
        title: event.title,
        description: event.description || '',
        start_ts: toDatetimeLocal(event.start_ts),
        end_ts: toDatetimeLocal(event.end_ts),
        location: event.location || '',
        category: event.category || 'Academic',
      })
      setLoading(false)
    }
    load()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.start_ts || !formData.end_ts) {
      toast({ title: 'Missing fields', description: 'Title, start and end time are required.', variant: 'destructive' })
      return
    }
    if (new Date(formData.end_ts) <= new Date(formData.start_ts)) {
      toast({ title: 'Invalid dates', description: 'End time must be after start time.', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...formData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Event updated!', description: `"${formData.title}" has been saved.` })
      router.push('/admin/events')
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update event', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <PortalHeader title="Edit Event" subtitle="Update event details" role="admin" />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader title="Edit Event" subtitle="Update event details" role="admin" />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/events">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Events
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="Enter event title"
                  required
                  data-testid="input-event-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Event details..."
                  rows={3}
                  data-testid="input-event-description"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_ts">Start Date & Time *</Label>
                  <Input
                    id="start_ts"
                    type="datetime-local"
                    value={formData.start_ts}
                    onChange={e => setFormData(p => ({ ...p, start_ts: e.target.value }))}
                    required
                    data-testid="input-event-start"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_ts">End Date & Time *</Label>
                  <Input
                    id="end_ts"
                    type="datetime-local"
                    value={formData.end_ts}
                    onChange={e => setFormData(p => ({ ...p, end_ts: e.target.value }))}
                    required
                    data-testid="input-event-end"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                  placeholder="School Hall, Sports Complex, etc."
                  data-testid="input-event-location"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))}>
                  <SelectTrigger data-testid="select-event-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting} className="gap-2" data-testid="button-save-event">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link href="/admin/events">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
