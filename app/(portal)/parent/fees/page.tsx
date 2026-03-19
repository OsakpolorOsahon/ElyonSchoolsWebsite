'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, CreditCard, Wallet, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react'

interface Child {
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

interface Payment {
  id: string
  amount: number
  status: string
  method: string
  reference: string
  created_at: string
  payment_type?: string
  payer_name?: string
  term?: string
  year?: number
  student_id?: string
}

const FEE_RELEVANT_TYPES = ['school_fee', 'tuition', 'pta_levy', 'books', 'uniform', 'technology_fee', 'sports_fee', 'lab_fee', 'exam_fee']

const feeTypeLabels: Record<string, string> = {
  tuition: 'Tuition',
  pta_levy: 'PTA Levy',
  books: 'Books',
  uniform: 'Uniform',
  technology_fee: 'Technology Fee',
  sports_fee: 'Sports Fee',
  lab_fee: 'Lab Fee',
  exam_fee: 'Exam Fee',
  school_fee: 'School Fees',
}

const paymentTypeLabels: Record<string, string> = {
  school_fee: 'School Fees',
  tuition: 'Tuition',
  pta_levy: 'PTA Levy',
  books: 'Books',
  uniform: 'Uniform',
  technology_fee: 'Technology Fee',
  sports_fee: 'Sports Fee',
  lab_fee: 'Lab Fee',
  exam_fee: 'Exam Fee',
  donation: 'Donation',
}

function FeesContent() {
  const searchParams = useSearchParams()
  const initialChildId = searchParams.get('child') || ''
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ full_name: string } | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>(initialChildId)
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [settings, setSettings] = useState<{ current_term: string; current_year: number } | null>(null)
  const [processing, setProcessing] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUserEmail(session.user.email || '')

      const res = await fetch('/api/parent/fees')
      if (!res.ok) { setLoading(false); return }
      const data = await res.json()

      setProfile(data.profile)
      const kids = (data.children || []) as Child[]
      setChildren(kids)
      if (kids.length > 0 && !initialChildId) setSelectedChildId(kids[0].id)
      else if (initialChildId && kids.some((k: Child) => k.id === initialChildId)) setSelectedChildId(initialChildId)
      setSettings(data.settings)
      setFeeStructures((data.feeStructures || []) as FeeStructure[])
      setPayments((data.payments || []) as Payment[])
      setLoading(false)
    }
    load()
  }, [initialChildId])

  const selectedChild = children.find(c => c.id === selectedChildId)

  const childFees = useMemo(() => {
    if (!selectedChild || !settings) return []
    return feeStructures.filter(f => f.class === selectedChild.class)
  }, [selectedChild, feeStructures, settings])

  const expectedTotal = useMemo(() => childFees.reduce((s, f) => s + Number(f.amount), 0), [childFees])

  const childPayments = useMemo(() => {
    if (!selectedChild || !settings) return []
    return payments.filter(p =>
      p.status === 'success' &&
      p.student_id === selectedChildId &&
      p.term === settings.current_term &&
      p.year === settings.current_year &&
      (FEE_RELEVANT_TYPES.includes(p.payment_type || '') || feeStructures.some(fs => fs.fee_type === p.payment_type))
    )
  }, [selectedChildId, payments, settings, feeStructures, selectedChild])

  const paidTotal = useMemo(() => childPayments.reduce((s, p) => s + Number(p.amount), 0), [childPayments])

  const outstanding = Math.max(0, expectedTotal - paidTotal)

  const status = expectedTotal === 0
    ? (paidTotal > 0 ? 'paid' : 'none')
    : outstanding <= 0
      ? 'paid'
      : paidTotal > 0
        ? 'partial'
        : 'unpaid'

  const allChildPayments = useMemo(() => {
    if (!selectedChildId) return []
    return payments.filter(p => p.student_id === selectedChildId)
  }, [selectedChildId, payments])

  const handlePayNow = () => {
    if (!selectedChild || outstanding <= 0) return

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!paystackKey) {
      toast({ title: 'Payment not configured', description: 'Please contact the school office.', variant: 'destructive' })
      return
    }

    const email = userEmail || 'parent@elyonschools.edu.ng'
    const ref = `ELYON-FEE-${selectedChild.admission_number}-${Date.now()}`

    setProcessing(true)

    const loadPaystack = () => {
      const handler = window.PaystackPop!.setup({
        key: paystackKey,
        email,
        amount: outstanding * 100,
        currency: 'NGN',
        ref,
        metadata: {
          payment_type: 'school_fee',
          student_id: selectedChild.id,
          student_name: selectedChild.profiles?.[0]?.full_name,
          admission_number: selectedChild.admission_number,
          payer_name: profile?.full_name,
        },
        callback: async (response: { reference: string }) => {
          try {
            const res = await fetch('/api/paystack/general', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reference: response.reference,
                amount: outstanding,
                payment_type: 'school_fee',
                payer_name: profile?.full_name,
                payer_email: email,
                metadata: {
                  student_id: selectedChild.id,
                  student_name: selectedChild.profiles?.[0]?.full_name,
                  admission_number: selectedChild.admission_number,
                },
              }),
            })
            if (res.ok) {
              toast({ title: 'Payment successful!', description: 'Your payment has been recorded.' })
              window.location.reload()
            } else {
              throw new Error('Verification failed')
            }
          } catch {
            toast({ title: 'Payment issue', description: 'Payment received but verification pending. Contact the school.', variant: 'destructive' })
          } finally {
            setProcessing(false)
          }
        },
        onClose: () => {
          setProcessing(false)
          toast({ title: 'Payment cancelled', description: 'You can complete payment at any time.' })
        },
      })
      handler.openIframe()
    }

    if (window.PaystackPop) {
      loadPaystack()
    } else {
      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.onload = loadPaystack
      document.head.appendChild(script)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <PortalHeader title="Fees & Payments" subtitle="Loading..." role="parent" />
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Fees & Payments"
        subtitle={`Welcome back, ${profile?.full_name || 'Parent'}`}
        role="parent"
      />

      {processing && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-background rounded-xl p-8 shadow-xl text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="font-medium">Processing payment...</p>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/parent">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <h2 className="text-xl font-semibold">Fees & Payments</h2>
          </div>
          {children.length > 1 && (
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger className="w-56" data-testid="select-child">
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {children.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.profiles?.[0]?.full_name} ({c.class})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {children.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <p>No children linked to your account.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {settings && (
              <div className="mb-4">
                <Badge variant="outline" className="text-sm" data-testid="badge-current-term">
                  {settings.current_term} Term {settings.current_year}
                </Badge>
                {selectedChild && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {selectedChild.profiles?.[0]?.full_name} — {selectedChild.class}
                  </span>
                )}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Wallet className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Expected Fees</p>
                  <p className="text-2xl font-bold" data-testid="text-expected-total">{formatAmount(expectedTotal)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600" data-testid="text-paid-total">{formatAmount(paidTotal)}</p>
                </CardContent>
              </Card>
              <Card className={outstanding > 0 ? 'border-red-200 bg-red-50/50' : ''}>
                <CardContent className="pt-6 text-center">
                  <TrendingDown className="h-8 w-8 mx-auto mb-2 text-red-500" />
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className={`text-2xl font-bold ${outstanding > 0 ? 'text-red-600' : 'text-green-600'}`} data-testid="text-outstanding">
                    {formatAmount(outstanding)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {outstanding > 0 && (
              <Card className="mb-6 border-primary/30 bg-primary/5">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-medium">Outstanding Balance: {formatAmount(outstanding)}</p>
                        <p className="text-sm text-muted-foreground">
                          Pay the outstanding balance for {selectedChild?.profiles?.[0]?.full_name} ({settings?.current_term} Term {settings?.current_year})
                        </p>
                      </div>
                    </div>
                    <Button className="gap-2" onClick={handlePayNow} data-testid="button-pay-now">
                      <CreditCard className="h-4 w-4" /> Pay Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {status === 'paid' && expectedTotal > 0 && (
              <Card className="mb-6 border-green-200 bg-green-50/50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="font-medium text-green-700">All fees paid for this term!</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {childFees.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">Fee Breakdown — {selectedChild?.class}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {childFees.map(f => (
                      <div key={f.id} className="flex justify-between py-2 border-b border-dashed last:border-0" data-testid={`fee-item-${f.id}`}>
                        <span className="text-sm">{feeTypeLabels[f.fee_type] || f.fee_type}</span>
                        <span className="text-sm font-medium">{formatAmount(Number(f.amount))}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 font-bold">
                      <span>Total</span>
                      <span>{formatAmount(expectedTotal)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment History
                  </CardTitle>
                  <Link href="/parent/payments">
                    <Button variant="outline" size="sm" data-testid="link-all-payments">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {allChildPayments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No payments recorded for this child yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allChildPayments.slice(0, 10).map(p => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0" data-testid={`payment-row-${p.id}`}>
                        <div>
                          <p className="text-sm font-medium">{paymentTypeLabels[p.payment_type || ''] || p.payment_type || 'Payment'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {' · '}{p.method?.toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{formatAmount(Number(p.amount))}</span>
                          <Link href={`/receipt/${p.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" data-testid={`button-receipt-${p.id}`}>
                              Receipt
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: Record<string, unknown>) => { openIframe: () => void }
    }
  }
}

export default function ParentFeesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/30">
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    }>
      <FeesContent />
    </Suspense>
  )
}
