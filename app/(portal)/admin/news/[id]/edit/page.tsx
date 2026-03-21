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

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function EditNewsPostPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    body: '',
    summary: '',
    status: 'draft',
  })

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/admin/news')
      const data = await res.json()
      const post = (data.posts || []).find((p: any) => p.id === id)
      if (!post) {
        toast({ title: 'Post not found', variant: 'destructive' })
        router.push('/admin/news')
        return
      }
      setFormData({
        title: post.title,
        slug: post.slug,
        body: post.body || '',
        summary: post.summary || '',
        status: post.status || 'draft',
      })
      setLoading(false)
    }
    load()
  }, [id])

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({ ...prev, title }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.slug || !formData.body) {
      toast({ title: 'Missing fields', description: 'Title, slug, and body are required.', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/news', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...formData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Post updated!', description: `"${formData.title}" has been saved.` })
      router.push('/admin/news')
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update post', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <PortalHeader title="Edit News Post" subtitle="Update article" role="admin" />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader title="Edit News Post" subtitle="Update article" role="admin" />

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/news">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to News
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit News Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                  required
                  data-testid="input-news-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={e => setFormData(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                  placeholder="post-url-slug"
                  required
                  data-testid="input-news-slug"
                />
                <p className="text-xs text-muted-foreground">Must be unique. Changing this may break existing links.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief summary shown on news listing page"
                  rows={2}
                  data-testid="input-news-summary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Content *</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Full article content..."
                  rows={12}
                  required
                  data-testid="input-news-body"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger data-testid="select-news-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting} className="gap-2" data-testid="button-save-news">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link href="/admin/news">
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
