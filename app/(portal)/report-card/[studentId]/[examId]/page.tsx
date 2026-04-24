'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, Download, Save } from 'lucide-react'
import { downloadAsPdf } from '@/lib/download-pdf'

type RatingVal = number | null

interface PsychomotorRatings {
  handwriting: RatingVal
  verbal_fluency: RatingVal
  games: RatingVal
  sport: RatingVal
  handling_tool: RatingVal
  drawing_painting: RatingVal
  musical_skills: RatingVal
}

interface AffectiveRatings {
  punctuality: RatingVal
  neatness: RatingVal
  politeness: RatingVal
  honesty: RatingVal
  cooperation: RatingVal
  leadership: RatingVal
  helping_others: RatingVal
  emotional_stability: RatingVal
  health: RatingVal
  attitude_to_school_work: RatingVal
  attentiveness: RatingVal
  perseverance: RatingVal
  speaking_handwriting: RatingVal
}

interface ResultRow {
  id: string | null
  score: number | null
  ca_score: number | null
  exam_score: number | null
  grade: string | null
  remarks: string | null
  subject_name: string
  subject_code: string
}

interface ReportData {
  student: {
    id: string
    admission_number: string
    class: string
    department: string | null
    gender: string | null
    full_name: string
  }
  exam: {
    id: string
    name: string
    term: string
    year: number
    published: boolean
    resumption_date: string | null
  }
  results: ResultRow[]
  school_name: string
  principal_name: string
  principal_signature_url: string | null
  principal_comment: string
  teacher_comment: string
  teacher_name: string
  viewer_role: string
  attendance: {
    times_opened: number
    times_present: number
    times_punctual: number
    percentage: number
  }
  position: number
  pupils_in_class: number
  psychomotor_ratings: PsychomotorRatings | null
  affective_ratings: AffectiveRatings | null
}

const PSYCHOMOTOR_LABELS: Array<{ key: keyof PsychomotorRatings; label: string }> = [
  { key: 'handwriting', label: 'Handwriting' },
  { key: 'verbal_fluency', label: 'Verbal Fluency' },
  { key: 'games', label: 'Games' },
  { key: 'sport', label: 'Sport' },
  { key: 'handling_tool', label: 'Handling of Tools' },
  { key: 'drawing_painting', label: 'Drawing & Painting' },
  { key: 'musical_skills', label: 'Musical Skills' },
]

const AFFECTIVE_LABELS: Array<{ key: keyof AffectiveRatings; label: string }> = [
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

const RATING_LABELS: Record<number, string> = {
  5: 'Excellent',
  4: 'Very Good',
  3: 'Good',
  2: 'Fair',
  1: 'Poor',
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function getGradeRemark(score: number | null): string {
  if (score === null) return '—'
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Very Good'
  if (score >= 70) return 'Good'
  if (score >= 60) return 'Fairly Good'
  if (score >= 50) return 'Fair'
  return 'Poor/Fail'
}

function getGradeLetter(score: number | null): string {
  if (score === null) return '—'
  if (score >= 90) return 'A'
  if (score >= 80) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'E'
}

function RatingDisplay({ value }: { value: RatingVal }) {
  if (!value) return <span className="text-gray-400">—</span>
  return (
    <span className="font-semibold text-green-800">
      {value} <span className="text-xs font-normal text-gray-500">({RATING_LABELS[value] || ''})</span>
    </span>
  )
}

function RatingInput({
  value,
  onChange,
  testId,
}: {
  value: RatingVal
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
          className={`w-7 h-7 rounded text-xs font-semibold border transition-colors ${
            value === n
              ? 'bg-green-700 text-white border-green-700'
              : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

const emptyPsychomotor: PsychomotorRatings = {
  handwriting: null, verbal_fluency: null, games: null, sport: null,
  handling_tool: null, drawing_painting: null, musical_skills: null,
}

const emptyAffective: AffectiveRatings = {
  punctuality: null, neatness: null, politeness: null, honesty: null,
  cooperation: null, leadership: null, helping_others: null, emotional_stability: null,
  health: null, attitude_to_school_work: null, attentiveness: null, perseverance: null,
  speaking_handwriting: null,
}

export default function ReportCardPage() {
  const params = useParams()
  const studentId = params.studentId as string
  const examId = params.examId as string
  const { toast } = useToast()

  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [savingComment, setSavingComment] = useState(false)
  const [teacherComment, setTeacherComment] = useState('')
  const [savingTeacherComment, setSavingTeacherComment] = useState(false)
  const [psychomotor, setPsychomotor] = useState<PsychomotorRatings>(emptyPsychomotor)
  const [affective, setAffective] = useState<AffectiveRatings>(emptyAffective)
  const [savingRatings, setSavingRatings] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/report-card/${studentId}/${examId}`)
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to load report card')
        }
        const d: ReportData = await res.json()
        setData(d)
        setComment(d.principal_comment)
        setTeacherComment(d.teacher_comment)
        if (d.psychomotor_ratings) setPsychomotor(d.psychomotor_ratings)
        if (d.affective_ratings) setAffective(d.affective_ratings)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [studentId, examId])

  const handleSaveComment = async () => {
    setSavingComment(true)
    try {
      const res = await fetch(`/api/report-card/${studentId}/${examId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ principal_comment: comment }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast({ title: 'Comment saved', description: "Principal's comment has been updated." })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setSavingComment(false)
    }
  }

  const handleSaveTeacherComment = async () => {
    setSavingTeacherComment(true)
    try {
      const res = await fetch(`/api/report-card/${studentId}/${examId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_comment: teacherComment }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast({ title: 'Comment saved', description: 'Your comment has been saved to the report card.' })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setSavingTeacherComment(false)
    }
  }

  const handleSaveRatings = async () => {
    setSavingRatings(true)
    try {
      const res = await fetch(`/api/report-card/${studentId}/${examId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ psychomotor_ratings: psychomotor, affective_ratings: affective }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast({ title: 'Ratings saved', description: 'Psychomotor and affective ratings have been saved.' })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setSavingRatings(false)
    }
  }

  const handleDownload = async () => {
    if (!data) return
    setGeneratingPdf(true)
    try {
      const filename = `report-card-${data.student.admission_number}-${data.exam.term}-${data.exam.year}.pdf`
      await downloadAsPdf('report-card', filename)
    } finally {
      setGeneratingPdf(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error || 'Report card not found'}</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    )
  }

  const { student, exam, results, school_name, principal_name, principal_signature_url, teacher_name, viewer_role, attendance, position, pupils_in_class } = data
  const scoredResults = results.filter(r => r.score !== null)
  const totalScore = scoredResults.reduce((s, r) => s + (r.score ?? 0), 0)
  const average = scoredResults.length > 0 ? totalScore / scoredResults.length : 0

  const isAdmin = viewer_role === 'admin'
  const isTeacher = viewer_role === 'teacher'
  const canEdit = isAdmin || isTeacher
  const SSS_CLASSES = ['SSS 1', 'SSS 2', 'SSS 3']
  const showDept = SSS_CLASSES.includes(student.class)

  const backUrl = viewer_role === 'student'
    ? '/student/results'
    : viewer_role === 'parent'
    ? '/parent'
    : viewer_role === 'teacher'
    ? '/teacher'
    : '/admin/students'

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-background border-b border-border sticky top-0 z-40" data-pdf-hide>
        <div className="mx-auto max-w-4xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={backUrl}>
              <Button variant="ghost" size="sm" className="gap-1" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Report Card</h1>
          </div>
          <Button onClick={handleDownload} disabled={generatingPdf} className="gap-2" data-testid="button-download">
            {generatingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {generatingPdf ? 'Generating…' : 'Download as PDF'}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm" id="report-card">
          <div className="p-8">

            {/* HEADER */}
            <div className="text-center mb-6 border-b-2 border-green-700 pb-6">
              <div className="flex items-center justify-center gap-4 mb-2">
                <img
                  src="/logo-official.png"
                  alt="School Logo"
                  className="h-20 w-20 object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold text-green-800 uppercase tracking-wider">
                    {school_name}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">Excellence in Education Since 1994</p>
                  <p className="text-xs text-gray-500">Motto: &quot;Hardwork and Determination&quot;</p>
                </div>
                <div className="h-20 w-20" />
              </div>
              <div className="mt-3 inline-block bg-green-700 text-white px-6 py-1.5 rounded-sm text-sm font-semibold uppercase tracking-wider">
                Student Report Card
              </div>
            </div>

            {/* STUDENT INFO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
              <InfoRow label="Student Name" value={student.full_name} testId="text-student-name" />
              <InfoRow label="Admission No" value={student.admission_number} testId="text-admission-number" />
              <InfoRow label="Class" value={student.class} testId="text-class" />
              {showDept && <InfoRow label="Department" value={student.department || 'N/A'} testId="text-department" />}
              <InfoRow label="Term" value={exam.term} testId="text-term" />
              <InfoRow label="Academic Year" value={`${exam.year}/${exam.year + 1}`} testId="text-year" />
              <InfoRow label="Gender" value={student.gender || 'N/A'} />
              <InfoRow label="Exam" value={exam.name} />
              {exam.resumption_date && (
                <InfoRow label="Next Term Begins" value={exam.resumption_date} testId="text-resumption-date" />
              )}
            </div>

            {/* SECTION 1: ATTENDANCE */}
            <SectionHeader title="1. Attendance Record" />
            <table className="w-full border-collapse mb-6 text-sm">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="border border-green-800 px-3 py-2 text-center">No. of Times School Opened</th>
                  <th className="border border-green-800 px-3 py-2 text-center">No. of Times Present</th>
                  <th className="border border-green-800 px-3 py-2 text-center">No. of Times Punctual</th>
                  <th className="border border-green-800 px-3 py-2 text-center">Percentage (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-center">
                  <td className="border border-gray-300 px-3 py-3 font-medium text-lg" data-testid="text-times-opened">
                    {attendance.times_opened || '—'}
                  </td>
                  <td className="border border-gray-300 px-3 py-3 font-medium text-lg" data-testid="text-times-present">
                    {attendance.times_present || '—'}
                  </td>
                  <td className="border border-gray-300 px-3 py-3 font-medium text-lg" data-testid="text-times-punctual">
                    {attendance.times_punctual || '—'}
                  </td>
                  <td className="border border-gray-300 px-3 py-3 font-bold text-lg text-green-800" data-testid="text-attendance-pct">
                    {attendance.times_opened > 0 ? `${attendance.percentage}%` : '—'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* SECTION 2: COGNITIVE ABILITY */}
            <SectionHeader title="2. Cognitive Ability (Academic Performance)" />
            <table className="w-full border-collapse mb-6 text-sm" data-testid="table-results">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="border border-green-800 px-3 py-2 text-left">S/N</th>
                  <th className="border border-green-800 px-3 py-2 text-left">Subject</th>
                  <th className="border border-green-800 px-3 py-2 text-center">1st Half CA (40)</th>
                  <th className="border border-green-800 px-3 py-2 text-center">2nd Half Exam (60)</th>
                  <th className="border border-green-800 px-3 py-2 text-center">Final Total (100)</th>
                  <th className="border border-green-800 px-3 py-2 text-center">Grade</th>
                  <th className="border border-green-800 px-3 py-2 text-left">Remark</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.subject_code + i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-3 py-2 text-center">{i + 1}</td>
                    <td className="border border-gray-300 px-3 py-2 font-medium">{r.subject_name}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {r.score !== null ? (r.ca_score ?? '—') : '—'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {r.score !== null ? (r.exam_score ?? '—') : '—'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-semibold">
                      {r.score !== null ? r.score : '—'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-bold">
                      {r.score !== null ? (
                        <span className={
                          r.score >= 90 ? 'text-green-700' :
                          r.score >= 80 ? 'text-blue-700' :
                          r.score >= 70 ? 'text-blue-600' :
                          r.score >= 60 ? 'text-yellow-700' :
                          r.score >= 50 ? 'text-orange-600' :
                          'text-red-600'
                        }>
                          {getGradeLetter(r.score)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-xs text-gray-600 italic">
                      {r.score !== null ? getGradeRemark(r.score) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              {scoredResults.length > 0 && (
                <tfoot>
                  <tr className="bg-green-50 font-semibold">
                    <td className="border border-gray-300 px-3 py-2" colSpan={4}>
                      Total Score ({scoredResults.length} subject{scoredResults.length !== 1 ? 's' : ''})
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center" data-testid="text-total-score">{totalScore}</td>
                    <td className="border border-gray-300 px-3 py-2" colSpan={2}></td>
                  </tr>
                  <tr className="bg-green-50 font-semibold">
                    <td className="border border-gray-300 px-3 py-2" colSpan={4}>
                      Average Score
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center text-green-800 text-base" data-testid="text-average">
                      {average.toFixed(1)}%
                    </td>
                    <td className="border border-gray-300 px-3 py-2" colSpan={2}></td>
                  </tr>
                  <tr className="bg-green-50 font-semibold">
                    <td className="border border-gray-300 px-3 py-2" colSpan={4}>
                      Position in Class
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center text-green-800 text-base" data-testid="text-position">
                      {ordinal(position)} out of {pupils_in_class}
                    </td>
                    <td className="border border-gray-300 px-3 py-2" colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>

            <div className="mb-6 text-xs text-gray-500 border border-gray-200 rounded px-3 py-2 bg-gray-50">
              <span className="font-semibold">Grading Key:</span>{' '}
              A (90-100) Excellent &nbsp;|&nbsp;
              B+ (80-89) Very Good &nbsp;|&nbsp;
              B (70-79) Good &nbsp;|&nbsp;
              C (60-69) Fairly Good &nbsp;|&nbsp;
              D (50-59) Fair &nbsp;|&nbsp;
              E (0-49) Poor/Fail
            </div>

            {/* SECTION 3: PSYCHOMOTOR SKILLS */}
            <SectionHeader title="3. Psychomotor Skills" />
            <div className="mb-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-green-700 text-white">
                    <th className="border border-green-800 px-3 py-2 text-left">Skill</th>
                    <th className="border border-green-800 px-3 py-2 text-center">Rating (1-5)</th>
                    <th className="border border-green-800 px-3 py-2 text-left">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {PSYCHOMOTOR_LABELS.map(({ key, label }, i) => (
                    <tr key={key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-3 py-2 font-medium">{label}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {canEdit ? (
                          <div className="flex justify-center" data-pdf-hide>
                            <RatingInput
                              value={psychomotor[key]}
                              onChange={v => setPsychomotor(prev => ({ ...prev, [key]: v }))}
                              testId={`rating-psychomotor-${key}`}
                            />
                          </div>
                        ) : null}
                        <span
                          className={canEdit ? 'hidden' : ''}
                          {...(canEdit ? { 'data-pdf-show': 'true' } : {})}
                          data-testid={`display-psychomotor-${key}`}
                        >
                          <RatingDisplay value={psychomotor[key]} />
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-xs text-gray-500 italic">
                        {psychomotor[key] ? RATING_LABELS[psychomotor[key] as number] : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {canEdit && (
                <div className="mt-2 flex justify-end" data-pdf-hide>
                  <Button size="sm" onClick={handleSaveRatings} disabled={savingRatings} className="gap-2" data-testid="button-save-psychomotor">
                    {savingRatings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Ratings
                  </Button>
                </div>
              )}
            </div>

            {/* SECTION 4: AFFECTIVE AREAS */}
            <SectionHeader title="4. Affective Areas (Character Assessment)" />
            <div className="mb-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-green-700 text-white">
                    <th className="border border-green-800 px-3 py-2 text-left">Character Trait</th>
                    <th className="border border-green-800 px-3 py-2 text-center">Rating (1-5)</th>
                    <th className="border border-green-800 px-3 py-2 text-left">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {AFFECTIVE_LABELS.map(({ key, label }, i) => (
                    <tr key={key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-3 py-2 font-medium">{label}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {canEdit ? (
                          <div className="flex justify-center" data-pdf-hide>
                            <RatingInput
                              value={affective[key]}
                              onChange={v => setAffective(prev => ({ ...prev, [key]: v }))}
                              testId={`rating-affective-${key}`}
                            />
                          </div>
                        ) : null}
                        <span
                          className={canEdit ? 'hidden' : ''}
                          {...(canEdit ? { 'data-pdf-show': 'true' } : {})}
                          data-testid={`display-affective-${key}`}
                        >
                          <RatingDisplay value={affective[key]} />
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-xs text-gray-500 italic">
                        {affective[key] ? RATING_LABELS[affective[key] as number] : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {canEdit && (
                <div className="mt-2 flex justify-end" data-pdf-hide>
                  <Button size="sm" onClick={handleSaveRatings} disabled={savingRatings} className="gap-2" data-testid="button-save-affective">
                    {savingRatings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Ratings
                  </Button>
                </div>
              )}
            </div>

            {/* RATING KEY */}
            <div className="mb-6 text-xs text-gray-500 border border-gray-200 rounded px-3 py-2 bg-gray-50">
              <span className="font-semibold">Rating Key:</span>{' '}
              5 — Excellent &nbsp;|&nbsp; 4 — Very Good &nbsp;|&nbsp; 3 — Good &nbsp;|&nbsp; 2 — Fair &nbsp;|&nbsp; 1 — Poor
            </div>

            {/* SECTION 5: COMMENTS & SIGNATURES */}
            <SectionHeader title="5. Comments & Signatures" />
            <div className="space-y-5 border-t-2 border-green-700 pt-4 mt-2">

              {/* Teacher's Comment */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Class Teacher&apos;s Comment:</p>
                {isTeacher && (
                  <div data-pdf-hide className="space-y-2">
                    <Textarea
                      value={teacherComment}
                      onChange={e => setTeacherComment(e.target.value)}
                      placeholder="Enter your comment for this student..."
                      className="min-h-[80px]"
                      data-testid="textarea-teacher-comment"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveTeacherComment}
                      disabled={savingTeacherComment}
                      className="gap-2"
                      data-testid="button-save-teacher-comment"
                    >
                      {savingTeacherComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Comment
                    </Button>
                  </div>
                )}
                <p
                  className={`text-sm italic text-gray-700 border-b border-dotted border-gray-400 min-h-[24px] pb-1 ${isTeacher ? 'hidden' : ''}`}
                  {...(isTeacher ? { 'data-pdf-show': 'true' } : {})}
                  data-testid="text-teacher-comment"
                >
                  {teacherComment || '—'}
                </p>
              </div>

              {/* Principal's Comment */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Principal&apos;s Comment:</p>
                {isAdmin && (
                  <div data-pdf-hide className="space-y-2">
                    <Textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Enter principal's comment for this student..."
                      className="min-h-[80px]"
                      data-testid="textarea-principal-comment"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveComment}
                      disabled={savingComment}
                      className="gap-2"
                      data-testid="button-save-comment"
                    >
                      {savingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Comment
                    </Button>
                  </div>
                )}
                <p
                  className={`text-sm italic text-gray-700 border-b border-dotted border-gray-400 min-h-[24px] pb-1 ${isAdmin ? 'hidden' : ''}`}
                  {...(isAdmin ? { 'data-pdf-show': 'true' } : {})}
                  data-testid="text-principal-comment"
                >
                  {comment || '—'}
                </p>
              </div>

              {/* Teacher name and Principal signature */}
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Class Teacher</p>
                  <p className="text-sm font-medium text-gray-700" data-testid="text-teacher-name">
                    {teacher_name || '—'}
                  </p>
                  <div className="border-b border-gray-300 mt-8 mb-1"></div>
                  <p className="text-xs text-gray-500">Signature</p>
                </div>
                <div className="text-center">
                  {principal_signature_url ? (
                    <div className="flex justify-center mb-1">
                      <img
                        src={principal_signature_url}
                        alt="Principal's Signature"
                        className="h-20 max-w-[280px] object-contain"
                        data-testid="img-principal-signature"
                      />
                    </div>
                  ) : (
                    <div className="border-b border-gray-400 mb-1 h-20"></div>
                  )}
                  <p className="text-xs text-gray-500">
                    {principal_name ? `${principal_name} — ` : ''}Principal&apos;s Signature &amp; School Stamp
                  </p>
                </div>
              </div>

              {exam.resumption_date && (
                <div className="text-center py-2 bg-green-50 rounded border border-green-200 text-sm">
                  <span className="font-semibold text-green-800">Next Term Begins: </span>
                  <span className="text-green-700">{exam.resumption_date}</span>
                </div>
              )}

              <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200">
                <p>This is an official report card of {school_name}. Generated on {new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className="flex gap-2">
      <span className="font-semibold text-gray-600 w-36 shrink-0">{label}:</span>
      <span
        className="font-medium border-b border-dotted border-gray-400 flex-1"
        data-testid={testId}
      >
        {value}
      </span>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-3 mt-2">
      <h2 className="text-sm font-bold text-green-800 uppercase tracking-wide bg-green-50 border-l-4 border-green-700 pl-3 py-1">
        {title}
      </h2>
    </div>
  )
}
