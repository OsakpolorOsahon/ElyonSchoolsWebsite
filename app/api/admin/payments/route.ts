import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const adminDb = createAdminClient()
  const { data: profile } = await adminDb.from('profiles').select('role').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can record payments' }, { status: 403 })
  }

  const body = await request.json()
  const { student_id, amount, payment_type, method, reference, notes, date, term, year } = body

  if (!student_id || !amount || !payment_type || !method) {
    return NextResponse.json({ error: 'student_id, amount, payment_type, and method are required' }, { status: 400 })
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
  }

  if (typeof payment_type !== 'string' || payment_type.trim().length === 0 || payment_type.length > 50) {
    return NextResponse.json({ error: 'Payment type must be a non-empty string (max 50 characters)' }, { status: 400 })
  }

  if (!['cash', 'bank_transfer'].includes(method)) {
    return NextResponse.json({ error: 'Method must be cash or bank_transfer' }, { status: 400 })
  }

  const { data: student } = await adminDb
    .from('students')
    .select('id, admission_number, profiles(full_name)')
    .eq('id', student_id)
    .single()

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const studentTyped = student as unknown as { id: string; admission_number: string; profiles: { full_name: string } | null }
  const paymentRef = reference || `OFFLINE-${randomUUID().slice(0, 8).toUpperCase()}`

  let resolvedTerm = term || null
  let resolvedYear = year || null
  if (!resolvedTerm || !resolvedYear) {
    const { data: settings } = await adminDb
      .from('academic_settings')
      .select('current_term, current_year')
      .eq('singleton_key', true)
      .single()
    if (settings) {
      resolvedTerm = resolvedTerm || settings.current_term
      resolvedYear = resolvedYear || settings.current_year
    }
  }

  const { error } = await adminDb.from('payments').insert({
    student_id,
    amount,
    status: 'success',
    method,
    reference: paymentRef,
    payment_type,
    payer_name: studentTyped.profiles?.full_name || studentTyped.admission_number,
    recorded_by: session.user.id,
    notes: notes?.trim() || null,
    term: resolvedTerm,
    year: resolvedYear,
    created_at: date ? new Date(date).toISOString() : new Date().toISOString(),
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A payment with this reference already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
