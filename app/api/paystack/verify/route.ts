import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference, admissionId } = body

    if (!reference || !admissionId) {
      return NextResponse.json({ error: 'Missing reference or admissionId' }, { status: 400 })
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    )

    const verifyData = await verifyResponse.json()

    if (!verifyData.status || verifyData.data?.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    const metadataAdmissionId = verifyData.data.metadata?.admission_id as string | undefined
    if (metadataAdmissionId && metadataAdmissionId !== admissionId) {
      console.error('Admission ID mismatch in Paystack metadata', {
        provided: admissionId,
        inMetadata: metadataAdmissionId,
        reference,
      })
      return NextResponse.json(
        { error: 'Payment reference does not match admission' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: admission, error: admissionLookupError } = await supabase
      .from('admissions')
      .select('id, amount, status')
      .eq('id', admissionId)
      .single()

    if (admissionLookupError || !admission) {
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 })
    }

    const expectedAmountKobo = (admission.amount as number) * 100
    const paidAmountKobo = verifyData.data.amount as number
    if (paidAmountKobo < expectedAmountKobo) {
      console.error('Insufficient payment amount', {
        expected: expectedAmountKobo,
        paid: paidAmountKobo,
        reference,
        admissionId,
      })
      return NextResponse.json({ error: 'Insufficient payment amount' }, { status: 400 })
    }

    const { error: admissionError } = await supabase
      .from('admissions')
      .update({
        status: 'processing',
        paystack_reference: reference,
      })
      .eq('id', admissionId)

    if (admissionError) {
      console.error('Error updating admission:', admissionError)
    }

    await supabase.from('payments').insert({
      admission_id: admissionId,
      amount: verifyData.data.amount / 100,
      status: 'success',
      method: 'paystack',
      reference,
      paystack_response: verifyData.data,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Paystack verify error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
