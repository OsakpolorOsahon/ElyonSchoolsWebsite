import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { admissionId, email } = body as { admissionId: string; email: string }

    if (!admissionId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
    }

    const supabase = createAdminClient()
    const { data: admission, error: admissionError } = await supabase
      .from('admissions')
      .select('id, amount, status')
      .eq('id', admissionId)
      .single()

    if (admissionError || !admission) {
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 })
    }

    if (admission.status !== 'pending_payment') {
      return NextResponse.json(
        { error: 'This application is not awaiting payment' },
        { status: 400 }
      )
    }

    const amountNaira = admission.amount as number
    const origin = request.nextUrl.origin
    const callbackUrl = `${origin}/admissions/payment/callback?id=${admissionId}&email=${encodeURIComponent(email)}`
    const reference = `ELYON-ADM-${admissionId.slice(0, 8)}-${Date.now()}`

    const initResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountNaira * 100,
        currency: 'NGN',
        reference,
        callback_url: callbackUrl,
        metadata: {
          admission_id: admissionId,
          custom_fields: [
            {
              display_name: 'Application ID',
              variable_name: 'admission_id',
              value: admissionId,
            },
          ],
        },
      }),
    })

    const initData = await initResponse.json()

    if (!initData.status || !initData.data?.authorization_url) {
      return NextResponse.json(
        { error: initData.message || 'Failed to initialize payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      authorization_url: initData.data.authorization_url,
      reference: initData.data.reference,
    })
  } catch (error) {
    console.error('Paystack initialize error:', error)
    return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 })
  }
}
