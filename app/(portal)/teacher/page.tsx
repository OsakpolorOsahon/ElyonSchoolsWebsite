import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Upload,
  Calendar,
  BookOpen,
  ArrowRight,
  Clock,
  Megaphone,
} from 'lucide-react'

export const metadata = {
  title: 'Teacher Dashboard - Elyon Schools',
}

interface StudentRecord {
  id: string
  admission_number: string
  class: string
  profiles: { full_name: string } | null
}

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login?redirect=/teacher')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'teacher') redirect('/')

  const adminDb = createAdminClient()

  const { data: classAssignments } = await supabase
    .from('class_teacher')
    .select('class')
    .eq('teacher_profile_id', session.user.id)

  const assignedClasses = (classAssignments || []).map(a => (a as { class: string }).class)

  let students: StudentRecord[] = []
  if (assignedClasses.length > 0) {
    const { data } = await adminDb
      .from('students')
      .select('id, admission_number, class, profiles!profile_id(full_name)')
      .in('class', assignedClasses)
      .eq('status', 'active')
    students = (data || []) as unknown as StudentRecord[]
  }

  const classCounts = assignedClasses.map(cls => ({
    name: cls,
    students: students.filter(s => s.class === cls).length,
  }))

  const [upcomingEventsResult, announcementsResult] = await Promise.all([
    supabase
      .from('events')
      .select('title, start_ts, location')
      .gte('start_ts', new Date().toISOString())
      .order('start_ts')
      .limit(3),
    adminDb
      .from('announcements')
      .select('id, title, body, created_at')
      .eq('is_published', true)
      .in('target_audience', ['all', 'teachers'])
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const upcomingEventsData = upcomingEventsResult.data
  const announcements = announcementsResult.data

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Teacher Dashboard"
        subtitle={`Welcome back, ${profile?.full_name || 'Teacher'}`}
        role="teacher"
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <Link href="/teacher/results/upload">
            <Card className="bg-primary text-primary-foreground hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">Upload Student Results</p>
                    <p className="text-sm text-primary-foreground/80">
                      Upload grades for students in your class
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Upload className="h-6 w-6" />
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {announcements && announcements.length > 0 && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
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

        {classCounts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">My Classes</h2>
            <div className="grid gap-6 lg:grid-cols-3">
              {classCounts.map((cls) => (
                <Card key={cls.name} className="hover-elevate">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {cls.students} student{cls.students !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{cls.name}</h3>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" asChild>
                        <Link href={`/teacher/classes/${encodeURIComponent(cls.name)}`}>
                          View Students
                        </Link>
                      </Button>
                      <Button size="sm" className="flex-1" asChild>
                        <Link href={`/teacher/results/upload?class=${encodeURIComponent(cls.name)}`}>
                          Upload Results
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Students ({students.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No classes assigned yet. Contact admin.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {students.slice(0, 5).map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{s.profiles?.full_name || s.admission_number}</p>
                        <p className="text-xs text-muted-foreground">{s.class} · {s.admission_number}</p>
                      </div>
                    </div>
                  ))}
                  {students.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      +{students.length - 5} more students
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEventsData && upcomingEventsData.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEventsData.map((event: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted flex-shrink-0">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.start_ts).toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {event.location && ` · ${event.location}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
