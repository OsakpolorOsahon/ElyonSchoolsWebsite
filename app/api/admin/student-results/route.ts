import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const adminDb = createAdminClient()
  const { data: profile } = await adminDb.from('profiles').select('role').eq('id', session.user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const studentId = request.nextUrl.searchParams.get('studentId')
  if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 })

  const { data: results } = await adminDb
    .from('student_results')
    .select('id, score, ca_score, exam_score, grade, remarks, exam_id, subject_id, exams(id, name, term, year, published), subjects(name, code)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  interface ResultRow {
    id: string
    score: number
    ca_score: number
    exam_score: number
    grade: string
    remarks: string | null
    exam_id: string
    subject_id: string
    exams: { id: string; name: string; term: string; year: number; published: boolean } | null
    subjects: { name: string; code: string } | null
  }

  const typedResults = (results || []) as ResultRow[]

  interface GroupedExam {
    exam_id: string
    exam_name: string
    term: string
    year: number
    published: boolean
    results: { subject: string; code: string; score: number; ca_score: number; exam_score: number; grade: string; remarks: string | null }[]
    average: number
  }

  const grouped: Record<string, GroupedExam> = {}
  for (const r of typedResults) {
    if (!r.exams) continue
    if (!grouped[r.exam_id]) {
      grouped[r.exam_id] = {
        exam_id: r.exam_id,
        exam_name: r.exams.name,
        term: r.exams.term,
        year: r.exams.year,
        published: r.exams.published,
        results: [],
        average: 0,
      }
    }
    grouped[r.exam_id].results.push({
      subject: r.subjects?.name || 'Unknown',
      code: r.subjects?.code || '',
      score: r.score,
      ca_score: r.ca_score,
      exam_score: r.exam_score,
      grade: r.grade,
      remarks: r.remarks,
    })
  }

  const examGroups = Object.values(grouped)
  for (const g of examGroups) {
    g.average = g.results.length > 0
      ? Math.round(g.results.reduce((s, r) => s + r.score, 0) / g.results.length * 10) / 10
      : 0
  }

  examGroups.sort((a, b) => b.year - a.year || a.term.localeCompare(b.term))

  return NextResponse.json({ exams: examGroups })
}
