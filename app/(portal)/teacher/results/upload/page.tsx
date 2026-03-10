'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Upload, Save } from 'lucide-react'

interface Student {
  id: string
  admission_number: string
  class: string
  profiles: { full_name: string } | null
}

interface Exam {
  id: string
  name: string
  term: string
  year: number
}

interface Subject {
  id: string
  name: string
  code: string
}

export default function UploadResultsPage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedExam, setSelectedExam] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [scores, setScores] = useState<Record<string, string>>({})
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUserId(session.user.id)

      const { data: p } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()
      setProfile(p)

      const [assignmentsRes, examsRes, subjectsRes] = await Promise.all([
        supabase
          .from('teacher_assignments')
          .select('students(id, admission_number, class, profiles(full_name))')
          .eq('teacher_profile_id', session.user.id),
        supabase.from('exams').select('*').order('year', { ascending: false }),
        supabase.from('subjects').select('*').order('name'),
      ])

      const assignedStudents: Student[] = (assignmentsRes.data || [])
        .map((a: any) => a.students)
        .filter(Boolean)
        .flat()
      setStudents(assignedStudents)
      setExams(examsRes.data || [])
      setSubjects(subjectsRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const getGrade = (score: number): string => {
    if (score >= 70) return 'A'
    if (score >= 60) return 'B'
    if (score >= 50) return 'C'
    if (score >= 45) return 'D'
    if (score >= 40) return 'E'
    return 'F'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExam || !selectedSubject) {
      toast({ title: 'Missing selection', description: 'Please select an exam and subject.', variant: 'destructive' })
      return
    }
    const entries = Object.entries(scores).filter(([, v]) => v !== '')
    if (entries.length === 0) {
      toast({ title: 'No scores entered', description: 'Please enter at least one score.', variant: 'destructive' })
      return
    }
    for (const [, v] of entries) {
      const n = parseFloat(v)
      if (isNaN(n) || n < 0 || n > 100) {
        toast({ title: 'Invalid score', description: 'Scores must be between 0 and 100.', variant: 'destructive' })
        return
      }
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const inserts = entries.map(([studentId, scoreStr]) => {
        const score = parseFloat(scoreStr)
        return {
          student_id: studentId,
          exam_id: selectedExam,
          subject_id: selectedSubject,
          score,
          grade: getGrade(score),
          uploaded_by: userId,
        }
      })

      const { error } = await supabase
        .from('student_results')
        .upsert(inserts, { onConflict: 'student_id,exam_id,subject_id' })

      if (error) throw error

      toast({ title: 'Results saved!', description: `${inserts.length} results have been uploaded.` })
      setScores({})
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save results', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Upload Results"
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
          <h2 className="text-xl font-semibold">Upload Student Results</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Exam & Subject</CardTitle>
                <CardDescription>Choose the exam and subject you are uploading results for</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Exam *</Label>
                  <Select value={selectedExam} onValueChange={setSelectedExam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map(exam => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.name} — {exam.term} {exam.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enter Scores</CardTitle>
                <CardDescription>
                  {students.length === 0
                    ? 'No students assigned to you yet. Contact admin to assign students.'
                    : `Enter scores (0-100) for your ${students.length} assigned student(s). Leave blank to skip.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Upload className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No students assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.map(student => (
                      <div key={student.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{student.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{student.admission_number} · {student.class}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            className="w-24 text-center"
                            placeholder="Score"
                            value={scores[student.id] || ''}
                            onChange={e => setScores(prev => ({ ...prev, [student.id]: e.target.value }))}
                          />
                          {scores[student.id] && (
                            <span className="text-sm font-bold w-6 text-primary">
                              {getGrade(parseFloat(scores[student.id]))}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {students.length > 0 && (
              <Button type="submit" disabled={isSubmitting} className="gap-2 w-full sm:w-auto">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSubmitting ? 'Saving Results...' : 'Save Results'}
              </Button>
            )}
          </form>
        )}
      </main>
    </div>
  )
}
