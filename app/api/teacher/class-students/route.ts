import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'teacher') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const className = request.nextUrl.searchParams.get('class')
  if (!className) {
    return NextResponse.json({ error: 'class parameter is required' }, { status: 400 })
  }

  const { data: assignment } = await supabase
    .from('class_teacher')
    .select('class')
    .eq('teacher_profile_id', session.user.id)
    .eq('class', className)
    .single()

  if (!assignment) {
    return NextResponse.json({ error: 'Not assigned to this class' }, { status: 403 })
  }

  const adminDb = createAdminClient()

  const { data: students, error } = await adminDb
    .from('students')
    .select('id, admission_number, class, gender, department, profiles!profile_id(full_name)')
    .eq('class', className)
    .eq('status', 'active')
    .order('admission_number')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ students: students || [] })
}
