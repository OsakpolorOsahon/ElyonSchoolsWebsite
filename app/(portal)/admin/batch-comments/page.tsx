'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Save, Search, MessageSquare } from 'lucide-react'

const ALL_CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
]
const CLASS_ORDER = ALL_CLASSES.reduce<Record<string, number>>((acc, cls, i) => { acc[cls] = i; return acc }, {})

interface Exam {
  id: string
  name: string
  term: string
  year: number
}

interface Student {
  id: string
  admission_number: string
  class: string
  full_name: string | null
  profiles: { full_name: string } | null
}

export default function BatchCommentsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exams, setExams] = useState<Exam[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedExam, setSelectedExam] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')
  const [comments, setComments] = useState<Record<string, string>>({})
  const [existingComments, setExistingComments] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [examsRes, studentsRes] = await Promise.all([
        supabase.from('exams').select('*').order('year', { ascending: false }),
        fetch('/api/admin/students').then(r => r.json()),
      ])
      setExams(examsRes.data || [])
      const activeStudents = ((studentsRes.students || []) as Student[]).filter((s: any) => s.status === 'active')
      setStudents(activeStudents)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedExam || students.length === 0) return
    setLoadingComments(true)
    const supabase = createClient()
    supabase
      .from('report_card_comments')
      .select('student_id, principal_comment')
      .eq('exam_id', selectedExam)
      .then(({ data }) => {
        const existing: Record<string, string> = {}
        for (const row of data || []) {
          if (row.principal_comment) existing[row.student_id] = row.principal_comment
        }
        setExistingComments(existing)
        setComments(existing)
        setLoadingComments(false)
      })
  }, [selectedExam, students.length])

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const oa = CLASS_ORDER[a.class] ?? 99
      const ob = CLASS_ORDER[b.class] ?? 99
      if (oa !== ob) return oa - ob
      const na = (a.profiles?.full_name || a.full_name || '').toLowerCase()
      const nb = (b.profiles?.full_name || b.full_name || '').toLowerCase()
      return na.localeCompare(nb)
    })
  }, [students])

  const filteredStudents = useMemo(() => {
    return sortedStudents.filter(s => {
      if (selectedClass !== 'all' && s.class !== selectedClass) return false
      if (search) {
        const name = (s.profiles?.full_name || s.full_name || '').toLowerCase()
        const adm = s.admission_number.toLowerCase()
        if (!name.includes(search.toLowerCase()) && !adm.includes(search.toLowerCase())) return false
      }
      return true
    })
  }, [sortedStudents, selectedClass, search])

  const handleSaveAll = async () => {
    if (!selectedExam) {
      toast({ title: 'No exam selected', variant: 'destructive' })
      return
    }

    const changed = filteredStudents.filter(s => {
      const current = comments[s.id] || ''
      const original = existingComments[s.id] || ''
      return current !== original
    })

    if (changed.length === 0) {
      toast({ title: 'No changes to save', description: 'All comments are up to date.' })
      return
    }

    setSaving(true)
    try {
      const results = await Promise.allSettled(
        changed.map(student =>
          fetch(`/api/report-card/${student.id}/${selectedExam}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ principal_comment: comments[student.id] || '' }),
          })
        )
      )

      const succeeded = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      if (failed > 0) {
        toast({
          title: `Partially saved`,
          description: `${succeeded} comments saved, ${failed} failed.`,
          variant: 'destructive',
        })
      } else {
        toast({
          title: `✓ ${succeeded} comment${succeeded !== 1 ? 's' : ''} saved!`,
          description: 'All selected student comments have been updated.',
        })
        setExistingComments(prev => ({ ...prev, ...comments }))
      }
    } catch {
      toast({ title: 'Error saving comments', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const changedCount = filteredStudents.filter(s => (comments[s.id] || '') !== (existingComments[s.id] || '')).length

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <PortalHeader title="Batch Report Comments" subtitle="Add comments for multiple students at once" role="admin" />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader title="Batch Report Comments" subtitle="Add principal comments for multiple students efficiently" role="admin" />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Filter Students
            </CardTitle>
            <CardDescription>Select an exam, then optionally filter by class and search</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Exam *</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger data-testid="select-exam">
                    <SelectValue placeholder="Select exam..." />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.name} — {e.term} {e.year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger data-testid="select-class">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {ALL_CLASSES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Name or admission number..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    data-testid="input-search"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedExam && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                {changedCount > 0 && (
                  <span className="ml-2 text-amber-600 font-medium">· {changedCount} unsaved change{changedCount !== 1 ? 's' : ''}</span>
                )}
              </p>
              <Button onClick={handleSaveAll} disabled={saving || changedCount === 0} className="gap-2" data-testid="button-save-all">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : `Save ${changedCount > 0 ? changedCount + ' ' : ''}Changes`}
              </Button>
            </div>

            {loadingComments ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No students match your filters.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredStudents.map(student => {
                  const name = student.profiles?.full_name || student.full_name || 'Unknown'
                  const current = comments[student.id] || ''
                  const original = existingComments[student.id] || ''
                  const isDirty = current !== original
                  return (
                    <Card key={student.id} className={isDirty ? 'border-amber-300 dark:border-amber-700' : ''}>
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <p className="font-medium text-foreground">{name}</p>
                              <Badge variant="outline" className="text-xs">{student.class}</Badge>
                              <span className="text-xs text-muted-foreground">{student.admission_number}</span>
                              {isDirty && <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">Unsaved</Badge>}
                            </div>
                            <Textarea
                              placeholder="Enter principal's comment for this student..."
                              value={current}
                              onChange={e => setComments(prev => ({ ...prev, [student.id]: e.target.value }))}
                              rows={2}
                              className="text-sm resize-none"
                              data-testid={`textarea-comment-${student.id}`}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {filteredStudents.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveAll} disabled={saving || changedCount === 0} className="gap-2" data-testid="button-save-all-bottom">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Saving...' : `Save ${changedCount > 0 ? changedCount + ' ' : ''}Changes`}
                </Button>
              </div>
            )}
          </>
        )}

        {!selectedExam && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Select an exam above to start adding comments for students.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
