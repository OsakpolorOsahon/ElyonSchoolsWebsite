import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { admissionId, email, amount } = body

    if (!admissionId || !email || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
    }

    const origin = request.nextUrl.origin
    const callbackUrl = `${origin}/admissions/payment/callback?id=${admissionId}`
    const reference = `ELYON-ADM-${admissionId.slice(0, 8)}-${Date.now()}`

    const initResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100,
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
