'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Lock, CheckCircle, Loader2, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

type PageState = 'loading' | 'ready' | 'bad_link' | 'done'

function ResetPasswordContent() {
  const { toast } = useToast()
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
      // PKCE flow — token arrives as ?code=xxx
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        window.history.replaceState({}, '', '/reset-password')
        setPageState(error ? 'bad_link' : 'ready')
        return
      }

      // Implicit flow — token arrives as #access_token=xxx&refresh_token=yyy
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

      // No tokens in URL — check for an existing session (e.g. server callback
      // already set cookies, or user is already logged in)
      const { data: { session } } = await supabase.auth.getSession()
      setPageState(session ? 'ready' : 'bad_link')
    }

    establishSession()
  }, [])

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
          title: 'Could not set password',
          description: error.message,
          variant: 'destructive',
        })
        return
      }
      setPageState('done')
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
            {pageState === 'done' ? 'Password Created' : 'Create Your Password'}
          </CardTitle>
          <CardDescription>
            {pageState === 'done'
              ? 'You can now sign in to your account'
              : 'Choose a strong password to secure your account'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {pageState === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Setting up your account&hellip;</p>
            </div>
          )}

          {pageState === 'bad_link' && (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Invite link expired or already used
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                This invite link has already been used or has expired. Ask your
                administrator to send you a new invitation.
              </p>
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
