'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { PaymentReceiptModal } from '@/components/portal/PaymentReceiptModal'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, CreditCard, TrendingUp, Plus, Download, Search, Banknote } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  status: string
  method: string
  reference: string
  created_at: string
  payment_type?: string
  payer_name?: string
  payer_email?: string
  student_id?: string
  notes?: string
  term?: string
  year?: number
  admissions: { class_applied: string; student_data: Record<string, unknown> } | null
}

interface Student {
  id: string
  admission_number: string
  class: string
  profiles: { full_name: string } | null
}

interface FeeStructure {
  id: string
  class: string
  term: string
  year: number
  fee_type: string
  amount: number
}

interface AcademicSettings {
  current_term: string
  current_year: number
}

interface OutstandingRow {
  student: Student
  expected: number
  paid: number
  balance: number
  status: 'paid' | 'partial' | 'unpaid'
}

const statusConfig: Record<string, { label: string; color: string }> = {
  success: { label: 'Success', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700' },
}

const paymentTypeConfig: Record<string, { label: string; color: string }> = {
  admission_fee: { label: 'Admission Fee', color: 'bg-blue-100 text-blue-700' },
  application_fee: { label: 'Application Fee', color: 'bg-blue-100 text-blue-700' },
  school_fee: { label: 'School Fee', color: 'bg-green-100 text-green-700' },
  tuition: { label: 'Tuition', color: 'bg-green-100 text-green-700' },
  pta_levy: { label: 'PTA Levy', color: 'bg-purple-100 text-purple-700' },
  books: { label: 'Books', color: 'bg-orange-100 text-orange-700' },
  uniform: { label: 'Uniform', color: 'bg-teal-100 text-teal-700' },
  technology_fee: { label: 'Technology Fee', color: 'bg-indigo-100 text-indigo-700' },
  sports_fee: { label: 'Sports Fee', color: 'bg-lime-100 text-lime-700' },
  lab_fee: { label: 'Lab Fee', color: 'bg-cyan-100 text-cyan-700' },
  exam_fee: { label: 'Exam Fee', color: 'bg-rose-100 text-rose-700' },
  donation: { label: 'Donation', color: 'bg-yellow-100 text-yellow-700' },
}

const FEE_RELEVANT_TYPES = ['school_fee', 'tuition', 'pta_levy', 'books', 'uniform', 'technology_fee', 'sports_fee', 'lab_fee', 'exam_fee']

const filterOptions = ['All', 'Admission Fee', 'School Fee', 'Donation', 'Offline']

const ALL_CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
]

export default function AdminPaymentsPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [settings, setSettings] = useState<AcademicSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ full_name: string } | null>(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [activeTab, setActiveTab] = useState<'records' | 'outstanding'>('records')

  const [offlineDialogOpen, setOfflineDialogOpen] = useState(false)
  const [offlineSaving, setOfflineSaving] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [offlineForm, setOfflineForm] = useState({
    student_id: '',
    amount: '',
    payment_type: 'school_fee',
    method: 'cash',
    reference: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  })

  const [outstandingSearch, setOutstandingSearch] = useState('')
  const [outstandingClassFilter, setOutstandingClassFilter] = useState('all')
  const [outstandingStatusFilter, setOutstandingStatusFilter] = useState('all')

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
      setProfile(p)

      const [paymentsRes, studentsRes, feesRes, settingsRes] = await Promise.all([
        supabase.from('payments').select('*, admissions(class_applied, student_data)').order('created_at', { ascending: false }),
        supabase.from('students').select('id, admission_number, class, profiles(full_name)').eq('status', 'active').order('admission_number'),
        supabase.from('fee_structures').select('*'),
        supabase.from('academic_settings').select('current_term, current_year').eq('singleton_key', true).single(),
      ])

      setPayments(paymentsRes.data || [])
      setStudents((studentsRes.data || []) as unknown as Student[])
      setFeeStructures((feesRes.data || []) as FeeStructure[])
      setSettings(settingsRes.data as AcademicSettings | null)
      setLoading(false)
    }
    load()
  }, [])

  const totalRevenue = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const filterMap: Record<string, string[]> = {
    'Admission Fee': ['admission_fee', 'application_fee'],
    'School Fee': ['school_fee'],
    'Donation': ['donation'],
  }

  const filteredPayments = useMemo(() => {
    if (activeFilter === 'All') return payments
    if (activeFilter === 'Offline') return payments.filter(p => p.method === 'cash' || p.method === 'bank_transfer')
    return payments.filter(p => filterMap[activeFilter]?.includes(p.payment_type || ''))
  }, [payments, activeFilter])

  const getDisplayName = (payment: Payment): string => {
    if (payment.payer_name) return payment.payer_name
    if (payment.admissions?.student_data) {
      const sd = payment.admissions.student_data as Record<string, string>
      const name = `${sd.firstName || ''} ${sd.lastName || ''}`.trim()
      if (name) return name
    }
    if (payment.payer_email) return payment.payer_email
    return 'N/A'
  }

  const outstandingRows: OutstandingRow[] = useMemo(() => {
    if (!settings) return []
    const { current_term, current_year } = settings
    const termFees = feeStructures.filter(f => f.term === current_term && f.year === current_year)
    const feeByClass: Record<string, number> = {}
    for (const f of termFees) {
      feeByClass[f.class] = (feeByClass[f.class] || 0) + Number(f.amount)
    }

    const feePayments = payments.filter(p =>
      p.status === 'success' &&
      p.student_id &&
      FEE_RELEVANT_TYPES.includes(p.payment_type || '')
    )
    const paidByStudent: Record<string, number> = {}
    for (const p of feePayments) {
      if (p.term === current_term && p.year === current_year && p.student_id) {
        paidByStudent[p.student_id] = (paidByStudent[p.student_id] || 0) + Number(p.amount)
      }
    }

    return students.map(student => {
      const expected = feeByClass[student.class] || 0
      const paid = paidByStudent[student.id] || 0
      const balance = expected - paid
      let status: 'paid' | 'partial' | 'unpaid' = 'unpaid'
      if (expected > 0 && balance <= 0) status = 'paid'
      else if (paid > 0 && balance > 0) status = 'partial'
      return { student, expected, paid, balance: Math.max(0, balance), status }
    }).filter(r => r.expected > 0)
  }, [students, feeStructures, payments, settings])

  const filteredOutstanding = useMemo(() => {
    const q = outstandingSearch.toLowerCase()
    return outstandingRows.filter(r => {
      if (outstandingClassFilter !== 'all' && r.student.class !== outstandingClassFilter) return false
      if (outstandingStatusFilter !== 'all' && r.status !== outstandingStatusFilter) return false
      if (q) {
        const name = r.student.profiles?.full_name?.toLowerCase() || ''
        const adm = r.student.admission_number.toLowerCase()
        if (!name.includes(q) && !adm.includes(q)) return false
      }
      return true
    })
  }, [outstandingRows, outstandingSearch, outstandingClassFilter, outstandingStatusFilter])

  const outstandingStats = useMemo(() => ({
    total: outstandingRows.length,
    paid: outstandingRows.filter(r => r.status === 'paid').length,
    partial: outstandingRows.filter(r => r.status === 'partial').length,
    unpaid: outstandingRows.filter(r => r.status === 'unpaid').length,
    totalExpected: outstandingRows.reduce((s, r) => s + r.expected, 0),
    totalPaid: outstandingRows.reduce((s, r) => s + r.paid, 0),
    totalBalance: outstandingRows.reduce((s, r) => s + r.balance, 0),
  }), [outstandingRows])

  function openOfflineDialog(preselectedStudentId?: string) {
    setOfflineForm({
      student_id: preselectedStudentId || '',
      amount: '',
      payment_type: 'school_fee',
      method: 'cash',
      reference: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    })
    setStudentSearch('')
    setOfflineDialogOpen(true)
  }

  async function handleOfflineSave() {
    if (!offlineForm.student_id || !offlineForm.amount || !offlineForm.payment_type) {
      toast({ title: 'Missing fields', description: 'Student, amount, and payment type are required.', variant: 'destructive' })
      return
    }
    const amount = parseFloat(offlineForm.amount)
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid amount', description: 'Amount must be a positive number.', variant: 'destructive' })
      return
    }
    setOfflineSaving(true)
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...offlineForm,
          amount,
          term: settings?.current_term || null,
          year: settings?.current_year || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Payment recorded', description: 'Offline payment has been saved successfully.' })
      setOfflineDialogOpen(false)

      const supabase = createClient()
      const { data: refreshed } = await supabase.from('payments').select('*, admissions(class_applied, student_data)').order('created_at', { ascending: false })
      setPayments(refreshed || [])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setOfflineSaving(false)
    }
  }

  function downloadCSV() {
    const headers = ['Student Name', 'Admission No', 'Class', 'Expected (₦)', 'Paid (₦)', 'Balance (₦)', 'Status']
    const rows = filteredOutstanding.map(r => [
      r.student.profiles?.full_name || 'Unknown',
      r.student.admission_number,
      r.student.class,
      r.expected.toFixed(2),
      r.paid.toFixed(2),
      r.balance.toFixed(2),
      r.status.toUpperCase(),
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `outstanding_fees_${settings?.current_term || ''}_${settings?.current_year || ''}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredStudentList = useMemo(() => {
    if (!studentSearch) return students.slice(0, 20)
    const q = studentSearch.toLowerCase()
    return students.filter(s =>
      s.profiles?.full_name?.toLowerCase().includes(q) ||
      s.admission_number.toLowerCase().includes(q)
    ).slice(0, 20)
  }, [students, studentSearch])

  const feeStatusColor: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-amber-100 text-amber-700',
    unpaid: 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Payments"
        subtitle={`Welcome back, ${profile?.full_name || 'Administrator'}`}
        role="admin"
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <h2 className="text-xl font-semibold">Payments</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/fee-structures">
              <Button variant="outline" className="gap-2" data-testid="button-fee-structures">
                <Banknote className="h-4 w-4" />
                Fee Structures
              </Button>
            </Link>
            <Button onClick={() => openOfflineDialog()} className="gap-2" data-testid="button-record-payment">
              <Plus className="h-4 w-4" />
              Record Offline Payment
            </Button>
          </div>
        </div>

        <Card className="mb-6 bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-foreground/10 rounded-full">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-primary-foreground/80">Total Revenue Collected</p>
                <p className="text-3xl font-bold" data-testid="text-total-revenue">{formatAmount(totalRevenue)}</p>
                <p className="text-sm text-primary-foreground/80">{payments.filter(p => p.status === 'success').length} successful payments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 mb-6 border-b">
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 ${activeTab === 'records' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
            onClick={() => setActiveTab('records')}
            data-testid="tab-records"
          >
            Payment Records
          </Button>
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 ${activeTab === 'outstanding' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
            onClick={() => setActiveTab('outstanding')}
            data-testid="tab-outstanding"
          >
            Outstanding Fees
            {outstandingStats.unpaid + outstandingStats.partial > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">{outstandingStats.unpaid + outstandingStats.partial}</Badge>
            )}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activeTab === 'records' ? (
          <>
            <div className="flex gap-2 mb-4 flex-wrap">
              {filterOptions.map(f => (
                <Button
                  key={f}
                  variant={activeFilter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(f)}
                  data-testid={`filter-${f.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {f}
                </Button>
              ))}
            </div>

            {filteredPayments.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>{payments.length === 0 ? 'No payment records yet' : 'No payments match this filter'}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredPayments.map(payment => {
                  const statusCfg = statusConfig[payment.status] || statusConfig.pending
                  const typeCfg = payment.payment_type
                    ? (paymentTypeConfig[payment.payment_type] || { label: payment.payment_type, color: 'bg-gray-100 text-gray-700' })
                    : null
                  const displayName = getDisplayName(payment)
                  const isOffline = payment.method === 'cash' || payment.method === 'bank_transfer'
                  return (
                    <Card key={payment.id} data-testid={`payment-${payment.id}`}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <CreditCard className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold">{formatAmount(Number(payment.amount))}</span>
                                <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                                {typeCfg && <Badge className={typeCfg.color}>{typeCfg.label}</Badge>}
                                {isOffline && <Badge className="bg-purple-100 text-purple-700">Offline</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {displayName} · {payment.method?.toUpperCase()} · Ref: {payment.reference?.slice(0, 20)}{(payment.reference?.length || 0) > 20 ? '...' : ''}
                              </p>
                              {payment.notes && (
                                <p className="text-xs text-muted-foreground italic">Note: {payment.notes}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {new Date(payment.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          {payment.status === 'success' && (
                            <div className="shrink-0">
                              <PaymentReceiptModal payment={{
                                ...payment,
                                student_name: payment.student_id ? (students.find(s => s.id === payment.student_id)?.profiles?.full_name || payment.payer_name) : payment.payer_name,
                                admission_number: payment.student_id ? students.find(s => s.id === payment.student_id)?.admission_number : undefined,
                              }} />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {settings && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground">Expected</p>
                    <p className="text-lg font-bold text-primary">{formatAmount(outstandingStats.totalExpected)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground">Collected</p>
                    <p className="text-lg font-bold text-green-600">{formatAmount(outstandingStats.totalPaid)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                    <p className="text-lg font-bold text-red-600">{formatAmount(outstandingStats.totalBalance)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground">Current Term</p>
                    <p className="text-lg font-bold">{settings.current_term} {settings.current_year}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by name or admission number..."
                  value={outstandingSearch}
                  onChange={e => setOutstandingSearch(e.target.value)}
                  data-testid="input-outstanding-search"
                />
              </div>
              <Select value={outstandingClassFilter} onValueChange={setOutstandingClassFilter}>
                <SelectTrigger className="w-40" data-testid="filter-outstanding-class">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {ALL_CLASSES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={outstandingStatusFilter} onValueChange={setOutstandingStatusFilter}>
                <SelectTrigger className="w-36" data-testid="filter-outstanding-status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({outstandingStats.total})</SelectItem>
                  <SelectItem value="paid">Paid ({outstandingStats.paid})</SelectItem>
                  <SelectItem value="partial">Partial ({outstandingStats.partial})</SelectItem>
                  <SelectItem value="unpaid">Unpaid ({outstandingStats.unpaid})</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2" onClick={downloadCSV} data-testid="button-download-csv">
                <Download className="h-4 w-4" />
                CSV
              </Button>
            </div>

            {filteredOutstanding.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <Banknote className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>{outstandingRows.length === 0
                    ? 'No fee structures defined for this term. Add fee structures first.'
                    : 'No students match your filter.'}</p>
                  {outstandingRows.length === 0 && (
                    <Link href="/admin/fee-structures">
                      <Button variant="outline" className="mt-4 gap-2">
                        <Banknote className="h-4 w-4" /> Manage Fee Structures
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredOutstanding.map(row => (
                  <Card key={row.student.id} data-testid={`outstanding-${row.student.id}`}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{row.student.profiles?.full_name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{row.student.admission_number} · {row.student.class}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 flex-wrap">
                          <div className="text-right text-sm">
                            <p className="text-muted-foreground">Expected: <span className="font-medium text-foreground">{formatAmount(row.expected)}</span></p>
                            <p className="text-muted-foreground">Paid: <span className="font-medium text-green-600">{formatAmount(row.paid)}</span></p>
                            {row.balance > 0 && (
                              <p className="text-muted-foreground">Balance: <span className="font-bold text-red-600">{formatAmount(row.balance)}</span></p>
                            )}
                          </div>
                          <Badge className={feeStatusColor[row.status]}>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</Badge>
                          {row.balance > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => openOfflineDialog(row.student.id)}
                              data-testid={`button-pay-${row.student.id}`}
                            >
                              <Plus className="h-3 w-3" /> Record
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Dialog open={offlineDialogOpen} onOpenChange={setOfflineDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Offline Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Student *</Label>
              <Input
                placeholder="Search student by name or admission number..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                data-testid="input-student-search"
              />
              {(studentSearch || !offlineForm.student_id) && (
                <div className="max-h-32 overflow-y-auto border rounded-md">
                  {filteredStudentList.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${offlineForm.student_id === s.id ? 'bg-primary/10 font-medium' : ''}`}
                      onClick={() => {
                        setOfflineForm(f => ({ ...f, student_id: s.id }))
                        setStudentSearch(s.profiles?.full_name || s.admission_number)
                      }}
                      data-testid={`select-student-${s.id}`}
                    >
                      {s.profiles?.full_name || 'Unknown'} ({s.admission_number} · {s.class})
                    </button>
                  ))}
                  {filteredStudentList.length === 0 && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">No students found</p>
                  )}
                </div>
              )}
              {offlineForm.student_id && !studentSearch && (
                <p className="text-xs text-muted-foreground">
                  Selected: {students.find(s => s.id === offlineForm.student_id)?.profiles?.full_name || 'Unknown'}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (₦) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="e.g. 45000"
                  value={offlineForm.amount}
                  onChange={e => setOfflineForm(f => ({ ...f, amount: e.target.value }))}
                  data-testid="input-offline-amount"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Type *</Label>
                <Select value={offlineForm.payment_type} onValueChange={v => setOfflineForm(f => ({ ...f, payment_type: v }))}>
                  <SelectTrigger data-testid="input-offline-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school_fee">School Fee</SelectItem>
                    <SelectItem value="tuition">Tuition</SelectItem>
                    <SelectItem value="pta_levy">PTA Levy</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="uniform">Uniform</SelectItem>
                    <SelectItem value="technology_fee">Technology Fee</SelectItem>
                    <SelectItem value="sports_fee">Sports Fee</SelectItem>
                    <SelectItem value="lab_fee">Lab Fee</SelectItem>
                    <SelectItem value="exam_fee">Exam Fee</SelectItem>
                    <SelectItem value="donation">Donation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Method *</Label>
                <Select value={offlineForm.method} onValueChange={v => setOfflineForm(f => ({ ...f, method: v }))}>
                  <SelectTrigger data-testid="input-offline-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={offlineForm.date}
                  onChange={e => setOfflineForm(f => ({ ...f, date: e.target.value }))}
                  data-testid="input-offline-date"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Receipt/Reference Number</Label>
              <Input
                placeholder="Optional reference number"
                value={offlineForm.reference}
                onChange={e => setOfflineForm(f => ({ ...f, reference: e.target.value }))}
                data-testid="input-offline-reference"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Optional notes about this payment..."
                value={offlineForm.notes}
                onChange={e => setOfflineForm(f => ({ ...f, notes: e.target.value }))}
                data-testid="input-offline-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleOfflineSave} disabled={offlineSaving} data-testid="button-save-offline">
              {offlineSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
