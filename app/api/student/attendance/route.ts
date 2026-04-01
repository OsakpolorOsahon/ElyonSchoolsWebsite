import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireStudent() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const adminDb = createAdminClient()
  const { data: profile } = await adminDb
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  if (profile?.role !== 'student') return null
  const { data: student } = await adminDb
    .from('students')
    .select('id, class')
    .eq('profile_id', session.user.id)
    .single()
  return { session, adminDb, student }
}

// GET /api/student/attendance?term=...&year=...
export async function GET(request: NextRequest) {
  const ctx = await requireStudent()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!ctx.student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const term = searchParams.get('term')
  const year = searchParams.get('year')

  let query = ctx.adminDb
    .from('attendance_records')
    .select('id, date, status, notes, class, term, year')
    .eq('student_id', ctx.student.id)
    .order('date', { ascending: false })

  if (term) query = query.eq('term', term) as typeof query
  if (year) query = query.eq('year', Number(year)) as typeof query

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ records: data || [] })
}
