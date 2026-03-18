'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Lock, CheckCircle, Loader2, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function ResetPasswordContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [isExchanging, setIsExchanging] = useState(false)
  const [linkInvalid, setLinkInvalid] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (!code) return

    // Exchange the invite code for a session so updateUser() can succeed
    setIsExchanging(true)
    const supabase = createClient()
    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          setLinkInvalid(true)
        }
        // Remove the code from the URL so a page refresh doesn't re-use it
        window.history.replaceState({}, '', '/reset-password')
      })
      .finally(() => setIsExchanging(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
        variant: 'destructive',
      })
      return
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: formData.password })

      if (error) {
        const lower = error.message.toLowerCase()
        const isSessionError =
          lower.includes('jwt') ||
          lower.includes('token') ||
          lower.includes('session') ||
          lower.includes('expired') ||
          lower.includes('invalid refresh') ||
          lower.includes('not authenticated') ||
          lower.includes('timed out')

        if (isSessionError) {
          setIsExpired(true)
        } else {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          })
        }
        return
      }

      setIsComplete(true)
      toast({
        title: 'Password Set',
        description: 'Your password has been created. You can now sign in.',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
              ES
            </div>
          </div>
          <CardTitle className="text-2xl">
            {isComplete ? 'Password Created' : 'Create Your Password'}
          </CardTitle>
          <CardDescription>
            {isComplete
              ? 'You can now sign in to your account'
              : 'Choose a strong password to secure your account'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isComplete ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">All done!</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Your password has been set. Sign in to access your account.
              </p>
              <Button
                onClick={() => { window.location.href = '/login' }}
                className="w-full gap-2"
                data-testid="button-go-to-login"
              >
                <Lock className="h-4 w-4" />
                Go to Sign In
              </Button>
            </div>
          ) : isExpired ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Invitation link expired</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Your invite link has expired. Please ask your administrator to send you a new invitation.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full gap-2" data-testid="button-expired-back-to-login">
                  <Lock className="h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : linkInvalid ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Link already used or expired</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This invite link has already been used or has expired. Please ask your administrator to send a new invitation.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full gap-2">
                  <Lock className="h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : isExchanging ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Setting up your account&hellip;</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                    data-testid="input-new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    data-testid="input-confirm-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isLoading}
                data-testid="button-update-password"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting password&hellip;
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Set Password
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
