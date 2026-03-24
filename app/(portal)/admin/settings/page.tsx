'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Settings, Save, AlertTriangle } from 'lucide-react'

const TERM_ORDER: Record<string, number> = { First: 1, Second: 2, Third: 3 }

function isRollback(
  savedTerm: string, savedYear: number,
  newTerm: string, newYear: number
): boolean {
  if (newYear < savedYear) return true
  if (newYear === savedYear && TERM_ORDER[newTerm] < TERM_ORDER[savedTerm]) return true
  return false
}

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({
    current_term: 'First',
    current_year: String(new Date().getFullYear()),
    school_name: 'Elyon Schools',
    principal_name: '',
  })
  const savedSettings = useRef<{ term: string; year: number } | null>(null)
  const [showRollbackDialog, setShowRollbackDialog] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
      setProfile(p)

      const { data: settings } = await supabase
        .from('academic_settings')
        .select('*')
        .eq('singleton_key', true)
        .single()

      if (settings) {
        setForm({
          current_term: settings.current_term,
          current_year: String(settings.current_year),
          school_name: settings.school_name,
          principal_name: settings.principal_name || '',
        })
        savedSettings.current = { term: settings.current_term, year: settings.current_year }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function performSave() {
    setSaving(true)
    try {
      const supabase = createClient()
      const newYear = parseInt(form.current_year)
      const { error } = await supabase
        .from('academic_settings')
        .upsert({
          singleton_key: true,
          current_term: form.current_term,
          current_year: newYear,
          school_name: form.school_name,
          principal_name: form.principal_name,
        }, { onConflict: 'singleton_key' })
      if (error) throw error
      savedSettings.current = { term: form.current_term, year: newYear }
      toast({ title: 'Settings saved', description: 'Academic settings have been updated.' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save settings', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  function handleSave() {
    const newYear = parseInt(form.current_year)
    if (isNaN(newYear)) {
      toast({ title: 'Invalid year', description: 'Please enter a valid year.', variant: 'destructive' })
      return
    }

    if (
      savedSettings.current &&
      isRollback(savedSettings.current.term, savedSettings.current.year, form.current_term, newYear)
    ) {
      setShowRollbackDialog(true)
      return
    }

    performSave()
  }

  const saved = savedSettings.current
  const newYear = parseInt(form.current_year)
  const rollbackDescription = saved
    ? `You are changing the academic period from ${saved.term} Term ${saved.year} to ${form.current_term} Term ${isNaN(newYear) ? form.current_year : newYear}. This is a step backwards and may cause incorrect fee balances and term labels across all parent and student portals.`
    : ''

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Academic Settings"
        subtitle={`Welcome back, ${profile?.full_name || 'Administrator'}`}
        role="admin"
      />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <h2 className="text-xl font-semibold">School Settings</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Academic Configuration
              </CardTitle>
              <CardDescription>These settings affect the entire school system. The current term and year will be displayed across all portals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Current Term</Label>
                  <Select value={form.current_term} onValueChange={v => setForm(f => ({ ...f, current_term: v }))}>
                    <SelectTrigger data-testid="select-current-term">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First">First Term</SelectItem>
                      <SelectItem value="Second">Second Term</SelectItem>
                      <SelectItem value="Third">Third Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentYear">Current Year</Label>
                  <Input
                    id="currentYear"
                    type="number"
                    value={form.current_year}
                    onChange={e => setForm(f => ({ ...f, current_year: e.target.value }))}
                    placeholder="e.g. 2026"
                    data-testid="input-current-year"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  value={form.school_name}
                  onChange={e => setForm(f => ({ ...f, school_name: e.target.value }))}
                  data-testid="input-school-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="principalName">Principal Name</Label>
                <Input
                  id="principalName"
                  placeholder="e.g. Mrs. A. Johnson"
                  value={form.principal_name}
                  onChange={e => setForm(f => ({ ...f, principal_name: e.target.value }))}
                  data-testid="input-principal-name"
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="gap-2" data-testid="button-save-settings">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <AlertDialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Warning: Setting Academic Period Backwards
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              {rollbackDescription}
              <br /><br />
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-rollback-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={performSave}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-rollback-confirm"
            >
              Yes, proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
