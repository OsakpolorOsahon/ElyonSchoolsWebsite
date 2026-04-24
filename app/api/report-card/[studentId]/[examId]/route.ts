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
  full_name: string | null
  profiles: ProfileRow | null
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
  score: number | null
  ca_score: number | null
  exam_score: number | null
  grade: string | null
  remarks: string | null
  subject_id: string
  subjects: { id: string; name: string; code: string }[] | null
}

interface AttendanceRow {
  date: string
  status: string
}

interface DateRow {
  date: string
}

interface PeerSubjectRow {
  student_id: string
  subject_id: string
  score: number | null
}

const SSS_CLASSES = new Set(['SSS 1', 'SSS 2', 'SSS 3'])

const PSYCHOMOTOR_FIELDS = [
  'handwriting', 'verbal_fluency', 'games', 'sport',
  'handling_tool', 'drawing_painting', 'musical_skills',
] as const

const AFFECTIVE_FIELDS = [
  'punctuality', 'neatness', 'politeness', 'honesty', 'cooperation',
  'leadership', 'helping_others', 'emotional_stability', 'health',
  'attitude_to_school_work', 'attentiveness', 'perseverance', 'speaking_handwriting',
] as const

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
    .select('id, name, term, year, published, resumption_date')
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
    .select('id, admission_number, class, department, gender, full_name, profiles!profile_id(full_name)')
    .eq('id', studentId)
    .single()

  if (!studentData) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const student = studentData as unknown as StudentRow

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

  // Pre-fetch all active students in the class (needed for pupils_in_class, attendance dates, and peer results)
  const { data: classStudentsData } = await adminDb
    .from('students')
    .select('id')
    .eq('class', student.class)
    .eq('status', 'active')

  const classStudentIds = (classStudentsData || []).map(s => s.id as string)
  const pupilsInClass = Math.max(classStudentIds.length, 1)

  const [
    resultsRes,
    subjectsRes,
    settingsRes,
    commentRes,
    classTeacherRes,
    studentAttendanceRes,
    classAttendanceDatesRes,
    peerSubjectResultsRes,
    psychomotorRes,
    affectiveRes,
  ] = await Promise.all([
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
      .select('school_name, principal_name, principal_signature_url')
      .eq('singleton_key', true)
      .single(),
    adminDb
      .from('report_card_comments')
      .select('principal_comment, teacher_comment')
      .eq('student_id', studentId)
      .eq('exam_id', examId)
      .single(),
    adminDb
      .from('class_teacher')
      .select('teacher_profile_id, profiles!teacher_profile_id(full_name)')
      .eq('class', student.class)
      .single(),
    // This student's individual attendance (for times_present and times_punctual)
    adminDb
      .from('attendance_records')
      .select('date, status')
      .eq('student_id', studentId)
      .eq('term', exam.term)
      .eq('year', exam.year),
    // Class-level attendance dates (for times_opened = how many days the school ran)
    classStudentIds.length > 0
      ? adminDb
          .from('attendance_records')
          .select('date')
          .in('student_id', classStudentIds)
          .eq('term', exam.term)
          .eq('year', exam.year)
      : Promise.resolve({ data: [] as DateRow[], error: null }),
    // All subject results for class peers (for per-subject class averages and position)
    classStudentIds.length > 0
      ? adminDb
          .from('student_results')
          .select('student_id, subject_id, score')
          .eq('exam_id', examId)
          .in('student_id', classStudentIds)
      : Promise.resolve({ data: [] as PeerSubjectRow[], error: null }),
    adminDb
      .from('psychomotor_ratings')
      .select('*')
      .eq('student_id', studentId)
      .eq('exam_id', examId)
      .maybeSingle(),
    adminDb
      .from('affective_ratings')
      .select('*')
      .eq('student_id', studentId)
      .eq('exam_id', examId)
      .maybeSingle(),
  ])

  const results = (resultsRes.data || []) as ResultRow[]
  const allSubjects = (subjectsRes.data || []) as SubjectRow[]
  const settings = settingsRes.data
  const commentData = commentRes.data
  const classTeacherData = classTeacherRes.data as unknown as {
    teacher_profile_id: string
    profiles: { full_name: string } | null
  } | null

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
  const peerSubjectRows = (peerSubjectResultsRes.data || []) as PeerSubjectRow[]

  // Build per-subject peer score map for class averages and subject positions
  const subjectPeerScoresMap: Record<string, number[]> = {}
  for (const row of peerSubjectRows) {
    if (row.score === null) continue
    if (!subjectPeerScoresMap[row.subject_id]) subjectPeerScoresMap[row.subject_id] = []
    subjectPeerScoresMap[row.subject_id].push(row.score)
  }

  const assembledResults = applicableSubjects.map(subject => {
    const result = resultsBySubjectId.get(subject.id)
    const subjectScore = result && result.score !== null ? result.score : null
    const subjectPeerScores = subjectPeerScoresMap[subject.id] || []
    const classAvg = subjectPeerScores.length > 0
      ? Math.round((subjectPeerScores.reduce((a, b) => a + b, 0) / subjectPeerScores.length) * 10) / 10
      : null
    const subjectPosition = subjectScore !== null && subjectPeerScores.length > 0
      ? subjectPeerScores.filter(s => s > subjectScore).length + 1
      : null
    return {
      id: result?.id || null,
      subject_name: subject.name,
      subject_code: subject.code,
      ca_score: result ? (result.ca_score !== null ? Number(result.ca_score) : null) : null,
      exam_score: result ? (result.exam_score !== null ? Number(result.exam_score) : null) : null,
      score: subjectScore,
      grade: result?.grade || null,
      remarks: result?.remarks || null,
      class_avg: classAvg,
      subject_position: subjectPosition,
    }
  })

  // Attendance: class-level opened days (any distinct date any class member had a record)
  const studentAttendanceRows = (studentAttendanceRes.data || []) as AttendanceRow[]
  const classDateRows = (classAttendanceDatesRes.data || []) as DateRow[]
  const distinctClassDates = new Set(classDateRows.map(r => r.date))
  const timesOpened = distinctClassDates.size
  const timesPresent = studentAttendanceRows.filter(r => r.status === 'present' || r.status === 'late').length
  const timesPunctual = studentAttendanceRows.filter(r => r.status === 'present').length

  // Overall position: compute per-student average across all subjects (null-safe)
  const peerOverallAvgMap: Record<string, number[]> = {}
  for (const row of peerSubjectRows) {
    if (row.score === null) continue
    if (!peerOverallAvgMap[row.student_id]) peerOverallAvgMap[row.student_id] = []
    peerOverallAvgMap[row.student_id].push(row.score)
  }
  const myScores = results.map(r => r.score).filter((s): s is number => s !== null)
  const myAvg = myScores.length > 0 ? myScores.reduce((a, b) => a + b, 0) / myScores.length : null
  const peerAvgs = Object.values(peerOverallAvgMap)
    .filter(scores => scores.length > 0)
    .map(scores => scores.reduce((a, b) => a + b, 0) / scores.length)
  const position = myAvg !== null
    ? peerAvgs.filter(avg => avg > myAvg).length + 1
    : pupilsInClass

  const psychomotorData = psychomotorRes.data as Record<string, number | null> | null
  const affectiveData = affectiveRes.data as Record<string, number | null> | null

  const buildRatings = (data: Record<string, number | null> | null, fields: readonly string[]) => {
    if (!data) return null
    const out: Record<string, number | null> = {}
    for (const f of fields) out[f] = data[f] ?? null
    return out
  }

  return NextResponse.json({
    student: {
      id: student.id,
      admission_number: student.admission_number,
      class: student.class,
      department: student.department,
      gender: student.gender,
      full_name: student.profiles?.full_name || student.full_name || 'Unknown',
    },
    exam: {
      id: exam.id,
      name: exam.name,
      term: exam.term,
      year: exam.year,
      published: exam.published,
      resumption_date: (exam as unknown as { resumption_date?: string }).resumption_date || null,
    },
    results: assembledResults,
    school_name: settings?.school_name || 'Elyon Schools',
    principal_name: settings?.principal_name || '',
    principal_signature_url: settings?.principal_signature_url || null,
    principal_comment: commentData?.principal_comment || '',
    teacher_comment: commentData?.teacher_comment || '',
    teacher_name: classTeacherData?.profiles?.full_name || '',
    viewer_role: role,
    attendance: {
      times_opened: timesOpened,
      times_present: timesPresent,
      times_punctual: timesPunctual,
      percentage: timesOpened > 0 ? Math.round((timesPresent / timesOpened) * 100) : 0,
    },
    position,
    pupils_in_class: pupilsInClass,
    psychomotor_ratings: buildRatings(psychomotorData, PSYCHOMOTOR_FIELDS),
    affective_ratings: buildRatings(affectiveData, AFFECTIVE_FIELDS),
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

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 403 })
  }

  const role = profile.role as string

  if (role !== 'admin' && role !== 'teacher') {
    return NextResponse.json({ error: 'Only admins and teachers can add comments' }, { status: 403 })
  }

  const body = await request.json()

  if (role === 'teacher') {
    const { data: studentData } = await adminDb
      .from('students')
      .select('class')
      .eq('id', studentId)
      .single()

    if (!studentData) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const { data: teacherClasses } = await adminDb
      .from('class_teacher')
      .select('class')
      .eq('teacher_profile_id', session.user.id)
    const assignedClasses = (teacherClasses || []).map(c => c.class as string)

    if (!assignedClasses.includes((studentData as { class: string }).class)) {
      return NextResponse.json({ error: 'Access denied — you are not the class teacher for this student' }, { status: 403 })
    }

    const teacher_comment = body.teacher_comment
    const psychomotor_ratings = body.psychomotor_ratings ?? body.psychomotor
    const affective_ratings = body.affective_ratings ?? body.affective

    if (teacher_comment !== undefined) {
      if (typeof teacher_comment !== 'string') {
        return NextResponse.json({ error: 'teacher_comment must be a string' }, { status: 400 })
      }
      const { error } = await adminDb
        .from('report_card_comments')
        .upsert(
          { student_id: studentId, exam_id: examId, teacher_comment: teacher_comment.trim() },
          { onConflict: 'student_id,exam_id' }
        )
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (psychomotor_ratings && typeof psychomotor_ratings === 'object') {
      const filtered = Object.fromEntries(
        PSYCHOMOTOR_FIELDS
          .filter(f => psychomotor_ratings[f] !== undefined)
          .map(f => [f, psychomotor_ratings[f]])
      )
      const { error } = await adminDb
        .from('psychomotor_ratings')
        .upsert({ student_id: studentId, exam_id: examId, ...filtered }, { onConflict: 'student_id,exam_id' })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (affective_ratings && typeof affective_ratings === 'object') {
      const filtered = Object.fromEntries(
        AFFECTIVE_FIELDS
          .filter(f => affective_ratings[f] !== undefined)
          .map(f => [f, affective_ratings[f]])
      )
      const { error } = await adminDb
        .from('affective_ratings')
        .upsert({ student_id: studentId, exam_id: examId, ...filtered }, { onConflict: 'student_id,exam_id' })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  if (role === 'admin') {
    const principal_comment = body.principal_comment
    const psychomotor_ratings = body.psychomotor_ratings ?? body.psychomotor
    const affective_ratings = body.affective_ratings ?? body.affective

    if (principal_comment !== undefined) {
      if (typeof principal_comment !== 'string') {
        return NextResponse.json({ error: 'principal_comment must be a string' }, { status: 400 })
      }
      const { error } = await adminDb
        .from('report_card_comments')
        .upsert(
          { student_id: studentId, exam_id: examId, principal_comment: principal_comment.trim() },
          { onConflict: 'student_id,exam_id' }
        )
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (psychomotor_ratings && typeof psychomotor_ratings === 'object') {
      const filtered = Object.fromEntries(
        PSYCHOMOTOR_FIELDS
          .filter(f => psychomotor_ratings[f] !== undefined)
          .map(f => [f, psychomotor_ratings[f]])
      )
      const { error } = await adminDb
        .from('psychomotor_ratings')
        .upsert({ student_id: studentId, exam_id: examId, ...filtered }, { onConflict: 'student_id,exam_id' })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (affective_ratings && typeof affective_ratings === 'object') {
      const filtered = Object.fromEntries(
        AFFECTIVE_FIELDS
          .filter(f => affective_ratings[f] !== undefined)
          .map(f => [f, affective_ratings[f]])
      )
      const { error } = await adminDb
        .from('affective_ratings')
        .upsert({ student_id: studentId, exam_id: examId, ...filtered }, { onConflict: 'student_id,exam_id' })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
