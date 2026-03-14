import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  if (profile?.role !== 'admin') return null
  return session
}

export async function POST(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { profile_id, admission_number, class: cls, gender, parent_profile_id } = body

  if (!profile_id || !admission_number || !cls) {
    return NextResponse.json({ error: 'profile_id, admission_number and class are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { error } = await supabase.from('students').insert({
    profile_id,
    admission_number,
    class: cls,
    gender: gender || null,
    parent_profile_id: parent_profile_id || null,
    status: 'active',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
