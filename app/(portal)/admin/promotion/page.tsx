'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, ChevronUp, GraduationCap, AlertTriangle } from 'lucide-react'

interface Student {
  id: string
  admission_number: string
  class: string
  gender: string | null
  department: string | null
  repeating: boolean
  profiles: { full_name: string } | null
}

const ALL_CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
]

function getNextClass(currentClass: string): string | null {
  const idx = ALL_CLASSES.indexOf(currentClass)
  if (idx === -1 || idx === ALL_CLASSES.length - 1) return null
  return ALL_CLASSES[idx + 1]
}

const CLASS_GROUPS = [
  { label: 'Nursery', classes: ['Nursery 1', 'Nursery 2'] },
  { label: 'Primary', classes: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'] },
  { label: 'Junior Secondary (JSS)', classes: ['JSS 1', 'JSS 2', 'JSS 3'] },
  { label: 'Senior Secondary (SSS)', classes: ['SSS 1', 'SSS 2', 'SSS 3'] },
]

export default function BulkPromotionPage() {
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [skipIds, setSkipIds] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)
  const [resultSummary, setResultSummary] = useState<{ promoted: number; graduated: number; skipped: number; errors: string[] } | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
      setProfile(p)

      const { data } = await supabase
        .from('students')
        .select('id, admission_number, class, gender, department, repeating, profiles(full_name)')
        .eq('status', 'active')
        .order('class')
        .order('admission_number')

      const studentList = (data || []) as unknown as Student[]
      setStudents(studentList)
      const preSkip = new Set(studentList.filter(s => s.repeating).map(s => s.id))
      setSkipIds(preSkip)
      setLoading(false)
    }
    load()
  }, [])

  function toggleSkip(studentId: string) {
    setSkipIds(prev => {
      const next = new Set(prev)
      if (next.has(studentId)) {
        next.delete(studentId)
      } else {
        next.add(studentId)
      }
      return next
    })
  }

  async function handleConfirm() {
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/students/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: students.map(s => s.id),
          skipIds: Array.from(skipIds),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResultSummary(data.results)
      setDone(true)
      setConfirmOpen(false)
      const errCount = data.results.errors?.length || 0
      toast({
        title: errCount > 0 ? 'Promotion completed with errors' : 'Promotion complete',
        description: `${data.results.promoted} promoted, ${data.results.graduated} graduated, ${data.results.skipped} skipped.${errCount > 0 ? ` ${errCount} error(s) occurred.` : ''}`,
        variant: errCount > 0 ? 'destructive' : 'default',
      })
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  const toPromote = students.filter(s => !skipIds.has(s.id) && getNextClass(s.class) !== null)
  const toGraduate = students.filter(s => !skipIds.has(s.id) && getNextClass(s.class) === null)
  const toSkip = students.filter(s => skipIds.has(s.id))

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="End-of-Year Promotion"
        subtitle={`Welcome back, ${profile?.full_name || 'Administrator'}`}
        role="admin"
      />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/students">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Students
            </Button>
          </Link>
          <h2 className="text-xl font-semibold">Bulk End-of-Year Promotion</h2>
        </div>

        {done && resultSummary ? (
          <Card>
            <CardContent className="py-12 text-center">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Promotion Complete</h3>
              <div className="flex justify-center gap-6 text-lg">
                <span><strong>{resultSummary.promoted}</strong> promoted</span>
                <span><strong>{resultSummary.graduated}</strong> graduated</span>
                <span><strong>{resultSummary.skipped}</strong> repeating</span>
              </div>
              {resultSummary.errors && resultSummary.errors.length > 0 && (
                <div className="mt-4 mx-auto max-w-md text-left">
                  <p className="text-sm font-medium text-destructive mb-2">
                    {resultSummary.errors.length} error(s) occurred:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                    {resultSummary.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-6 flex justify-center gap-4">
                <Link href="/admin/students">
                  <Button data-testid="button-back-to-students">View Students</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : students.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No active students to promote.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Review the preview below before confirming.</p>
                    <p className="text-muted-foreground mt-1">
                      Each student will be moved to the next class. SSS 3 students will be graduated.
                      Check &ldquo;Repeat&rdquo; for any student who should stay in their current class.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4 text-sm">
                <span className="text-green-600 font-medium">{toPromote.length} to promote</span>
                <span className="text-blue-600 font-medium">{toGraduate.length} to graduate</span>
                <span className="text-amber-600 font-medium">{toSkip.length} repeating</span>
              </div>
              <Button
                onClick={() => setConfirmOpen(true)}
                className="gap-2"
                disabled={toPromote.length + toGraduate.length === 0}
                data-testid="button-open-confirm"
              >
                <ChevronUp className="h-4 w-4" />
                Confirm Promotion
              </Button>
            </div>

            <div className="space-y-6">
              {CLASS_GROUPS.map(group => {
                const groupStudents = students.filter(s => group.classes.includes(s.class))
                if (groupStudents.length === 0) return null
                return (
                  <Card key={group.label}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{group.label}</CardTitle>
                      <CardDescription>{groupStudents.length} students</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {group.classes.map(cls => {
                          const classStudents = groupStudents.filter(s => s.class === cls)
                          if (classStudents.length === 0) return null
                          const nextCls = getNextClass(cls)
                          return (
                            <div key={cls}>
                              <div className="flex items-center gap-2 mb-2 mt-3">
                                <Badge variant="outline" className="text-xs">{cls}</Badge>
                                <span className="text-xs text-muted-foreground">→</span>
                                <Badge className={nextCls ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                                  {nextCls || 'Graduate'}
                                </Badge>
                              </div>
                              {classStudents.map(student => (
                                <div
                                  key={student.id}
                                  className={`flex items-center gap-3 p-2 rounded-lg ${skipIds.has(student.id) ? 'bg-amber-50 border border-amber-200' : 'bg-muted/30'}`}
                                  data-testid={`row-student-${student.id}`}
                                >
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Checkbox
                                      checked={skipIds.has(student.id)}
                                      onCheckedChange={() => toggleSkip(student.id)}
                                      data-testid={`checkbox-repeat-${student.id}`}
                                    />
                                    <span className="text-xs text-muted-foreground">Repeat</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {student.profiles?.full_name || 'Unknown'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {student.admission_number}
                                      {student.department && ` · ${student.department}`}
                                    </p>
                                  </div>
                                  {skipIds.has(student.id) && (
                                    <Badge className="bg-amber-100 text-amber-700 text-xs">
                                      {student.repeating ? 'Flagged repeating' : 'Repeating'}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </main>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Promotion</DialogTitle>
            <DialogDescription>This action cannot be easily undone.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2 text-sm">
            <p><strong>{toPromote.length}</strong> students will be promoted to their next class.</p>
            <p><strong>{toGraduate.length}</strong> SSS 3 students will be graduated.</p>
            {toSkip.length > 0 && (
              <p><strong>{toSkip.length}</strong> students will remain in their current class (repeating).</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={processing} data-testid="button-final-confirm">
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Yes, Promote All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
