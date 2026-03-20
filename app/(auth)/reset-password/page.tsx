'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Lock, CheckCircle, Loader2, Clock, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

type PageState = 'loading' | 'ready' | 'bad_link' | 'done'

function ResetPasswordContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const supabaseRef = useRef<SupabaseClient | null>(null)
  const [pageState, setPageState] = useState<PageState>('loading')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabaseRef.current = supabase

    async function establishSession() {
      // If the server callback reported an error, show bad_link immediately
      const urlError = searchParams.get('error')
      if (urlError === 'invalid_link') {
        setPageState('bad_link')
        return
      }

      // Implicit flow fallback — token arrives as #access_token=xxx&refresh_token=yyy
      // (used when Supabase project is configured for implicit flow)
      const hash = window.location.hash
      if (hash && hash.includes('access_token=')) {
        const params = new URLSearchParams(hash.slice(1))
        const access_token = params.get('access_token') ?? ''
        const refresh_token = params.get('refresh_token') ?? ''
        window.history.replaceState({}, '', '/reset-password')
        if (access_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          setPageState(error ? 'bad_link' : 'ready')
          return
        }
      }

      // Primary path — server callback already exchanged the PKCE code and set
      // session cookies before redirecting here, so just check for an active session.
      const { data: { session } } = await supabase.auth.getSession()
      setPageState(session ? 'ready' : 'bad_link')
    }

    establishSession()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = supabaseRef.current
    if (!supabase) return

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
        variant: 'destructive',
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast({
          title: 'Could not update password',
          description: error.message,
          variant: 'destructive',
        })
        return
      }
      setPageState('done')
      setTimeout(() => { window.location.href = '/login' }, 3000)
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

  const cardTitle = pageState === 'done' ? 'Password Reset!' : 'Reset Your Password'
  const cardDescription =
    pageState === 'done'
      ? 'Your password has been updated successfully'
      : pageState === 'loading'
      ? 'Verifying your reset link…'
      : pageState === 'bad_link'
      ? 'There was a problem with your reset link'
      : 'Choose a new strong password for your account'

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
              ES
            </div>
          </div>
          <CardTitle className="text-2xl">{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>

        <CardContent>
          {pageState === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Verifying your reset link&hellip;</p>
            </div>
          )}

          {pageState === 'bad_link' && (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Reset link expired or already used
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                This password reset link has expired or has already been used.
                Please request a new one — reset links are only valid for a short time.
              </p>
              <Link href="/forgot-password">
                <Button className="w-full gap-2 mb-3" data-testid="button-request-new-link">
                  <Mail className="h-4 w-4" />
                  Request New Reset Link
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full gap-2" data-testid="button-bad-link-back">
                  <Lock className="h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          )}

          {pageState === 'done' && (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">All done!</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Your password has been updated. You will be taken to the sign-in page in a moment.
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
          )}

          {pageState === 'ready' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    data-testid="button-toggle-password"
                  >
                    {showPassword
                      ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                      : <Eye className="h-4 w-4 text-muted-foreground" />}
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    data-testid="input-confirm-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    data-testid="button-toggle-confirm-password"
                  >
                    {showConfirmPassword
                      ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                      : <Eye className="h-4 w-4 text-muted-foreground" />}
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
                    Updating password&hellip;
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Update Password
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
