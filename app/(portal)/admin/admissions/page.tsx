'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, CheckCircle, XCircle, Clock, Filter } from 'lucide-react'

type AdmissionStatus = 'pending_payment' | 'processing' | 'accepted' | 'rejected'

interface Admission {
  id: string
  student_data: Record<string, any>
  guardian_data: Record<string, any>
  class_applied: string
  status: AdmissionStatus
  amount: number
  paystack_reference: string | null
  created_at: string
}

const statusConfig: Record<AdmissionStatus, { label: string; color: string; icon: any }> = {
  pending_payment: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Loader2 },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function AdminAdmissionsPage() {
  const { toast } = useToast()
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [profile, setProfile] = useState<any>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: p } = await supabase.from('profiles').select('full_name, role').eq('id', session.user.id).single()
      setProfile(p)
      await fetchAdmissions()
    }
    load()
  }, [])

  const fetchAdmissions = async (status?: string) => {
    setLoading(true)
    const url = status && status !== 'all' ? `/api/admin/admissions?status=${status}` : '/api/admin/admissions'
    const res = await fetch(url)
    const data = await res.json()
    setAdmissions(data.admissions || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: AdmissionStatus) => {
    setUpdating(id)
    const res = await fetch('/api/admin/admissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      setAdmissions(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      toast({ title: 'Status updated', description: `Application marked as ${status}` })
    } else {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    }
    setUpdating(null)
  }

  const handleFilter = (status: string) => {
    setFilterStatus(status)
    fetchAdmissions(status)
  }

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Admissions"
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
          <h2 className="text-xl font-semibold">All Admission Applications</h2>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending_payment', 'processing', 'accepted', 'rejected'].map(s => (
            <Button
              key={s}
              variant={filterStatus === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilter(s)}
            >
              {s === 'all' ? 'All' : statusConfig[s as AdmissionStatus]?.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : admissions.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No admissions found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {admissions.map(admission => {
              const config = statusConfig[admission.status]
              const IconComp = config.icon
              const studentName = `${admission.student_data.firstName || ''} ${admission.student_data.lastName || ''}`.trim()
              return (
                <Card key={admission.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{studentName}</h3>
                          <Badge className={config.color}>
                            <IconComp className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <span>Class: <strong className="text-foreground">{admission.class_applied}</strong></span>
                          <span>Guardian: <strong className="text-foreground">{admission.guardian_data.firstName} {admission.guardian_data.lastName}</strong></span>
                          <span>Email: <strong className="text-foreground">{admission.guardian_data.email}</strong></span>
                          <span>Fee: <strong className="text-foreground">{formatAmount(admission.amount)}</strong></span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Applied: {new Date(admission.created_at).toLocaleDateString('en-NG')}
                          {admission.paystack_reference && ` • Ref: ${admission.paystack_reference}`}
                        </p>
                      </div>
                      {admission.status === 'processing' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="gap-1 bg-green-600 hover:bg-green-700"
                            onClick={() => updateStatus(admission.id, 'accepted')}
                            disabled={updating === admission.id}
                          >
                            {updating === admission.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => updateStatus(admission.id, 'rejected')}
                            disabled={updating === admission.id}
                          >
                            {updating === admission.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                            Reject
                          </Button>
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
