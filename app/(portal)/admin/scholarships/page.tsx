'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Award, Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight } from 'lucide-react'

interface ScholarshipStudent {
  admission_number: string
  class: string
  profiles: { full_name: string } | null
}

interface Scholarship {
  id: string
  student_id: string
  name: string
  coverage_type: 'full' | 'percentage' | 'fixed'
  coverage_value: number
  fee_types: string[] | null
  applies_to_term: string | null
  applies_to_year: number | null
  active: boolean
  notes: string | null
  created_at: string
  students: ScholarshipStudent | null
}

interface StudentRecord {
  id: string
  admission_number: string
  class: string
  profiles: { full_name: string } | null
}

const FEE_TYPE_OPTIONS = [
  { value: 'tuition', label: 'Tuition' },
  { value: 'pta_levy', label: 'PTA Levy' },
  { value: 'books', label: 'Books' },
  { value: 'uniform', label: 'Uniform' },
  { value: 'technology_fee', label: 'Technology Fee' },
  { value: 'sports_fee', label: 'Sports Fee' },
  { value: 'lab_fee', label: 'Lab Fee' },
  { value: 'exam_fee', label: 'Exam Fee' },
  { value: 'school_fee', label: 'School Fee (General)' },
]

const TERMS = ['First', 'Second', 'Third']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 1 + i)

function coverageLabel(s: Scholarship): string {
  if (s.coverage_type === 'full') return '100% (Full)'
  if (s.coverage_type === 'percentage') return `${s.coverage_value}%`
  return `₦${Number(s.coverage_value).toLocaleString()} fixed`
}

function scopeLabel(s: Scholarship): string {
  if (!s.fee_types || s.fee_types.length === 0) return 'All fees'
  return s.fee_types.map(t => FEE_TYPE_OPTIONS.find(o => o.value === t)?.label || t).join(', ')
}

const BLANK_FORM = {
  student_id: '',
  name: '',
  coverage_type: 'percentage' as 'full' | 'percentage' | 'fixed',
  coverage_value: '',
  fee_types: [] as string[],
  applies_to_term: '',
  applies_to_year: '',
  notes: '',
}

export default function AdminScholarshipsPage() {
  const { toast } = useToast()
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ full_name: string } | null>(null)
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Scholarship | null>(null)
  const [form, setForm] = useState(BLANK_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function loadData() {
    const [schRes, studRes] = await Promise.all([
      fetch('/api/admin/scholarships'),
      fetch('/api/admin/students'),
    ])
    const schData = await schRes.json()
    const studData = await studRes.json()
    setScholarships((schData.scholarships || []) as Scholarship[])
    setStudents((studData.students || []) as StudentRecord[])
  }

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const profileRes = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
      setProfile(profileRes.data)
      await loadData()
      setLoading(false)
    }
    load()
  }, [])

  function openCreate() {
    setEditTarget(null)
    setForm(BLANK_FORM)
    setDialogOpen(true)
  }

  function openEdit(s: Scholarship) {
    setEditTarget(s)
    setForm({
      student_id: s.student_id,
      name: s.name,
      coverage_type: s.coverage_type,
      coverage_value: String(s.coverage_value),
      fee_types: s.fee_types || [],
      applies_to_term: s.applies_to_term || '',
      applies_to_year: s.applies_to_year ? String(s.applies_to_year) : '',
      notes: s.notes || '',
    })
    setDialogOpen(true)
  }

  function toggleFeeType(type: string) {
    setForm(f => ({
      ...f,
      fee_types: f.fee_types.includes(type)
        ? f.fee_types.filter(t => t !== type)
        : [...f.fee_types, type],
    }))
  }

  async function handleSave() {
    if (!form.student_id || !form.name.trim() || !form.coverage_type) {
      toast({ title: 'Missing fields', description: 'Student, scholarship name, and coverage type are required.', variant: 'destructive' })
      return
    }
    const val = parseFloat(form.coverage_value)
    if (form.coverage_type !== 'full' && (isNaN(val) || val <= 0)) {
      toast({ title: 'Invalid value', description: 'Enter a valid coverage value greater than 0.', variant: 'destructive' })
      return
    }
    if (form.coverage_type === 'percentage' && val > 100) {
      toast({ title: 'Invalid percentage', description: 'Percentage cannot exceed 100.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        student_id: form.student_id,
        name: form.name.trim(),
        coverage_type: form.coverage_type,
        coverage_value: form.coverage_type === 'full' ? 100 : val,
        fee_types: form.fee_types.length > 0 ? form.fee_types : [],
        applies_to_term: form.applies_to_term || null,
        applies_to_year: form.applies_to_year || null,
        notes: form.notes.trim() || null,
      }

      let res: Response
      if (editTarget) {
        res = await fetch('/api/admin/scholarships', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editTarget.id, ...payload }),
        })
      } else {
        res = await fetch('/api/admin/scholarships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: editTarget ? 'Scholarship updated' : 'Scholarship created', description: `"${payload.name}" has been saved.` })
      setDialogOpen(false)
      await loadData()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to save', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(s: Scholarship) {
    if (!confirm(`Delete scholarship "${s.name}" for ${s.students?.profiles?.full_name || 'this student'}?\n\nThis action cannot be undone.`)) return
    setDeletingId(s.id)
    try {
      const res = await fetch(`/api/admin/scholarships?id=${s.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Deleted', description: `Scholarship "${s.name}" removed.` })
      await loadData()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to delete', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  async function handleToggleActive(s: Scholarship) {
    setTogglingId(s.id)
    try {
      const res = await fetch('/api/admin/scholarships', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, active: !s.active }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: s.active ? 'Scholarship deactivated' : 'Scholarship activated', description: `"${s.name}" is now ${s.active ? 'inactive' : 'active'}.` })
      await loadData()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to update', variant: 'destructive' })
    } finally {
      setTogglingId(null)
    }
  }

  const filtered = scholarships.filter(s => {
    const q = search.toLowerCase()
    const nameMatch = s.name.toLowerCase().includes(q)
    const studentMatch = s.students?.profiles?.full_name?.toLowerCase().includes(q) || false
    const admMatch = s.students?.admission_number?.toLowerCase().includes(q) || false
    const textMatch = !q || nameMatch || studentMatch || admMatch
    const activeMatch = filterActive === 'all' || (filterActive === 'active' ? s.active : !s.active)
    return textMatch && activeMatch
  })

  const counts = {
    all: scholarships.length,
    active: scholarships.filter(s => s.active).length,
    inactive: scholarships.filter(s => !s.active).length,
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Scholarships"
        subtitle={`Welcome back, ${profile?.full_name || 'Administrator'}`}
        role="admin"
      />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <h2 className="text-xl font-semibold">Scholarships &amp; Awards</h2>
          </div>
          <Button onClick={openCreate} className="gap-2" data-testid="button-add-scholarship">
            <Plus className="h-4 w-4" />
            Add Scholarship
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <Button
              key={f}
              variant={filterActive === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterActive(f)}
              data-testid={`filter-${f}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </Button>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by student name, admission number, or scholarship name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="input-search-scholarships"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="mb-4">{scholarships.length === 0 ? 'No scholarships created yet' : 'No results match your search'}</p>
              {scholarships.length === 0 && (
                <Button onClick={openCreate} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" /> Create First Scholarship
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => (
              <Card key={s.id} data-testid={`card-scholarship-${s.id}`}>
                <CardContent className="py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{s.name}</p>
                          <Badge className={s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                            {s.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {s.students?.profiles?.full_name || 'Unknown Student'}
                          {' · '}{s.students?.admission_number}
                          {' · '}{s.students?.class}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          <Badge variant="outline" className="text-xs">
                            {coverageLabel(s)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {scopeLabel(s)}
                          </Badge>
                          {(s.applies_to_term || s.applies_to_year) && (
                            <Badge variant="outline" className="text-xs">
                              {[s.applies_to_term, s.applies_to_year].filter(Boolean).join(' ')} term only
                            </Badge>
                          )}
                        </div>
                        {s.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{s.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleToggleActive(s)}
                        disabled={togglingId === s.id}
                        data-testid={`button-toggle-${s.id}`}
                      >
                        {togglingId === s.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : s.active ? (
                          <ToggleRight className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-3.5 w-3.5" />
                        )}
                        {s.active ? 'Active' : 'Inactive'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(s)}
                        data-testid={`button-edit-scholarship-${s.id}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(s)}
                        disabled={deletingId === s.id}
                        data-testid={`button-delete-scholarship-${s.id}`}
                      >
                        {deletingId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Scholarship' : 'Add Scholarship'}</DialogTitle>
            <DialogDescription>
              Assign a scholarship or fee waiver to a student.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Student *</Label>
              <Select
                value={form.student_id}
                onValueChange={v => setForm(f => ({ ...f, student_id: v }))}
                disabled={!!editTarget}
              >
                <SelectTrigger data-testid="select-scholarship-student">
                  <SelectValue placeholder="Select student..." />
                </SelectTrigger>
                <SelectContent>
                  {students
                    .filter(s => s.profiles?.full_name)
                    .sort((a, b) => (a.profiles?.full_name || '').localeCompare(b.profiles?.full_name || ''))
                    .map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.profiles?.full_name} — {s.admission_number} ({s.class})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scholarship-name">Scholarship Name *</Label>
              <Input
                id="scholarship-name"
                placeholder="e.g. Academic Excellence Award, Founder's Scholarship"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                data-testid="input-scholarship-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Coverage Type *</Label>
                <Select
                  value={form.coverage_type}
                  onValueChange={v => setForm(f => ({ ...f, coverage_type: v as 'full' | 'percentage' | 'fixed', coverage_value: v === 'full' ? '100' : '' }))}
                >
                  <SelectTrigger data-testid="select-coverage-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full (100%)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₦)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.coverage_type !== 'full' && (
                <div className="space-y-2">
                  <Label>
                    {form.coverage_type === 'percentage' ? 'Percentage (%)' : 'Amount (₦)'} *
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max={form.coverage_type === 'percentage' ? 100 : undefined}
                    step={form.coverage_type === 'percentage' ? 1 : 500}
                    placeholder={form.coverage_type === 'percentage' ? '50' : '25000'}
                    value={form.coverage_value}
                    onChange={e => setForm(f => ({ ...f, coverage_value: e.target.value }))}
                    data-testid="input-coverage-value"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Applies To (leave all unchecked for all fees)</Label>
              <div className="flex flex-wrap gap-2 border rounded-md p-3">
                {FEE_TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleFeeType(opt.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      form.fee_types.includes(opt.value)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                    }`}
                    data-testid={`fee-type-toggle-${opt.value}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {form.fee_types.length === 0
                  ? 'Will apply to all fee types'
                  : `Applies only to: ${form.fee_types.map(t => FEE_TYPE_OPTIONS.find(o => o.value === t)?.label || t).join(', ')}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Restrict to Term</Label>
                <Select
                  value={form.applies_to_term || '__all__'}
                  onValueChange={v => setForm(f => ({ ...f, applies_to_term: v === '__all__' ? '' : v }))}
                >
                  <SelectTrigger data-testid="select-applies-term">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All terms</SelectItem>
                    {TERMS.map(t => (
                      <SelectItem key={t} value={t}>{t} Term</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Restrict to Year</Label>
                <Select
                  value={form.applies_to_year || '__all__'}
                  onValueChange={v => setForm(f => ({ ...f, applies_to_year: v === '__all__' ? '' : v }))}
                >
                  <SelectTrigger data-testid="select-applies-year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All years</SelectItem>
                    {YEARS.map(y => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Optional notes about this scholarship..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                data-testid="input-scholarship-notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} data-testid="button-save-scholarship">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editTarget ? 'Save Changes' : 'Create Scholarship'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
