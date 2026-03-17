'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Lock, CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function isSessionExpiredError(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('jwt') ||
    lower.includes('token') ||
    lower.includes('session') ||
    lower.includes('expired') ||
    lower.includes('invalid refresh') ||
    lower.includes('timed out')
  )
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isReady, setIsReady] = useState(false)
  const [isError, setIsError] = useState(false)
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
    const supabase = createClient()

    async function initSession() {
      const hash = window.location.hash
      const params = new URLSearchParams(hash.replace(/^#/, ''))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type')

      if (accessToken && refreshToken && (type === 'invite' || type === 'recovery')) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (error) {
          if (isSessionExpiredError(error.message)) {
            setIsExpired(true)
          } else {
            setIsError(true)
          }
        } else if (
          data.session?.expires_at &&
          data.session.expires_at * 1000 < Date.now()
        ) {
          setIsExpired(true)
        } else {
          setIsReady(true)
        }
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsReady(true)
        return
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (
          (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') &&
          session
        ) {
          setIsReady(true)
          subscription.unsubscribe()
        }
      })

      const timer = setTimeout(() => {
        setIsError(true)
      }, 12000)

      return () => {
        clearTimeout(timer)
        subscription.unsubscribe()
      }
    }

    const cleanup = initSession()
    return () => {
      cleanup.then(fn => fn?.())
    }
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

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out — please try again.')), 20000)
      )

      const { error } = await Promise.race([
        supabase.auth.updateUser({ password: formData.password }),
        timeout,
      ])

      if (error) {
        if (isSessionExpiredError(error.message)) {
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
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      if (isSessionExpiredError(message)) {
        setIsExpired(true)
      } else {
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        })
      }
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
              <Button onClick={() => { window.location.href = '/login' }} className="w-full gap-2" data-testid="button-go-to-login">
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
                Your invitation link has expired. Please ask your administrator to delete your account and send you a new invitation.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full gap-2" data-testid="button-expired-back-to-login">
                  <Lock className="h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : isError ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Link expired or invalid</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This link has expired or already been used. Request a new password reset link below.
              </p>
              <Button onClick={() => { window.location.href = '/forgot-password' }} className="w-full gap-2">
                Request New Link
              </Button>
              <div className="mt-3">
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground underline">
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : !isReady ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Verifying your link&hellip;</p>
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
