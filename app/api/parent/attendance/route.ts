import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireParent() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const adminDb = createAdminClient()
  const { data: profile } = await adminDb
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  if (profile?.role !== 'parent') return null
  return { session, adminDb }
}

// GET /api/parent/attendance?student_id=...&term=...&year=...
export async function GET(request: NextRequest) {
  const ctx = await requireParent()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('student_id')
  const term = searchParams.get('term')
  const year = searchParams.get('year')

  if (!studentId) return NextResponse.json({ error: 'student_id is required' }, { status: 400 })

  // Verify the student belongs to this parent
  const { data: student, error: stuErr } = await ctx.adminDb
    .from('students')
    .select('id')
    .eq('id', studentId)
    .eq('parent_profile_id', ctx.session.user.id)
    .single()

  if (stuErr || !student) {
    return NextResponse.json({ error: 'Student not found or not your child' }, { status: 403 })
  }

  let query = ctx.adminDb
    .from('attendance_records')
    .select('id, date, status, notes, class, term, year')
    .eq('student_id', studentId)
    .order('date', { ascending: false })

  if (term) query = query.eq('term', term) as typeof query
  if (year) query = query.eq('year', Number(year)) as typeof query

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ records: data || [] })
}
