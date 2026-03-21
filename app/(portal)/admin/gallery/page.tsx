'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
import { Loader2, ArrowLeft, Plus, Camera, Trash2, Pencil } from 'lucide-react'

interface GalleryItem {
  id: string
  title: string
  description: string | null
  category: string
  public_url: string
  created_at: string
}

const categoryColors: Record<string, string> = {
  campus: 'bg-green-100 text-green-700',
  events: 'bg-purple-100 text-purple-700',
  sports: 'bg-orange-100 text-orange-700',
  graduation: 'bg-blue-100 text-blue-700',
  students: 'bg-pink-100 text-pink-700',
}

const CATEGORIES = ['campus', 'events', 'sports', 'graduation', 'students']

export default function AdminGalleryPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<GalleryItem | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', category: 'campus' })
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
      setProfile(p)
      await fetchItems()
    }
    load()
  }, [])

  const fetchItems = async () => {
    const res = await fetch('/api/admin/gallery')
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this image? This cannot be undone.')) return
    setDeleting(id)
    const res = await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== id))
      toast({ title: 'Image deleted' })
    } else {
      toast({ title: 'Error', description: 'Failed to delete image', variant: 'destructive' })
    }
    setDeleting(null)
  }

  const openEdit = (item: GalleryItem) => {
    setEditTarget(item)
    setEditForm({ title: item.title, description: item.description || '', category: item.category })
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!editTarget) return
    if (!editForm.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' })
      return
    }
    setEditSaving(true)
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editTarget.id,
          title: editForm.title,
          description: editForm.description,
          category: editForm.category,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setItems(prev => prev.map(i =>
        i.id === editTarget.id
          ? { ...i, title: editForm.title, description: editForm.description || null, category: editForm.category }
          : i
      ))
      toast({ title: 'Image updated' })
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
        title="Gallery"
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
            <h2 className="text-xl font-semibold">Gallery Images ({items.length})</h2>
          </div>
          <Link href="/admin/gallery/upload">
            <Button className="gap-2" data-testid="button-upload-image">
              <Plus className="h-4 w-4" /> Upload Image
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="mb-4">No gallery images yet</p>
              <Link href="/admin/gallery/upload">
                <Button>Upload First Image</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map(item => (
              <Card key={item.id} className="overflow-hidden group" data-testid={`card-gallery-${item.id}`}>
                <div className="relative aspect-[4/3] bg-muted">
                  <Image
                    src={item.public_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openEdit(item)}
                      data-testid={`button-edit-gallery-${item.id}`}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteItem(item.id)}
                      disabled={deleting === item.id}
                      data-testid={`button-delete-gallery-${item.id}`}
                    >
                      {deleting === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      Delete
                    </Button>
                  </div>
                </div>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                      )}
                    </div>
                    <Badge className={`shrink-0 text-xs ${categoryColors[item.category] || 'bg-gray-100 text-gray-700'}`}>
                      {item.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Image Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Image title"
                data-testid="input-edit-gallery-title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description..."
                rows={2}
                data-testid="input-edit-gallery-desc"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={editForm.category} onValueChange={v => setEditForm(f => ({ ...f, category: v }))}>
                <SelectTrigger data-testid="select-edit-gallery-cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editSaving} data-testid="button-save-gallery-edit">
              {editSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
