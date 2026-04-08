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

/** Generate a unique admission number: ELY/YYYY/NNNN */
async function generateAdmissionNumber(supabase: ReturnType<typeof createAdminClient>): Promise<string> {
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
  const next = String((count ?? 0) + 1).padStart(4, '0')
  return `ELY/${year}/${next}`
}

/** Find an existing auth user by email, or invite them as parent and return their profile ID. */
async function findOrInviteParent(
  supabase: ReturnType<typeof createAdminClient>,
  email: string,
  fullName: string,
  siteUrl: string,
): Promise<{ profileId: string; invited: boolean }> {

  // First check if a profile with this email already exists in auth.users
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (!listErr && users) {
    const existing = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (existing) {
      // Ensure profile row exists (it should, but guard against edge cases)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', existing.id)
        .maybeSingle()

      if (!profile) {
        // Create the profile row if missing
        await supabase.from('profiles').insert({
          id: existing.id,
          full_name: fullName,
          role: 'parent',
        })
      }
      return { profileId: existing.id, invited: false }
    }
  }

  // User doesn't exist — invite them as a parent
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role: 'parent' },
    redirectTo: `${siteUrl}/reset-password`,
  })

  if (error) throw new Error(`Failed to invite parent: ${error.message}`)

  // Upsert profile row (invite trigger may create it, but ensure it's correct)
  await supabase.from('profiles').upsert({
    id: data.user.id,
    full_name: fullName,
    role: 'parent',
  })

  return { profileId: data.user.id, invited: true }
}

export async function GET(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const supabase = createAdminClient()
  let query = supabase
    .from('admissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ admissions: data })
}

export async function PATCH(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, status } = body

  if (!id || !status) {
    return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
  }

  const validStatuses = ['pending_payment', 'processing', 'accepted', 'rejected']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // For non-acceptance transitions, just update the status directly
  if (status !== 'accepted') {
    const { error } = await supabase
      .from('admissions')
      .update({ status })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // === ACCEPTANCE FLOW ===
  // Fetch the admission record
  const { data: admission, error: fetchErr } = await supabase
    .from('admissions')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !admission) {
    return NextResponse.json({ error: 'Admission record not found' }, { status: 404 })
  }

  if (admission.status === 'accepted') {
    return NextResponse.json({ error: 'Admission is already accepted' }, { status: 400 })
  }

  if (admission.status !== 'processing') {
    return NextResponse.json({ error: 'Only processing applications can be accepted' }, { status: 400 })
  }

  const studentData = admission.student_data as Record<string, string | null>
  const guardianData = admission.guardian_data as Record<string, string | null>

  const guardianEmail = guardianData.email
  if (!guardianEmail) {
    return NextResponse.json({ error: 'Admission record is missing guardian email' }, { status: 400 })
  }

  const guardianFullName = [guardianData.firstName, guardianData.lastName].filter(Boolean).join(' ')
  const studentFullName = [studentData.firstName, studentData.middleName, studentData.lastName].filter(Boolean).join(' ')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'

  try {
    // 1. Find or create the parent portal account
    const { profileId: parentProfileId, invited } = await findOrInviteParent(
      supabase,
      guardianEmail,
      guardianFullName,
      siteUrl,
    )

    // 2. Generate a unique admission number
    const admissionNumber = await generateAdmissionNumber(supabase)

    // 3. Parse date of birth
    const dobRaw = studentData.dateOfBirth
    const dob = dobRaw && /^\d{4}-\d{2}-\d{2}$/.test(dobRaw) ? dobRaw : null

    // 4. Normalise gender
    const genderRaw = (studentData.gender || '').toLowerCase()
    const gender = genderRaw === 'male' ? 'Male' : genderRaw === 'female' ? 'Female' : null

    // 5. Create the student record
    const { error: studentErr } = await supabase.from('students').insert({
      admission_number: admissionNumber,
      class: admission.class_applied,
      full_name: studentFullName,
      dob,
      gender,
      parent_profile_id: parentProfileId,
      status: 'active',
    })

    if (studentErr) {
      return NextResponse.json(
        { error: `Failed to create student record: ${studentErr.message}` },
        { status: 500 }
      )
    }

    // 6. Update admission status to accepted
    const { error: updateErr } = await supabase
      .from('admissions')
      .update({ status: 'accepted' })
      .eq('id', id)

    if (updateErr) {
      return NextResponse.json(
        { error: `Student created but failed to update admission status: ${updateErr.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      created: {
        admissionNumber,
        parentEmail: guardianEmail,
        parentInvited: invited,
        studentName: studentFullName,
      },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error during acceptance'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
