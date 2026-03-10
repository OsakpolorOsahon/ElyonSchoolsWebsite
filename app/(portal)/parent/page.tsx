import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  FileText,
  Bell,
  User
} from 'lucide-react'

export const metadata = {
  title: 'Parent Dashboard - Elyon Schools',
}

export default async function ParentDashboard() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login?redirect=/parent')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'parent') redirect('/')

  const { data: children } = await supabase
    .from('students')
    .select('id, admission_number, class, profiles(full_name)')
    .eq('parent_profile_id', session.user.id)

  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('title, start_ts')
    .gte('start_ts', new Date().toISOString())
    .order('start_ts')
    .limit(3)

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Parent Dashboard"
        subtitle={`Welcome back, ${profile?.full_name || 'Parent'}`}
        role="parent"
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">My Children</h2>

        {children && children.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {children.map((child: any) => (
              <Card key={child.id} className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">{child.profiles?.full_name || 'Student'}</h3>
                      <p className="text-sm text-muted-foreground">{child.class}</p>
                      <p className="text-xs text-muted-foreground">{child.admission_number}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link href={`/parent/results/${encodeURIComponent(child.admission_number)}`}>
                        <FileText className="h-4 w-4 mr-1" />
                        View Results
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link href="/parent/payments">
                        <CreditCard className="h-4 w-4 mr-1" />
                        Payments
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mb-8">
            <CardContent className="py-12 text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No children linked to your account yet.</p>
              <p className="text-sm mt-1">Please contact the school administrator.</p>
            </CardContent>
          </Card>
        )}

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
                <Link href="/parent/payments">
                  <Button variant="outline" size="sm">View Payment History</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents && upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                        <Bell className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.start_ts).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming events</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
