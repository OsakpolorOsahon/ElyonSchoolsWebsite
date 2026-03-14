'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, BookOpen, Loader2, UserCheck, UserX } from 'lucide-react'

interface ClassEntry {
  class: string
  teacher_profile_id: string | null
  teacher_name: string | null
}

interface Teacher {
  id: string
  full_name: string
}

const CLASS_GROUPS = [
  { label: 'Nursery', classes: ['Nursery 1', 'Nursery 2'] },
  { label: 'Primary', classes: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'] },
  { label: 'Junior Secondary (JSS)', classes: ['JSS 1', 'JSS 2', 'JSS 3'] },
  { label: 'Senior Secondary (SSS)', classes: ['SSS 1', 'SSS 2', 'SSS 3'] },
]

export default function ClassTeachersPage() {
  const { toast } = useToast()
  const [classes, setClasses] = useState<ClassEntry[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassEntry | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  async function fetchData() {
    const res = await fetch('/api/admin/class-teachers')
    const data = await res.json()
    setClasses(data.classes || [])
    setTeachers(data.teachers || [])
    setLoading(false)
  }

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => {
        const u = (d.users || []).find((u: any) => u.role === 'admin')
        if (u) setProfile(u)
      })
    fetchData()
  }, [])

  function openAssign(cls: ClassEntry) {
    setSelectedClass(cls)
    setSelectedTeacher(cls.teacher_profile_id || '')
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!selectedClass || !selectedTeacher) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/class-teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class: selectedClass.class, teacher_profile_id: selectedTeacher }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Assigned', description: `Teacher assigned to ${selectedClass.class}` })
      setDialogOpen(false)
      await fetchData()
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(cls: ClassEntry) {
    setRemoving(cls.class)
    try {
      const res = await fetch('/api/admin/class-teachers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class: cls.class }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Removed', description: `Teacher removed from ${cls.class}` })
      await fetchData()
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setRemoving(null)
    }
  }

  const classMap: Record<string, ClassEntry> = {}
  for (const c of classes) classMap[c.class] = c

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Class Teachers"
        subtitle={`Welcome back, ${profile?.full_name || 'Administrator'}`}
        role="admin"
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <h2 className="text-xl font-semibold">Assign Class Teachers</h2>
        </div>

        <p className="text-muted-foreground mb-8 text-sm">
          Each class can have one class teacher. That teacher will see all students in the class and can upload their results.
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {CLASS_GROUPS.map(group => (
              <div key={group.label}>
                <h3 className="text-base font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {group.label}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.classes.map(cls => {
                    const entry = classMap[cls]
                    const hasTeacher = !!entry?.teacher_profile_id
                    return (
                      <Card key={cls} data-testid={`card-class-${cls.replace(/\s/g, '-')}`}>
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                                <BookOpen className="h-4 w-4 text-primary" />
                              </div>
                              <p className="font-semibold">{cls}</p>
                            </div>
                            {hasTeacher ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 shrink-0">
                                Assigned
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground shrink-0">
                                Unassigned
                              </Badge>
                            )}
                          </div>

                          {hasTeacher ? (
                            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                              <UserCheck className="h-4 w-4 text-green-600 shrink-0" />
                              <span className="truncate">{entry.teacher_name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                              <UserX className="h-4 w-4 shrink-0" />
                              <span>No teacher assigned</span>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={hasTeacher ? 'outline' : 'default'}
                              className="flex-1"
                              onClick={() => openAssign(entry || { class: cls, teacher_profile_id: null, teacher_name: null })}
                              data-testid={`button-assign-${cls.replace(/\s/g, '-')}`}
                            >
                              {hasTeacher ? 'Change Teacher' : 'Assign Teacher'}
                            </Button>
                            {hasTeacher && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                disabled={removing === cls}
                                onClick={() => handleRemove(entry)}
                                data-testid={`button-remove-${cls.replace(/\s/g, '-')}`}
                              >
                                {removing === cls ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove'}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Teacher to {selectedClass?.class}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {teachers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No teachers found. Invite teachers first from the{' '}
                <Link href="/admin/users" className="text-primary underline">Users page</Link>.
              </p>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Teacher</label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger data-testid="select-teacher">
                    <SelectValue placeholder="Choose a teacher..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !selectedTeacher}
              data-testid="button-save-assignment"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
