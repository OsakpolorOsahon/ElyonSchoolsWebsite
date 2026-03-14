'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, UserCog, Search, Edit, Plus, Mail, Phone, GraduationCap, BookOpen } from 'lucide-react'

interface StaffProfile {
  id: string
  subject_specialty: string | null
  qualification: string | null
  phone: string | null
  bio: string | null
}

interface StaffMember {
  profile_id: string
  full_name: string
  email: string
  staff_profile: StaffProfile | null
}

export default function AdminStaffPage() {
  const { toast } = useToast()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [filtered, setFiltered] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null)
  const [form, setForm] = useState({
    subject_specialty: '',
    qualification: '',
    phone: '',
    bio: '',
  })

  async function fetchStaff() {
    const res = await fetch('/api/admin/staff')
    if (res.ok) {
      const data = await res.json()
      setStaff(data.staff || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchStaff() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      staff.filter(s =>
        s.full_name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.staff_profile?.subject_specialty?.toLowerCase().includes(q)
      )
    )
  }, [search, staff])

  function openAddDialog(member: StaffMember) {
    setEditTarget(member)
    setForm({
      subject_specialty: member.staff_profile?.subject_specialty || '',
      qualification: member.staff_profile?.qualification || '',
      phone: member.staff_profile?.phone || '',
      bio: member.staff_profile?.bio || '',
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!editTarget) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: editTarget.profile_id,
          ...form,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Staff profile saved', description: `Profile for ${editTarget.full_name} updated.` })
      setDialogOpen(false)
      await fetchStaff()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Staff Profiles"
        subtitle="Manage teacher bios and qualifications"
        role="admin"
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <h2 className="text-xl font-semibold" data-testid="text-staff-count">Staff Members ({filtered.length})</h2>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, email, or specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="input-search-staff"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <UserCog className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{staff.length === 0 ? 'No teacher accounts found. Invite teachers from User Management first.' : 'No results match your search'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(member => (
              <Card key={member.profile_id} data-testid={`card-staff-${member.profile_id}`} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{member.full_name}</CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3" /> {member.email || 'No email'}
                      </p>
                    </div>
                    <Badge className={member.staff_profile ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                      {member.staff_profile ? 'Profile Set' : 'No Profile'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {member.staff_profile ? (
                    <>
                      {member.staff_profile.subject_specialty && (
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-primary shrink-0" />
                          <span>{member.staff_profile.subject_specialty}</span>
                        </div>
                      )}
                      {member.staff_profile.qualification && (
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                          <span>{member.staff_profile.qualification}</span>
                        </div>
                      )}
                      {member.staff_profile.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-primary shrink-0" />
                          <span>{member.staff_profile.phone}</span>
                        </div>
                      )}
                      {member.staff_profile.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mt-2">{member.staff_profile.bio}</p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 gap-1"
                        onClick={() => openAddDialog(member)}
                        data-testid={`button-edit-staff-${member.profile_id}`}
                      >
                        <Edit className="h-3 w-3" /> Edit Profile
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full gap-1"
                      onClick={() => openAddDialog(member)}
                      data-testid={`button-add-staff-${member.profile_id}`}
                    >
                      <Plus className="h-3 w-3" /> Add Profile
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget?.staff_profile ? 'Edit' : 'Add'} Staff Profile — {editTarget?.full_name}</DialogTitle>
            <DialogDescription>Set the teacher&apos;s specialty, qualifications, and contact details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="specialty">Subject Specialty</Label>
              <Input
                id="specialty"
                value={form.subject_specialty}
                onChange={e => setForm(f => ({ ...f, subject_specialty: e.target.value }))}
                placeholder="e.g. Mathematics, English Language"
                data-testid="input-staff-specialty"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                value={form.qualification}
                onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))}
                placeholder="e.g. B.Ed Mathematics, NCE"
                data-testid="input-staff-qualification"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="e.g. +234 801 234 5678"
                data-testid="input-staff-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="A brief description of the teacher's background and experience..."
                rows={4}
                data-testid="input-staff-bio"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} data-testid="button-save-staff">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
