'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Download, Home, Loader2, AlertCircle } from 'lucide-react'
import { downloadAsPdf } from '@/lib/download-pdf'

const paymentTypeLabels: Record<string, string> = {
  school_fee: 'School Fees',
  donation: 'Donation',
  application_fee: 'Application Fee',
  admission_fee: 'Admission Application Fee',
}

function ReceiptContent() {
  const params = useSearchParams()
  const ref = params.get('ref') || ''

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [receipt, setReceipt] = useState<{
    amount: number
    payment_type?: string
    payer_name?: string
    payer_email?: string
    reference: string
    created_at: string
    method?: string
  } | null>(null)

  useEffect(() => {
    if (!ref) {
      setError('No payment reference provided.')
      setLoading(false)
      return
    }

    fetch(`/api/payments/${encodeURIComponent(ref)}`)
      .then(async res => {
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Receipt not found.')
        } else {
          setReceipt(data.payment || data)
        }
      })
      .catch(() => setError('Failed to load receipt. Please try again.'))
      .finally(() => setLoading(false))
  }, [ref])

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n)

  const handleDownload = async () => {
    setGeneratingPdf(true)
    try {
      await downloadAsPdf('receipt-doc', `elyon-receipt-${ref.slice(0, 16)}.pdf`)
    } finally {
      setGeneratingPdf(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Receipt Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || 'This payment receipt could not be found. Please ensure you have the correct reference.'}
          </p>
          <div className="space-y-3">
            <Link href="/payments">
              <Button className="w-full gap-2">
                <Home className="h-4 w-4" /> Go to Payments
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="w-full">Contact School</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const paymentDate = new Date(receipt.created_at)
  const displayName = receipt.payer_name || receipt.payer_email || 'N/A'
  const typeLabel = receipt.payment_type
    ? (paymentTypeLabels[receipt.payment_type] || receipt.payment_type)
    : 'Payment'

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-muted/30 border-b px-6 py-3 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <Home className="h-4 w-4" /> Home
          </Button>
        </Link>
        <Button size="sm" className="gap-2" onClick={handleDownload} disabled={generatingPdf} data-testid="button-download-receipt">
          {generatingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {generatingPdf ? 'Generating…' : 'Download Receipt'}
        </Button>
      </div>

      <div className="mx-auto max-w-lg px-6 py-12">
        <div id="receipt-doc" className="border-2 border-primary/30 rounded-xl p-8 bg-white">
          <div className="text-center mb-8 pb-6 border-b">
            <img src="/logo.png" alt="Elyon Schools" className="h-16 w-16 object-contain mx-auto mb-2" />
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
              { label: 'Receipt No.', value: receipt.reference.slice(0, 24) + (receipt.reference.length > 24 ? '…' : '') },
              { label: 'Payment Type', value: typeLabel },
              { label: 'Payer Name', value: displayName },
              { label: 'Amount Paid', value: formatAmount(receipt.amount), highlight: true },
              { label: 'Payment Method', value: receipt.method ? receipt.method.charAt(0).toUpperCase() + receipt.method.slice(1) + ' (Online)' : 'Online' },
              { label: 'Date', value: paymentDate.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }) },
              { label: 'Time', value: paymentDate.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) },
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
            <p className="mt-1">© {paymentDate.getFullYear()} Elyon Schools. All rights reserved.</p>
          </div>
        </div>

        <div className="text-center mt-6 space-y-3">
          <Button className="w-full gap-2" onClick={handleDownload} disabled={generatingPdf} data-testid="button-download-pdf">
            {generatingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {generatingPdf ? 'Generating PDF…' : 'Download as PDF'}
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
