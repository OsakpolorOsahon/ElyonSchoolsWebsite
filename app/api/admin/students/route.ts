import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const ALL_CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
]

const VALID_STATUSES = ['active', 'graduated', 'withdrawn', 'transferred']
const VALID_DEPARTMENTS = ['Science', 'Commercial', 'Art']
const SSS_CLASSES = new Set(['SSS 1', 'SSS 2', 'SSS 3'])

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
  const { data, error } = await supabase
    .from('students')
    .select('id, admission_number, class, gender, status, department, graduation_year, transfer_note, repeating, profile_id, profiles!profile_id(full_name)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ students: data || [] })
}

export async function POST(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { profile_id, admission_number, class: cls, gender, parent_profile_id, department } = body

  if (!profile_id || !admission_number || !cls) {
    return NextResponse.json({ error: 'profile_id, admission_number and class are required' }, { status: 400 })
  }

  if (!ALL_CLASSES.includes(cls)) {
    return NextResponse.json({ error: 'Invalid class' }, { status: 400 })
  }

  const isSSS = SSS_CLASSES.has(cls)
  if (department && !VALID_DEPARTMENTS.includes(department)) {
    return NextResponse.json({ error: 'Invalid department' }, { status: 400 })
  }
  if (department && !isSSS) {
    return NextResponse.json({ error: 'Department can only be set for SSS classes' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('students')
    .select('id')
    .eq('profile_id', profile_id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'This student account is already linked to another student record.' }, { status: 400 })
  }

  const { error } = await supabase.from('students').insert({
    profile_id,
    admission_number,
    class: cls,
    gender: gender || null,
    parent_profile_id: parent_profile_id || null,
    status: 'active',
    department: isSSS ? (department || null) : null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, status, class: cls, department, transfer_note, graduation_year, repeating } = body

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Student id is required' }, { status: 400 })
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  if (cls && !ALL_CLASSES.includes(cls)) {
    return NextResponse.json({ error: 'Invalid class' }, { status: 400 })
  }

  if (department !== undefined && department !== null && !VALID_DEPARTMENTS.includes(department)) {
    return NextResponse.json({ error: 'Invalid department' }, { status: 400 })
  }

  const targetClass = cls || undefined
  if (department && targetClass && !SSS_CLASSES.has(targetClass)) {
    return NextResponse.json({ error: 'Department can only be set for SSS classes' }, { status: 400 })
  }

  if (graduation_year !== undefined && graduation_year !== null) {
    const yr = Number(graduation_year)
    if (!Number.isInteger(yr) || yr < 1994 || yr > 2100) {
      return NextResponse.json({ error: 'Invalid graduation year' }, { status: 400 })
    }
  }

  if (transfer_note !== undefined && typeof transfer_note !== 'string') {
    return NextResponse.json({ error: 'Transfer note must be a string' }, { status: 400 })
  }
  if (transfer_note && transfer_note.length > 500) {
    return NextResponse.json({ error: 'Transfer note must be 500 characters or less' }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (department !== undefined && !cls) {
    const { data: student } = await supabase.from('students').select('class').eq('id', id).single()
    if (student && department && !SSS_CLASSES.has(student.class)) {
      return NextResponse.json({ error: 'Department can only be set for SSS classes' }, { status: 400 })
    }
  }

  if (repeating !== undefined && typeof repeating !== 'boolean') {
    return NextResponse.json({ error: 'Repeating must be a boolean' }, { status: 400 })
  }

  const updateData: Record<string, any> = {}
  if (status) updateData.status = status
  if (cls) updateData.class = cls
  if (department !== undefined) updateData.department = department || null
  if (transfer_note !== undefined) updateData.transfer_note = transfer_note
  if (graduation_year !== undefined) updateData.graduation_year = graduation_year
  if (repeating !== undefined) updateData.repeating = repeating

  if (status === 'graduated' && !graduation_year) {
    updateData.graduation_year = new Date().getFullYear()
  }

  if (status === 'active') {
    if (graduation_year === undefined) updateData.graduation_year = null
    if (transfer_note === undefined) updateData.transfer_note = null
  }

  if (body.admission_number !== undefined) {
    const adm = body.admission_number?.trim()
    if (!adm) return NextResponse.json({ error: 'Admission number cannot be empty' }, { status: 400 })
    updateData.admission_number = adm
  }

  if (body.gender !== undefined) {
    if (body.gender && !['Male', 'Female'].includes(body.gender)) {
      return NextResponse.json({ error: 'Invalid gender' }, { status: 400 })
    }
    updateData.gender = body.gender || null
  }

  if (body.parent_profile_id !== undefined) {
    updateData.parent_profile_id = body.parent_profile_id || null
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { error } = await supabase.from('students').update(updateData).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
