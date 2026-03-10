'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'

export default function NewAnnouncementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    target_audience: 'all',
    is_published: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.body) {
      toast({ title: 'Missing fields', description: 'Title and body are required.', variant: 'destructive' })
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Announcement created!', description: `"${formData.title}" has been saved.` })
      router.push('/admin/announcements')
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader title="New Announcement" subtitle="Broadcast to your school community" role="admin" />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/announcements">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="Announcement title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message *</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={e => setFormData(p => ({ ...p, body: e.target.value }))}
                  placeholder="Write your announcement here..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select
                  value={formData.target_audience}
                  onValueChange={v => setFormData(p => ({ ...p, target_audience: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone (All Users)</SelectItem>
                    <SelectItem value="parents">Parents Only</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="teachers">Teachers Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 py-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={v => setFormData(p => ({ ...p, is_published: v }))}
                />
                <Label htmlFor="is_published" className="cursor-pointer">
                  Publish immediately
                  <span className="block text-xs text-muted-foreground font-normal">
                    Unpublished announcements are saved as drafts
                  </span>
                </Label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isSubmitting ? 'Saving...' : 'Create Announcement'}
                </Button>
                <Link href="/admin/announcements">
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
