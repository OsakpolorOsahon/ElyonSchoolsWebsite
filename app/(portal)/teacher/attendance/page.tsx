'use client'

import { useState, useEffect, useCallback } from 'react'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Users,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Loader2,
  CalendarDays,
  ChevronDown,
  MessageSquare,
} from 'lucide-react'

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

interface Student {
  id: string
  admission_number: string
  profiles: { full_name: string } | null
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  present:  { label: 'Present',  color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',  icon: <CheckCircle className="h-3.5 w-3.5" /> },
  absent:   { label: 'Absent',   color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',          icon: <XCircle className="h-3.5 w-3.5" /> },
  late:     { label: 'Late',     color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200',  icon: <Clock className="h-3.5 w-3.5" /> },
  excused:  { label: 'Excused',  color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',      icon: <BookOpen className="h-3.5 w-3.5" /> },
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function TeacherAttendancePage() {
  const { toast } = useToast()
  const [assignedClasses, setAssignedClasses] = useState<string[]>([])
  const [activeClass, setActiveClass] = useState<string>('')
  const [students, setStudents] = useState<Student[]>([])
  const [date, setDate] = useState(todayISO())
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentTerm, setCurrentTerm] = useState('First')
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const fetchSettings = useCallback(async () => {
    const res = await fetch('/api/settings')
    if (res.ok) {
      const d = await res.json()
      if (d.settings) {
        setCurrentTerm(d.settings.current_term || 'First')
        setCurrentYear(d.settings.current_year || new Date().getFullYear())
      }
    }
  }, [])

  const fetchAttendance = useCallback(async (selectedDate: string, selectedClass?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ date: selectedDate })
      if (selectedClass) params.set('class', selectedClass)
      const res = await fetch(`/api/teacher/attendance?${params}`)
      if (!res.ok) {
        const err = await res.json()
        toast({ title: 'Error', description: err.error || 'Failed to load attendance', variant: 'destructive' })
        return
      }
      const data = await res.json()
      setAssignedClasses(data.assignedClasses || [])
      setActiveClass(data.activeClass || '')
      setStudents(data.students || [])

      // Pre-fill existing records
      const statusMap: Record<string, AttendanceStatus> = {}
      const notesMap: Record<string, string> = {}
      for (const rec of (data.records || []) as { student_id: string; status: AttendanceStatus; notes?: string }[]) {
        statusMap[rec.student_id] = rec.status
        if (rec.notes) notesMap[rec.student_id] = rec.notes
      }
      // Default all students to 'present' if no record exists
      for (const s of (data.students || []) as Student[]) {
        if (!statusMap[s.id]) statusMap[s.id] = 'present'
      }
      setAttendance(statusMap)
      setNotes(notesMap)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSettings()
    fetchAttendance(date)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateChange = (newDate: string) => {
    setDate(newDate)
    fetchAttendance(newDate, activeClass)
  }

  const handleClassChange = (cls: string) => {
    setActiveClass(cls)
    fetchAttendance(date, cls)
  }

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const setNote = (studentId: string, note: string) => {
    setNotes(prev => ({ ...prev, [studentId]: note }))
  }

  const toggleNotes = (studentId: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  const markAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {}
    for (const s of students) updated[s.id] = status
    setAttendance(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const records = students.map(s => ({
        student_id: s.id,
        status: attendance[s.id] || 'present',
        notes: notes[s.id] || '',
      }))
      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, term: currentTerm, year: currentYear, class: activeClass, records }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast({ title: 'Save failed', description: err.error || 'Could not save attendance', variant: 'destructive' })
        return
      }
      toast({ title: 'Attendance saved', description: `Attendance for ${date} recorded in ${activeClass}.` })
    } finally {
      setSaving(false)
    }
  }

  const summary = students.reduce((acc, s) => {
    const status = attendance[s.id] || 'present'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<AttendanceStatus, number>)

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Attendance"
        subtitle={activeClass ? `Taking attendance for ${activeClass}` : 'Loading...'}
        role="teacher"
      />

      <main className="mx-auto max-w-5xl px-6 py-8 animate-fade-up">
        {/* Controls: Date + Class selector */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Date</label>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={date}
                    max={todayISO()}
                    onChange={e => handleDateChange(e.target.value)}
                    data-testid="input-attendance-date"
                    className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {assignedClasses.length > 1 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Class</label>
                  <div className="relative">
                    <select
                      value={activeClass}
                      onChange={e => handleClassChange(e.target.value)}
                      data-testid="select-attendance-class"
                      className="border border-input rounded-md px-3 py-1.5 text-sm bg-background appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {assignedClasses.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              )}

              {assignedClasses.length === 1 && activeClass && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Class</label>
                  <p className="text-sm font-semibold text-foreground py-1.5">{activeClass}</p>
                </div>
              )}

              <div className="text-sm text-muted-foreground sm:ml-auto pt-1 sm:pt-0 sm:pb-1.5">
                <span className="font-medium">{currentTerm} Term</span> · {currentYear}
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : assignedClasses.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No class assigned to your account.</p>
              <p className="text-sm mt-1">Contact the admin to be assigned to a class.</p>
            </CardContent>
          </Card>
        ) : students.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No students found in {activeClass}.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary bar */}
            <div className="flex flex-wrap gap-3 mb-6">
              {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(status => (
                <div key={status} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${STATUS_CONFIG[status].color}`}>
                  {STATUS_CONFIG[status].icon}
                  {STATUS_CONFIG[status].label}: {summary[status] || 0}
                </div>
              ))}
            </div>

            {/* Bulk actions */}
            <Card className="mb-6">
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground mr-1">Mark all as:</span>
                  {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(status => (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      onClick={() => markAll(status)}
                      data-testid={`button-mark-all-${status}`}
                      className={`text-xs ${STATUS_CONFIG[status].color} border`}
                    >
                      {STATUS_CONFIG[status].icon}
                      <span className="ml-1">{STATUS_CONFIG[status].label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Student roster */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {activeClass} — {students.length} Student{students.length !== 1 ? 's' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {students.map((student, idx) => {
                    const status = attendance[student.id] || 'present'
                    const showNotes = expandedNotes.has(student.id)
                    return (
                      <div
                        key={student.id}
                        data-testid={`row-student-${student.id}`}
                        className="px-6 py-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0 text-sm font-bold text-primary">
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{student.profiles?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{student.admission_number}</p>
                            </div>
                          </div>

                          {/* Status buttons */}
                          <div className="flex flex-wrap gap-1.5 sm:shrink-0">
                            {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(s => (
                              <button
                                key={s}
                                onClick={() => setStatus(student.id, s)}
                                data-testid={`button-status-${s}-${student.id}`}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                                  status === s
                                    ? STATUS_CONFIG[s].color + ' ring-2 ring-offset-1 ring-current'
                                    : 'bg-muted/50 text-muted-foreground border-muted hover:bg-muted'
                                }`}
                              >
                                {STATUS_CONFIG[s].icon}
                                {STATUS_CONFIG[s].label}
                              </button>
                            ))}
                          </div>

                          {/* Current status badge + notes toggle */}
                          <div className="flex items-center gap-2 sm:shrink-0">
                            <Badge
                              data-testid={`badge-attendance-status-${student.id}`}
                              className={`text-xs ${STATUS_CONFIG[status].color} border`}
                            >
                              {STATUS_CONFIG[status].label}
                            </Badge>
                            <button
                              onClick={() => toggleNotes(student.id)}
                              data-testid={`button-notes-${student.id}`}
                              title="Add/view note"
                              className={`p-1.5 rounded-md transition-colors ${
                                notes[student.id]
                                  ? 'text-primary bg-primary/10'
                                  : 'text-muted-foreground hover:bg-muted'
                              }`}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Expandable notes input */}
                        {showNotes && (
                          <div className="mt-3 pl-12">
                            <input
                              type="text"
                              placeholder="Optional note (e.g. sick, left early...)"
                              value={notes[student.id] || ''}
                              onChange={e => setNote(student.id, e.target.value)}
                              data-testid={`input-notes-${student.id}`}
                              className="w-full border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Save button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                data-testid="button-save-attendance"
                size="lg"
                className="min-w-40"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Save Attendance</>
                )}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
