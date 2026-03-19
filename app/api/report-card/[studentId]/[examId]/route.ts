import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface ProfileRow {
  full_name: string
}

interface StudentRow {
  id: string
  admission_number: string
  class: string
  department: string | null
  gender: string | null
  profiles: ProfileRow[] | null
}

interface SubjectRow {
  id: string
  name: string
  code: string
  applicable_classes: string[] | null
  applicable_departments: string[] | null
}

interface ResultRow {
  id: string
  score: number
  ca_score: number | null
  exam_score: number | null
  grade: string | null
  remarks: string | null
  subject_id: string
  subjects: { id: string; name: string; code: string }[] | null
}

const SSS_CLASSES = new Set(['SSS 1', 'SSS 2', 'SSS 3'])

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

  const { data: studentData } = await adminDb
    .from('students')
    .select('id, admission_number, class, department, gender, profiles!profile_id(full_name)')
    .eq('id', studentId)
    .single()

  if (!studentData) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const student = studentData as StudentRow

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

  if (role === 'teacher') {
    const { data: teacherClasses } = await adminDb
      .from('class_teacher')
      .select('class')
      .eq('teacher_profile_id', session.user.id)
    const assignedClasses = (teacherClasses || []).map(c => c.class as string)
    if (!assignedClasses.includes(student.class)) {
      return NextResponse.json({ error: 'Access denied — you are not assigned to this student\'s class' }, { status: 403 })
    }
  }

  const [resultsRes, subjectsRes, settingsRes, commentRes] = await Promise.all([
    adminDb
      .from('student_results')
      .select('id, score, ca_score, exam_score, grade, remarks, subject_id, subjects(id, name, code)')
      .eq('student_id', studentId)
      .eq('exam_id', examId)
      .order('created_at'),
    adminDb
      .from('subjects')
      .select('id, name, code, applicable_classes, applicable_departments')
      .order('name'),
    adminDb
      .from('academic_settings')
      .select('school_name, principal_name')
      .eq('singleton_key', true)
      .single(),
    adminDb
      .from('report_card_comments')
      .select('principal_comment')
      .eq('student_id', studentId)
      .eq('exam_id', examId)
      .single(),
  ])

  const results = (resultsRes.data || []) as ResultRow[]
  const allSubjects = (subjectsRes.data || []) as SubjectRow[]
  const settings = settingsRes.data
  const commentData = commentRes.data

  const applicableSubjects = allSubjects.filter(subject => {
    const classes = subject.applicable_classes || []
    if (classes.length > 0 && !classes.includes(student.class)) return false
    if (SSS_CLASSES.has(student.class)) {
      const depts = subject.applicable_departments || []
      if (depts.length > 0 && student.department && !depts.includes(student.department)) return false
    }
    return true
  })

  const resultsBySubjectId = new Map(results.map(r => [r.subject_id, r]))

  const assembledResults = applicableSubjects.map(subject => {
    const result = resultsBySubjectId.get(subject.id)
    return {
      id: result?.id || null,
      subject_name: subject.name,
      subject_code: subject.code,
      ca_score: result ? Number(result.ca_score ?? 0) : null,
      exam_score: result ? Number(result.exam_score ?? 0) : null,
      score: result ? Number(result.score) : null,
      grade: result?.grade || null,
      remarks: result?.remarks || null,
    }
  })

  return NextResponse.json({
    student: {
      id: student.id,
      admission_number: student.admission_number,
      class: student.class,
      department: student.department,
      gender: student.gender,
      full_name: student.profiles?.[0]?.full_name || 'Unknown',
    },
    exam: {
      id: exam.id,
      name: exam.name,
      term: exam.term,
      year: exam.year,
      published: exam.published,
    },
    results: assembledResults,
    school_name: settings?.school_name || 'Elyon Schools',
    principal_name: settings?.principal_name || '',
    principal_comment: commentData?.principal_comment || '',
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
