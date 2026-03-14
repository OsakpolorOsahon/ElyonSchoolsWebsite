import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string; examId: string }> }
) {
  const { studentId, examId } = await params

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const adminDb = createAdminClient()

  const { data: profile } = await adminDb
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 403 })
  }

  const role = profile.role as string

  const { data: exam } = await adminDb
    .from('exams')
    .select('id, name, term, year, published')
    .eq('id', examId)
    .single()

  if (!exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  if (!exam.published && (role === 'student' || role === 'parent')) {
    return NextResponse.json({ error: 'Exam results not published yet' }, { status: 403 })
  }

  const { data: student } = await adminDb
    .from('students')
    .select('id, admission_number, class, department, gender, profiles(full_name)')
    .eq('id', studentId)
    .single()

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  if (role === 'student') {
    const { data: myStudent } = await adminDb
      .from('students')
      .select('id')
      .eq('profile_id', session.user.id)
      .eq('id', studentId)
      .single()
    if (!myStudent) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
  }

  if (role === 'parent') {
    const { data: childStudent } = await adminDb
      .from('students')
      .select('id')
      .eq('parent_profile_id', session.user.id)
      .eq('id', studentId)
      .single()
    if (!childStudent) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
  }

  const { data: results } = await adminDb
    .from('student_results')
    .select('id, score, grade, remarks, subjects(id, name, code)')
    .eq('student_id', studentId)
    .eq('exam_id', examId)
    .order('created_at')

  const { data: settings } = await adminDb
    .from('academic_settings')
    .select('school_name, principal_name')
    .eq('singleton_key', true)
    .single()

  const { data: comment } = await adminDb
    .from('report_card_comments')
    .select('principal_comment')
    .eq('student_id', studentId)
    .eq('exam_id', examId)
    .single()

  return NextResponse.json({
    student: {
      id: student.id,
      admission_number: student.admission_number,
      class: student.class,
      department: student.department,
      gender: student.gender,
      full_name: (student as any).profiles?.full_name || 'Unknown',
    },
    exam: {
      id: exam.id,
      name: exam.name,
      term: exam.term,
      year: exam.year,
      published: exam.published,
    },
    results: (results || []).map((r: any) => ({
      id: r.id,
      score: Number(r.score),
      grade: r.grade,
      remarks: r.remarks,
      subject_name: r.subjects?.name || 'Unknown',
      subject_code: r.subjects?.code || '',
    })),
    school_name: settings?.school_name || 'Elyon Schools',
    principal_name: settings?.principal_name || '',
    principal_comment: comment?.principal_comment || '',
    viewer_role: role,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string; examId: string }> }
) {
  const { studentId, examId } = await params

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const adminDb = createAdminClient()

  const { data: profile } = await adminDb
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can edit principal comments' }, { status: 403 })
  }

  const body = await request.json()
  const { principal_comment } = body

  if (typeof principal_comment !== 'string') {
    return NextResponse.json({ error: 'principal_comment must be a string' }, { status: 400 })
  }

  const { error } = await adminDb
    .from('report_card_comments')
    .upsert(
      {
        student_id: studentId,
        exam_id: examId,
        principal_comment: principal_comment.trim(),
      },
      { onConflict: 'student_id,exam_id' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
