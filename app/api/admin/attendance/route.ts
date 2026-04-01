import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const adminDb = createAdminClient()
  const { data: profile } = await adminDb
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  if (profile?.role !== 'admin') return null
  return { session, adminDb }
}

// GET /api/admin/attendance?class=...&term=...&year=...&date=...&student_id=...
export async function GET(request: NextRequest) {
  const ctx = await requireAdmin()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const className = searchParams.get('class')
  const term = searchParams.get('term')
  const year = searchParams.get('year')
  const date = searchParams.get('date')
  const studentId = searchParams.get('student_id')

  let query = ctx.adminDb
    .from('attendance_records')
    .select('*, students(admission_number, class, profiles!profile_id(full_name))')
    .order('date', { ascending: false })

  if (className) query = query.eq('class', className) as typeof query
  if (term) query = query.eq('term', term) as typeof query
  if (year) query = query.eq('year', Number(year)) as typeof query
  if (date) query = query.eq('date', date) as typeof query
  if (studentId) query = query.eq('student_id', studentId) as typeof query

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ records: data || [] })
}
