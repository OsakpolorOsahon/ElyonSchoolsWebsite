'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Trophy, User } from 'lucide-react'

interface Result {
  id: string
  score: number
  grade: string | null
  exams: { name: string; term: string; year: number } | null
  subjects: { name: string; code: string } | null
}

interface Student {
  id: string
  admission_number: string
  class: string
  profiles: { full_name: string } | null
}

const gradeColors: Record<string, string> = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-700',
  D: 'bg-orange-100 text-orange-700',
  E: 'bg-red-100 text-red-700',
  F: 'bg-red-200 text-red-800',
}

export default function ChildResultsPage() {
  const params = useParams()
  const admissionNumber = decodeURIComponent(params.admissionNumber as string)
  const [student, setStudent] = useState<Student | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
      setProfile(p)

      const { data: studentData } = await supabase
        .from('students')
        .select('id, admission_number, class, profiles(full_name)')
        .eq('admission_number', admissionNumber)
        .eq('parent_profile_id', session.user.id)
        .single()

      if (!studentData) {
        setLoading(false)
        return
      }
      setStudent(studentData)

      const { data: resultsData } = await supabase
        .from('student_results')
        .select('id, score, grade, exams(name, term, year), subjects(name, code)')
        .eq('student_id', studentData.id)
        .order('created_at', { ascending: false })

      setResults(resultsData || [])
      setLoading(false)
    }
    load()
  }, [admissionNumber])

  const groupedByExam = results.reduce((acc, result) => {
    const examKey = result.exams ? `${result.exams.term} ${result.exams.year} — ${result.exams.name}` : 'Unknown Exam'
    if (!acc[examKey]) acc[examKey] = []
    acc[examKey].push(result)
    return acc
  }, {} as Record<string, Result[]>)

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Child Results"
        subtitle={`Welcome back, ${profile?.full_name || 'Parent'}`}
        role="parent"
      />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/parent">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
          {student && (
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">{student.profiles?.full_name} — Results</h2>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !student ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <p>Student record not found or access denied.</p>
              <Link href="/parent" className="mt-4 inline-block">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No results available yet for {student.profiles?.full_name}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByExam).map(([examName, examResults]) => {
              const avg = examResults.reduce((s, r) => s + r.score, 0) / examResults.length
              return (
                <Card key={examName}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        {examName}
                      </CardTitle>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Average</p>
                        <p className="text-2xl font-bold text-primary">{avg.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {examResults.map(result => (
                        <div key={result.id} className="p-3 bg-muted/40 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{result.subjects?.name}</span>
                            <Badge className={gradeColors[result.grade || 'F'] || gradeColors.F}>
                              {result.grade || 'F'}
                            </Badge>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mb-1">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${result.score}%` }} />
                          </div>
                          <p className="text-xs text-muted-foreground">{result.score}/100</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
