'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CreditCard, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isPaying, setIsPaying] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  const admissionId = searchParams.get('id')
  const amount = parseInt(searchParams.get('amount') || '50000', 10)
  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

  useEffect(() => {
    if (!admissionId) {
      router.push('/admissions/apply')
    }
  }, [admissionId, router])

  const formatAmount = (kobo: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(kobo)

  const handlePayment = () => {
    if (!paystackKey) {
      toast({
        title: 'Payment not configured',
        description: 'Please contact the school to arrange payment.',
        variant: 'destructive',
      })
      return
    }

    setIsPaying(true)

    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.onload = () => {
      const handler = (window as any).PaystackPop.setup({
        key: paystackKey,
        email: 'applicant@elyonschools.edu.ng',
        amount: amount * 100,
        currency: 'NGN',
        ref: `ELYON-ADM-${admissionId}-${Date.now()}`,
        metadata: { admission_id: admissionId },
        callback: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/paystack/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reference: response.reference,
                admissionId,
              }),
            })

            if (verifyRes.ok) {
              setIsPaid(true)
              toast({
                title: 'Payment Successful!',
                description: 'Your application is now being processed.',
              })
            } else {
              throw new Error('Verification failed')
            }
          } catch {
            toast({
              title: 'Payment verification issue',
              description: 'Payment received but verification failed. Please contact the school.',
              variant: 'destructive',
            })
          } finally {
            setIsPaying(false)
          }
        },
        onClose: () => {
          setIsPaying(false)
          toast({
            title: 'Payment cancelled',
            description: 'You can complete payment at any time.',
          })
        },
      })
      handler.openIframe()
    }
    document.head.appendChild(script)
  }

  if (isPaid) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Application Complete!</h2>
            <p className="text-muted-foreground mb-2">
              Your admission application and payment have been received.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Application ID: <span className="font-mono font-medium">{admissionId}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              We will review your application and contact you within 3-5 business days.
            </p>
            <Link href="/">
              <Button className="w-full">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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
            <div className="flex justify-between items-center">
              <span className="font-medium">Application Fee</span>
              <span className="text-2xl font-bold text-primary">{formatAmount(amount)}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            This fee covers application processing and is non-refundable. Secure payment powered by Paystack.
          </p>

          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handlePayment}
            disabled={isPaying}
          >
            {isPaying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Pay {formatAmount(amount)}
              </>
            )}
          </Button>

          <div className="text-center">
            <Link href="/admissions/apply" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
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
