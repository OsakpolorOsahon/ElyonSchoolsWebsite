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

/**
 * Find an existing auth user by email using paginated listing.
 * Returns their profile ID, or null if not found.
 */
async function findExistingUserByEmail(
  supabase: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<string | null> {
  const normalised = email.toLowerCase()
  let page = 1
  const perPage = 1000

  while (true) {
    const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error || !users) break

    const match = users.find(u => u.email?.toLowerCase() === normalised)
    if (match) return match.id

    // If we got fewer results than perPage, we've exhausted the list
    if (users.length < perPage) break
    page++
  }
  return null
}

/**
 * Invite a new user as 'parent'. If they already exist (race condition),
 * fall back to a paginated lookup and return their existing profile ID.
 * Returns { profileId, invited }.
 */
async function findOrInviteParent(
  supabase: ReturnType<typeof createAdminClient>,
  email: string,
  fullName: string,
  siteUrl: string,
): Promise<{ profileId: string; invited: boolean }> {

  // 1. Deterministic scan first to avoid unnecessary duplicate invites
  const existingId = await findExistingUserByEmail(supabase, email)
  if (existingId) {
    // Ensure the profile row exists with at least role = parent (don't downgrade admins/teachers)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', existingId)
      .maybeSingle()

    if (!profile) {
      await supabase.from('profiles').insert({ id: existingId, full_name: fullName, role: 'parent' })
    }
    return { profileId: existingId, invited: false }
  }

  // 2. User not found — attempt invite
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role: 'parent' },
    redirectTo: `${siteUrl}/reset-password`,
  })

  if (!error) {
    // Upsert profile (invite trigger may race, ensure it's right)
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      role: 'parent',
    })
    return { profileId: data.user.id, invited: true }
  }

  // 3. If invite failed because user already registered (race condition between step 1 and 2),
  //    do another paginated scan to find them.
  const errMsg = error.message?.toLowerCase() ?? ''
  const isAlreadyExists =
    errMsg.includes('already registered') ||
    errMsg.includes('already exists') ||
    errMsg.includes('user already') ||
    errMsg.includes('email address is already')

  if (isAlreadyExists) {
    const fallbackId = await findExistingUserByEmail(supabase, email)
    if (fallbackId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', fallbackId)
        .maybeSingle()
      if (!profile) {
        await supabase.from('profiles').insert({ id: fallbackId, full_name: fullName, role: 'parent' })
      }
      return { profileId: fallbackId, invited: false }
    }
  }

  throw new Error(`Failed to create parent portal account: ${error.message}`)
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

  // Non-acceptance transitions: simple status update
  if (status !== 'accepted') {
    const { error } = await supabase
      .from('admissions')
      .update({ status })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // === ACCEPTANCE FLOW ===

  // 1. Fetch admission record
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

  // 2. Parse and validate dob
  const dobRaw = studentData.dateOfBirth
  const dob: string | null = dobRaw && /^\d{4}-\d{2}-\d{2}$/.test(dobRaw) ? dobRaw : null

  // 3. Normalise gender
  const genderRaw = (studentData.gender || '').toLowerCase()
  const gender: string | null = genderRaw === 'male' ? 'Male' : genderRaw === 'female' ? 'Female' : null

  try {
    // 4. Find or invite the parent (non-transactional; must happen before DB transaction)
    const { profileId: parentProfileId, invited } = await findOrInviteParent(
      supabase,
      guardianEmail,
      guardianFullName,
      siteUrl,
    )

    // 5. Atomically: create student record + update admission status via RPC
    //    The RPC function also generates the admission number from a Postgres sequence.
    //    If anything fails inside the function, the entire transaction rolls back.
    const { data: admissionNumber, error: rpcErr } = await supabase.rpc('accept_admission_transaction', {
      p_admission_id: id,
      p_parent_profile_id: parentProfileId,
      p_student_full_name: studentFullName,
      p_class: admission.class_applied,
      p_dob: dob,
      p_gender: gender,
    })

    if (rpcErr) {
      return NextResponse.json(
        { error: `Could not complete acceptance: ${rpcErr.message}` },
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
    const message = err instanceof Error ? err.message : 'Unexpected error during acceptance'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
