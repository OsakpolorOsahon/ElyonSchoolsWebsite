'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Plus, Trash2, BookMarked } from 'lucide-react'

interface Subject {
  id: string
  name: string
  code: string
}

export default function AdminSubjectsPage() {
  const { toast } = useToast()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({ name: '', code: '' })
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: p } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
    setProfile(p)

    const { data } = await supabase.from('subjects').select('*').order('name')
    setSubjects(data || [])
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim()) {
      toast({ title: 'Missing fields', description: 'Please enter both subject name and code.', variant: 'destructive' })
      return
    }
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('subjects').insert({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
      })
      if (error) {
        if (error.message?.includes('unique')) {
          throw new Error('A subject with this name or code already exists.')
        }
        throw error
      }
      toast({ title: 'Subject created', description: `${form.name} has been added.` })
      setForm({ name: '', code: '' })
      await load()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create subject', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete subject "${name}"? This may affect existing results.`)) return
    setDeletingId(id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('subjects').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Deleted', description: `Subject "${name}" has been removed.` })
      setSubjects(prev => prev.filter(s => s.id !== id))
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Manage Subjects"
        subtitle={`Welcome back, ${profile?.full_name || 'Administrator'}`}
        role="admin"
      />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <h2 className="text-xl font-semibold">Subjects Management</h2>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Subject</CardTitle>
            <CardDescription>Add a subject that teachers can upload results for</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subjectName">Subject Name *</Label>
                <Input
                  id="subjectName"
                  placeholder="e.g. Mathematics"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectCode">Subject Code *</Label>
                <Input
                  id="subjectCode"
                  placeholder="e.g. MAT"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                  maxLength={10}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {isSubmitting ? 'Adding...' : 'Add Subject'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Subjects ({subjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <BookMarked className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No subjects added yet</p>
                <p className="text-sm mt-1">Add subjects above so teachers can select them when uploading results.</p>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {subjects.map(subject => (
                  <div key={subject.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{subject.code}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(subject.id, subject.name)}
                      disabled={deletingId === subject.id}
                    >
                      {deletingId === subject.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
