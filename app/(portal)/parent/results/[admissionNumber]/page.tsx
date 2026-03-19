'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Trophy, User, FileText } from 'lucide-react'

interface Result {
  id: string
  score: number
  grade: string | null
  exam_id: string
  exams: { id: string; name: string; term: string; year: number; published: boolean }[] | null
  subjects: { name: string; code: string }[] | null
}

interface Student {
  id: string
  admission_number: string
  class: string
  profiles: { full_name: string }[] | null
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
  const [profile, setProfile] = useState<{ full_name: string } | null>(null)
  const [termFilter, setTermFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
      setProfile(p)

      const { data: studentData } = await supabase
        .from('students')
        .select('id, admission_number, class, profiles!profile_id(full_name)')
        .eq('admission_number', admissionNumber)
        .eq('parent_profile_id', session.user.id)
        .single()

      if (!studentData) {
        setLoading(false)
        return
      }
      setStudent(studentData as Student)

      const { data: resultsData } = await supabase
        .from('student_results')
        .select('id, score, grade, exam_id, exams!inner(id, name, term, year, published), subjects(name, code)')
        .eq('student_id', studentData.id)
        .eq('exams.published', true)
        .order('created_at', { ascending: false })

      setResults((resultsData || []) as Result[])
      setLoading(false)
    }
    load()
  }, [admissionNumber])

  const termOptions = useMemo(() => {
    const terms = new Set<string>()
    results.forEach(r => {
      const exam = r.exams?.[0]
      if (exam) terms.add(`${exam.term} ${exam.year}`)
    })
    return Array.from(terms).sort().reverse()
  }, [results])

  const filteredResults = useMemo(() => {
    if (termFilter === 'all') return results
    return results.filter(r => { const exam = r.exams?.[0]; return exam && `${exam.term} ${exam.year}` === termFilter })
  }, [results, termFilter])

  const groupedByExam = filteredResults.reduce((acc, result) => {
    const exam = result.exams?.[0]
    const eId = exam?.id || 'unknown'
    const examKey = exam ? `${exam.term} ${exam.year} — ${exam.name}` : 'Unknown Exam'
    if (!acc[eId]) acc[eId] = { label: examKey, results: [] }
    acc[eId].results.push(result)
    return acc
  }, {} as Record<string, { label: string; results: Result[] }>)

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Child Results"
        subtitle={`Welcome back, ${profile?.full_name || 'Parent'}`}
        role="parent"
      />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/parent">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            {student && (
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">{student.profiles?.[0]?.full_name} — Results</h2>
              </div>
            )}
          </div>
          {termOptions.length > 1 && (
            <Select value={termFilter} onValueChange={setTermFilter}>
              <SelectTrigger className="w-48" data-testid="select-term-filter">
                <SelectValue placeholder="Filter by term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                {termOptions.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        ) : filteredResults.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No published results available yet for {student.profiles?.[0]?.full_name}</p>
              <p className="text-sm mt-2">Results will appear here once the admin publishes them.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByExam).map(([eId, { label: examName, results: examResults }]) => {
              const avg = examResults.reduce((s, r) => s + r.score, 0) / examResults.length
              return (
                <Card key={eId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        {examName}
                      </CardTitle>
                      <div className="flex items-center gap-4">
                        {student && eId !== 'unknown' && (
                          <Link href={`/report-card/${student.id}/${eId}`}>
                            <Button variant="outline" size="sm" className="gap-1" data-testid={`button-report-card-${eId}`}>
                              <FileText className="h-4 w-4" />
                              View Report Card
                            </Button>
                          </Link>
                        )}
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Average</p>
                          <p className="text-2xl font-bold text-primary">{avg.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {examResults.map(result => (
                        <div key={result.id} className="p-3 bg-muted/40 rounded-lg" data-testid={`result-${result.id}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{result.subjects?.[0]?.name}</span>
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
