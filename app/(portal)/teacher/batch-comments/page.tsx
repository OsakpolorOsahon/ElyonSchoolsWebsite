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
import { Loader2, ArrowLeft, Save, Search, MessageSquare, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react'

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

const RATING_LABELS: Record<number, string> = {
  5: 'Excellent', 4: 'Very Good', 3: 'Good', 2: 'Fair', 1: 'Poor',
}

const PSYCHOMOTOR_LABELS: Array<{ key: string; label: string }> = [
  { key: 'handwriting', label: 'Handwriting' },
  { key: 'verbal_fluency', label: 'Verbal Fluency' },
  { key: 'games', label: 'Games' },
  { key: 'sport', label: 'Sport' },
  { key: 'handling_tool', label: 'Handling of Tools' },
  { key: 'drawing_painting', label: 'Drawing & Painting' },
  { key: 'musical_skills', label: 'Musical Skills' },
]

const AFFECTIVE_LABELS: Array<{ key: string; label: string }> = [
  { key: 'punctuality', label: 'Punctuality' },
  { key: 'neatness', label: 'Neatness' },
  { key: 'politeness', label: 'Politeness' },
  { key: 'honesty', label: 'Honesty' },
  { key: 'cooperation', label: 'Cooperation' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'helping_others', label: 'Helping Others' },
  { key: 'emotional_stability', label: 'Emotional Stability' },
  { key: 'health', label: 'Health' },
  { key: 'attitude_to_school_work', label: 'Attitude to School Work' },
  { key: 'attentiveness', label: 'Attentiveness' },
  { key: 'perseverance', label: 'Perseverance' },
  { key: 'speaking_handwriting', label: 'Speaking / Handwriting' },
]

type RatingsMap = Record<string, number | null>

interface Exam {
  id: string
  name: string
  term: string
  year: number
  resumption_date?: string | null
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

interface ResultRow {
  student_id: string
  ca_score: number | null
  exam_score: number | null
  score: number | null
  grade: string | null
  subjects: { name: string } | { name: string }[] | null
}

interface PsychomotorRow {
  student_id: string
  handwriting: number | null
  verbal_fluency: number | null
  games: number | null
  sport: number | null
  handling_tool: number | null
  drawing_painting: number | null
  musical_skills: number | null
}

interface AffectiveRow {
  student_id: string
  punctuality: number | null
  neatness: number | null
  politeness: number | null
  honesty: number | null
  cooperation: number | null
  leadership: number | null
  helping_others: number | null
  emotional_stability: number | null
  health: number | null
  attitude_to_school_work: number | null
  attentiveness: number | null
  perseverance: number | null
  speaking_handwriting: number | null
}

function RatingButtonGroup({ value, onChange, testId }: {
  value: number | null
  onChange: (v: number) => void
  testId?: string
}) {
  return (
    <div className="flex gap-1" data-testid={testId}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-8 h-8 rounded text-xs font-semibold border transition-colors ${
            value === n
              ? 'bg-green-700 text-white border-green-700'
              : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'
          }`}
          title={RATING_LABELS[n]}
        >
          {n}
        </button>
      ))}
    </div>
  )
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
  const [psychomotorRatings, setPsychomotorRatings] = useState<Record<string, RatingsMap>>({})
  const [affectiveRatings, setAffectiveRatings] = useState<Record<string, RatingsMap>>({})
  const [existingPsychomotor, setExistingPsychomotor] = useState<Record<string, RatingsMap>>({})
  const [existingAffective, setExistingAffective] = useState<Record<string, RatingsMap>>({})
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  function toggleSection(studentId: string, section: 'psy' | 'aff') {
    setExpandedSections(prev => {
      const next = new Set(prev)
      const key = `${studentId}:${section}`
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

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
          .select('id, name, term, year, resumption_date')
          .order('year', { ascending: false }),
      ])

      const myClasses = ((classRes.data || []) as { class: string }[]).map(c => c.class)
        .sort((a, b) => (CLASS_ORDER[a] ?? 99) - (CLASS_ORDER[b] ?? 99))
      setAssignedClasses(myClasses)
      setExams(examsRes.data || [])

      if (myClasses.length > 0) {
        const studentsRes = await fetch('/api/teacher/students').then(r => r.json())
        setStudents((studentsRes.students || []) as Student[])
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
    setPsychomotorRatings({})
    setAffectiveRatings({})
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
      supabase
        .from('psychomotor_ratings')
        .select('*')
        .eq('exam_id', selectedExam),
      supabase
        .from('affective_ratings')
        .select('*')
        .eq('exam_id', selectedExam),
    ]).then(([commentsRes, resultsRes, psychomotorRes, affectiveRes]) => {
      const myStudentIds = new Set(students.map(s => s.id))
      const existing: Record<string, string> = {}
      for (const row of commentsRes.data || []) {
        if (myStudentIds.has(row.student_id) && row.teacher_comment)
          existing[row.student_id] = row.teacher_comment
      }
      setExistingComments(existing)
      setComments(existing)

      const byStudent: Record<string, SubjectResult[]> = {}
      for (const row of (resultsRes.data || []) as ResultRow[]) {
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

      const psyMap: Record<string, RatingsMap> = {}
      for (const row of (psychomotorRes.data || []) as PsychomotorRow[]) {
        if (!myStudentIds.has(row.student_id)) continue
        psyMap[row.student_id] = {
          handwriting: row.handwriting, verbal_fluency: row.verbal_fluency,
          games: row.games, sport: row.sport, handling_tool: row.handling_tool,
          drawing_painting: row.drawing_painting, musical_skills: row.musical_skills,
        }
      }
      setExistingPsychomotor(psyMap)
      setPsychomotorRatings(psyMap)

      const affMap: Record<string, RatingsMap> = {}
      for (const row of (affectiveRes.data || []) as AffectiveRow[]) {
        if (!myStudentIds.has(row.student_id)) continue
        affMap[row.student_id] = {
          punctuality: row.punctuality, neatness: row.neatness, politeness: row.politeness,
          honesty: row.honesty, cooperation: row.cooperation, leadership: row.leadership,
          helping_others: row.helping_others, emotional_stability: row.emotional_stability,
          health: row.health, attitude_to_school_work: row.attitude_to_school_work,
          attentiveness: row.attentiveness, perseverance: row.perseverance,
          speaking_handwriting: row.speaking_handwriting,
        }
      }
      setExistingAffective(affMap)
      setAffectiveRatings(affMap)

      setLoadingComments(false)
    })
  }, [selectedExam, students.length])

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const oa = CLASS_ORDER[a.class] ?? 99
      const ob = CLASS_ORDER[b.class] ?? 99
      if (oa !== ob) return oa - ob
      return getStudentName(a).toLowerCase().localeCompare(getStudentName(b).toLowerCase())
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

  const isStudentDirty = (studentId: string) => {
    const commentDirty = (comments[studentId] || '') !== (existingComments[studentId] || '')
    const psy = psychomotorRatings[studentId] || {}
    const existPsy = existingPsychomotor[studentId] || {}
    const aff = affectiveRatings[studentId] || {}
    const existAff = existingAffective[studentId] || {}
    const psyDirty = PSYCHOMOTOR_LABELS.some(({ key }) => (psy[key] ?? null) !== (existPsy[key] ?? null))
    const affDirty = AFFECTIVE_LABELS.some(({ key }) => (aff[key] ?? null) !== (existAff[key] ?? null))
    return commentDirty || psyDirty || affDirty
  }

  const handleSaveAll = async () => {
    if (!selectedExam) {
      toast({ title: 'No exam selected', variant: 'destructive' })
      return
    }

    const changed = filteredStudents.filter(s => isStudentDirty(s.id))

    if (changed.length === 0) {
      toast({ title: 'No changes to save', description: 'All data is up to date.' })
      return
    }

    setSaving(true)
    try {
      const results = await Promise.allSettled(
        changed.map(async student => {
          const body: Record<string, unknown> = {}
          const commentCurrent = comments[student.id] || ''
          const commentOriginal = existingComments[student.id] || ''
          if (commentCurrent !== commentOriginal) body.teacher_comment = commentCurrent

          const psy = psychomotorRatings[student.id] || {}
          const existPsy = existingPsychomotor[student.id] || {}
          if (PSYCHOMOTOR_LABELS.some(({ key }) => (psy[key] ?? null) !== (existPsy[key] ?? null)))
            body.psychomotor_ratings = psy

          const aff = affectiveRatings[student.id] || {}
          const existAff = existingAffective[student.id] || {}
          if (AFFECTIVE_LABELS.some(({ key }) => (aff[key] ?? null) !== (existAff[key] ?? null)))
            body.affective_ratings = aff

          const res = await fetch(`/api/report-card/${student.id}/${selectedExam}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
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
          description: `${succeeded} saved, ${failed.length} failed: ${failed[0]?.reason?.message || 'unknown error'}`,
          variant: 'destructive',
        })
      } else {
        toast({
          title: `✓ ${succeeded} student${succeeded !== 1 ? 's' : ''} saved!`,
          description: 'All report card data has been updated.',
        })
        setExistingComments(prev => {
          const updated = { ...prev }
          for (const s of changed) updated[s.id] = comments[s.id] || ''
          return updated
        })
        setExistingPsychomotor({ ...psychomotorRatings })
        setExistingAffective({ ...affectiveRatings })
      }
    } catch {
      toast({ title: 'Error saving data', variant: 'destructive' })
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

  const changedCount = filteredStudents.filter(s => isStudentDirty(s.id)).length
  const selectedExamObj = exams.find(e => e.id === selectedExam)

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <PortalHeader title="Batch Report Card Data" subtitle="Enter comments and ratings for your students" role="teacher" />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (assignedClasses.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30">
        <PortalHeader title="Batch Report Card Data" subtitle="Enter comments and ratings for your students" role="teacher" />
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
      <PortalHeader title="Batch Report Card Data" subtitle="Enter comments, psychomotor & affective ratings for your students" role="teacher" />

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
              <ClipboardList className="h-5 w-5 text-primary" />
              Filter Students
            </CardTitle>
            <CardDescription>
              Select an exam, then optionally filter by class and search.
              Your class{assignedClasses.length > 1 ? 'es' : ''}: {assignedClasses.join(', ')}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Exam *</Label>
                <Select value={selectedExam} onValueChange={v => { setSelectedExam(v); setExpandedCards(new Set()); setExpandedSections(new Set()) }}>
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
            {selectedExamObj?.resumption_date && (
              <div className="text-sm text-muted-foreground bg-muted/50 rounded px-3 py-2 border">
                <span className="font-medium">Next term resumption:</span> {selectedExamObj.resumption_date}
              </div>
            )}
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
                  const isDirty = isStudentDirty(student.id)
                  const results = studentResults[student.id] || []
                  const isExpanded = expandedCards.has(student.id)
                  const psy = psychomotorRatings[student.id] || {}
                  const aff = affectiveRatings[student.id] || {}
                  const psyExpanded = expandedSections.has(`${student.id}:psy`)
                  const affExpanded = expandedSections.has(`${student.id}:aff`)

                  return (
                    <Card key={student.id} className={isDirty ? 'border-amber-300 dark:border-amber-700' : ''}>
                      <CardContent className="py-4">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <p className="font-semibold text-foreground">{name}</p>
                          <Badge variant="outline" className="text-xs">{student.class}</Badge>
                          <span className="text-xs text-muted-foreground">{student.admission_number}</span>
                          {isDirty && <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">Unsaved</Badge>}
                          <div className="ml-auto flex items-center gap-2">
                            {results.length > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(student.id)}
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                                data-testid={`toggle-results-${student.id}`}
                              >
                                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                {isExpanded ? 'Hide' : 'View'} Results ({results.length})
                              </button>
                            )}
                          </div>
                        </div>

                        {isExpanded && results.length > 0 && (
                          <div className="mb-4 rounded-md border overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Subject</th>
                                  <th className="text-center px-3 py-2 text-muted-foreground font-medium">CA</th>
                                  <th className="text-center px-3 py-2 text-muted-foreground font-medium">Exam</th>
                                  <th className="text-center px-3 py-2 text-muted-foreground font-medium">Total</th>
                                  <th className="text-center px-3 py-2 text-muted-foreground font-medium">Grade</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {results.map((r, i) => (
                                  <tr key={i} className="bg-background">
                                    <td className="px-3 py-2 text-foreground">{r.subject_name}</td>
                                    <td className="px-3 py-2 text-center text-muted-foreground">{r.ca_score != null ? r.ca_score : '—'}</td>
                                    <td className="px-3 py-2 text-center text-muted-foreground">{r.exam_score != null ? r.exam_score : '—'}</td>
                                    <td className="px-3 py-2 text-center font-semibold text-foreground">{r.score != null ? r.score : '—'}</td>
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

                        {/* Psychomotor Skills — collapsible subsection */}
                        <div className="border border-border rounded mb-2">
                          <button
                            type="button"
                            onClick={() => toggleSection(student.id, 'psy')}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/40 transition-colors"
                            data-testid={`toggle-psy-${student.id}`}
                          >
                            <span>Psychomotor Skills</span>
                            {psyExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                          {psyExpanded && (
                            <div className="border-t px-3 py-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {PSYCHOMOTOR_LABELS.map(({ key, label }) => (
                                  <div key={key} className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-foreground w-36 shrink-0">{label}</span>
                                    <RatingButtonGroup
                                      value={psy[key] ?? null}
                                      onChange={v => setPsychomotorRatings(prev => ({
                                        ...prev,
                                        [student.id]: { ...(prev[student.id] || {}), [key]: v }
                                      }))}
                                      testId={`rating-psy-${key}-${student.id}`}
                                    />
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">1=Poor · 2=Fair · 3=Good · 4=Very Good · 5=Excellent</p>
                            </div>
                          )}
                        </div>

                        {/* Affective Areas — collapsible subsection */}
                        <div className="border border-border rounded mb-3">
                          <button
                            type="button"
                            onClick={() => toggleSection(student.id, 'aff')}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/40 transition-colors"
                            data-testid={`toggle-aff-${student.id}`}
                          >
                            <span>Affective Areas</span>
                            {affExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                          {affExpanded && (
                            <div className="border-t px-3 py-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {AFFECTIVE_LABELS.map(({ key, label }) => (
                                  <div key={key} className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-foreground w-36 shrink-0">{label}</span>
                                    <RatingButtonGroup
                                      value={aff[key] ?? null}
                                      onChange={v => setAffectiveRatings(prev => ({
                                        ...prev,
                                        [student.id]: { ...(prev[student.id] || {}), [key]: v }
                                      }))}
                                      testId={`rating-aff-${key}-${student.id}`}
                                    />
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">1=Poor · 2=Fair · 3=Good · 4=Very Good · 5=Excellent</p>
                            </div>
                          )}
                        </div>

                        {/* Teacher's Comment — always visible */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Teacher&apos;s Comment</p>
                          <Textarea
                            placeholder="Enter your teacher's comment for this student..."
                            value={comments[student.id] || ''}
                            onChange={e => setComments(prev => ({ ...prev, [student.id]: e.target.value }))}
                            rows={2}
                            className="text-sm resize-none"
                            data-testid={`textarea-comment-${student.id}`}
                          />
                        </div>
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
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Select an exam above to start entering report card data for your students.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
