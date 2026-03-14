'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Trophy, BookOpen, FileText } from 'lucide-react'

interface Result {
  id: string
  score: number
  grade: string | null
  remarks: string | null
  exam_id: string
  exams: { id: string; name: string; term: string; year: number; published: boolean } | null
  subjects: { name: string; code: string } | null
}

const gradeColors: Record<string, string> = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-700',
  D: 'bg-orange-100 text-orange-700',
  E: 'bg-red-100 text-red-700',
  F: 'bg-red-200 text-red-800',
}

export default function StudentResultsPage() {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [termFilter, setTermFilter] = useState('all')
  const [studentId, setStudentId] = useState<string | null>(null)

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

      const { data: studentRecord } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', session.user.id)
        .single()

      if (!studentRecord) {
        setLoading(false)
        return
      }
      setStudentId(studentRecord.id)

      const { data } = await supabase
        .from('student_results')
        .select('id, score, grade, remarks, exam_id, exams!inner(id, name, term, year, published), subjects(name, code)')
        .eq('student_id', studentRecord.id)
        .eq('exams.published', true)
        .order('created_at', { ascending: false })

      setResults((data || []) as unknown as Result[])
      setLoading(false)
    }
    load()
  }, [])

  const termOptions = useMemo(() => {
    const terms = new Set<string>()
    results.forEach(r => {
      if (r.exams) terms.add(`${r.exams.term} ${r.exams.year}`)
    })
    return Array.from(terms).sort().reverse()
  }, [results])

  const filteredResults = useMemo(() => {
    if (termFilter === 'all') return results
    return results.filter(r => r.exams && `${r.exams.term} ${r.exams.year}` === termFilter)
  }, [results, termFilter])

  const groupedByExam = filteredResults.reduce((acc, result) => {
    const examId = result.exams?.id || 'unknown'
    const examKey = result.exams ? `${result.exams.term} ${result.exams.year} — ${result.exams.name}` : 'Unknown Exam'
    if (!acc[examId]) acc[examId] = { label: examKey, results: [] }
    acc[examId].results.push(result)
    return acc
  }, {} as Record<string, { label: string; results: Result[] }>)

  const getAverage = (examResults: Result[]) => {
    if (examResults.length === 0) return 0
    return examResults.reduce((sum, r) => sum + r.score, 0) / examResults.length
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="My Results"
        subtitle={`Welcome back, ${profile?.full_name || 'Student'}`}
        role="student"
      />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/student">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <h2 className="text-xl font-semibold">All Academic Results</h2>
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
        ) : filteredResults.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No results available yet</p>
              <p className="text-sm mt-2">Results will appear here once your teacher uploads them and the admin publishes them.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByExam).map(([examId, { label: examName, results: examResults }]) => {
              const average = getAverage(examResults)
              return (
                <Card key={examId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        {examName}
                      </CardTitle>
                      <div className="flex items-center gap-4">
                        {studentId && examId !== 'unknown' && (
                          <Link href={`/report-card/${studentId}/${examId}`}>
                            <Button variant="outline" size="sm" className="gap-1" data-testid={`button-report-card-${examId}`}>
                              <FileText className="h-4 w-4" />
                              Report Card
                            </Button>
                          </Link>
                        )}
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Average</p>
                          <p className="text-2xl font-bold text-primary">{average.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {examResults.map(result => (
                        <div key={result.id} className="p-3 bg-muted/40 rounded-lg" data-testid={`result-${result.id}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{result.subjects?.name || 'Unknown'}</span>
                            <Badge className={gradeColors[result.grade || 'F'] || gradeColors.F}>
                              {result.grade || 'F'}
                            </Badge>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mb-1">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${result.score}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{result.score}/100</p>
                          {result.remarks && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{result.remarks}</p>
                          )}
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
