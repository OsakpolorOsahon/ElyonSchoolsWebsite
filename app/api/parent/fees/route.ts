import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calcScholarshipCredit } from '@/lib/scholarship'

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
    .select('id, admission_number, class, profiles!profile_id(full_name)')
    .eq('parent_profile_id', session.user.id)
    .eq('status', 'active')

  const childIds = (children || []).map((c: { id: string }) => c.id)

  const { data: settings } = await adminDb
    .from('academic_settings')
    .select('current_term, current_year')
    .eq('singleton_key', true)
    .single()

  let feeStructures: { id: string; class: string; term: string; year: number; fee_type: string; amount: number }[] = []
  if (settings) {
    const { data: fees } = await adminDb
      .from('fee_structures')
      .select('id, class, term, year, fee_type, amount')
      .eq('term', settings.current_term)
      .eq('year', settings.current_year)
    feeStructures = (fees || []) as typeof feeStructures
  }

  let payments: { id: string; amount: number; status: string; method: string; reference: string; created_at: string; payment_type: string; payer_name: string; term: string; year: number; student_id: string }[] = []
  if (childIds.length > 0) {
    const { data: childPayments } = await adminDb
      .from('payments')
      .select('id, amount, status, method, reference, created_at, payment_type, payer_name, term, year, student_id')
      .in('student_id', childIds)
      .order('created_at', { ascending: false })

    const { data: directPayments } = await adminDb
      .from('payments')
      .select('id, amount, status, method, reference, created_at, payment_type, payer_name, term, year, student_id')
      .or(`user_id.eq.${session.user.id},payer_email.eq.${session.user.email}`)
      .order('created_at', { ascending: false })

    const all = [...(childPayments || [])]
    const existingIds = new Set(all.map(p => p.id))
    for (const dp of (directPayments || [])) {
      if (!existingIds.has(dp.id)) all.push(dp)
    }
    payments = all as typeof payments
  }

  const scholarshipsByChild: Record<string, { id: string; name: string; coverage_type: string; coverage_value: number; fee_types: string[] | null; applies_to_term: string | null; applies_to_year: number | null; active: boolean; notes: string | null } | null> = {}

  if (childIds.length > 0 && settings) {
    const { data: allScholarships } = await adminDb
      .from('scholarships')
      .select('id, student_id, name, coverage_type, coverage_value, fee_types, applies_to_term, applies_to_year, active, notes')
      .in('student_id', childIds)
      .eq('active', true)

    for (const childId of childIds) {
      const childFees = feeStructures.filter(f => {
        const child = (children || []).find((c: { id: string }) => c.id === childId)
        return child && f.class === (child as { class: string }).class
      })
      const childScholarships = (allScholarships || []).filter(s => s.student_id === childId)

      let bestScholarship = null
      let bestCredit = 0

      for (const s of childScholarships) {
        const credit = calcScholarshipCredit(childFees, s as Parameters<typeof calcScholarshipCredit>[1], settings.current_term, settings.current_year)
        if (credit > bestCredit) {
          bestCredit = credit
          bestScholarship = s
        }
      }

      scholarshipsByChild[childId] = bestScholarship
    }
  }

  return NextResponse.json({
    profile: { full_name: profile.full_name },
    children: children || [],
    settings,
    feeStructures,
    payments,
    scholarshipsByChild,
  })
}
