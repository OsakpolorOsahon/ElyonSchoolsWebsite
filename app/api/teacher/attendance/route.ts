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
  const { data: classRow } = await adminDb
    .from('class_teacher')
    .select('class')
    .eq('teacher_profile_id', session.user.id)
    .single()
  return { session, adminDb, assignedClass: classRow?.class ?? null }
}

// GET /api/teacher/attendance?date=YYYY-MM-DD&term=...&year=...
export async function GET(request: NextRequest) {
  const ctx = await requireTeacher()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!ctx.assignedClass) return NextResponse.json({ error: 'No class assigned' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const term = searchParams.get('term')
  const year = searchParams.get('year')

  // Fetch all students in the teacher's class
  const { data: students, error: studentsErr } = await ctx.adminDb
    .from('students')
    .select('id, admission_number, profiles!profile_id(full_name)')
    .eq('class', ctx.assignedClass)
    .order('profiles(full_name)')

  if (studentsErr) return NextResponse.json({ error: studentsErr.message }, { status: 500 })

  // Fetch existing attendance records
  let attQuery = ctx.adminDb
    .from('attendance_records')
    .select('*')
    .eq('class', ctx.assignedClass)

  if (date) attQuery = attQuery.eq('date', date) as typeof attQuery
  if (term) attQuery = attQuery.eq('term', term) as typeof attQuery
  if (year) attQuery = attQuery.eq('year', Number(year)) as typeof attQuery

  const { data: records, error: recErr } = await attQuery
  if (recErr) return NextResponse.json({ error: recErr.message }, { status: 500 })

  return NextResponse.json({
    assignedClass: ctx.assignedClass,
    students: students || [],
    records: records || [],
  })
}

// POST /api/teacher/attendance — bulk upsert for a given date
export async function POST(request: NextRequest) {
  const ctx = await requireTeacher()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!ctx.assignedClass) return NextResponse.json({ error: 'No class assigned' }, { status: 403 })

  const body = await request.json()
  const { date, term, year, records } = body

  if (!date || !term || !year || !Array.isArray(records)) {
    return NextResponse.json({ error: 'date, term, year, and records are required' }, { status: 400 })
  }

  const validStatuses = ['present', 'absent', 'late', 'excused']
  const rows = records.map((r: { student_id: string; status: string; notes?: string }) => {
    if (!r.student_id || !validStatuses.includes(r.status)) return null
    return {
      student_id: r.student_id,
      date,
      status: r.status,
      notes: r.notes?.trim() || null,
      recorded_by: ctx.session.user.id,
      class: ctx.assignedClass,
      term,
      year: Number(year),
    }
  }).filter(Boolean)

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
