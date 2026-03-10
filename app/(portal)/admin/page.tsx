import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Clock
} from 'lucide-react'

export const metadata = {
  title: 'Admin Dashboard - Elyon Schools',
}

const quickActions = [
  { name: 'Process Admission', icon: UserPlus, href: '/admin/admissions', description: 'Review pending applications' },
  { name: 'Upload Results', icon: Upload, href: '/admin/results', description: 'Manage student grades' },
  { name: 'Create Event', icon: Calendar, href: '/admin/events/new', description: 'Add new school event' },
  { name: 'Post News', icon: Newspaper, href: '/admin/news/new', description: 'Publish news article' },
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

  const [
    { count: pendingAdmissions },
    { count: totalStudents },
    { data: recentPayments },
    { count: upcomingEventsCount },
  ] = await Promise.all([
    adminDb.from('admissions').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
    adminDb.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    adminDb.from('payments').select('amount').eq('status', 'success'),
    adminDb.from('events').select('*', { count: 'exact', head: true }).gte('start_ts', new Date().toISOString()),
  ])

  const totalRevenue = recentPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
  const formatAmount = (n: number) =>
    n >= 1_000_000
      ? `₦${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `₦${(n / 1_000).toFixed(0)}K`
      : `₦${n}`

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

  const { data: recentPaymentsList } = await adminDb
    .from('payments')
    .select('id, amount, status, created_at, admissions(student_data)')
    .order('created_at', { ascending: false })
    .limit(4)

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
                <div className="grid gap-4 sm:grid-cols-2">
                  {quickActions.map((action) => (
                    <Link key={action.name} href={action.href}>
                      <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <action.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{action.name}</p>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
                {(recentAdmissions || []).map((admission: any) => {
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
                  {recentAdmissions.map((a: any) => {
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
              <CardTitle>Recent Payments</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/payments">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentPaymentsList && recentPaymentsList.length > 0 ? (
                <div className="space-y-3">
                  {recentPaymentsList.map((p: any) => {
                    const studentName = p.admissions?.student_data
                      ? `${p.admissions.student_data.firstName || ''} ${p.admissions.student_data.lastName || ''}`.trim()
                      : 'Unknown'
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">
                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(p.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">{studentName} · {new Date(p.created_at).toLocaleDateString('en-NG')}</p>
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
      </main>
    </div>
  )
}
