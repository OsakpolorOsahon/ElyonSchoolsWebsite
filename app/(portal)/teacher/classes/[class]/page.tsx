'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, User, GraduationCap } from 'lucide-react'

interface Student {
  id: string
  admission_number: string
  class: string
  gender: string | null
  profiles: { full_name: string } | null
}

export default function ClassStudentsPage() {
  const params = useParams()
  const className = decodeURIComponent(params.class as string).replace(/-/g, ' ').toUpperCase()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: p } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()
      setProfile(p)

      const { data } = await supabase
        .from('teacher_assignments')
        .select('students(id, admission_number, class, gender, profiles(full_name))')
        .eq('teacher_profile_id', session.user.id)

      const assignedStudents: Student[] = (data || [])
        .map((a: any) => a.students)
        .filter(Boolean)
        .flat()
        .filter((s: Student) => s.class.toUpperCase() === className)

      setStudents(assignedStudents)
      setLoading(false)
    }
    load()
  }, [className])

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title={className}
        subtitle={`Welcome back, ${profile?.full_name || 'Teacher'}`}
        role="teacher"
      />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/teacher">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <h2 className="text-xl font-semibold">Students in {className} ({students.length})</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : students.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No students assigned to you in this class</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {students.map(student => (
              <Card key={student.id}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{student.profiles?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.admission_number}
                        {student.gender && ` · ${student.gender}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
