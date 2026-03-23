'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { CreditCard, GraduationCap, Heart, FileText, Loader2, Shield, CheckCircle } from 'lucide-react'

const paymentTypes = [
  {
    id: 'school_fee',
    title: 'School Fees',
    description: 'Pay tuition and other school fees for enrolled students',
    icon: GraduationCap,
    color: 'text-primary',
    bg: 'bg-primary/10',
    fields: ['student_id', 'amount'],
  },
  {
    id: 'application_fee',
    title: 'Application Fee',
    description: 'Pay the admission application fee when submitting a new application',
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    link: '/admissions/apply',
  },
  {
    id: 'donation',
    title: 'Donation',
    description: 'Support Elyon Schools with a voluntary donation to improve facilities',
    icon: Heart,
    color: 'text-red-500',
    bg: 'bg-red-50',
    fields: ['amount'],
  },
]

function PaymentCard({
  type,
  onPay,
  disabled,
}: {
  type: typeof paymentTypes[0]
  onPay: (id: string, amount: number, metadata: Record<string, string>) => void
  disabled?: boolean
}) {
  const [amount, setAmount] = useState('')
  const [studentId, setStudentId] = useState('')
  const [payerName, setPayerName] = useState('')
  const [payerEmail, setPayerEmail] = useState('')

  if (type.link) {
    return (
      <Card className="hover-elevate">
        <CardHeader>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${type.bg} mb-2`}>
            <type.icon className={`h-6 w-6 ${type.color}`} />
          </div>
          <CardTitle>{type.title}</CardTitle>
          <CardDescription>{type.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={type.link}>
            <Button className="w-full gap-2">
              <FileText className="h-4 w-4" /> Apply Now
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover-elevate">
      <CardHeader>
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${type.bg} mb-2`}>
          <type.icon className={`h-6 w-6 ${type.color}`} />
        </div>
        <CardTitle>{type.title}</CardTitle>
        <CardDescription>{type.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {type.fields?.includes('student_id') && (
          <div className="space-y-1">
            <Label htmlFor={`${type.id}-sid`}>Admission Number</Label>
            <Input
              id={`${type.id}-sid`}
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              placeholder="e.g. ELY/2024/001"
              data-testid={`input-admission-${type.id}`}
            />
          </div>
        )}
        <div className="space-y-1">
          <Label htmlFor={`${type.id}-name`}>Your Full Name</Label>
          <Input
            id={`${type.id}-name`}
            value={payerName}
            onChange={e => setPayerName(e.target.value)}
            placeholder="e.g. Amaka Johnson"
            data-testid={`input-name-${type.id}`}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${type.id}-email`}>Email Address</Label>
          <Input
            id={`${type.id}-email`}
            type="email"
            value={payerEmail}
            onChange={e => setPayerEmail(e.target.value)}
            placeholder="your@email.com"
            data-testid={`input-email-${type.id}`}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${type.id}-amount`}>Amount (₦)</Label>
          <Input
            id={`${type.id}-amount`}
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g. 150000"
            min="100"
            data-testid={`input-amount-${type.id}`}
          />
        </div>
        <Button
          className="w-full gap-2 mt-2"
          onClick={() => {
            const amt = parseFloat(amount)
            if (!amt || amt < 100) return
            onPay(type.id, amt, { student_id: studentId, payer_name: payerName, payer_email: payerEmail })
          }}
          disabled={disabled || !amount || parseFloat(amount) < 100}
          data-testid={`button-pay-${type.id}`}
        >
          {disabled ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Pay ₦{amount ? parseInt(amount).toLocaleString() : '0'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

function PaymentsContent() {
  const { toast } = useToast()
  const [processing, setProcessing] = useState(false)

  const handlePay = async (paymentType: string, amount: number, metadata: Record<string, string>) => {
    setProcessing(true)
    try {
      const origin = window.location.origin
      const res = await fetch('/api/paystack/initialize-general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          payment_type: paymentType,
          email: metadata.payer_email || 'payer@elyonschools.edu.ng',
          payer_name: metadata.payer_name,
          callback_url: `${origin}/payments/callback`,
          student_id: metadata.student_id || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.authorization_url) {
        throw new Error(data.error || 'Could not initialize payment')
      }
      window.location.href = data.authorization_url
    } catch (err) {
      toast({
        title: 'Could not start payment',
        description: err instanceof Error ? err.message : 'Please try again or contact the school.',
        variant: 'destructive',
      })
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">
              <Shield className="mr-1 h-3 w-3" />
              Secure Payments
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Make a Payment
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Pay school fees, donations, and other charges securely online via Paystack.
              All payments are encrypted and protected.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {paymentTypes.map(type => (
              <PaymentCard key={type.id} type={type} onPay={handlePay} disabled={processing} />
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-6 flex-wrap justify-center text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" /> Secured by Paystack
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" /> SSL Encrypted
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" /> Instant Receipt
              </span>
            </div>
          </div>

          <div className="mt-12 bg-muted/50 rounded-xl p-6 text-center max-w-2xl mx-auto">
            <h3 className="font-semibold mb-2">Need help with payments?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Contact our accounts office for payment plan options or assistance.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/contact">
                <Button variant="outline" size="sm">Contact Us</Button>
              </Link>
              <a href="tel:+2348031234567">
                <Button size="sm" variant="outline">Call: +234 803 123 4567</Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <PaymentsContent />
    </Suspense>
  )
}
