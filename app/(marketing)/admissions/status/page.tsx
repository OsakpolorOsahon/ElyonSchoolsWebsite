'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Search, Loader2, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending_payment: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  pending: { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Not Successful', color: 'bg-red-100 text-red-800', icon: XCircle },
}

const classLabels: Record<string, string> = {
  creche: 'Creche',
  nursery1: 'Nursery 1',
  nursery2: 'Nursery 2',
  primary1: 'Primary 1',
  primary2: 'Primary 2',
  primary3: 'Primary 3',
  primary4: 'Primary 4',
  primary5: 'Primary 5',
  primary6: 'Primary 6',
  jss1: 'JSS 1',
  jss2: 'JSS 2',
  jss3: 'JSS 3',
  sss1: 'SSS 1',
  sss2: 'SSS 2',
  sss3: 'SSS 3',
}

interface AdmissionResult {
  id: string
  status: string
  class_applied: string
  created_at: string
  student_data: Record<string, any>
  guardian_data: Record<string, any>
  amount?: number
}

function StatusContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [lookupValue, setLookupValue] = useState(searchParams.get('id') || '')
  const [lookupType, setLookupType] = useState<'id' | 'email'>('id')
  const [results, setResults] = useState<AdmissionResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lookupValue.trim()) return

    setLoading(true)
    setSearched(false)
    try {
      const param = lookupType === 'id' ? `id=${encodeURIComponent(lookupValue.trim())}` : `email=${encodeURIComponent(lookupValue.trim())}`
      const res = await fetch(`/api/admissions?${param}`)
      const data = await res.json()

      if (!res.ok || !data.results) {
        setResults([])
      } else {
        setResults(data.results)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch status. Please try again.', variant: 'destructive' })
      setResults([])
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 bg-muted/30 flex-1">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Check Application Status</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Track the progress of your admission application using your Application ID or the guardian's email address.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Look Up Application</CardTitle>
            <CardDescription>Enter your Application ID or guardian email address below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={lookupType === 'id' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setLookupType('id'); setLookupValue(''); setResults([]); setSearched(false) }}
                >
                  Application ID
                </Button>
                <Button
                  type="button"
                  variant={lookupType === 'email' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setLookupType('email'); setLookupValue(''); setResults([]); setSearched(false) }}
                >
                  Email Address
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lookup">
                  {lookupType === 'id' ? 'Application ID' : "Guardian's Email Address"}
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="lookup"
                    type={lookupType === 'email' ? 'email' : 'text'}
                    placeholder={lookupType === 'id' ? 'e.g. a1b2c3d4-e5f6-...' : 'e.g. parent@email.com'}
                    value={lookupValue}
                    onChange={e => setLookupValue(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button type="submit" disabled={loading || !lookupValue.trim()} className="gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Search
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {searched && results.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No application found</p>
              <p className="text-sm mt-1">
                Please check your {lookupType === 'id' ? 'Application ID' : 'email address'} and try again.
              </p>
              <Link href="/admissions/apply" className="mt-6 inline-block">
                <Button variant="outline">Start a New Application</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{results.length === 1 ? 'Application Found' : `${results.length} Applications Found`}</h2>
            {results.map((admission) => {
              const cfg = statusConfig[admission.status] || { label: admission.status, color: 'bg-gray-100 text-gray-800', icon: Clock }
              const StatusIcon = cfg.icon
              const studentName = `${admission.student_data?.firstName || ''} ${admission.student_data?.lastName || ''}`.trim()
              const appliedDate = new Date(admission.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
              return (
                <Card key={admission.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{studentName || 'Applicant'}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Class Applied: <span className="font-medium">{classLabels[admission.class_applied] || admission.class_applied}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Application Date: <span className="font-medium">{appliedDate}</span>
                        </p>
                      </div>
                      <Badge className={`${cfg.color} flex items-center gap-1.5 px-3 py-1.5 text-sm`}>
                        <StatusIcon className="h-4 w-4" />
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-xs text-muted-foreground font-mono">Application ID: {admission.id}</p>
                    </div>
                    {admission.status === 'pending_payment' && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        Your application is awaiting payment. Please complete the application fee to proceed.
                        <div className="mt-2">
                          <Link href={`/admissions/payment?id=${admission.id}&amount=${admission.amount || 50000}&email=${encodeURIComponent(admission.guardian_data?.email || '')}`}>
                            <Button size="sm" className="mt-1">Complete Payment</Button>
                          </Link>
                        </div>
                      </div>
                    )}
                    {admission.status === 'approved' && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                        Congratulations! Your application has been approved. The school will contact you with further instructions.
                      </div>
                    )}
                    {admission.status === 'rejected' && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                        We regret to inform you that this application was not successful. Please contact us for more information.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <div className="mt-10 text-center text-sm text-muted-foreground">
          Having trouble? <Link href="/contact" className="text-primary hover:underline">Contact our admissions team</Link>
        </div>
    </main>
  )
}

export default function AdmissionsStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <StatusContent />
    </Suspense>
  )
}
