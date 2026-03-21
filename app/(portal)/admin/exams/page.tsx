'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Loader2, ArrowLeft, Plus, Trash2, BookOpen, Eye, EyeOff, Pencil } from 'lucide-react'

interface Exam {
  id: string
  name: string
  term: string
  year: number
  published: boolean
  created_at: string
}

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i)

export default function AdminExamsPage() {
  const { toast } = useToast()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({ name: '', term: '', year: String(currentYear) })
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Exam | null>(null)
  const [editForm, setEditForm] = useState({ name: '', term: '', year: String(currentYear) })
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: p } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
    setProfile(p)

    const { data } = await supabase.from('exams').select('*').order('year', { ascending: false }).order('term')
    setExams((data || []) as Exam[])
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.term || !form.year) {
      toast({ title: 'Missing fields', description: 'Please fill in all fields.', variant: 'destructive' })
      return
    }
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('exams').insert({
        name: form.name.trim(),
        term: form.term,
        year: parseInt(form.year),
        published: false,
      })
      if (error) throw error
      toast({ title: 'Exam created', description: `${form.name} has been added (unpublished).` })
      setForm({ name: '', term: '', year: String(currentYear) })
      await load()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create exam', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete exam "${name}"? This may affect existing results.`)) return
    setDeletingId(id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('exams').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Deleted', description: `Exam "${name}" has been removed.` })
      setExams(prev => prev.filter(e => e.id !== id))
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  const openEditDialog = (exam: Exam) => {
    setEditTarget(exam)
    setEditForm({ name: exam.name, term: exam.term, year: String(exam.year) })
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!editTarget) return
    if (editTarget.published) {
      toast({ title: 'Cannot edit published exam', description: 'Unpublish the exam first before making changes.', variant: 'destructive' })
      return
    }
    if (!editForm.name.trim() || !editForm.term || !editForm.year) {
      toast({ title: 'Missing fields', description: 'Please fill in all fields.', variant: 'destructive' })
      return
    }
    setEditSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('exams')
        .update({ name: editForm.name.trim(), term: editForm.term, year: parseInt(editForm.year) })
        .eq('id', editTarget.id)
      if (error) throw error
      toast({ title: 'Exam updated', description: `${editForm.name} has been saved.` })
      setEditOpen(false)
      await load()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update exam', variant: 'destructive' })
    } finally {
      setEditSaving(false)
    }
  }

  const togglePublish = async (exam: Exam) => {
    setTogglingId(exam.id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('exams')
        .update({ published: !exam.published })
        .eq('id', exam.id)
      if (error) throw error
      toast({
        title: exam.published ? 'Exam unpublished' : 'Exam published',
        description: exam.published
          ? `${exam.name} results are now hidden from students and parents.`
          : `${exam.name} results are now visible to students and parents.`,
      })
      await load()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to toggle', variant: 'destructive' })
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Manage Exams"
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
          <h2 className="text-xl font-semibold">Exams Management</h2>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Exam</CardTitle>
            <CardDescription>New exams are created as unpublished (draft). Publish when results are ready.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="name">Exam Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. First Term Examination"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  data-testid="input-exam-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Term *</Label>
                <Select value={form.term} onValueChange={v => setForm(f => ({ ...f, term: v }))}>
                  <SelectTrigger data-testid="select-exam-term">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First Term">First Term</SelectItem>
                    <SelectItem value="Second Term">Second Term</SelectItem>
                    <SelectItem value="Third Term">Third Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year *</Label>
                <Select value={form.year} onValueChange={v => setForm(f => ({ ...f, year: v }))}>
                  <SelectTrigger data-testid="select-exam-year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(y => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-3">
                <Button type="submit" disabled={isSubmitting} className="gap-2" data-testid="button-create-exam">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {isSubmitting ? 'Creating...' : 'Create Exam'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Exams ({exams.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : exams.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No exams created yet</p>
                <p className="text-sm mt-1">Create an exam above so teachers can upload results.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {exams.map(exam => (
                  <div key={exam.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg" data-testid={`exam-${exam.id}`}>
                    <div className="flex items-center gap-3">
                      {exam.published && (
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{exam.name}</p>
                          <Badge className={exam.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                            {exam.published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{exam.term} · {exam.year}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublish(exam)}
                        disabled={togglingId === exam.id}
                        className={exam.published ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}
                        data-testid={`button-toggle-${exam.id}`}
                      >
                        {togglingId === exam.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : exam.published ? (
                          <><EyeOff className="h-4 w-4 mr-1" /> Unpublish</>
                        ) : (
                          <><Eye className="h-4 w-4 mr-1" /> Publish</>
                        )}
                      </Button>
                      {!exam.published && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => openEditDialog(exam)}
                          data-testid={`button-edit-exam-${exam.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(exam.id, exam.name)}
                        disabled={deletingId === exam.id}
                        data-testid={`button-delete-exam-${exam.id}`}
                      >
                        {deletingId === exam.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-exam-name">Exam Name *</Label>
              <Input
                id="edit-exam-name"
                placeholder="e.g. First Term Examination"
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                data-testid="input-edit-exam-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Term *</Label>
              <Select value={editForm.term} onValueChange={v => setEditForm(f => ({ ...f, term: v }))}>
                <SelectTrigger data-testid="select-edit-exam-term">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Term">First Term</SelectItem>
                  <SelectItem value="Second Term">Second Term</SelectItem>
                  <SelectItem value="Third Term">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year *</Label>
              <Select value={editForm.year} onValueChange={v => setEditForm(f => ({ ...f, year: v }))}>
                <SelectTrigger data-testid="select-edit-exam-year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editSaving} data-testid="button-save-exam-edit">
              {editSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
