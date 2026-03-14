'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Users, Search, UserPlus, ArrowUpRight, GraduationCap, ChevronUp } from 'lucide-react'

interface Student {
  id: string
  admission_number: string
  class: string
  gender: string | null
  status: string
  department: string | null
  graduation_year: number | null
  transfer_note: string | null
  repeating: boolean
  profile_id: string
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

const SSS_CLASSES = ['SSS 1', 'SSS 2', 'SSS 3']
const DEPARTMENTS = ['Science', 'Commercial', 'Art']

function getNextClass(currentClass: string): string | null {
  const idx = ALL_CLASSES.indexOf(currentClass)
  if (idx === -1 || idx === ALL_CLASSES.length - 1) return null
  return ALL_CLASSES[idx + 1]
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  graduated: 'bg-blue-100 text-blue-700',
  withdrawn: 'bg-amber-100 text-amber-700',
  transferred: 'bg-gray-100 text-gray-700',
}

export default function AdminStudentsPage() {
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [filtered, setFiltered] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
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
    department: '',
  })

  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusTarget, setStatusTarget] = useState<Student | null>(null)
  const [statusForm, setStatusForm] = useState({ status: '', transfer_note: '' })
  const [statusSaving, setStatusSaving] = useState(false)

  const [promoteTarget, setPromoteTarget] = useState<Student | null>(null)
  const [promoteSaving, setPromoteSaving] = useState(false)

  const [deptTarget, setDeptTarget] = useState<Student | null>(null)
  const [deptForm, setDeptForm] = useState('')
  const [deptSaving, setDeptSaving] = useState(false)

  async function fetchStudents() {
    const supabase = createClient()
    const { data } = await supabase
      .from('students')
      .select('id, admission_number, class, gender, status, department, graduation_year, transfer_note, repeating, profile_id, profiles(full_name)')
      .order('created_at', { ascending: false })
    const list = (data || []) as unknown as Student[]
    setStudents(list)
    setExistingProfileIds(new Set(list.map(s => s.profile_id).filter(Boolean)))
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
      students.filter(s => {
        const matchesSearch =
          s.profiles?.full_name?.toLowerCase().includes(q) ||
          s.admission_number.toLowerCase().includes(q) ||
          s.class.toLowerCase().includes(q)
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter
        return matchesSearch && matchesStatus
      })
    )
  }, [search, students, statusFilter])

  async function openDialog() {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    const users: UserProfile[] = data.users || []
    setStudentUsers(users.filter(u => u.role === 'student'))
    setParentUsers(users.filter(u => u.role === 'parent'))
    setForm({ profile_id: '', admission_number: '', class: '', gender: '', parent_profile_id: '', department: '' })
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

  function openStatusDialog(student: Student) {
    setStatusTarget(student)
    setStatusForm({ status: student.status, transfer_note: student.transfer_note || '' })
    setStatusDialogOpen(true)
  }

  async function handleStatusSave() {
    if (!statusTarget || !statusForm.status) return
    setStatusSaving(true)
    try {
      const payload: Record<string, any> = { id: statusTarget.id, status: statusForm.status }
      if (statusForm.status === 'transferred') {
        payload.transfer_note = statusForm.transfer_note
      }
      const res = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Status updated', description: `Student marked as ${statusForm.status}.` })
      setStatusDialogOpen(false)
      await fetchStudents()
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setStatusSaving(false)
    }
  }

  function openPromoteDialog(student: Student) {
    setPromoteTarget(student)
  }

  async function handlePromote() {
    if (!promoteTarget) return
    setPromoteSaving(true)
    const nextClass = getNextClass(promoteTarget.class)
    try {
      const payload: Record<string, any> = { id: promoteTarget.id }
      if (nextClass) {
        payload.class = nextClass
      } else {
        payload.status = 'graduated'
      }
      const res = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({
        title: nextClass ? 'Student promoted' : 'Student graduated',
        description: nextClass
          ? `Moved from ${promoteTarget.class} to ${nextClass}.`
          : `${promoteTarget.profiles?.full_name || 'Student'} has been graduated.`,
      })
      setPromoteTarget(null)
      await fetchStudents()
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setPromoteSaving(false)
    }
  }

  function openDeptDialog(student: Student) {
    setDeptTarget(student)
    setDeptForm(student.department || '')
  }

  async function handleDeptSave() {
    if (!deptTarget) return
    setDeptSaving(true)
    try {
      const res = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deptTarget.id, department: deptForm || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Department updated', description: `Department set to ${deptForm || 'none'}.` })
      setDeptTarget(null)
      await fetchStudents()
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setDeptSaving(false)
    }
  }

  async function toggleRepeating(student: Student) {
    try {
      const res = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: student.id, repeating: !student.repeating }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({
        title: student.repeating ? 'Repeating cleared' : 'Marked as repeating',
        description: student.repeating
          ? `${student.profiles?.full_name || 'Student'} will be promoted normally.`
          : `${student.profiles?.full_name || 'Student'} will stay in ${student.class} during promotion.`,
      })
      await fetchStudents()
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  const availableStudentUsers = studentUsers.filter(u => !existingProfileIds.has(u.id))
  const isSSS = (cls: string) => SSS_CLASSES.includes(cls)
  const statusCounts = {
    all: students.length,
    active: students.filter(s => s.status === 'active').length,
    graduated: students.filter(s => s.status === 'graduated').length,
    withdrawn: students.filter(s => s.status === 'withdrawn').length,
    transferred: students.filter(s => s.status === 'transferred').length,
  }

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
          <div className="flex items-center gap-2">
            <Link href="/admin/promotion">
              <Button variant="outline" className="gap-2" data-testid="button-bulk-promote">
                <ChevronUp className="h-4 w-4" />
                End-of-Year Promotion
              </Button>
            </Link>
            <Button onClick={openDialog} className="gap-2" data-testid="button-add-student">
              <UserPlus className="h-4 w-4" />
              Add Student
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', 'active', 'graduated', 'withdrawn', 'transferred'] as const).map(s => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              data-testid={`filter-status-${s}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s]})
            </Button>
          ))}
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
            {filtered.map(student => {
              const nextClass = getNextClass(student.class)
              return (
                <Card key={student.id} data-testid={`card-student-${student.id}`}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{student.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.admission_number} · {student.class}
                            {student.gender && ` · ${student.gender}`}
                            {student.department && ` · ${student.department}`}
                          </p>
                          {student.status === 'graduated' && student.graduation_year && (
                            <p className="text-xs text-muted-foreground">Graduated {student.graduation_year}</p>
                          )}
                          {student.status === 'transferred' && student.transfer_note && (
                            <p className="text-xs text-muted-foreground">Transfer: {student.transfer_note}</p>
                          )}
                          {student.repeating && student.status === 'active' && (
                            <Badge className="bg-amber-100 text-amber-700 text-xs mt-0.5">Repeating</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {student.status === 'active' && (
                          <>
                            <Button
                              variant={student.repeating ? 'default' : 'outline'}
                              size="sm"
                              className={student.repeating ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
                              onClick={() => toggleRepeating(student)}
                              data-testid={`button-repeat-${student.id}`}
                            >
                              {student.repeating ? 'Repeating' : 'Repeat'}
                            </Button>
                            {isSSS(student.class) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeptDialog(student)}
                                data-testid={`button-dept-${student.id}`}
                              >
                                {student.department || 'Set Dept'}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => openPromoteDialog(student)}
                              data-testid={`button-promote-${student.id}`}
                            >
                              {nextClass ? (
                                <><ArrowUpRight className="h-3 w-3" /> Promote</>
                              ) : (
                                <><GraduationCap className="h-3 w-3" /> Graduate</>
                              )}
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openStatusDialog(student)}
                          data-testid={`button-status-${student.id}`}
                        >
                          <Badge className={STATUS_COLORS[student.status] || 'bg-gray-100 text-gray-700'}>
                            {student.status}
                          </Badge>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Add Student Dialog */}
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
              <Select value={form.class} onValueChange={v => setForm(f => ({ ...f, class: v, department: isSSS(v) ? f.department : '' }))}>
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

            {isSSS(form.class) && (
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={v => setForm(f => ({ ...f, department: v }))}>
                  <SelectTrigger data-testid="select-department">
                    <SelectValue placeholder="Select department..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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

      {/* Change Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Student Status</DialogTitle>
            <DialogDescription>
              {statusTarget?.profiles?.full_name} ({statusTarget?.admission_number})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusForm.status} onValueChange={v => setStatusForm(f => ({ ...f, status: v }))}>
                <SelectTrigger data-testid="select-new-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {statusForm.status === 'transferred' && (
              <div className="space-y-2">
                <Label>Transfer Note</Label>
                <Textarea
                  placeholder="Where was the student transferred to? (optional)"
                  value={statusForm.transfer_note}
                  onChange={e => setStatusForm(f => ({ ...f, transfer_note: e.target.value }))}
                  data-testid="input-transfer-note"
                />
              </div>
            )}

            {statusForm.status === 'graduated' && (
              <p className="text-sm text-muted-foreground">
                The graduation year will be set to {new Date().getFullYear()} automatically.
              </p>
            )}

            {(statusForm.status === 'graduated' || statusForm.status === 'withdrawn' || statusForm.status === 'transferred') &&
              statusTarget?.status === 'active' && (
              <p className="text-sm text-amber-600 font-medium">
                This student will be removed from their teacher&apos;s class list and results upload.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleStatusSave}
              disabled={statusSaving || statusForm.status === statusTarget?.status}
              data-testid="button-confirm-status"
            >
              {statusSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote Confirmation Dialog */}
      <Dialog open={!!promoteTarget} onOpenChange={() => setPromoteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {promoteTarget && getNextClass(promoteTarget.class) ? 'Promote Student' : 'Graduate Student'}
            </DialogTitle>
            <DialogDescription>
              {promoteTarget?.profiles?.full_name} ({promoteTarget?.admission_number})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {promoteTarget && getNextClass(promoteTarget.class) ? (
              <p className="text-sm">
                Move from <strong>{promoteTarget.class}</strong> to <strong>{getNextClass(promoteTarget.class)}</strong>?
              </p>
            ) : (
              <p className="text-sm">
                Mark this SSS 3 student as <strong>graduated</strong> (class of {new Date().getFullYear()})?
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoteTarget(null)}>Cancel</Button>
            <Button onClick={handlePromote} disabled={promoteSaving} data-testid="button-confirm-promote">
              {promoteSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {promoteTarget && getNextClass(promoteTarget.class) ? 'Promote' : 'Graduate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Department Dialog */}
      <Dialog open={!!deptTarget} onOpenChange={() => setDeptTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Set Department</DialogTitle>
            <DialogDescription>
              {deptTarget?.profiles?.full_name} ({deptTarget?.class})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label>Department</Label>
            <Select value={deptForm} onValueChange={setDeptForm}>
              <SelectTrigger data-testid="select-dept-value">
                <SelectValue placeholder="Select department..." />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeptTarget(null)}>Cancel</Button>
            <Button onClick={handleDeptSave} disabled={deptSaving} data-testid="button-confirm-dept">
              {deptSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
