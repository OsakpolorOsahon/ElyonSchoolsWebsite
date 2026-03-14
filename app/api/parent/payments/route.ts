import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const adminDb = createAdminClient()
  const { data: profile } = await adminDb.from('profiles').select('role, full_name').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'parent') {
    return NextResponse.json({ error: 'Parent access only' }, { status: 403 })
  }

  const { data: children } = await adminDb
    .from('students')
    .select('id')
    .eq('parent_profile_id', session.user.id)
  const childIds = (children || []).map((c: { id: string }) => c.id)

  const { data: directPayments } = await adminDb
    .from('payments')
    .select('id, amount, status, method, reference, created_at, payment_type, payer_name, student_id')
    .or(`user_id.eq.${session.user.id},payer_email.eq.${session.user.email}`)
    .order('created_at', { ascending: false })

  const all = [...(directPayments || [])]

  if (childIds.length > 0) {
    const { data: childPayments } = await adminDb
      .from('payments')
      .select('id, amount, status, method, reference, created_at, payment_type, payer_name, student_id')
      .in('student_id', childIds)
      .order('created_at', { ascending: false })

    const existingIds = new Set(all.map(p => p.id))
    for (const cp of (childPayments || [])) {
      if (!existingIds.has(cp.id)) all.push(cp)
    }
    all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  return NextResponse.json({
    profile: { full_name: profile.full_name },
    payments: all,
  })
}
