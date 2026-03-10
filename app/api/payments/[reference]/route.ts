import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    const { reference } = params

    if (!reference) {
      return NextResponse.json({ error: 'Reference required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('payments')
      .select('id, amount, status, payment_type, payer_name, payer_email, reference, created_at, method')
      .eq('reference', reference)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    if (data.status !== 'success') {
      return NextResponse.json({ error: 'Payment was not successful' }, { status: 404 })
    }

    return NextResponse.json({
      id: data.id,
      amount: data.amount,
      payment_type: data.payment_type,
      payer_name: data.payer_name,
      payer_email: data.payer_email,
      reference: data.reference,
      created_at: data.created_at,
      method: data.method,
    })
  } catch (error) {
    console.error('Payment lookup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
