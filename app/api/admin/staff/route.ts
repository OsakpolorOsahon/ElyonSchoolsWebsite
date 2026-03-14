import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const adminDb = createAdminClient()
  const { data: profile } = await adminDb.from('profiles').select('role').eq('id', session.user.id).single()
  if (profile?.role !== 'admin') return null
  return { session, adminDb }
}

export async function GET() {
  const ctx = await requireAdmin()
  if (!ctx) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const { adminDb } = ctx

  const { data: teachers } = await adminDb
    .from('profiles')
    .select('id, full_name, email:id')
    .eq('role', 'teacher')
    .order('full_name')

  const { data: staffProfiles } = await adminDb
    .from('staff_profiles')
    .select('*')

  const staffMap = new Map<string, { id: string; subject_specialty: string | null; qualification: string | null; phone: string | null; bio: string | null }>()
  for (const sp of (staffProfiles || [])) {
    staffMap.set(sp.profile_id, sp)
  }

  const { data: authUsers } = await adminDb.auth.admin.listUsers()
  const emailMap = new Map<string, string>()
  if (authUsers?.users) {
    for (const u of authUsers.users) {
      emailMap.set(u.id, u.email || '')
    }
  }

  const result = (teachers || []).map(t => ({
    profile_id: t.id,
    full_name: t.full_name,
    email: emailMap.get(t.id) || '',
    staff_profile: staffMap.get(t.id) || null,
  }))

  return NextResponse.json({ staff: result })
}

export async function POST(request: NextRequest) {
  const ctx = await requireAdmin()
  if (!ctx) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const body = await request.json()
  const { profile_id, subject_specialty, qualification, phone, bio } = body

  if (!profile_id) {
    return NextResponse.json({ error: 'profile_id is required' }, { status: 400 })
  }

  const { adminDb } = ctx

  const { data, error } = await adminDb
    .from('staff_profiles')
    .upsert({
      profile_id,
      subject_specialty: subject_specialty || null,
      qualification: qualification || null,
      phone: phone || null,
      bio: bio || null,
    }, { onConflict: 'profile_id' })
    .select('id')
    .single()

  if (error) {
    console.error('Staff profile upsert error:', error)
    return NextResponse.json({ error: 'Failed to save staff profile' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id })
}
