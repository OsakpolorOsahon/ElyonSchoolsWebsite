import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference, amount, payment_type, payer_name, payer_email, metadata } = body

    if (!reference || !payment_type) {
      return NextResponse.json({ error: 'Missing reference or payment_type' }, { status: 400 })
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

    const actualAmount = verifyData.data.amount / 100
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('payments')
      .insert({
        amount: actualAmount,
        status: 'success',
        method: 'paystack',
        reference,
        payment_type,
        payer_name: payer_name || null,
        payer_email: payer_email || verifyData.data.customer?.email || null,
        paystack_response: verifyData.data,
        metadata: metadata || null,
      })
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
  } catch (error: any) {
    console.error('General payment error:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
