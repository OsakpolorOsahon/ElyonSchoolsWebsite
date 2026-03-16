import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  Calendar,
  FileText,
  UserPlus,
  Upload,
  Newspaper,
  ArrowRight,
  Clock,
  Megaphone,
  Camera,
  UserCog,
  BookOpen,
  Settings,
  Banknote,
  CheckCircle,
  XCircle,
  ClipboardList,
} from 'lucide-react'

export const metadata = {
  title: 'Admin Dashboard - Elyon Schools',
}

const quickActions = [
  { name: 'Process Admissions', icon: UserPlus, href: '/admin/admissions', description: 'Review pending applications' },
  { name: 'Manage Exams', icon: Upload, href: '/admin/exams', description: 'Create & manage exams' },
  { name: 'Manage Subjects', icon: GraduationCap, href: '/admin/subjects', description: 'Create & manage subjects' },
  { name: 'Announcements', icon: Megaphone, href: '/admin/announcements', description: 'Manage announcements' },
  { name: 'Gallery', icon: Camera, href: '/admin/gallery', description: 'Manage school gallery' },
  { name: 'Post News', icon: Newspaper, href: '/admin/news/new', description: 'Publish news article' },
  { name: 'Create Event', icon: Calendar, href: '/admin/events/new', description: 'Add new school event' },
  { name: 'Manage Users', icon: UserCog, href: '/admin/users', description: 'Roles & invitations' },
  { name: 'All Students', icon: Users, href: '/admin/students', description: 'View & enrol students' },
  { name: 'Fee Structures', icon: Banknote, href: '/admin/fee-structures', description: 'Manage term fees by class' },
  { name: 'Staff Profiles', icon: UserCog, href: '/admin/staff', description: 'Teacher bios & qualifications' },
  { name: 'Class Teachers', icon: BookOpen, href: '/admin/class-teachers', description: 'Assign teachers to classes' },
  { name: 'Settings', icon: Settings, href: '/admin/settings', description: 'Academic term & school config' },
]

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login?redirect=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const adminDb = createAdminClient()
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: pendingAdmissions },
    { count: totalStudents },
    { data: allPayments },
    { count: upcomingEventsCount },
    { count: newPaymentsCount },
    { data: recentPaymentsList },
    latestExamResult,
    resultsDataResult,
  ] = await Promise.all([
    adminDb.from('admissions').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
    adminDb.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    adminDb.from('payments').select('amount').eq('status', 'success'),
    adminDb.from('events').select('*', { count: 'exact', head: true }).gte('start_ts', now.toISOString()),
    adminDb.from('payments').select('*', { count: 'exact', head: true }).gte('created_at', yesterday),
    adminDb.from('payments')
      .select('id, amount, status, created_at, reference, payment_type, payer_name, admissions(student_data)')
      .order('created_at', { ascending: false })
      .limit(5),
    adminDb.from('exams').select('id, name, term, year').order('year', { ascending: false }).order('created_at', { ascending: false }).limit(1).single(),
    adminDb.from('student_results').select('student_id, students!inner(class)'),
  ])

  const ALL_CLASSES = [
    'Nursery 1', 'Nursery 2',
    'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
    'JSS 1', 'JSS 2', 'JSS 3',
    'SSS 1', 'SSS 2', 'SSS 3',
  ]

  let latestExam: { id: string; name: string; term: string; year: number } | null = latestExamResult.data
  let classStatuses: { class: string; hasResults: boolean }[] = []

  if (latestExam) {
    const { data: examResults } = await adminDb
      .from('student_results')
      .select('student_id, students!inner(class)')
      .eq('exam_id', latestExam.id)

    const classesWithResults = new Set<string>()
    for (const r of (examResults || [])) {
      const studentClass = (r as unknown as { student_id: string; students: { class: string }[] }).students?.[0]?.class
      if (studentClass) classesWithResults.add(studentClass)
    }
    classStatuses = ALL_CLASSES.map(cls => ({ class: cls, hasResults: classesWithResults.has(cls) }))
  }

  const totalRevenue = allPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
  const formatAmount = (n: number) =>
    n >= 1_000_000
      ? `₦${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `₦${(n / 1_000).toFixed(0)}K`
      : `₦${n}`
  const formatAmountFull = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n)

  const stats = [
    { name: 'Pending Admissions', value: String(pendingAdmissions ?? 0), icon: FileText, href: '/admin/admissions', color: 'text-orange-500' },
    { name: 'Active Students', value: String(totalStudents ?? 0), icon: GraduationCap, href: '/admin/students', color: 'text-primary' },
    { name: 'Total Revenue', value: formatAmount(totalRevenue), icon: CreditCard, href: '/admin/payments', color: 'text-green-500' },
    { name: 'Upcoming Events', value: String(upcomingEventsCount ?? 0), icon: Calendar, href: '/admin/events', color: 'text-blue-500' },
  ]

  const { data: recentAdmissions } = await adminDb
    .from('admissions')
    .select('id, student_data, class_applied, status, created_at')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Admin Dashboard"
        subtitle={`Welcome back, ${profile?.full_name || 'Administrator'}`}
        role="admin"
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.name} href={stat.href}>
              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.name}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {quickActions.map((action) => (
                    <Link key={action.name} href={action.href}>
                      <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                          <action.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{action.name}</p>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(recentAdmissions || []).map((admission: { id: string; student_data: Record<string, string> | null; class_applied: string; status: string; created_at: string }) => {
                  const name = `${admission.student_data?.firstName || ''} ${admission.student_data?.lastName || ''}`.trim()
                  return (
                    <div key={admission.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted flex-shrink-0">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-foreground">New application: {name || 'Applicant'}</p>
                        <p className="text-xs text-muted-foreground">{new Date(admission.created_at).toLocaleDateString('en-NG')}</p>
                      </div>
                    </div>
                  )
                })}
                {(!recentAdmissions || recentAdmissions.length === 0) && (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Admissions</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/admissions">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentAdmissions && recentAdmissions.length > 0 ? (
                <div className="space-y-3">
                  {recentAdmissions.map((a: { id: string; student_data: Record<string, string> | null; class_applied: string; status: string; created_at: string }) => {
                    const name = `${a.student_data?.firstName || ''} ${a.student_data?.lastName || ''}`.trim()
                    return (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{name || 'Applicant'}</p>
                          <p className="text-xs text-muted-foreground">{a.class_applied} · {a.status}</p>
                        </div>
                        <Link href="/admin/admissions">
                          <Button size="sm" variant="outline">Review</Button>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending admissions</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Recent Payments</CardTitle>
                {(newPaymentsCount ?? 0) > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
                    {newPaymentsCount} new
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/payments">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentPaymentsList && recentPaymentsList.length > 0 ? (
                <div className="space-y-3">
                  {recentPaymentsList.map((p: { id: string; amount: number; status: string; created_at: string; reference: string; payment_type: string; payer_name: string | null; admissions: { student_data: Record<string, string> | null } | null }) => {
                    const isNew = new Date(p.created_at) > new Date(yesterday)
                    const studentName = p.payer_name
                      || (p.admissions?.student_data
                        ? `${p.admissions.student_data.firstName || ''} ${p.admissions.student_data.lastName || ''}`.trim()
                        : null)
                      || 'Unknown'
                    const typeLabel: Record<string, string> = {
                      school_fee: 'School Fee',
                      donation: 'Donation',
                      admission_fee: 'Admission Fee',
                      application_fee: 'Application Fee',
                    }
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{formatAmountFull(p.amount)}</p>
                            {isNew && <Badge className="bg-green-100 text-green-700 text-xs">New</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {studentName} · {typeLabel[p.payment_type] || 'Payment'} · {new Date(p.created_at).toLocaleDateString('en-NG')}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {p.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payments yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {latestExam && classStatuses.length > 0 && (
          <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Results Submission Status
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {latestExam.name} — {latestExam.term} Term {latestExam.year}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> Submitted</span>
                <span className="flex items-center gap-1"><XCircle className="h-4 w-4 text-gray-300" /> Pending</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-3" data-testid="grid-results-status">
                {classStatuses.map(cs => (
                  <Link key={cs.class} href={`/admin/students?class=${encodeURIComponent(cs.class)}`}>
                    <div
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-colors cursor-pointer ${
                        cs.hasResults
                          ? 'bg-green-50 border-green-200 hover:bg-green-100'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      data-testid={`cell-results-${cs.class.replace(/\s/g, '-')}`}
                    >
                      {cs.hasResults ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300 mb-1" />
                      )}
                      <span className="text-xs font-medium">{cs.class}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
