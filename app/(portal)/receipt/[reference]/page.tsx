'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Printer, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface PaymentData {
  id: string
  amount: number
  status: string
  method: string
  reference: string
  created_at: string
  payment_type?: string
  payer_name?: string
  student_name?: string
  admission_number?: string
  notes?: string
  term?: string
  year?: number
}

const paymentTypeLabels: Record<string, string> = {
  school_fee: 'School Fees',
  tuition: 'Tuition',
  pta_levy: 'PTA Levy',
  books: 'Books',
  uniform: 'Uniform',
  technology_fee: 'Technology Fee',
  sports_fee: 'Sports Fee',
  lab_fee: 'Lab Fee',
  exam_fee: 'Exam Fee',
  donation: 'Donation',
  application_fee: 'Application Fee',
  admission_fee: 'Admission Application Fee',
}

export default function ReceiptPage() {
  const params = useParams()
  const reference = params.reference as string
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/payments/${reference}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setPayment(data.payment)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load receipt')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [reference])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">{error || 'Payment not found'}</p>
          <Button variant="outline" className="gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    )
  }

  const isPaid = payment.status === 'success'

  const rows = [
    { label: 'Receipt Reference', value: payment.reference },
    ...(payment.student_name ? [{ label: 'Student Name', value: payment.student_name }] : []),
    ...(payment.admission_number ? [{ label: 'Admission Number', value: payment.admission_number }] : []),
    ...(payment.payer_name && !payment.student_name ? [{ label: 'Payer', value: payment.payer_name }] : []),
    { label: 'Payment Type', value: paymentTypeLabels[payment.payment_type || ''] || payment.payment_type || 'Payment' },
    { label: 'Amount', value: formatAmount(payment.amount), highlight: true },
    { label: 'Method', value: payment.method?.toUpperCase() || 'N/A' },
    ...(payment.term ? [{ label: 'Term/Year', value: `${payment.term} Term ${payment.year || ''}` }] : []),
    { label: 'Date', value: new Date(payment.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
  ]

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="min-h-screen bg-muted/30 py-8 px-4">
        <div className="no-print flex justify-center gap-3 mb-6">
          <Button variant="outline" className="gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button className="gap-2" onClick={() => window.print()} data-testid="button-print-receipt">
            <Printer className="h-4 w-4" /> Print / Save as PDF
          </Button>
        </div>

        <div className="max-w-lg mx-auto bg-white border rounded-xl p-8 shadow-sm relative overflow-hidden" data-testid="receipt-content">
          {isPaid && (
            <div className="absolute top-1/2 right-8 -translate-y-1/2 -rotate-[15deg] border-[5px] border-green-500 text-green-500 text-4xl font-extrabold px-8 py-3 rounded-xl opacity-15 pointer-events-none select-none">
              PAID
            </div>
          )}

          <div className="text-center mb-6 pb-6 border-b-2 border-primary">
            <h1 className="text-2xl font-bold text-primary tracking-tight" data-testid="text-school-name">ELYON SCHOOLS</h1>
            <p className="text-sm text-muted-foreground mt-1">123 Education Avenue, Ikeja, Lagos</p>
            <p className="text-sm text-muted-foreground">Tel: +234 xxx xxx xxxx</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <h2 className="text-xl font-semibold">PAYMENT RECEIPT</h2>
              {isPaid && <CheckCircle className="h-5 w-5 text-green-600" />}
            </div>
          </div>

          <div className="space-y-3">
            {rows.map(row => (
              <div key={row.label} className="flex justify-between py-2 border-b border-dashed border-gray-200 last:border-0">
                <span className="text-sm text-gray-500">{row.label}</span>
                <span className={`text-sm font-medium text-right ${row.highlight ? 'text-primary font-bold text-lg' : ''}`} data-testid={`receipt-${row.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {isPaid && (
            <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-700 font-semibold text-sm">Payment Confirmed</p>
            </div>
          )}

          <div className="mt-8 pt-4 border-t text-center">
            <p className="text-xs text-gray-400">This is a computer-generated receipt. No signature required.</p>
            <p className="text-xs text-gray-400 mt-1">&copy; {new Date().getFullYear()} Elyon Schools. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  )
}
