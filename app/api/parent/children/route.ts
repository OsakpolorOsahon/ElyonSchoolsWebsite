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

  if (!profile || profile.role !== 'parent') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminDb = createAdminClient()

  const { data: children, error } = await adminDb
    .from('students')
    .select('id, admission_number, class, profiles!profile_id(full_name)')
    .eq('parent_profile_id', session.user.id)
    .eq('status', 'active')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ children: children || [] })
}
