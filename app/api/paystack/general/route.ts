import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      reference,
      payment_type: bodyPaymentType,
      payer_name: bodyPayerName,
      payer_email: bodyPayerEmail,
      metadata: bodyMetadata,
      from_redirect,
    } = body

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${paystackSecretKey}` } }
    )

    const verifyData = await verifyResponse.json()

    if (!verifyData.status || verifyData.data?.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    const paystackMeta = verifyData.data.metadata || {}
    const payment_type = bodyPaymentType || paystackMeta.payment_type
    const payer_name = bodyPayerName || paystackMeta.payer_name || null
    const payer_email = bodyPayerEmail || verifyData.data.customer?.email || null

    const student_id_from_body = bodyMetadata?.student_id
    const student_id_from_paystack = paystackMeta.student_id
    const student_id = student_id_from_body || student_id_from_paystack

    if (!payment_type) {
      return NextResponse.json({ error: 'Missing payment_type' }, { status: 400 })
    }

    const actualAmount = verifyData.data.amount / 100
    const adminDb = createAdminClient()

    const { data: existing } = await adminDb
      .from('payments')
      .select('id')
      .eq('reference', reference)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        success: true,
        paymentId: existing.id,
        amount: actualAmount,
        reference,
        payment_type,
        payer_name,
      })
    }

    const insertData: Record<string, unknown> = {
      amount: actualAmount,
      status: 'success',
      method: 'paystack',
      reference,
      payment_type,
      payer_name,
      payer_email,
      paystack_response: verifyData.data,
      metadata: bodyMetadata || (Object.keys(paystackMeta).length ? paystackMeta : null),
    }

    if (student_id) {
      if (from_redirect) {
        insertData.student_id = student_id
        try {
          const supabase = await createClient()
          const { data: { session } } = await supabase.auth.getSession()
          if (session) insertData.user_id = session.user.id
        } catch {}
      } else if (student_id_from_body) {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          return NextResponse.json({ error: 'Authentication required for student-linked payments' }, { status: 401 })
        }

        const { data: parentProfile } = await adminDb
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (parentProfile?.role === 'parent') {
          const { data: student } = await adminDb
            .from('students')
            .select('id, parent_profile_id')
            .eq('id', student_id)
            .single()

          if (!student || student.parent_profile_id !== session.user.id) {
            return NextResponse.json({ error: 'You can only make payments for your own children' }, { status: 403 })
          }
        } else if (parentProfile?.role !== 'admin') {
          return NextResponse.json({ error: 'Only parents and admins can make student-linked payments' }, { status: 403 })
        }

        insertData.student_id = student_id
        insertData.user_id = session.user.id
      }
    }

    const { data: settings } = await adminDb
      .from('academic_settings')
      .select('current_term, current_year')
      .eq('singleton_key', true)
      .single()
    if (settings) {
      insertData.term = settings.current_term
      insertData.year = settings.current_year
    }

    const { data, error } = await adminDb
      .from('payments')
      .insert(insertData)
      .select('id')
      .single()

    if (error) {
      console.error('Payment insert error:', error)
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      paymentId: data.id,
      amount: actualAmount,
      reference,
      payment_type,
      payer_name,
    })
  } catch (error) {
    console.error('General payment error:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
