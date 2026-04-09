import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
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

  const { data: assignments } = await supabase
    .from('class_teacher')
    .select('class')
    .eq('teacher_profile_id', session.user.id)

  const classes = (assignments || []).map((a: { class: string }) => a.class)

  if (classes.length === 0) {
    return NextResponse.json({ students: [] })
  }

  const adminDb = createAdminClient()

  const { data: students, error } = await adminDb
    .from('students')
    .select('id, admission_number, class, department, full_name, profiles!profile_id(full_name)')
    .in('class', classes)
    .eq('status', 'active')
    .order('admission_number')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ students: students || [] })
}
