'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CreditCard, ArrowLeft, Loader2 } from 'lucide-react'

const PAYSTACK_SCRIPT_URL = 'https://js.paystack.co/v1/inline.js'

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).PaystackPop) {
      resolve()
      return
    }
    const existing = document.querySelector(`script[src="${PAYSTACK_SCRIPT_URL}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Paystack script failed to load')))
      return
    }
    const script = document.createElement('script')
    script.src = PAYSTACK_SCRIPT_URL
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Paystack script failed to load'))
    document.head.appendChild(script)
  })
}

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [isPaying, setIsPaying] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const [scriptError, setScriptError] = useState(false)

  const admissionId = searchParams.get('id')
  const amount = parseInt(searchParams.get('amount') || '50000', 10)
  const applicantEmail = searchParams.get('email') || 'applicant@elyonschools.edu.ng'
  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

  useEffect(() => {
    if (!admissionId) {
      router.push('/admissions/apply')
      return
    }

    loadPaystackScript()
      .then(() => setScriptReady(true))
      .catch(() => {
        setScriptError(true)
        toast({
          title: 'Payment service unavailable',
          description: 'Could not load payment provider. Please disable any ad blocker and try again, or contact the school.',
          variant: 'destructive',
        })
      })
  }, [admissionId, router, toast])

  const formatAmount = (naira: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(naira)

  const handlePayment = useCallback(() => {
    if (!paystackKey) {
      toast({
        title: 'Payment not configured',
        description: 'Please contact the school to arrange payment.',
        variant: 'destructive',
      })
      return
    }

    if (!scriptReady) {
      toast({
        title: 'Payment not ready',
        description: 'Payment provider is still loading. Please wait a moment and try again.',
        variant: 'destructive',
      })
      return
    }

    setIsPaying(true)

    try {
      const PaystackPop = (window as any).PaystackPop
      if (!PaystackPop) {
        throw new Error('Paystack not available')
      }

      const handler = PaystackPop.setup({
        key: paystackKey,
        email: applicantEmail,
        amount: amount * 100,
        currency: 'NGN',
        ref: `ELYON-ADM-${admissionId}-${Date.now()}`,
        metadata: { admission_id: admissionId },
        callback: async (response: { reference: string }) => {
          try {
            const verifyRes = await fetch('/api/paystack/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference: response.reference, admissionId }),
            })

            if (verifyRes.ok) {
              toast({
                title: 'Payment Successful!',
                description: 'Your application is now being processed.',
              })
              router.push(
                `/payments/receipt?ref=${response.reference}&amount=${amount}&type=admission_fee&name=${encodeURIComponent(applicantEmail)}`
              )
            } else {
              throw new Error('Verification failed')
            }
          } catch {
            toast({
              title: 'Payment verification issue',
              description: 'Payment received but verification failed. Please contact the school with your reference: ' + response.reference,
              variant: 'destructive',
            })
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
    } catch (err) {
      setIsPaying(false)
      toast({
        title: 'Could not open payment',
        description: 'There was a problem opening the payment window. Please try again.',
        variant: 'destructive',
      })
    }
  }, [admissionId, amount, applicantEmail, paystackKey, router, scriptReady, toast])

  const buttonDisabled = isPaying || !scriptReady || scriptError

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
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium truncate max-w-[200px]">{applicantEmail}</span>
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
            disabled={buttonDisabled}
            data-testid="button-pay-now"
          >
            {isPaying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : !scriptReady && !scriptError ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading payment...
              </>
            ) : scriptError ? (
              <>
                <CreditCard className="h-4 w-4" />
                Payment unavailable
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Pay {formatAmount(amount)}
              </>
            )}
          </Button>

          {scriptError && (
            <p className="text-xs text-destructive text-center">
              Payment provider failed to load. Try disabling your ad blocker, or contact the school directly.
            </p>
          )}

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
