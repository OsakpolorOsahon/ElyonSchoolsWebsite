'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Plus, Trash2, BookMarked, Pencil } from 'lucide-react'

interface Subject {
  id: string
  name: string
  code: string
  applicable_classes: string[]
  applicable_departments: string[]
}

const ALL_CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
]

const DEPARTMENTS = ['Science', 'Commercial', 'Art']

export default function AdminSubjectsPage() {
  const { toast } = useToast()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({ name: '', code: '' })
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [editTarget, setEditTarget] = useState<Subject | null>(null)
  const [editClasses, setEditClasses] = useState<string[]>([])
  const [editDepts, setEditDepts] = useState<string[]>([])
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

    const { data } = await supabase.from('subjects').select('*').order('name')
    setSubjects((data || []) as Subject[])
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

  function openEdit(subject: Subject) {
    setEditTarget(subject)
    setEditClasses(subject.applicable_classes || [])
    setEditDepts(subject.applicable_departments || [])
  }

  function toggleClass(cls: string) {
    setEditClasses(prev => prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls])
  }

  function toggleDept(dept: string) {
    setEditDepts(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept])
  }

  async function handleEditSave() {
    if (!editTarget) return
    setEditSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('subjects')
        .update({
          applicable_classes: editClasses,
          applicable_departments: editDepts,
        })
        .eq('id', editTarget.id)
      if (error) throw error
      toast({ title: 'Subject updated', description: `Applicability for ${editTarget.name} saved.` })
      setEditTarget(null)
      await load()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update', variant: 'destructive' })
    } finally {
      setEditSaving(false)
    }
  }

  function getApplicabilityLabel(subject: Subject): string {
    const classes = subject.applicable_classes || []
    const depts = subject.applicable_departments || []
    if (classes.length === 0 && depts.length === 0) return 'All classes'
    const parts: string[] = []
    if (classes.length > 0) parts.push(`${classes.length} class${classes.length > 1 ? 'es' : ''}`)
    if (depts.length > 0) parts.push(depts.join(', '))
    return parts.join(' · ')
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
                  data-testid="input-subject-name"
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
                  data-testid="input-subject-code"
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={isSubmitting} className="gap-2" data-testid="button-add-subject">
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
            <CardDescription>Click Edit to assign which classes and departments each subject applies to</CardDescription>
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
                  <div key={subject.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg" data-testid={`subject-${subject.id}`}>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{subject.code}</p>
                      <p className="text-xs text-muted-foreground mt-1">{getApplicabilityLabel(subject)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(subject)}
                        data-testid={`button-edit-${subject.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(subject.id, subject.name)}
                        disabled={deletingId === subject.id}
                        data-testid={`button-delete-${subject.id}`}
                      >
                        {deletingId === subject.id
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

      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            <div>
              <Label className="text-sm font-medium mb-3 block">Applicable Classes</Label>
              <p className="text-xs text-muted-foreground mb-3">Leave all unchecked = applies to all classes</p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_CLASSES.map(cls => (
                  <label key={cls} className="flex items-center gap-2 text-sm cursor-pointer p-1.5 rounded hover:bg-muted/50">
                    <Checkbox
                      checked={editClasses.includes(cls)}
                      onCheckedChange={() => toggleClass(cls)}
                      data-testid={`checkbox-class-${cls}`}
                    />
                    {cls}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Applicable Departments (SSS only)</Label>
              <p className="text-xs text-muted-foreground mb-3">Leave all unchecked = applies to all departments</p>
              <div className="space-y-2">
                {DEPARTMENTS.map(dept => (
                  <label key={dept} className="flex items-center gap-2 text-sm cursor-pointer p-1.5 rounded hover:bg-muted/50">
                    <Checkbox
                      checked={editDepts.includes(dept)}
                      onCheckedChange={() => toggleDept(dept)}
                      data-testid={`checkbox-dept-${dept}`}
                    />
                    {dept}
                  </label>
                ))}
              </div>
            </div>

            {editClasses.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">
                  Selected: {editClasses.join(', ')}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editSaving} data-testid="button-save-applicability">
              {editSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
