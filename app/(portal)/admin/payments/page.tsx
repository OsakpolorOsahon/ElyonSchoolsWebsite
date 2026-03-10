'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, CreditCard, TrendingUp } from 'lucide-react'

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
  admissions: { class_applied: string; student_data: Record<string, any> } | null
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
  donation: { label: 'Donation', color: 'bg-yellow-100 text-yellow-700' },
}

const filterOptions = ['All', 'Admission Fee', 'School Fee', 'Donation']

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [activeFilter, setActiveFilter] = useState('All')

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
      setProfile(p)

      const { data } = await supabase
        .from('payments')
        .select('*, admissions(class_applied, student_data)')
        .order('created_at', { ascending: false })

      setPayments(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const totalRevenue = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0)

  const filterMap: Record<string, string[]> = {
    'Admission Fee': ['admission_fee', 'application_fee'],
    'School Fee': ['school_fee'],
    'Donation': ['donation'],
  }

  const filtered = activeFilter === 'All'
    ? payments
    : payments.filter(p => filterMap[activeFilter]?.includes(p.payment_type || ''))

  const getDisplayName = (payment: Payment): string => {
    if (payment.payer_name) return payment.payer_name
    if (payment.admissions?.student_data) {
      const { firstName, lastName } = payment.admissions.student_data
      const name = `${firstName || ''} ${lastName || ''}`.trim()
      if (name) return name
    }
    if (payment.payer_email) return payment.payer_email
    return 'N/A'
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Payments"
        subtitle={`Welcome back, ${profile?.full_name || 'Administrator'}`}
        role="admin"
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <h2 className="text-xl font-semibold">Payment Records</h2>
        </div>

        <Card className="mb-6 bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-foreground/10 rounded-full">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-primary-foreground/80">Total Revenue Collected</p>
                <p className="text-3xl font-bold">{formatAmount(totalRevenue)}</p>
                <p className="text-sm text-primary-foreground/80">{payments.filter(p => p.status === 'success').length} successful payments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 mb-4 flex-wrap">
          {filterOptions.map(f => (
            <Button
              key={f}
              variant={activeFilter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{payments.length === 0 ? 'No payment records yet' : 'No payments match this filter'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(payment => {
              const statusCfg = statusConfig[payment.status] || statusConfig.pending
              const typeCfg = payment.payment_type
                ? (paymentTypeConfig[payment.payment_type] || { label: payment.payment_type, color: 'bg-gray-100 text-gray-700' })
                : null
              const displayName = getDisplayName(payment)
              return (
                <Card key={payment.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{formatAmount(payment.amount)}</span>
                            <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                            {typeCfg && (
                              <Badge className={typeCfg.color}>{typeCfg.label}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {displayName} · {payment.method?.toUpperCase()} · Ref: {payment.reference?.slice(0, 20)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
