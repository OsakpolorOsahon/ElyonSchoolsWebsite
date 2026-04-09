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
    .select('id, admission_number, class, gender, status, department, graduation_year, transfer_note, repeating, profile_id, parent_profile_id, full_name, profiles!profile_id(full_name)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ students: data || [] })
}

export async function POST(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { profile_id, full_name, admission_number, class: cls, gender, parent_profile_id, department } = body

  // Either a portal account (profile_id) or a direct name is required
  if (!profile_id && !full_name?.trim()) {
    return NextResponse.json({ error: 'Either a portal account or a student name is required' }, { status: 400 })
  }
  if (!admission_number || !cls) {
    return NextResponse.json({ error: 'admission_number and class are required' }, { status: 400 })
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

  // If profile_id provided, check it's not already linked
  if (profile_id) {
    const { data: existing } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', profile_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'This student account is already linked to another student record.' }, { status: 400 })
    }
  }

  const insertPayload: Record<string, any> = {
    admission_number,
    class: cls,
    gender: gender || null,
    parent_profile_id: parent_profile_id || null,
    status: 'active',
    department: isSSS ? (department || null) : null,
  }

  if (profile_id) {
    insertPayload.profile_id = profile_id
    // When linked to a portal account, name is on the profile; clear full_name
    insertPayload.full_name = null
  } else {
    insertPayload.full_name = full_name.trim()
    insertPayload.profile_id = null
  }

  const { error } = await supabase.from('students').insert(insertPayload)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, action } = body

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Student id is required' }, { status: 400 })
  }

  // Special action: invite student to portal and link the resulting profile
  if (action === 'invite_to_portal') {
    const { email } = body
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch student to get their stored name
    const { data: student, error: fetchErr } = await supabase
      .from('students')
      .select('id, full_name, profile_id')
      .eq('id', id)
      .single()

    if (fetchErr || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    if (student.profile_id) {
      return NextResponse.json({ error: 'This student already has a portal account' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'

    // Attempt to invite as a student portal user
    const { data: inviteData, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name: student.full_name || '', role: 'student' },
      redirectTo: `${siteUrl}/reset-password`,
    })

    if (inviteErr) {
      return NextResponse.json({ error: `Failed to send invite: ${inviteErr.message}` }, { status: 500 })
    }

    const newUserId = inviteData.user.id

    // Upsert profile row
    await supabase.from('profiles').upsert({
      id: newUserId,
      full_name: student.full_name || '',
      role: 'student',
    })

    // Link profile to student and clear stored full_name (profile now holds the name)
    const { error: linkErr } = await supabase
      .from('students')
      .update({ profile_id: newUserId, full_name: null })
      .eq('id', id)

    if (linkErr) {
      // Best-effort cleanup of the invite since we could not link
      try {
        await supabase.auth.admin.deleteUser(newUserId)
      } catch { /* swallow */ }
      return NextResponse.json({ error: `Invite sent but failed to link profile: ${linkErr.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, profileId: newUserId })
  }

  // Standard field updates
  const { status, class: cls, department, transfer_note, graduation_year, repeating } = body

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  if (cls && !ALL_CLASSES.includes(cls)) {
    return NextResponse.json({ error: 'Invalid class' }, { status: 400 })
  }

  if (department !== undefined && department !== null && !VALID_DEPARTMENTS.includes(department)) {
    return NextResponse.json({ error: 'Invalid department' }, { status: 400 })
  }

  // If changing to a non-SSS class, department will be auto-cleared — skip the 400 check

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
  if (cls) {
    updateData.class = cls
    // When changing to a non-SSS class, always clear department regardless of what was sent
    if (!SSS_CLASSES.has(cls)) {
      updateData.department = null
    } else if (department !== undefined) {
      updateData.department = department || null
    }
  } else if (department !== undefined) {
    updateData.department = department || null
  }
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
