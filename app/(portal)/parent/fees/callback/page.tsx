'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

type VerifyStatus = 'verifying' | 'success' | 'failed'

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<VerifyStatus>('verifying')
  const [reference, setReference] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const ref = searchParams.get('reference') || searchParams.get('trxref') || ''
    setReference(ref)

    if (!ref) {
      setStatus('failed')
      setErrorMessage('No payment reference found.')
      return
    }

    fetch('/api/paystack/general', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: ref, from_redirect: true }),
    })
      .then(async res => {
        const data = await res.json()
        if (res.ok && data.success) {
          setStatus('success')
          setTimeout(() => {
            router.replace('/parent/fees?payment_success=true')
          }, 1500)
        } else {
          setErrorMessage(data.error || 'Payment verification failed.')
          setStatus('failed')
        }
      })
      .catch(() => {
        setErrorMessage('Could not connect to the server. Please contact the school.')
        setStatus('failed')
      })
  }, [searchParams, router])

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-semibold">Verifying your payment...</p>
        <p className="text-sm text-muted-foreground">Please wait — do not close or refresh this page.</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center gap-4 px-4">
        <CheckCircle className="h-12 w-12 text-green-600" />
        <p className="text-lg font-semibold text-green-700">Payment Successful!</p>
        <p className="text-sm text-muted-foreground">Redirecting to your fees page...</p>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Verification Failed</CardTitle>
          <CardDescription>
            {errorMessage || 'We could not confirm your payment. If money was deducted from your account, please contact the school immediately.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reference && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground mb-1">Provide this reference to the school:</p>
              <span className="font-mono font-semibold text-foreground">{reference}</span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Link href="/parent/fees">
              <Button className="w-full" data-testid="button-back-fees">
                Back to Fees
              </Button>
            </Link>
            <Link
              href="https://wa.me/2347035175566?text=Hello%2C%20I%20need%20help%20with%20my%20school%20fee%20payment"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full" data-testid="button-contact-school">
                Contact School on WhatsApp
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ParentFeesCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Processing payment...</p>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
