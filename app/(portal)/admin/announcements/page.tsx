'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, Plus, Megaphone, Trash2, Pencil } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  body: string
  target_audience: string
  is_published: boolean
  created_at: string
}

const audienceColors: Record<string, string> = {
  all: 'bg-blue-100 text-blue-700',
  parents: 'bg-purple-100 text-purple-700',
  students: 'bg-green-100 text-green-700',
  teachers: 'bg-orange-100 text-orange-700',
}

export default function AdminAnnouncementsPage() {
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Announcement | null>(null)
  const [editForm, setEditForm] = useState({ title: '', body: '', target_audience: 'all' })
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
      setProfile(p)
      await fetchAnnouncements()
    }
    load()
  }, [])

  const fetchAnnouncements = async () => {
    const res = await fetch('/api/admin/announcements')
    const data = await res.json()
    setAnnouncements(data.announcements || [])
    setLoading(false)
  }

  const togglePublished = async (id: string, current: boolean) => {
    setToggling(id)
    const res = await fetch('/api/admin/announcements', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_published: !current }),
    })
    if (res.ok) {
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_published: !current } : a))
      toast({ title: `Announcement ${!current ? 'published' : 'unpublished'}` })
    }
    setToggling(null)
  }

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    setDeleting(id)
    const res = await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setAnnouncements(prev => prev.filter(a => a.id !== id))
      toast({ title: 'Announcement deleted' })
    } else {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
    setDeleting(null)
  }

  const openEdit = (ann: Announcement) => {
    setEditTarget(ann)
    setEditForm({ title: ann.title, body: ann.body, target_audience: ann.target_audience })
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!editTarget) return
    if (!editForm.title.trim() || !editForm.body.trim()) {
      toast({ title: 'Missing fields', description: 'Title and body are required.', variant: 'destructive' })
      return
    }
    setEditSaving(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editTarget.id,
          title: editForm.title,
          body: editForm.body,
          target_audience: editForm.target_audience,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAnnouncements(prev => prev.map(a =>
        a.id === editTarget.id
          ? { ...a, title: editForm.title, body: editForm.body, target_audience: editForm.target_audience }
          : a
      ))
      toast({ title: 'Announcement updated' })
      setEditOpen(false)
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update', variant: 'destructive' })
    } finally {
      setEditSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Announcements"
        subtitle={`Welcome back, ${profile?.full_name || 'Administrator'}`}
        role="admin"
      />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <h2 className="text-xl font-semibold">All Announcements</h2>
          </div>
          <Link href="/admin/announcements/new">
            <Button className="gap-2" data-testid="button-new-announcement">
              <Plus className="h-4 w-4" /> New Announcement
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="mb-4">No announcements yet</p>
              <Link href="/admin/announcements/new">
                <Button>Create First Announcement</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {announcements.map(ann => (
              <Card key={ann.id} data-testid={`card-announcement-${ann.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold">{ann.title}</h3>
                        <Badge className={ann.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {ann.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge className={audienceColors[ann.target_audience] || audienceColors.all}>
                          {ann.target_audience === 'all' ? 'Everyone' : ann.target_audience}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ann.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(ann.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      <Button
                        size="sm"
                        variant={ann.is_published ? 'outline' : 'default'}
                        onClick={() => togglePublished(ann.id, ann.is_published)}
                        disabled={toggling === ann.id}
                        data-testid={`button-toggle-announcement-${ann.id}`}
                      >
                        {toggling === ann.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                        {ann.is_published ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(ann)}
                        data-testid={`button-edit-announcement-${ann.id}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteAnnouncement(ann.id)}
                        disabled={deleting === ann.id}
                        data-testid={`button-delete-announcement-${ann.id}`}
                      >
                        {deleting === ann.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Announcement title"
                data-testid="input-edit-ann-title"
              />
            </div>
            <div className="space-y-2">
              <Label>Body *</Label>
              <Textarea
                value={editForm.body}
                onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Announcement content..."
                rows={4}
                data-testid="input-edit-ann-body"
              />
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={editForm.target_audience} onValueChange={v => setEditForm(f => ({ ...f, target_audience: v }))}>
                <SelectTrigger data-testid="select-edit-ann-audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="parents">Parents</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="teachers">Teachers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editSaving} data-testid="button-save-ann-edit">
              {editSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
