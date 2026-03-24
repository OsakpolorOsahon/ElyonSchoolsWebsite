import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  FileText,
  Clock,
  User,
  BookOpen,
  Trophy,
  Megaphone,
  Wallet,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'

export const metadata = {
  title: 'Student Dashboard - Elyon Schools',
}

const FEE_RELEVANT_TYPES = ['school_fee', 'tuition', 'pta_levy', 'books', 'uniform', 'technology_fee', 'sports_fee', 'lab_fee', 'exam_fee']

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login?redirect=/student')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'student') redirect('/')

  const adminDb = createAdminClient()

  const { data: studentRecord } = await supabase
    .from('students')
    .select('id, admission_number, class, gender')
    .eq('profile_id', session.user.id)
    .single()

  const [resultsResult, eventsResult, announcementsResult, settingsResult] = await Promise.all([
    studentRecord
      ? supabase
          .from('student_results')
          .select('score, grade, subjects(name), exams!inner(name, term, year, published)')
          .eq('student_id', studentRecord.id)
          .eq('exams.published', true)
          .order('created_at', { ascending: false })
          .limit(6)
      : Promise.resolve({ data: [] }),
    supabase
      .from('events')
      .select('title, start_ts, category')
      .gte('start_ts', new Date().toISOString())
      .order('start_ts')
      .limit(3),
    adminDb
      .from('announcements')
      .select('id, title, body, created_at')
      .eq('is_published', true)
      .in('target_audience', ['all', 'students'])
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('academic_settings')
      .select('current_term, current_year')
      .eq('singleton_key', true)
      .single(),
  ])

  const results = resultsResult.data
  const upcomingEvents = eventsResult.data
  const announcements = announcementsResult.data
  const settings = settingsResult.data

  const average = results && results.length > 0
    ? results.reduce((sum: number, r: { score: number }) => sum + r.score, 0) / results.length
    : null

  let feeExpected = 0
  let feePaid = 0
  let feeStatus: 'paid' | 'partial' | 'unpaid' | 'none' = 'none'

  if (studentRecord && settings) {
    const { data: fees } = await adminDb
      .from('fee_structures')
      .select('amount')
      .eq('class', studentRecord.class)
      .eq('term', settings.current_term)
      .eq('year', settings.current_year)

    feeExpected = (fees || []).reduce((s: number, f: { amount: number }) => s + Number(f.amount), 0)

    const { data: payments } = await adminDb
      .from('payments')
      .select('amount, payment_type')
      .eq('student_id', studentRecord.id)
      .eq('status', 'success')
      .eq('term', settings.current_term)
      .eq('year', settings.current_year)

    const feePayments = (payments || []).filter((p: { amount: number; payment_type: string }) => FEE_RELEVANT_TYPES.includes(p.payment_type || ''))
    feePaid = feePayments.reduce((s: number, p: { amount: number; payment_type: string }) => s + Number(p.amount), 0)

    if (feeExpected === 0) {
      feeStatus = feePaid > 0 ? 'paid' : 'none'
    } else if (feeExpected - feePaid <= 0) {
      feeStatus = 'paid'
    } else if (feePaid > 0) {
      feeStatus = 'partial'
    } else {
      feeStatus = 'unpaid'
    }
  }

  const feeOutstanding = Math.max(0, feeExpected - feePaid)

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n)

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Student Dashboard"
        subtitle={`Welcome back, ${profile?.full_name || 'Student'}`}
        role="student"
      />

      <main className="mx-auto max-w-7xl px-6 py-8 animate-fade-up">
        {announcements && announcements.length > 0 && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                School Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {announcements.map((ann: { id: string; title: string; body: string; created_at: string }) => (
                <div key={ann.id} className="border-l-4 border-primary pl-3">
                  <p className="font-medium text-sm">{ann.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{ann.body}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(ann.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3 mb-8 stagger-children">
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{profile?.full_name || 'Student'}</h3>
                {studentRecord ? (
                  <>
                    <p className="text-muted-foreground">{studentRecord.class}</p>
                    <p className="text-sm text-muted-foreground">{studentRecord.admission_number}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No student record linked yet</p>
                )}

                {average !== null && (
                  <div className="mt-6 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Recent Average</p>
                    <p className="text-2xl font-bold text-primary">{average.toFixed(1)}%</p>
                  </div>
                )}

                <Button className="w-full mt-4" asChild>
                  <Link href="/student/results">
                    <FileText className="h-4 w-4 mr-2" />
                    View Full Results
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results && results.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(results as any[]).map((result, index: number) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{result.subjects?.name || 'Subject'}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          result.grade === 'A' ? 'bg-green-100 text-green-700' :
                          result.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {result.grade || 'N/A'}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${result.score}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{result.score}/100</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No results uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {studentRecord && settings && feeExpected > 0 && (
          <Card className={`mb-8 ${feeStatus === 'paid' ? 'border-green-200' : feeStatus === 'partial' ? 'border-amber-200' : 'border-red-200'}`} data-testid="card-fee-status">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Fee Status — {settings.current_term} Term {settings.current_year}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3 mb-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Expected</p>
                  <p className="text-lg font-bold" data-testid="text-fee-expected">{formatAmount(feeExpected)}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Paid</p>
                  <p className="text-lg font-bold text-green-600" data-testid="text-fee-paid">{formatAmount(feePaid)}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
                  <p className={`text-lg font-bold ${feeOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`} data-testid="text-fee-outstanding">
                    {formatAmount(feeOutstanding)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {feeStatus === 'paid' && (
                  <Badge className="bg-green-100 text-green-700 gap-1" data-testid="badge-fee-status">
                    <CheckCircle className="h-3 w-3" /> Fully Paid
                  </Badge>
                )}
                {feeStatus === 'partial' && (
                  <Badge className="bg-amber-100 text-amber-700 gap-1" data-testid="badge-fee-status">
                    <AlertTriangle className="h-3 w-3" /> Partially Paid
                  </Badge>
                )}
                {feeStatus === 'unpaid' && (
                  <Badge className="bg-red-100 text-red-700 gap-1" data-testid="badge-fee-status">
                    <AlertTriangle className="h-3 w-3" /> Unpaid
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground ml-2">
                  Contact your parent/guardian to make payments.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {upcomingEvents.map((event: { title: string; start_ts: string; category: string }, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.start_ts).toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-accent/20 text-accent-foreground rounded-full">
                        {event.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming events</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
