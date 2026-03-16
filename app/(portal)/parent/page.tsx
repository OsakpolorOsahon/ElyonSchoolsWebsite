import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  FileText,
  Bell,
  User,
  Megaphone,
  Wallet,
} from 'lucide-react'
import ParentChildSelector from '@/components/portal/ParentChildSelector'

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

  const adminDb = createAdminClient()

  const [childrenResult, upcomingEventsResult, announcementsResult] = await Promise.all([
    supabase
      .from('students')
      .select('id, admission_number, class, profiles(full_name)')
      .eq('parent_profile_id', session.user.id)
      .eq('status', 'active'),
    supabase
      .from('events')
      .select('title, start_ts')
      .gte('start_ts', new Date().toISOString())
      .order('start_ts')
      .limit(3),
    adminDb
      .from('announcements')
      .select('id, title, body, created_at')
      .eq('is_published', true)
      .in('target_audience', ['all', 'parents'])
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  interface ChildRecord {
    id: string
    admission_number: string
    class: string
    profiles: { full_name: string }[] | null
  }
  const children = (childrenResult.data || []) as ChildRecord[]
  const upcomingEvents = upcomingEventsResult.data
  const announcements = announcementsResult.data

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Parent Dashboard"
        subtitle={`Welcome back, ${profile?.full_name || 'Parent'}`}
        role="parent"
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
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

        <h2 className="text-lg font-semibold text-foreground mb-4">My Children</h2>

        {children.length > 0 ? (
          <>
            {children.length > 1 ? (
              <ParentChildSelector children={children} />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card className="hover-elevate">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">{children[0].profiles?.[0]?.full_name || 'Student'}</h3>
                        <p className="text-sm text-muted-foreground">{children[0].class}</p>
                        <p className="text-xs text-muted-foreground">{children[0].admission_number}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" asChild>
                        <Link href={`/parent/results/${encodeURIComponent(children[0].admission_number)}`}>
                          <FileText className="h-4 w-4 mr-1" />
                          Results
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" asChild>
                        <Link href={`/parent/fees?child=${children[0].id}`}>
                          <Wallet className="h-4 w-4 mr-1" />
                          Fees
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
              </div>
            )}
          </>
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
                  {upcomingEvents.map((event: { title: string; start_ts: string; category: string }, index: number) => (
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
