'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Printer, Home, Loader2 } from 'lucide-react'

const paymentTypeLabels: Record<string, string> = {
  school_fee: 'School Fees',
  donation: 'Donation',
  application_fee: 'Application Fee',
  admission_fee: 'Admission Application Fee',
}

function ReceiptContent() {
  const params = useSearchParams()
  const ref = params.get('ref') || ''
  const amount = parseFloat(params.get('amount') || '0')
  const type = params.get('type') || 'payment'
  const name = params.get('name') || 'N/A'
  const now = new Date()

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n)

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden bg-muted/30 border-b px-6 py-3 flex items-center justify-between">
        <Link href="/payments">
          <Button variant="ghost" size="sm" className="gap-2">
            <Home className="h-4 w-4" /> Back
          </Button>
        </Link>
        <Button size="sm" className="gap-2" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print Receipt
        </Button>
      </div>

      <div className="mx-auto max-w-lg px-6 py-12 print:py-4">
        <div className="border-2 border-primary/30 rounded-xl p-8 print:border-gray-400">
          <div className="text-center mb-8 pb-6 border-b">
            <div className="text-4xl mb-2">🏫</div>
            <h1 className="text-2xl font-bold text-primary">ELYON SCHOOLS</h1>
            <p className="text-sm text-muted-foreground">123 Education Avenue, Ikeja, Lagos</p>
            <p className="text-sm text-muted-foreground">Tel: +234 803 123 4567</p>
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-3">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">PAYMENT RECEIPT</h2>
            <p className="text-sm text-green-600 font-medium mt-1">Payment Successful</p>
          </div>

          <div className="space-y-3 mb-6">
            {[
              { label: 'Receipt No.', value: ref.slice(0, 20) + (ref.length > 20 ? '...' : '') },
              { label: 'Payment Type', value: paymentTypeLabels[type] || type },
              { label: 'Payer Name', value: name || 'N/A' },
              { label: 'Amount Paid', value: formatAmount(amount), highlight: true },
              { label: 'Payment Method', value: 'Paystack (Online)' },
              { label: 'Date', value: now.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }) },
              { label: 'Time', value: now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) },
              { label: 'Status', value: 'PAID', status: true },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-dashed border-gray-200 last:border-0">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className={`text-sm font-medium ${row.highlight ? 'text-primary text-lg font-bold' : ''} ${row.status ? 'text-green-600 font-bold' : ''}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            <p>This is a computer-generated receipt. No signature required.</p>
            <p className="mt-1">Keep this receipt for your records.</p>
            <p className="mt-1">© {now.getFullYear()} Elyon Schools. All rights reserved.</p>
          </div>
        </div>

        <div className="print:hidden text-center mt-6 space-y-3">
          <Button className="w-full gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print or Save as PDF
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full">Return to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ReceiptContent />
    </Suspense>
  )
}
