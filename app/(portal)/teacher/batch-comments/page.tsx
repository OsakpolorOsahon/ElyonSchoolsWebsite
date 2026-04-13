'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Save, Search, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'

const ALL_CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
]
const CLASS_ORDER = ALL_CLASSES.reduce<Record<string, number>>((acc, cls, i) => { acc[cls] = i; return acc }, {})

function getStudentName(student: { full_name: string | null; profiles: { full_name: string } | { full_name: string }[] | null }): string {
  const profileName = Array.isArray(student.profiles)
    ? student.profiles[0]?.full_name
    : student.profiles?.full_name
  return profileName || student.full_name || 'Unknown'
}

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-yellow-100 text-yellow-800',
  D: 'bg-orange-100 text-orange-800',
  F: 'bg-red-100 text-red-800',
}

interface Exam {
  id: string
  name: string
  term: string
  year: number
}

interface Student {
  id: string
  admission_number: string
  class: string
  full_name: string | null
  profiles: { full_name: string } | { full_name: string }[] | null
}

interface SubjectResult {
  subject_name: string
  ca_score: number | null
  exam_score: number | null
  score: number | null
  grade: string | null
}

export default function TeacherBatchCommentsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exams, setExams] = useState<Exam[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [assignedClasses, setAssignedClasses] = useState<string[]>([])
  const [selectedExam, setSelectedExam] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')
  const [comments, setComments] = useState<Record<string, string>>({})
  const [existingComments, setExistingComments] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [studentResults, setStudentResults] = useState<Record<string, SubjectResult[]>>({})
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const [classRes, examsRes] = await Promise.all([
        supabase
          .from('class_teacher')
          .select('class')
          .eq('teacher_profile_id', session.user.id),
        supabase
          .from('exams')
          .select('*')
          .order('year', { ascending: false }),
      ])

      const myClasses = ((classRes.data || []) as { class: string }[]).map(c => c.class)
        .sort((a, b) => (CLASS_ORDER[a] ?? 99) - (CLASS_ORDER[b] ?? 99))
      setAssignedClasses(myClasses)
      setExams(examsRes.data || [])

      if (myClasses.length > 0) {
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, admission_number, class, full_name, profiles!profile_id(full_name)')
          .in('class', myClasses)
          .eq('status', 'active')
        setStudents((studentsData || []) as unknown as Student[])
        if (myClasses.length === 1) setSelectedClass(myClasses[0])
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedExam || students.length === 0) return
    setLoadingComments(true)
    setStudentResults({})
    const supabase = createClient()
    Promise.all([
      supabase
        .from('report_card_comments')
        .select('student_id, teacher_comment')
        .eq('exam_id', selectedExam),
      supabase
        .from('student_results')
        .select('student_id, ca_score, exam_score, score, grade, subjects(name)')
        .eq('exam_id', selectedExam),
    ]).then(([commentsRes, resultsRes]) => {
      const myStudentIds = new Set(students.map(s => s.id))
      const existing: Record<string, string> = {}
      for (const row of commentsRes.data || []) {
        if (myStudentIds.has(row.student_id) && row.teacher_comment)
          existing[row.student_id] = row.teacher_comment
      }
      setExistingComments(existing)
      setComments(existing)

      const byStudent: Record<string, SubjectResult[]> = {}
      for (const row of (resultsRes.data || []) as any[]) {
        if (!myStudentIds.has(row.student_id)) continue
        if (!byStudent[row.student_id]) byStudent[row.student_id] = []
        byStudent[row.student_id].push({
          subject_name: Array.isArray(row.subjects) ? (row.subjects[0]?.name || 'Unknown') : (row.subjects?.name || 'Unknown'),
          ca_score: row.ca_score != null ? Number(row.ca_score) : null,
          exam_score: row.exam_score != null ? Number(row.exam_score) : null,
          score: row.score != null ? Number(row.score) : null,
          grade: row.grade,
        })
      }
      for (const sid of Object.keys(byStudent)) {
        byStudent[sid].sort((a, b) => a.subject_name.localeCompare(b.subject_name))
      }
      setStudentResults(byStudent)
      setLoadingComments(false)
    })
  }, [selectedExam, students.length])

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const oa = CLASS_ORDER[a.class] ?? 99
      const ob = CLASS_ORDER[b.class] ?? 99
      if (oa !== ob) return oa - ob
      const na = getStudentName(a).toLowerCase()
      const nb = getStudentName(b).toLowerCase()
      return na.localeCompare(nb)
    })
  }, [students])

  const filteredStudents = useMemo(() => {
    return sortedStudents.filter(s => {
      if (selectedClass !== 'all' && s.class !== selectedClass) return false
      if (search) {
        const name = getStudentName(s).toLowerCase()
        const adm = s.admission_number.toLowerCase()
        if (!name.includes(search.toLowerCase()) && !adm.includes(search.toLowerCase())) return false
      }
      return true
    })
  }, [sortedStudents, selectedClass, search])

  const handleSaveAll = async () => {
    if (!selectedExam) {
      toast({ title: 'No exam selected', variant: 'destructive' })
      return
    }

    const changed = filteredStudents.filter(s => {
      const current = comments[s.id] || ''
      const original = existingComments[s.id] || ''
      return current !== original
    })

    if (changed.length === 0) {
      toast({ title: 'No changes to save', description: 'All comments are up to date.' })
      return
    }

    setSaving(true)
    try {
      const results = await Promise.allSettled(
        changed.map(async student => {
          const res = await fetch(`/api/report-card/${student.id}/${selectedExam}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacher_comment: comments[student.id] || '' }),
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || `HTTP ${res.status}`)
          }
          return student.id
        })
      )

      const succeeded = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[]

      if (failed.length > 0) {
        toast({
          title: `Partially saved`,
          description: `${succeeded} comments saved, ${failed.length} failed: ${failed[0]?.reason?.message || 'unknown error'}`,
          variant: 'destructive',
        })
      } else {
        toast({
          title: `✓ ${succeeded} comment${succeeded !== 1 ? 's' : ''} saved!`,
          description: 'All teacher comments have been updated.',
        })
        setExistingComments(prev => {
          const updated = { ...prev }
          for (const s of changed) updated[s.id] = comments[s.id] || ''
          return updated
        })
      }
    } catch {
      toast({ title: 'Error saving comments', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  function toggleExpand(studentId: string) {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  const changedCount = filteredStudents.filter(s => (comments[s.id] || '') !== (existingComments[s.id] || '')).length

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <PortalHeader title="Batch Report Comments" subtitle="Add your teacher comments for all students at once" role="teacher" />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (assignedClasses.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30">
        <PortalHeader title="Batch Report Comments" subtitle="Add your teacher comments for all students at once" role="teacher" />
        <main className="mx-auto max-w-4xl px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/teacher">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>You are not assigned as a class teacher for any class yet.</p>
              <p className="text-sm mt-1">Contact the admin to get assigned to a class.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader title="Batch Teacher Comments" subtitle="Write and save your comments for all students efficiently" role="teacher" />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/teacher">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Filter Students
            </CardTitle>
            <CardDescription>
              Select an exam, then optionally filter by class and search.
              You can only comment on students in your assigned {assignedClasses.length > 1 ? 'classes' : 'class'}: {assignedClasses.join(', ')}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Exam *</Label>
                <Select value={selectedExam} onValueChange={v => { setSelectedExam(v); setExpandedCards(new Set()) }}>
                  <SelectTrigger data-testid="select-exam">
                    <SelectValue placeholder="Select exam..." />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.name} — {e.term} {e.year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger data-testid="select-class">
                    <SelectValue placeholder="All My Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedClasses.length > 1 && <SelectItem value="all">All My Classes</SelectItem>}
                    {assignedClasses.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Name or admission number..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    data-testid="input-search"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedExam && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                {changedCount > 0 && (
                  <span className="ml-2 text-amber-600 font-medium">· {changedCount} unsaved change{changedCount !== 1 ? 's' : ''}</span>
                )}
              </p>
              <Button onClick={handleSaveAll} disabled={saving || changedCount === 0} className="gap-2" data-testid="button-save-all">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : `Save ${changedCount > 0 ? changedCount + ' ' : ''}Changes`}
              </Button>
            </div>

            {loadingComments ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No students match your filters.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredStudents.map(student => {
                  const name = getStudentName(student)
                  const current = comments[student.id] || ''
                  const original = existingComments[student.id] || ''
                  const isDirty = current !== original
                  const results = studentResults[student.id] || []
                  const isExpanded = expandedCards.has(student.id)
                  return (
                    <Card key={student.id} className={isDirty ? 'border-amber-300 dark:border-amber-700' : ''}>
                      <CardContent className="py-4">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <p className="font-semibold text-foreground">{name}</p>
                          <Badge variant="outline" className="text-xs">{student.class}</Badge>
                          <span className="text-xs text-muted-foreground">{student.admission_number}</span>
                          {isDirty && <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">Unsaved</Badge>}
                          {results.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(student.id)}
                              className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline"
                              data-testid={`toggle-results-${student.id}`}
                            >
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              {isExpanded ? 'Hide' : 'View'} Results ({results.length})
                            </button>
                          )}
                          {results.length === 0 && (
                            <span className="ml-auto text-xs text-muted-foreground italic">No results uploaded</span>
                          )}
                        </div>

                        {isExpanded && results.length > 0 && (
                          <div className="mb-4 rounded-md border overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Subject</th>
                                  <th className="text-center px-3 py-2 text-muted-foreground font-medium">CA</th>
                                  <th className="text-center px-3 py-2 text-muted-foreground font-medium">Exam</th>
                                  <th className="text-center px-3 py-2 text-muted-foreground font-medium font-bold">Total</th>
                                  <th className="text-center px-3 py-2 text-muted-foreground font-medium">Grade</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {results.map((r, i) => (
                                  <tr key={i} className="bg-background">
                                    <td className="px-3 py-2 text-foreground">{r.subject_name}</td>
                                    <td className="px-3 py-2 text-center text-muted-foreground">
                                      {r.ca_score != null ? r.ca_score : '—'}
                                    </td>
                                    <td className="px-3 py-2 text-center text-muted-foreground">
                                      {r.exam_score != null ? r.exam_score : '—'}
                                    </td>
                                    <td className="px-3 py-2 text-center font-semibold text-foreground">
                                      {r.score != null ? r.score : '—'}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      {r.grade ? (
                                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold ${GRADE_COLORS[r.grade] || 'bg-muted text-muted-foreground'}`}>
                                          {r.grade}
                                        </span>
                                      ) : '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        <Textarea
                          placeholder="Enter your teacher's comment for this student..."
                          value={current}
                          onChange={e => setComments(prev => ({ ...prev, [student.id]: e.target.value }))}
                          rows={2}
                          className="text-sm resize-none"
                          data-testid={`textarea-comment-${student.id}`}
                        />
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {filteredStudents.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveAll} disabled={saving || changedCount === 0} className="gap-2" data-testid="button-save-all-bottom">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Saving...' : `Save ${changedCount > 0 ? changedCount + ' ' : ''}Changes`}
                </Button>
              </div>
            )}
          </>
        )}

        {!selectedExam && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Select an exam above to start adding your comments for students.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
