import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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

const stats = [
  { name: 'Pending Admissions', value: '12', icon: FileText, href: '/admin/admissions', color: 'text-orange-500' },
  { name: 'Active Students', value: '1,543', icon: GraduationCap, href: '/admin/students', color: 'text-primary' },
  { name: 'Total Revenue', value: '₦45.2M', icon: CreditCard, href: '/admin/payments', color: 'text-green-500' },
  { name: 'Upcoming Events', value: '5', icon: Calendar, href: '/admin/events', color: 'text-blue-500' },
]

const quickActions = [
  { name: 'Process Admission', icon: UserPlus, href: '/admin/admissions', description: 'Review pending applications' },
  { name: 'Upload Results', icon: Upload, href: '/admin/results', description: 'Manage student grades' },
  { name: 'Create Event', icon: Calendar, href: '/admin/events/new', description: 'Add new school event' },
  { name: 'Post News', icon: Newspaper, href: '/admin/news/new', description: 'Publish news article' },
]

const recentActivity = [
  { type: 'admission', message: 'New admission application from Adaeze Okonkwo', time: '5 minutes ago' },
  { type: 'payment', message: 'Payment of ₦200,000 received from Mr. Chukwu', time: '1 hour ago' },
  { type: 'result', message: 'First term results uploaded by Mrs. Adebayo', time: '2 hours ago' },
  { type: 'event', message: 'Cultural Day event created for February 10', time: '3 hours ago' },
  { type: 'news', message: 'News article published: Science Competition Winners', time: '5 hours ago' },
]

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login?redirect=/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name || 'Administrator'}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">View Website</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.name} href={stat.href}>
              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.name}</p>
                      <p className="text-3xl font-bold text-foreground" data-testid={`text-stat-${stat.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        {stat.value}
                      </p>
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
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted flex-shrink-0">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
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
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Connect to Supabase to view pending admissions</p>
              </div>
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
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Connect to Supabase to view recent payments</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
