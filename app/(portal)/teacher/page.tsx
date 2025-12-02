import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Upload, 
  Calendar,
  BookOpen,
  ArrowRight,
  Clock
} from 'lucide-react'

export const metadata = {
  title: 'Teacher Dashboard - Elyon Schools',
}

const assignedClasses = [
  { name: 'JSS 2A', subject: 'Mathematics', students: 35 },
  { name: 'JSS 3A', subject: 'Mathematics', students: 32 },
  { name: 'SSS 1A', subject: 'Further Mathematics', students: 28 },
]

const upcomingEvents = [
  { title: 'Staff Meeting', date: 'December 5, 2024', time: '2:00 PM' },
  { title: 'First Term Examination', date: 'December 10, 2024', time: '8:00 AM' },
  { title: 'Inter-House Sports', date: 'January 20, 2025', time: '8:00 AM' },
]

export default async function TeacherDashboard() {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login?redirect=/teacher')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'teacher') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Teacher Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name || 'Teacher'}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">View Website</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <Link href="/teacher/results/upload">
            <Card className="bg-primary text-primary-foreground hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">Upload Student Results</p>
                    <p className="text-sm text-primary-foreground/80">
                      Upload grades for your assigned classes
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

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {assignedClasses.map((cls) => (
            <Card key={cls.name} className="hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{cls.students} students</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">{cls.name}</h3>
                <p className="text-muted-foreground">{cls.subject}</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href={`/teacher/classes/${cls.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      View Students
                    </Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/teacher/results/upload?class=${cls.name}`}>
                      Upload Results
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Connect to Supabase to view your assigned students</p>
              </div>
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
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted flex-shrink-0">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date} at {event.time}</p>
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
