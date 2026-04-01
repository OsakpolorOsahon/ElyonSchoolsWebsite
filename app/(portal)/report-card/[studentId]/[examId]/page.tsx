'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, Download, Save } from 'lucide-react'
import { downloadAsPdf } from '@/lib/download-pdf'

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
  }
  results: ResultRow[]
  school_name: string
  principal_name: string
  principal_comment: string
  teacher_comment: string
  teacher_name: string
  viewer_role: string
}

const gradePoints: Record<string, number> = {
  A: 5, B: 4, C: 3, D: 2, E: 1, F: 0,
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
      toast({ title: 'Comment saved', description: "Your comment has been saved to the report card." })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
      setSavingTeacherComment(false)
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

  const { student, exam, results, school_name, principal_name, teacher_name, viewer_role } = data
  const scoredResults = results.filter(r => r.score !== null)
  const totalScore = scoredResults.reduce((s, r) => s + (r.score ?? 0), 0)
  const average = scoredResults.length > 0 ? totalScore / scoredResults.length : 0
  const totalGradePoints = scoredResults.reduce((s, r) => s + (gradePoints[r.grade || 'F'] || 0), 0)

  const isAdmin = viewer_role === 'admin'
  const isTeacher = viewer_role === 'teacher'
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
      <div className="bg-background border-b border-border sticky top-0 z-40">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
              <div className="flex gap-2">
                <span className="font-semibold text-gray-600 w-36 shrink-0">Student Name:</span>
                <span className="font-medium border-b border-dotted border-gray-400 flex-1" data-testid="text-student-name">
                  {student.full_name}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-600 w-36 shrink-0">Admission No:</span>
                <span className="font-medium border-b border-dotted border-gray-400 flex-1" data-testid="text-admission-number">
                  {student.admission_number}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-600 w-36 shrink-0">Class:</span>
                <span className="font-medium border-b border-dotted border-gray-400 flex-1" data-testid="text-class">
                  {student.class}
                </span>
              </div>
              {showDept && (
                <div className="flex gap-2">
                  <span className="font-semibold text-gray-600 w-36 shrink-0">Department:</span>
                  <span className="font-medium border-b border-dotted border-gray-400 flex-1" data-testid="text-department">
                    {student.department || 'N/A'}
                  </span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="font-semibold text-gray-600 w-36 shrink-0">Term:</span>
                <span className="font-medium border-b border-dotted border-gray-400 flex-1" data-testid="text-term">
                  {exam.term}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-600 w-36 shrink-0">Academic Year:</span>
                <span className="font-medium border-b border-dotted border-gray-400 flex-1" data-testid="text-year">
                  {exam.year}/{exam.year + 1}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-600 w-36 shrink-0">Gender:</span>
                <span className="font-medium border-b border-dotted border-gray-400 flex-1">
                  {student.gender || 'N/A'}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-600 w-36 shrink-0">Exam:</span>
                <span className="font-medium border-b border-dotted border-gray-400 flex-1">
                  {exam.name}
                </span>
              </div>
            </div>

            <table className="w-full border-collapse mb-6 text-sm" data-testid="table-results">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="border border-green-800 px-3 py-2 text-left">S/N</th>
                  <th className="border border-green-800 px-3 py-2 text-left">Subject</th>
                  <th className="border border-green-800 px-3 py-2 text-center">CA (40)</th>
                  <th className="border border-green-800 px-3 py-2 text-center">Exam (60)</th>
                  <th className="border border-green-800 px-3 py-2 text-center">Total (100)</th>
                  <th className="border border-green-800 px-3 py-2 text-center">Grade</th>
                  <th className="border border-green-800 px-3 py-2 text-left">Remark</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.subject_code + i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-3 py-2">{i + 1}</td>
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
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {r.grade ? (
                        <span className={`font-bold ${
                          r.grade === 'A' ? 'text-green-700' :
                          r.grade === 'B' ? 'text-blue-700' :
                          r.grade === 'C' ? 'text-yellow-700' :
                          r.grade === 'D' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {r.grade}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-xs text-gray-600 italic">
                      {r.remarks || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              {scoredResults.length > 0 && (
                <tfoot>
                  <tr className="bg-green-50 font-semibold">
                    <td className="border border-gray-300 px-3 py-2" colSpan={4}>
                      Total ({scoredResults.length} subject{scoredResults.length !== 1 ? 's' : ''} scored)
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{totalScore}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{totalGradePoints} pts</td>
                    <td className="border border-gray-300 px-3 py-2"></td>
                  </tr>
                  <tr className="bg-green-50 font-semibold">
                    <td className="border border-gray-300 px-3 py-2" colSpan={4}>
                      Average Score
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center text-green-700 text-lg">
                      {average.toFixed(1)}%
                    </td>
                    <td className="border border-gray-300 px-3 py-2" colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>

            <div className="mb-3 text-xs text-gray-500">
              <span className="font-semibold">Grading Key:</span> A (70-100) Excellent | B (60-69) Very Good | C (50-59) Good | D (45-49) Fair | E (40-44) Pass | F (0-39) Fail
            </div>

            <div className="border-t-2 border-green-700 pt-4 mt-6 space-y-4">

              {/* Teacher's Comment */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Class Teacher&apos;s Comment:</p>
                {isTeacher ? (
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
                ) : null}
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
                {isAdmin ? (
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
                ) : null}
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
                  <p className="text-sm font-medium text-gray-700">
                    {teacher_name || '—'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 mb-1 h-12"></div>
                  <p className="text-xs text-gray-500">
                    {principal_name ? `${principal_name} — ` : ''}Principal&apos;s Signature &amp; School Stamp
                  </p>
                </div>
              </div>

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
