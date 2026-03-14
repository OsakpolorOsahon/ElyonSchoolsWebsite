'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Users, Search, UserPlus } from 'lucide-react'

interface Student {
  id: string
  admission_number: string
  class: string
  gender: string | null
  status: string
  profiles: { full_name: string } | null
}

interface UserProfile {
  id: string
  full_name: string
  role: string
}

const ALL_CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
]

export default function AdminStudentsPage() {
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [filtered, setFiltered] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [studentUsers, setStudentUsers] = useState<UserProfile[]>([])
  const [parentUsers, setParentUsers] = useState<UserProfile[]>([])
  const [existingProfileIds, setExistingProfileIds] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({
    profile_id: '',
    admission_number: '',
    class: '',
    gender: '',
    parent_profile_id: '',
  })

  async function fetchStudents() {
    const supabase = createClient()
    const { data } = await supabase
      .from('students')
      .select('id, admission_number, class, gender, status, profile_id, profiles(full_name)')
      .order('created_at', { ascending: false })
    const list = (data || []) as unknown as (Student & { profile_id: string })[]
    setStudents(list)
    setFiltered(list)
    setExistingProfileIds(new Set(list.map((s: any) => s.profile_id).filter(Boolean)))
  }

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
      setProfile(p)
      await fetchStudents()
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      students.filter(s =>
        s.profiles?.full_name?.toLowerCase().includes(q) ||
        s.admission_number.toLowerCase().includes(q) ||
        s.class.toLowerCase().includes(q)
      )
    )
  }, [search, students])

  async function openDialog() {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    const users: UserProfile[] = data.users || []
    setStudentUsers(users.filter(u => u.role === 'student'))
    setParentUsers(users.filter(u => u.role === 'parent'))
    setForm({ profile_id: '', admission_number: '', class: '', gender: '', parent_profile_id: '' })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.profile_id || !form.admission_number || !form.class) {
      toast({ title: 'Missing fields', description: 'Student account, admission number and class are required.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Student added', description: 'Student record created successfully.' })
      setDialogOpen(false)
      await fetchStudents()
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const availableStudentUsers = studentUsers.filter(u => !existingProfileIds.has(u.id))

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Students"
        subtitle={`Welcome back, ${profile?.full_name || 'Administrator'}`}
        role="admin"
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <h2 className="text-xl font-semibold">All Students ({filtered.length})</h2>
          </div>
          <Button onClick={openDialog} className="gap-2" data-testid="button-add-student">
            <UserPlus className="h-4 w-4" />
            Add Student
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, admission number, or class..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="input-search-students"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="mb-4">{students.length === 0 ? 'No students enrolled yet' : 'No results match your search'}</p>
              {students.length === 0 && (
                <Button onClick={openDialog} variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4" /> Add First Student
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(student => (
              <Card key={student.id} data-testid={`card-student-${student.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{student.profiles?.full_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.admission_number} · {student.class}
                          {student.gender && ` · ${student.gender}`}
                        </p>
                      </div>
                    </div>
                    <Badge className={student.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'}>
                      {student.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Student Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Student Account *</Label>
              <Select value={form.profile_id} onValueChange={v => setForm(f => ({ ...f, profile_id: v }))}>
                <SelectTrigger data-testid="select-student-user">
                  <SelectValue placeholder="Select student account..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStudentUsers.length === 0 ? (
                    <SelectItem value="__none__">No unregistered student accounts</SelectItem>
                  ) : (
                    availableStudentUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Only shows student accounts without a record yet</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admission_number">Admission Number *</Label>
              <Input
                id="admission_number"
                placeholder="e.g. ELY/2025/001"
                value={form.admission_number}
                onChange={e => setForm(f => ({ ...f, admission_number: e.target.value }))}
                data-testid="input-admission-number"
              />
            </div>

            <div className="space-y-2">
              <Label>Class *</Label>
              <Select value={form.class} onValueChange={v => setForm(f => ({ ...f, class: v }))}>
                <SelectTrigger data-testid="select-class">
                  <SelectValue placeholder="Select class..." />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CLASSES.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))}>
                <SelectTrigger data-testid="select-gender">
                  <SelectValue placeholder="Select gender (optional)..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Parent Account</Label>
              <Select value={form.parent_profile_id} onValueChange={v => setForm(f => ({ ...f, parent_profile_id: v }))}>
                <SelectTrigger data-testid="select-parent">
                  <SelectValue placeholder="Select parent (optional)..." />
                </SelectTrigger>
                <SelectContent>
                  {parentUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} data-testid="button-save-student">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
