import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  GraduationCap, 
  CreditCard, 
  FileText,
  Bell,
  ArrowRight,
  User
} from 'lucide-react'

export const metadata = {
  title: 'Parent Dashboard - Elyon Schools',
}

const children = [
  { 
    name: 'Amara Okonkwo', 
    class: 'SSS 2A', 
    admissionNumber: 'ELY/2022/0234',
    lastResult: '78%',
    outstandingFees: '₦200,000'
  },
  { 
    name: 'Chidi Okonkwo', 
    class: 'Primary 4A', 
    admissionNumber: 'ELY/2023/0567',
    lastResult: '85%',
    outstandingFees: '₦0'
  },
]

const announcements = [
  { title: 'School Resumes January 8, 2025', date: 'December 1, 2024' },
  { title: 'Second Term Fees Due by January 15', date: 'November 28, 2024' },
  { title: 'Parent-Teacher Meeting Scheduled', date: 'November 25, 2024' },
]

export default async function ParentDashboard() {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login?redirect=/parent')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'parent') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Parent Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name || 'Parent'}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">View Website</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">My Children</h2>
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {children.map((child) => (
            <Card key={child.admissionNumber} className="hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{child.name}</h3>
                    <p className="text-sm text-muted-foreground">{child.class}</p>
                    <p className="text-xs text-muted-foreground">{child.admissionNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Last Term Result</p>
                    <p className="text-lg font-bold text-primary">{child.lastResult}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Outstanding Fees</p>
                    <p className={`text-lg font-bold ${child.outstandingFees === '₦0' ? 'text-green-600' : 'text-orange-500'}`}>
                      {child.outstandingFees}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href={`/parent/results/${child.admissionNumber}`}>
                      <FileText className="h-4 w-4 mr-1" />
                      View Results
                    </Link>
                  </Button>
                  {child.outstandingFees !== '₦0' && (
                    <Button size="sm" className="flex-1" asChild>
                      <Link href={`/payments?student=${child.admissionNumber}`}>
                        <CreditCard className="h-4 w-4 mr-1" />
                        Pay Fees
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment History
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/parent/payments">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Connect to Supabase to view payment history</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{announcement.title}</p>
                      <p className="text-xs text-muted-foreground">{announcement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
