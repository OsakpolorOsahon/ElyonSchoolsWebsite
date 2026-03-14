'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, CreditCard } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  status: string
  method: string
  reference: string
  created_at: string
  payment_type?: string
  payer_name?: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  success: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700' },
}

const paymentTypeLabels: Record<string, string> = {
  school_fee: 'School Fees',
  donation: 'Donation',
  application_fee: 'Application Fee',
  admission_fee: 'Admission Application Fee',
}

export default function ParentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: p } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()
      setProfile(p)

      const userEmail = session.user.email || ''

      const { data: children } = await supabase
        .from('students')
        .select('id')
        .eq('parent_profile_id', session.user.id)
      const childIds = (children || []).map((c: { id: string }) => c.id)

      let allPayments: any[] = []

      const { data: directPayments } = await supabase
        .from('payments')
        .select('*')
        .or(`user_id.eq.${session.user.id},payer_email.eq.${userEmail}`)
        .order('created_at', { ascending: false })
      allPayments = directPayments || []

      if (childIds.length > 0) {
        const { data: childPayments } = await supabase
          .from('payments')
          .select('*')
          .in('student_id', childIds)
          .order('created_at', { ascending: false })

        const existingIds = new Set(allPayments.map((p: any) => p.id))
        for (const cp of (childPayments || [])) {
          if (!existingIds.has(cp.id)) {
            allPayments.push(cp)
          }
        }
        allPayments.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      }

      setPayments(allPayments)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Payment History"
        subtitle={`Welcome back, ${profile?.full_name || 'Parent'}`}
        role="parent"
      />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/parent">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <h2 className="text-xl font-semibold">All Payments</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No payment records yet</p>
              <p className="text-sm mt-2">Payments made via the school portal will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {payments.map(payment => {
              const config = statusConfig[payment.status] || statusConfig.pending
              return (
                <Card key={payment.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{formatAmount(payment.amount)}</span>
                            <Badge className={config.color}>{config.label}</Badge>
                            {payment.payment_type && (
                              <span className="text-xs text-muted-foreground">
                                {paymentTypeLabels[payment.payment_type] || payment.payment_type}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {payment.method?.toUpperCase()} · {payment.reference?.slice(0, 24)}{payment.reference?.length > 24 ? '...' : ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString('en-NG', {
                              year: 'numeric', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      {payment.status === 'success' && (
                        <div className="shrink-0">
                          <Link href={`/receipt/${payment.id}`}>
                            <Button size="sm" variant="outline" className="gap-1" data-testid={`button-receipt-${payment.id}`}>
                              <CreditCard className="h-3 w-3" /> Receipt
                            </Button>
                          </Link>
                        </div>
                      )}
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
