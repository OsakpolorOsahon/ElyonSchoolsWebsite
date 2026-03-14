import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const ALL_CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
]

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

  const { data: assignments } = await supabase
    .from('class_teacher')
    .select('class, teacher_profile_id, profiles(full_name)')

  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'teacher')
    .order('full_name')

  const assignmentMap: Record<string, { teacher_profile_id: string; teacher_name: string }> = {}
  for (const a of assignments || []) {
    assignmentMap[a.class] = {
      teacher_profile_id: a.teacher_profile_id,
      teacher_name: (a.profiles as any)?.full_name || '',
    }
  }

  const classes = ALL_CLASSES.map(cls => ({
    class: cls,
    teacher_profile_id: assignmentMap[cls]?.teacher_profile_id || null,
    teacher_name: assignmentMap[cls]?.teacher_name || null,
  }))

  return NextResponse.json({ classes, teachers: teachers || [] })
}

export async function POST(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { class: cls, teacher_profile_id } = body

  if (!cls || !teacher_profile_id) {
    return NextResponse.json({ error: 'class and teacher_profile_id are required' }, { status: 400 })
  }

  if (!ALL_CLASSES.includes(cls)) {
    return NextResponse.json({ error: 'Invalid class name' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('class_teacher')
    .upsert({ class: cls, teacher_profile_id }, { onConflict: 'class' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { class: cls } = body

  if (!cls) return NextResponse.json({ error: 'class is required' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('class_teacher')
    .delete()
    .eq('class', cls)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
