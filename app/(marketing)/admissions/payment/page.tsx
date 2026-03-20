'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CreditCard, ArrowLeft, Loader2 } from 'lucide-react'

function PaymentContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const admissionId = searchParams.get('id')
  const amount = parseInt(searchParams.get('amount') || '50000', 10)
  const applicantEmail = searchParams.get('email') || ''

  useEffect(() => {
    if (!admissionId) {
      window.location.href = '/admissions/apply'
    }
  }, [admissionId])

  const formatAmount = (naira: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(naira)

  const handlePayment = async () => {
    if (!admissionId) return

    setIsRedirecting(true)
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admissionId,
          email: applicantEmail || 'applicant@elyonschools.edu.ng',
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.authorization_url) {
        throw new Error(data.error || 'Could not initialize payment')
      }

      window.location.href = data.authorization_url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Please try again or contact the school.'
      toast({
        title: 'Could not start payment',
        description: message,
        variant: 'destructive',
      })
      setIsRedirecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Complete Your Application</CardTitle>
          <CardDescription>
            Pay the application fee to submit your admission request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Application ID</span>
              <span className="text-sm font-mono font-medium">{admissionId?.slice(0, 8)}...</span>
            </div>
            {applicantEmail && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium truncate max-w-[200px]">{applicantEmail}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-medium">Application Fee</span>
              <span className="text-2xl font-bold text-primary">{formatAmount(amount)}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            You will be redirected to Paystack's secure checkout to complete your payment. This fee is non-refundable.
          </p>

          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handlePayment}
            disabled={isRedirecting || !admissionId}
            data-testid="button-pay-now"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting to payment...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Pay {formatAmount(amount)}
              </>
            )}
          </Button>

          <div className="text-center">
            <Link
              href="/admissions/apply"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to application
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
