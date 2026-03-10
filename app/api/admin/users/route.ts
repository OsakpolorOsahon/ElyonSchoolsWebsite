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

export async function GET() {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) {
    return NextResponse.json({ users: profiles })
  }

  const emailMap: Record<string, string> = {}
  users.forEach(u => { emailMap[u.id] = u.email || '' })

  const combined = (profiles || []).map(p => ({
    ...p,
    email: emailMap[p.id] || '',
  }))

  return NextResponse.json({ users: combined })
}

export async function PATCH(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, role, full_name } = body

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const validRoles = ['admin', 'teacher', 'parent', 'student']
  if (role && !validRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const updates: Record<string, any> = {}
  if (role) updates.role = role
  if (full_name) updates.full_name = full_name

  const { error } = await supabase.from('profiles').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function POST(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { email, full_name, role } = body

  if (!email || !role) {
    return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'}/login`,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: full_name || '',
      role,
    })
  }

  return NextResponse.json({ success: true })
}
