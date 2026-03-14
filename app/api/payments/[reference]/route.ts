import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params

    if (!reference) {
      return NextResponse.json({ error: 'Reference required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const adminDb = createAdminClient()

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reference)
    let payment: any = null

    if (isUUID) {
      const { data } = await adminDb
        .from('payments')
        .select('*')
        .eq('id', reference)
        .single()
      payment = data
    }

    if (!payment) {
      const { data } = await adminDb
        .from('payments')
        .select('*')
        .eq('reference', reference)
        .single()
      payment = data
    }

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const PUBLIC_RECEIPT_TYPES = ['application_fee', 'admission_fee', 'donation']

    if (!session) {
      if (isUUID || !PUBLIC_RECEIPT_TYPES.includes(payment.payment_type) || payment.status !== 'success') {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
      }
      return NextResponse.json({
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          payment_type: payment.payment_type,
          payer_name: payment.payer_name ? payment.payer_name.split(' ').map((w: string) => w[0] + '***').join(' ') : 'N/A',
          reference: payment.reference,
          created_at: payment.created_at,
          method: payment.method,
        }
      })
    }

    const { data: profile } = await adminDb.from('profiles').select('role').eq('id', session.user.id).single()

    if (profile?.role !== 'admin') {
      const isOwner = payment.user_id === session.user.id
      const isPayerEmail = payment.payer_email === session.user.email

      let isParentOfStudent = false
      if (payment.student_id) {
        const { data: student } = await adminDb
          .from('students')
          .select('parent_profile_id')
          .eq('id', payment.student_id)
          .single()
        if (student?.parent_profile_id === session.user.id) isParentOfStudent = true
      }

      if (!isOwner && !isPayerEmail && !isParentOfStudent) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    let student_name: string | null = null
    let admission_number: string | null = null

    if (payment.student_id) {
      const { data: student } = await adminDb
        .from('students')
        .select('admission_number, profiles(full_name)')
        .eq('id', payment.student_id)
        .single()

      if (student) {
        const s = student as unknown as { admission_number: string; profiles: { full_name: string } | null }
        student_name = s.profiles?.full_name || null
        admission_number = s.admission_number || null
      }
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        payment_type: payment.payment_type,
        payer_name: payment.payer_name,
        payer_email: payment.payer_email,
        reference: payment.reference,
        created_at: payment.created_at,
        method: payment.method,
        notes: payment.notes,
        term: payment.term,
        year: payment.year,
        student_name: student_name || payment.payer_name,
        admission_number,
      }
    })
  } catch (error) {
    console.error('Payment lookup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
