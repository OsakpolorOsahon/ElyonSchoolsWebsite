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

// GET /api/admin/attendance
//   ?class=...&term=...&year=...&date=...&date_from=...&date_to=...&student_id=...&search=...
export async function GET(request: NextRequest) {
  const ctx = await requireAdmin()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const className = searchParams.get('class')
  const term = searchParams.get('term')
  const year = searchParams.get('year')
  const date = searchParams.get('date')
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')
  const studentId = searchParams.get('student_id')
  const search = searchParams.get('search')?.trim().toLowerCase()

  let query = ctx.adminDb
    .from('attendance_records')
    .select('*, students(id, admission_number, class, profiles!profile_id(full_name))')
    .order('date', { ascending: false })

  if (className) query = query.eq('class', className) as typeof query
  if (term) query = query.eq('term', term) as typeof query
  if (year) query = query.eq('year', Number(year)) as typeof query
  if (date) query = query.eq('date', date) as typeof query
  if (dateFrom) query = query.gte('date', dateFrom) as typeof query
  if (dateTo) query = query.lte('date', dateTo) as typeof query
  if (studentId) query = query.eq('student_id', studentId) as typeof query

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let records = data || []

  // Apply text search on student name or admission number (post-fetch, Supabase join filter)
  if (search) {
    records = records.filter((r: {
      students: { admission_number: string; profiles: { full_name: string } | null } | null
    }) => {
      const name = r.students?.profiles?.full_name?.toLowerCase() || ''
      const admNum = r.students?.admission_number?.toLowerCase() || ''
      return name.includes(search) || admNum.includes(search)
    })
  }

  return NextResponse.json({ records })
}
