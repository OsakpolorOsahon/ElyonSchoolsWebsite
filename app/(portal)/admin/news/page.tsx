'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, Plus, Newspaper, Pencil, Trash2 } from 'lucide-react'

interface NewsPost {
  id: string
  title: string
  slug: string
  summary: string | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
}

export default function AdminNewsPage() {
  const { toast } = useToast()
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchPosts = async () => {
    const res = await fetch('/api/admin/news')
    const data = await res.json()
    setPosts(data.posts || [])
    setLoading(false)
  }

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
      setProfile(p)
      await fetchPosts()
    }
    load()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete news post "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/news?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPosts(prev => prev.filter(p => p.id !== id))
      toast({ title: 'Post deleted', description: `"${title}" has been removed.` })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete post', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="News Posts"
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
            <h2 className="text-xl font-semibold">All News Posts</h2>
          </div>
          <Link href="/admin/news/new">
            <Button className="gap-2" data-testid="button-new-post">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="mb-4">No news posts yet</p>
              <Link href="/admin/news/new">
                <Button>Create Your First Post</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <Card key={post.id} data-testid={`card-post-${post.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{post.title}</h3>
                        <Badge className={post.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'}>
                          {post.status}
                        </Badge>
                      </div>
                      {post.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{post.summary}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {post.status === 'published' && post.published_at
                          ? `Published ${new Date(post.published_at).toLocaleDateString('en-NG')}`
                          : `Created ${new Date(post.created_at).toLocaleDateString('en-NG')}`}
                        {' · '}Slug: {post.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/admin/news/${post.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-muted-foreground hover:text-foreground"
                          data-testid={`button-edit-post-${post.id}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={deletingId === post.id}
                        data-testid={`button-delete-post-${post.id}`}
                      >
                        {deletingId === post.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
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
