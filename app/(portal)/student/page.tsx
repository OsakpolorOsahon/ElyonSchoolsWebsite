import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  GraduationCap, 
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

const subjects = [
  { name: 'Mathematics', grade: 'A', score: 85 },
  { name: 'English Language', grade: 'B', score: 72 },
  { name: 'Physics', grade: 'A', score: 88 },
  { name: 'Chemistry', grade: 'B', score: 75 },
  { name: 'Biology', grade: 'A', score: 82 },
  { name: 'Economics', grade: 'B', score: 70 },
]

const timetable = [
  { day: 'Monday', classes: ['Mathematics', 'English', 'Physics', 'Break', 'Chemistry', 'Biology'] },
  { day: 'Tuesday', classes: ['English', 'Physics', 'Mathematics', 'Break', 'Economics', 'Government'] },
  { day: 'Wednesday', classes: ['Chemistry', 'Biology', 'English', 'Break', 'Mathematics', 'Physics'] },
]

const upcomingEvents = [
  { title: 'Mathematics Test', date: 'December 8, 2024', type: 'Academic' },
  { title: 'Inter-House Sports', date: 'January 20, 2025', type: 'Sports' },
  { title: 'Cultural Day', date: 'February 10, 2025', type: 'Cultural' },
]

export default async function StudentDashboard() {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login?redirect=/student')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'student') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name || 'Student'}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">View Website</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{profile?.full_name || 'Student Name'}</h3>
                <p className="text-muted-foreground">SSS 2A</p>
                <p className="text-sm text-muted-foreground">ELY/2022/0234</p>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold text-primary">78%</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Class Position</p>
                    <p className="text-2xl font-bold text-primary">5th</p>
                  </div>
                </div>

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
                First Term Results - 2024/2025
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject) => (
                  <div key={subject.name} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{subject.name}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        subject.grade === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        subject.grade === 'B' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {subject.grade}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${subject.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{subject.score}/100</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Today&apos;s Timetable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['8:00 AM - Mathematics', '9:00 AM - English', '10:00 AM - Physics', '11:00 AM - Break', '11:30 AM - Chemistry', '12:30 PM - Biology'].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
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
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-accent/20 text-accent-foreground rounded-full">
                        {event.type}
                      </span>
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
