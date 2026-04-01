import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireTeacher() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const adminDb = createAdminClient()
  const { data: profile } = await adminDb
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  if (profile?.role !== 'teacher') return null
  // Fetch all classes assigned to this teacher
  const { data: classRows } = await adminDb
    .from('class_teacher')
    .select('class')
    .eq('teacher_profile_id', session.user.id)
  const assignedClasses = (classRows || []).map((r: { class: string }) => r.class)
  return { session, adminDb, assignedClasses }
}

// GET /api/teacher/attendance?date=YYYY-MM-DD&class=...
export async function GET(request: NextRequest) {
  const ctx = await requireTeacher()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (ctx.assignedClasses.length === 0) return NextResponse.json({ error: 'No class assigned' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const requestedClass = searchParams.get('class')

  // Use the requested class if valid, otherwise use the first assigned class
  const targetClass = requestedClass && ctx.assignedClasses.includes(requestedClass)
    ? requestedClass
    : ctx.assignedClasses[0]

  // Fetch all students in the target class
  const { data: students, error: studentsErr } = await ctx.adminDb
    .from('students')
    .select('id, admission_number, profiles!profile_id(full_name)')
    .eq('class', targetClass)
    .eq('status', 'active')
    .order('profiles(full_name)')

  if (studentsErr) return NextResponse.json({ error: studentsErr.message }, { status: 500 })

  // Fetch existing attendance records for this class and date
  let attQuery = ctx.adminDb
    .from('attendance_records')
    .select('*')
    .eq('class', targetClass)

  if (date) attQuery = attQuery.eq('date', date) as typeof attQuery

  const { data: records, error: recErr } = await attQuery
  if (recErr) return NextResponse.json({ error: recErr.message }, { status: 500 })

  return NextResponse.json({
    assignedClasses: ctx.assignedClasses,
    activeClass: targetClass,
    students: students || [],
    records: records || [],
  })
}

// POST /api/teacher/attendance — bulk upsert for a given date
export async function POST(request: NextRequest) {
  const ctx = await requireTeacher()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (ctx.assignedClasses.length === 0) return NextResponse.json({ error: 'No class assigned' }, { status: 403 })

  const body = await request.json()
  const { date, term, year, class: className, records } = body

  if (!date || !term || !year || !className || !Array.isArray(records)) {
    return NextResponse.json({ error: 'date, term, year, class, and records are required' }, { status: 400 })
  }

  // Verify the teacher is allowed to record for this class
  if (!ctx.assignedClasses.includes(className)) {
    return NextResponse.json({ error: 'You are not assigned to this class' }, { status: 403 })
  }

  // Fetch all valid student IDs for this class — security check
  const { data: validStudents, error: vsErr } = await ctx.adminDb
    .from('students')
    .select('id')
    .eq('class', className)
    .eq('status', 'active')

  if (vsErr) return NextResponse.json({ error: vsErr.message }, { status: 500 })
  const validStudentIds = new Set((validStudents || []).map((s: { id: string }) => s.id))

  const validStatuses = ['present', 'absent', 'late', 'excused']
  const rows: Array<{
    student_id: string
    date: string
    status: string
    notes: string | null
    recorded_by: string
    class: string
    term: string
    year: number
  }> = []

  for (const r of records as { student_id: string; status: string; notes?: string }[]) {
    if (!r.student_id || !validStatuses.includes(r.status)) continue
    // Only allow students that actually belong to this class
    if (!validStudentIds.has(r.student_id)) continue
    rows.push({
      student_id: r.student_id,
      date,
      status: r.status,
      notes: r.notes?.trim() || null,
      recorded_by: ctx.session.user.id,
      class: className,
      term,
      year: Number(year),
    })
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No valid records provided' }, { status: 400 })
  }

  const { data, error } = await ctx.adminDb
    .from('attendance_records')
    .upsert(rows, { onConflict: 'student_id,date' })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ records: data })
}
