import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  FileText,
  Clock,
  User,
  BookOpen,
  Trophy
} from 'lucide-react'

export const metadata = {
  title: 'Student Dashboard - Elyon Schools',
}

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

  const { data: studentRecord } = await supabase
    .from('students')
    .select('id, admission_number, class, gender')
    .eq('profile_id', session.user.id)
    .single()

  const { data: results } = studentRecord
    ? await supabase
        .from('student_results')
        .select('score, grade, subjects(name), exams(name, term, year)')
        .eq('student_id', studentRecord.id)
        .order('created_at', { ascending: false })
        .limit(6)
    : { data: [] }

  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('title, start_ts, category')
    .gte('start_ts', new Date().toISOString())
    .order('start_ts')
    .limit(3)

  const average = results && results.length > 0
    ? results.reduce((sum: number, r: any) => sum + r.score, 0) / results.length
    : null

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Student Dashboard"
        subtitle={`Welcome back, ${profile?.full_name || 'Student'}`}
        role="student"
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
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
                  {results.map((result: any, index: number) => (
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
                {upcomingEvents.map((event: any, index: number) => (
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
