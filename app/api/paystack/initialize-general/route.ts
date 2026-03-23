import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      amount,
      payment_type,
      email: clientEmail,
      payer_name,
      callback_url: clientCallbackUrl,
      student_id,
      student_name,
      admission_number,
    } = body as {
      amount: number
      payment_type: string
      email?: string
      payer_name?: string
      callback_url?: string
      student_id?: string
      student_name?: string
      admission_number?: string
    }

    if (!amount || !payment_type) {
      return NextResponse.json({ error: 'Missing amount or payment_type' }, { status: 400 })
    }

    if (amount < 100) {
      return NextResponse.json({ error: 'Amount must be at least ₦100' }, { status: 400 })
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
    }

    const email = clientEmail || 'payer@elyonschools.edu.ng'
    const origin = request.nextUrl.origin
    const callbackUrl = clientCallbackUrl || `${origin}/payments/callback`
    const reference = `ELYON-${payment_type.toUpperCase().replace('_', '-')}-${Date.now()}`

    const metadata: Record<string, string> = { payment_type }
    if (payer_name) metadata.payer_name = payer_name
    if (clientEmail) metadata.payer_email = clientEmail
    if (student_id) metadata.student_id = student_id
    if (student_name) metadata.student_name = student_name
    if (admission_number) metadata.admission_number = admission_number

    if (clientCallbackUrl) {
      try {
        const cbOrigin = new URL(clientCallbackUrl).origin
        if (cbOrigin !== origin) {
          return NextResponse.json({ error: 'Invalid callback_url origin' }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid callback_url' }, { status: 400 })
      }
    }

    const initResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100),
        currency: 'NGN',
        reference,
        callback_url: callbackUrl,
        metadata,
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
    console.error('Paystack initialize-general error:', error)
    return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 })
  }
}
