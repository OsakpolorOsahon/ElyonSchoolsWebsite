'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Plus, Trash2, Pencil, Banknote } from 'lucide-react'

interface FeeStructure {
  id: string
  class: string
  term: string
  year: number
  fee_type: string
  amount: number
  created_at: string
}

const ALL_CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
]

const TERMS = ['First', 'Second', 'Third']

const FEE_TYPES: { value: string; label: string }[] = [
  { value: 'tuition', label: 'Tuition' },
  { value: 'pta_levy', label: 'PTA Levy' },
  { value: 'books', label: 'Books' },
  { value: 'uniform', label: 'Uniform' },
  { value: 'technology_fee', label: 'Technology Fee' },
  { value: 'sports_fee', label: 'Sports Fee' },
  { value: 'lab_fee', label: 'Lab Fee' },
  { value: 'exam_fee', label: 'Exam Fee' },
]

const FEE_TYPE_LABELS: Record<string, string> = Object.fromEntries(FEE_TYPES.map(f => [f.value, f.label]))

export default function FeeStructuresPage() {
  const { toast } = useToast()
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ full_name: string } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    class: '',
    term: 'First',
    year: new Date().getFullYear(),
    fee_type: 'tuition',
    amount: '',
    custom_fee_type: '',
  })
  const [classFilter, setClassFilter] = useState('all')
  const [termFilter, setTermFilter] = useState('all')

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n)

  async function fetchData() {
    const res = await fetch('/api/admin/fee-structures')
    const data = await res.json()
    setFeeStructures(data.fee_structures || [])
  }

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
      setProfile(p)
      await fetchData()
      setLoading(false)
    }
    load()
  }, [])

  function openAddDialog() {
    setEditId(null)
    setForm({ class: '', term: 'First', year: new Date().getFullYear(), fee_type: 'tuition', amount: '', custom_fee_type: '' })
    setDialogOpen(true)
  }

  function openEditDialog(fs: FeeStructure) {
    const isKnown = FEE_TYPES.some(t => t.value === fs.fee_type)
    setEditId(fs.id)
    setForm({
      class: fs.class,
      term: fs.term,
      year: fs.year,
      fee_type: isKnown ? fs.fee_type : '__custom__',
      amount: String(fs.amount),
      custom_fee_type: isKnown ? '' : fs.fee_type,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    const resolvedFeeType = form.fee_type === '__custom__' ? form.custom_fee_type.trim().toLowerCase().replace(/\s+/g, '_') : form.fee_type
    if (!form.class || !form.term || !form.year || !resolvedFeeType || !form.amount) {
      toast({ title: 'Missing fields', description: 'All fields are required.', variant: 'destructive' })
      return
    }
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid amount', description: 'Amount must be a positive number.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/fee-structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editId || undefined,
          class: form.class,
          term: form.term,
          year: form.year,
          fee_type: resolvedFeeType,
          amount,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const displayLabel = FEE_TYPE_LABELS[resolvedFeeType] || resolvedFeeType
      toast({ title: editId ? 'Fee updated' : 'Fee added', description: `${displayLabel} fee for ${form.class} saved.` })
      setDialogOpen(false)
      await fetchData()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this fee structure entry?')) return
    try {
      const res = await fetch(`/api/admin/fee-structures?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast({ title: 'Deleted', description: 'Fee structure entry removed.' })
      await fetchData()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    }
  }

  const filtered = feeStructures.filter(fs => {
    if (classFilter !== 'all' && fs.class !== classFilter) return false
    if (termFilter !== 'all' && `${fs.term} ${fs.year}` !== termFilter) return false
    return true
  })

  const termOptions = Array.from(new Set(feeStructures.map(fs => `${fs.term} ${fs.year}`))).sort().reverse()

  const groupedByClass = filtered.reduce((acc, fs) => {
    if (!acc[fs.class]) acc[fs.class] = []
    acc[fs.class].push(fs)
    return acc
  }, {} as Record<string, FeeStructure[]>)

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Fee Structures"
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
            <h2 className="text-xl font-semibold">Fee Structures</h2>
          </div>
          <Button onClick={openAddDialog} className="gap-2" data-testid="button-add-fee">
            <Plus className="h-4 w-4" />
            Add Fee
          </Button>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-44" data-testid="filter-class">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {ALL_CLASSES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={termFilter} onValueChange={setTermFilter}>
            <SelectTrigger className="w-44" data-testid="filter-term">
              <SelectValue placeholder="All Terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Terms</SelectItem>
              {termOptions.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Banknote className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{feeStructures.length === 0 ? 'No fee structures defined yet' : 'No fees match your filter'}</p>
              {feeStructures.length === 0 && (
                <Button onClick={openAddDialog} variant="outline" className="mt-4 gap-2">
                  <Plus className="h-4 w-4" /> Add First Fee Structure
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByClass).map(([cls, fees]) => {
              const total = fees.reduce((s, f) => s + Number(f.amount), 0)
              return (
                <Card key={cls}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{cls}</CardTitle>
                      <Badge variant="outline" className="font-mono">{formatAmount(total)} total</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {fees.map(fs => (
                        <div key={fs.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg" data-testid={`fee-${fs.id}`}>
                          <div>
                            <span className="font-medium">{FEE_TYPE_LABELS[fs.fee_type] || fs.fee_type}</span>
                            <span className="text-sm text-muted-foreground ml-2">({fs.term} {fs.year})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-primary">{formatAmount(Number(fs.amount))}</span>
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(fs)} data-testid={`button-edit-${fs.id}`}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(fs.id)} data-testid={`button-delete-${fs.id}`}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Fee Structure' : 'Add Fee Structure'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select value={form.class} onValueChange={v => setForm(f => ({ ...f, class: v }))}>
                <SelectTrigger data-testid="input-class">
                  <SelectValue placeholder="Select class..." />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CLASSES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Term *</Label>
                <Select value={form.term} onValueChange={v => setForm(f => ({ ...f, term: v }))}>
                  <SelectTrigger data-testid="input-term">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TERMS.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year *</Label>
                <Input
                  type="number"
                  value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) || 0 }))}
                  data-testid="input-year"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fee Type *</Label>
              <Select value={form.fee_type} onValueChange={v => setForm(f => ({ ...f, fee_type: v }))}>
                <SelectTrigger data-testid="input-fee-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEE_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                  <SelectItem value="__custom__">Other (custom)</SelectItem>
                </SelectContent>
              </Select>
              {form.fee_type === '__custom__' && (
                <Input
                  placeholder="e.g. Registration Fee"
                  value={form.custom_fee_type}
                  onChange={e => setForm(f => ({ ...f, custom_fee_type: e.target.value }))}
                  className="mt-2"
                  data-testid="input-custom-fee-type"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Amount (₦) *</Label>
              <Input
                type="number"
                min="0"
                step="100"
                placeholder="e.g. 45000"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                data-testid="input-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving} data-testid="button-save-fee">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editId ? 'Update' : 'Add Fee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
