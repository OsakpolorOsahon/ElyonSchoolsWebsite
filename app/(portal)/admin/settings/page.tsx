'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Settings, Save } from 'lucide-react'

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 2 + i)

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({
    current_term: 'First',
    current_year: String(currentYear),
    school_name: 'Elyon Schools',
    principal_name: '',
  })

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
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('academic_settings')
        .upsert({
          singleton_key: true,
          current_term: form.current_term,
          current_year: parseInt(form.current_year),
          school_name: form.school_name,
          principal_name: form.principal_name,
        }, { onConflict: 'singleton_key' })
      if (error) throw error
      toast({ title: 'Settings saved', description: 'Academic settings have been updated.' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save settings', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

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
                  <Label>Current Year</Label>
                  <Select value={form.current_year} onValueChange={v => setForm(f => ({ ...f, current_year: v }))}>
                    <SelectTrigger data-testid="select-current-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map(y => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
    </div>
  )
}
