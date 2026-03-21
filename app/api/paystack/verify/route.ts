import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference, admissionId: clientAdmissionId } = body

    if (!reference) {
      return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 })
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

    if (!metadataAdmissionId) {
      return NextResponse.json(
        { error: 'Payment reference is not linked to an admission' },
        { status: 400 }
      )
    }

    if (clientAdmissionId && metadataAdmissionId !== clientAdmissionId) {
      console.error('Admission ID mismatch in Paystack metadata', {
        provided: clientAdmissionId,
        inMetadata: metadataAdmissionId,
        reference,
      })
      return NextResponse.json(
        { error: 'Payment reference does not match admission' },
        { status: 400 }
      )
    }

    const admissionId = metadataAdmissionId

    const supabase = createAdminClient()

    const { data: admissionData, error: admissionLookupError } = await supabase
      .from('admissions')
      .select('id, amount, status, paystack_reference')
      .eq('id', admissionId)
      .single()

    if (admissionLookupError || !admissionData) {
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 })
    }

    const admission = admissionData as {
      id: string
      amount: number
      status: string
      paystack_reference: string | null
    }

    if (admission.status === 'processing' && admission.paystack_reference === reference) {
      return NextResponse.json({ success: true, admissionId, amount: admission.amount })
    }

    const expectedAmountKobo = admission.amount * 100
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
      console.error('Error updating admission status:', admissionError)
      return NextResponse.json(
        { error: 'Payment received but failed to update application status. Please contact the school.' },
        { status: 500 }
      )
    }

    const customer = verifyData.data.customer as { email?: string; first_name?: string; last_name?: string } | null
    const payerName = [customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || null

    await supabase.from('payments').insert({
      admission_id: admissionId,
      amount: verifyData.data.amount / 100,
      status: 'success',
      method: 'paystack',
      payment_type: 'admission_fee',
      payer_email: customer?.email || null,
      payer_name: payerName,
      reference,
      paystack_response: verifyData.data,
    })

    return NextResponse.json({ success: true, admissionId, amount: admission.amount })
  } catch (error) {
    console.error('Paystack verify error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
