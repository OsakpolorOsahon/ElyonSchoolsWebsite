'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
  department: string | null
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
  applicable_classes: string[]
  applicable_departments: string[]
}

const SSS_CLASSES = new Set(['SSS 1', 'SSS 2', 'SSS 3'])

export default function UploadResultsPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const preselectedClass = searchParams.get('class') || ''

  const [profile, setProfile] = useState<any>(null)
  const [assignedClasses, setAssignedClasses] = useState<string[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [allSubjects, setAllSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedClass, setSelectedClass] = useState(preselectedClass)
  const [selectedExam, setSelectedExam] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [scores, setScores] = useState<Record<string, string>>({})
  const [remarks, setRemarks] = useState<Record<string, string>>({})

  const classStudents = allStudents.filter(s => s.class === selectedClass)

  const filteredSubjects = useMemo(() => {
    if (!selectedClass) return allSubjects
    return allSubjects.filter(subject => {
      const classes = subject.applicable_classes || []
      if (classes.length > 0 && !classes.includes(selectedClass)) return false
      if (SSS_CLASSES.has(selectedClass)) {
        const depts = subject.applicable_departments || []
        if (depts.length > 0) {
          const classDepts = new Set(classStudents.map(s => s.department).filter(Boolean))
          const hasOverlap = depts.some(d => classDepts.has(d))
          if (!hasOverlap) return false
        }
      }
      return true
    })
  }, [selectedClass, allSubjects, classStudents])

  const selectedSubjectObj = allSubjects.find(s => s.id === selectedSubject)

  const students = useMemo(() => {
    if (!selectedSubject || !selectedSubjectObj) return classStudents
    const depts = selectedSubjectObj.applicable_departments || []
    if (depts.length === 0 || !SSS_CLASSES.has(selectedClass)) return classStudents
    return classStudents.filter(s => s.department && depts.includes(s.department))
  }, [classStudents, selectedSubject, selectedSubjectObj, selectedClass])

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

      const [classRes, examsRes, subjectsRes] = await Promise.all([
        supabase
          .from('class_teacher')
          .select('class')
          .eq('teacher_profile_id', session.user.id),
        supabase.from('exams').select('*').order('year', { ascending: false }),
        supabase.from('subjects').select('*').order('name'),
      ])

      const classes = (classRes.data || []).map((c: any) => c.class)
      setAssignedClasses(classes)

      if (classes.length > 0) {
        const { data: studs } = await supabase
          .from('students')
          .select('id, admission_number, class, department, profiles(full_name)')
          .in('class', classes)
          .eq('status', 'active')
          .order('admission_number')
        setAllStudents((studs || []) as unknown as Student[])
      }

      setExams(examsRes.data || [])
      setAllSubjects((subjectsRes.data || []) as Subject[])

      if (preselectedClass && classes.includes(preselectedClass)) {
        setSelectedClass(preselectedClass)
      } else if (classes.length === 1) {
        setSelectedClass(classes[0])
      }

      setLoading(false)
    }
    load()
  }, [preselectedClass])

  useEffect(() => {
    setScores({})
    setRemarks({})
    setSelectedSubject('')
  }, [selectedClass])

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
    if (!selectedClass || !selectedExam || !selectedSubject) {
      toast({ title: 'Missing selection', description: 'Please select a class, exam and subject.', variant: 'destructive' })
      return
    }
    const isValidSubject = filteredSubjects.some(s => s.id === selectedSubject)
    if (!isValidSubject) {
      toast({ title: 'Invalid subject', description: 'The selected subject is not applicable to this class.', variant: 'destructive' })
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
          remarks: remarks[studentId]?.trim() || null,
          uploaded_by: null,
        }
      })

      const { error } = await supabase
        .from('student_results')
        .upsert(inserts, { onConflict: 'student_id,exam_id,subject_id' })

      if (error) throw error

      toast({ title: 'Results saved!', description: `${entries.length} result${entries.length !== 1 ? 's' : ''} saved successfully.` })
      setScores({})
      setRemarks({})
    } catch (err: any) {
      toast({ title: 'Error saving results', description: err.message || 'Something went wrong.', variant: 'destructive' })
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

      <main className="mx-auto max-w-3xl px-6 py-8">
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
        ) : assignedClasses.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No classes assigned to you yet. Contact admin.</p>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Step 1 — Select Class, Exam & Subject</CardTitle>
                <CardDescription>Choose what you are uploading results for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger data-testid="select-class">
                      <SelectValue placeholder="Select class..." />
                    </SelectTrigger>
                    <SelectContent>
                      {assignedClasses.map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Exam</Label>
                  <Select value={selectedExam} onValueChange={setSelectedExam}>
                    <SelectTrigger data-testid="select-exam">
                      <SelectValue placeholder="Select exam..." />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map(e => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name} — {e.term} {e.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger data-testid="select-subject">
                      <SelectValue placeholder={selectedClass ? 'Select subject...' : 'Select a class first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedClass && filteredSubjects.length === 0 && (
                    <p className="text-xs text-amber-600">
                      No subjects are applicable to {selectedClass}. Ask admin to assign subjects.
                    </p>
                  )}
                  {selectedClass && filteredSubjects.length > 0 && filteredSubjects.length < allSubjects.length && (
                    <p className="text-xs text-muted-foreground">
                      Showing {filteredSubjects.length} of {allSubjects.length} subjects applicable to {selectedClass}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2 — Enter Scores</CardTitle>
                <CardDescription>
                  {selectedClass
                    ? `${students.length} student${students.length !== 1 ? 's' : ''} in ${selectedClass}${
                        selectedSubjectObj && (selectedSubjectObj.applicable_departments || []).length > 0 && SSS_CLASSES.has(selectedClass)
                          ? ` (filtered to ${(selectedSubjectObj.applicable_departments || []).join(', ')} department${(selectedSubjectObj.applicable_departments || []).length > 1 ? 's' : ''})`
                          : ''
                      }`
                    : 'Select a class above to see students'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedClass ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Select a class to see the student list
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Upload className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No students enrolled in {selectedClass} yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.map(student => (
                      <div key={student.id} className="p-3 bg-muted/30 rounded-lg space-y-2">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{student.profiles?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{student.admission_number}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              className="w-24 text-center"
                              placeholder="Score"
                              value={scores[student.id] || ''}
                              onChange={e => setScores(prev => ({ ...prev, [student.id]: e.target.value }))}
                              data-testid={`input-score-${student.id}`}
                            />
                            {scores[student.id] && (
                              <span className="text-sm font-bold w-6 text-primary">
                                {getGrade(parseFloat(scores[student.id]))}
                              </span>
                            )}
                          </div>
                        </div>
                        <Input
                          placeholder="Remark (optional)"
                          className="text-sm h-8"
                          value={remarks[student.id] || ''}
                          onChange={e => setRemarks(prev => ({ ...prev, [student.id]: e.target.value }))}
                          data-testid={`input-remark-${student.id}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {students.length > 0 && (
              <Button type="submit" disabled={isSubmitting} className="gap-2 w-full sm:w-auto" data-testid="button-save-results">
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
