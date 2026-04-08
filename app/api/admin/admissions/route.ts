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
 * Returns their user ID or null if not found.
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

    if (users.length < perPage) break
    page++
  }
  return null
}

/**
 * Find an existing parent account or invite a new one.
 * Returns { profileId, newUserId } — newUserId is set only when we created a brand-new auth user.
 * newUserId is used for compensation (cleanup) if the subsequent DB transaction fails.
 */
async function findOrInviteParent(
  supabase: ReturnType<typeof createAdminClient>,
  email: string,
  fullName: string,
  siteUrl: string,
): Promise<{ profileId: string; newUserId: string | null }> {

  // 1. Full paginated scan — avoid creating duplicates
  const existingId = await findExistingUserByEmail(supabase, email)
  if (existingId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', existingId)
      .maybeSingle()

    if (!profile) {
      await supabase.from('profiles').insert({ id: existingId, full_name: fullName, role: 'parent' })
    }
    return { profileId: existingId, newUserId: null }
  }

  // 2. Not found — invite as parent
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role: 'parent' },
    redirectTo: `${siteUrl}/reset-password`,
  })

  if (!error) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      role: 'parent',
    })
    return { profileId: data.user.id, newUserId: data.user.id }
  }

  // 3. Race condition: invite failed because user was created between scan and invite attempt
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
      return { profileId: fallbackId, newUserId: null }
    }
  }

  throw new Error(`Failed to create parent portal account: ${error.message}`)
}

/**
 * Compensating action: delete a newly-created auth user (and their profile via CASCADE)
 * when the subsequent DB transaction failed. Best-effort — errors are swallowed so the
 * original failure can still be reported to the admin.
 */
async function compensateNewUser(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
) {
  try {
    await supabase.auth.admin.deleteUser(userId)
  } catch {
    // Compensation is best-effort; log nothing to avoid masking the original error
  }
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

  // Non-acceptance transitions: simple status update only
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

  // 2. Parse DOB
  const dobRaw = studentData.dateOfBirth
  const dob: string | null = dobRaw && /^\d{4}-\d{2}-\d{2}$/.test(dobRaw) ? dobRaw : null

  // 3. Normalise gender
  const genderRaw = (studentData.gender || '').toLowerCase()
  const gender: string | null = genderRaw === 'male' ? 'Male' : genderRaw === 'female' ? 'Female' : null

  let newUserId: string | null = null

  try {
    // 4. Find or invite the parent portal account.
    //    newUserId is non-null only when we NEWLY created the auth user in this request.
    const result = await findOrInviteParent(supabase, guardianEmail, guardianFullName, siteUrl)
    const { profileId: parentProfileId } = result
    newUserId = result.newUserId

    // 5. Atomically: generate admission number, insert student, update admission status.
    //    This runs as a single Postgres transaction inside the RPC function.
    //    If it fails, the entire DB transaction is rolled back.
    //    We also compensate the newly-created auth user (if any) on failure.
    const { data: admissionNumber, error: rpcErr } = await supabase.rpc('accept_admission_transaction', {
      p_admission_id: id,
      p_parent_profile_id: parentProfileId,
      p_student_full_name: studentFullName,
      p_class: admission.class_applied,
      p_dob: dob,
      p_gender: gender,
    })

    if (rpcErr) {
      // Compensate: remove newly-invited user so no partial state remains
      if (newUserId) {
        await compensateNewUser(supabase, newUserId)
      }
      return NextResponse.json(
        { error: `Acceptance failed — no records were saved. ${rpcErr.message}`, compensated: newUserId !== null },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      created: {
        admissionNumber,
        parentEmail: guardianEmail,
        parentInvited: newUserId !== null,
        studentName: studentFullName,
      },
    })

  } catch (err) {
    // Compensate: remove newly-invited user if the error occurred after invite
    if (newUserId) {
      await compensateNewUser(supabase, newUserId)
    }
    const message = err instanceof Error ? err.message : 'Unexpected error during acceptance'
    return NextResponse.json(
      { error: message, compensated: newUserId !== null },
      { status: 500 }
    )
  }
}
