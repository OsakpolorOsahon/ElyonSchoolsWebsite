'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, Plus, Camera, Trash2 } from 'lucide-react'

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

export default function AdminGalleryPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)

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
            <Button className="gap-2">
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
              <Card key={item.id} className="overflow-hidden group">
                <div className="relative aspect-[4/3] bg-muted">
                  <Image
                    src={item.public_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteItem(item.id)}
                      disabled={deleting === item.id}
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
    </div>
  )
}
