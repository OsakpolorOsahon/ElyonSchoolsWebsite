'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, Receipt } from 'lucide-react'

interface PaymentData {
  id: string
  amount: number
  status: string
  method: string
  reference: string
  created_at: string
  payment_type?: string
  payer_name?: string
}

interface Props {
  payment: PaymentData
  trigger?: React.ReactNode
}

const paymentTypeLabels: Record<string, string> = {
  school_fee: 'School Fees',
  donation: 'Donation',
  application_fee: 'Application Fee',
  admission_fee: 'Admission Application Fee',
}

export function PaymentReceiptModal({ payment, trigger }: Props) {
  const formatAmount = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n)

  const rows = [
    { label: 'Receipt Reference', value: payment.reference },
    { label: 'Payment Type', value: paymentTypeLabels[payment.payment_type || ''] || 'Payment' },
    { label: 'Amount', value: formatAmount(payment.amount), highlight: true },
    { label: 'Method', value: payment.method?.toUpperCase() || 'Paystack' },
    { label: 'Status', value: payment.status.toUpperCase(), status: payment.status === 'success' },
    { label: 'Date', value: new Date(payment.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
  ]

  const handlePrint = () => {
    const printContent = `
      <html><head><title>Payment Receipt - Elyon Schools</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 500px; margin: 40px auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #1a5c2a; padding-bottom: 16px; margin-bottom: 24px; }
        .title { color: #1a5c2a; font-size: 24px; font-weight: bold; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #ddd; }
        .label { color: #666; font-size: 14px; }
        .value { font-weight: 500; font-size: 14px; }
        .amount { font-size: 18px; font-weight: bold; color: #1a5c2a; }
        .status-paid { color: #16a34a; font-weight: bold; }
        .footer { text-align: center; font-size: 12px; color: #999; margin-top: 24px; border-top: 1px solid #ddd; padding-top: 16px; }
      </style></head>
      <body>
        <div class="header">
          <div class="title">ELYON SCHOOLS</div>
          <p style="margin:4px 0;font-size:13px;color:#666">123 Education Avenue, Ikeja, Lagos</p>
          <h2 style="margin-top:12px">PAYMENT RECEIPT</h2>
        </div>
        ${rows.map(r => `
          <div class="row">
            <span class="label">${r.label}</span>
            <span class="value ${r.highlight ? 'amount' : ''} ${r.status ? 'status-paid' : ''}">${r.value}</span>
          </div>
        `).join('')}
        <div class="footer">
          <p>This is a computer-generated receipt. No signature required.</p>
          <p>© ${new Date().getFullYear()} Elyon Schools. All rights reserved.</p>
        </div>
      </body></html>
    `
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(printContent)
      win.document.close()
      win.print()
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-1">
            <Receipt className="h-3 w-3" /> Receipt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Payment Receipt</DialogTitle>
        </DialogHeader>
        <div className="border rounded-lg p-6">
          <div className="text-center mb-4 pb-4 border-b">
            <p className="font-bold text-primary text-lg">ELYON SCHOOLS</p>
            <p className="text-xs text-muted-foreground">123 Education Avenue, Ikeja, Lagos</p>
          </div>
          <div className="space-y-2">
            {rows.map(row => (
              <div key={row.label} className="flex justify-between py-1.5 border-b border-dashed border-muted last:border-0">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className={`text-sm font-medium ${row.highlight ? 'text-primary font-bold text-base' : ''} ${row.status ? 'text-green-600 font-bold' : ''}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">Computer-generated receipt. No signature required.</p>
        </div>
        <Button className="w-full gap-2" onClick={handlePrint}>
          <Printer className="h-4 w-4" /> Print Receipt
        </Button>
      </DialogContent>
    </Dialog>
  )
}
