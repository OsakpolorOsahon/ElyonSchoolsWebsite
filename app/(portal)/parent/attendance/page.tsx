'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Loader2,
  CalendarDays,
  ChevronDown,
  BarChart3,
  User,
} from 'lucide-react'

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

interface AttendanceRecord {
  id: string
  date: string
  status: AttendanceStatus
  notes: string | null
  class: string
  term: string
  year: number
}

interface Child {
  id: string
  admission_number: string
  class: string
  profiles: { full_name: string } | null
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  present:  { label: 'Present',  color: 'bg-green-100 text-green-700',  icon: <CheckCircle className="h-3.5 w-3.5" /> },
  absent:   { label: 'Absent',   color: 'bg-red-100 text-red-700',      icon: <XCircle className="h-3.5 w-3.5" /> },
  late:     { label: 'Late',     color: 'bg-amber-100 text-amber-700',  icon: <Clock className="h-3.5 w-3.5" /> },
  excused:  { label: 'Excused',  color: 'bg-blue-100 text-blue-700',    icon: <BookOpen className="h-3.5 w-3.5" /> },
}

const TERMS = ['First', 'Second', 'Third']

function AttendanceContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const preselectedChildId = searchParams.get('child')

  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTerm, setFilterTerm] = useState('')
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()))

  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]

  const fetchChildren = useCallback(async () => {
    const res = await fetch('/api/parent/children')
    if (res.ok) {
      const data = await res.json()
      const list = (data.children || []) as Child[]
      setChildren(list)
      const defaultId = preselectedChildId && list.some(c => c.id === preselectedChildId)
        ? preselectedChildId
        : (list[0]?.id ?? '')
      setSelectedChildId(defaultId)
      return defaultId
    }
    return ''
  }, [preselectedChildId])

  const fetchAttendance = useCallback(async (childId: string, term: string, year: string) => {
    if (!childId) { setLoading(false); return }
    setLoading(true)
    try {
      const params = new URLSearchParams({ student_id: childId })
      if (term) params.set('term', term)
      if (year) params.set('year', year)
      const res = await fetch(`/api/parent/attendance?${params}`)
      if (!res.ok) {
        const err = await res.json()
        toast({ title: 'Error', description: err.error || 'Failed to load attendance', variant: 'destructive' })
        return
      }
      const data = await res.json()
      setRecords(data.records || [])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchChildren().then(defaultId => {
      fetchAttendance(defaultId, filterTerm, filterYear)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChildChange = (childId: string) => {
    setSelectedChildId(childId)
    fetchAttendance(childId, filterTerm, filterYear)
  }

  const handleApplyFilters = () => {
    fetchAttendance(selectedChildId, filterTerm, filterYear)
  }

  const summary = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {} as Record<AttendanceStatus, number>)

  const attendanceRate = records.length > 0
    ? Math.round((((summary.present || 0) + (summary.late || 0)) / records.length) * 100)
    : null

  const selectedChild = children.find(c => c.id === selectedChildId)

  // Use tabs for 1–3 children, dropdown for 4+
  const useTabs = children.length <= 3

  // Group by month
  const byMonth = records.reduce((acc, rec) => {
    const month = rec.date.substring(0, 7)
    if (!acc[month]) acc[month] = []
    acc[month].push(rec)
    return acc
  }, {} as Record<string, AttendanceRecord[]>)

  const sortedMonths = Object.keys(byMonth).sort((a, b) => b.localeCompare(a))

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Attendance"
        subtitle="Track your child's school attendance"
        role="parent"
      />

      <main className="mx-auto max-w-4xl px-6 py-8 animate-fade-up">
        {/* Child selector — tabs (1-3) or dropdown (4+), matching ParentChildSelector UX */}
        {children.length > 1 && (
          <div className="mb-6">
            {useTabs ? (
              <Tabs value={selectedChildId} onValueChange={handleChildChange}>
                <TabsList data-testid="child-tabs">
                  {children.map(c => (
                    <TabsTrigger key={c.id} value={c.id} data-testid={`tab-child-${c.id}`}>
                      {c.profiles?.full_name || c.admission_number}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            ) : (
              <Select value={selectedChildId} onValueChange={handleChildChange}>
                <SelectTrigger className="w-64" data-testid="select-child">
                  <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.profiles?.full_name || c.admission_number} ({c.class})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Selected child info (single child) */}
        {children.length === 1 && selectedChild && (
          <div className="flex items-center gap-3 mb-6 p-3 bg-muted/40 rounded-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{selectedChild.profiles?.full_name || selectedChild.admission_number}</p>
              <p className="text-xs text-muted-foreground">{selectedChild.class} · {selectedChild.admission_number}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-5">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Term</label>
                <div className="relative">
                  <select
                    value={filterTerm}
                    onChange={e => setFilterTerm(e.target.value)}
                    data-testid="select-filter-term"
                    className="border border-input rounded-md px-3 py-2 text-sm bg-background appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Terms</option>
                    {TERMS.map(t => <option key={t} value={t}>{t} Term</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Year</label>
                <div className="relative">
                  <select
                    value={filterYear}
                    onChange={e => setFilterYear(e.target.value)}
                    data-testid="select-filter-year"
                    className="border border-input rounded-md px-3 py-2 text-sm bg-background appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <Button onClick={handleApplyFilters} data-testid="button-apply-filters">Apply</Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary card */}
        {!loading && selectedChild && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4" />
                {selectedChild.profiles?.full_name || selectedChild.admission_number} — Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-5">
                {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(status => (
                  <div key={status} className={`text-center p-3 rounded-lg ${STATUS_CONFIG[status].color}`}>
                    <div className="flex justify-center mb-1">{STATUS_CONFIG[status].icon}</div>
                    <p className="text-lg font-bold" data-testid={`stat-${status}`}>{summary[status] || 0}</p>
                    <p className="text-xs">{STATUS_CONFIG[status].label}</p>
                  </div>
                ))}
                <div className="text-center p-3 rounded-lg bg-muted/70">
                  <BarChart3 className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                  <p className={`text-lg font-bold ${
                    attendanceRate === null ? 'text-muted-foreground' :
                    attendanceRate >= 80 ? 'text-green-600' :
                    attendanceRate >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`} data-testid="stat-attendance-rate">
                    {attendanceRate !== null ? `${attendanceRate}%` : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Records list */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !selectedChild ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No children linked to your account. Please contact the school administrator.</p>
            </CardContent>
          </Card>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No attendance records found for the selected filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedMonths.map(month => {
              const monthDate = new Date(month + '-01')
              const monthLabel = monthDate.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })
              const monthRecords = byMonth[month].sort((a, b) => b.date.localeCompare(a.date))
              return (
                <Card key={month}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {monthLabel}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {monthRecords.map(rec => {
                        const d = new Date(rec.date + 'T12:00:00')
                        return (
                          <div
                            key={rec.id}
                            data-testid={`row-attendance-${rec.id}`}
                            className="flex items-center justify-between px-6 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${STATUS_CONFIG[rec.status].color}`}>
                                {STATUS_CONFIG[rec.status].icon}
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {d.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'short' })}
                                </p>
                                {rec.notes && (
                                  <p className="text-xs text-muted-foreground">{rec.notes}</p>
                                )}
                              </div>
                            </div>
                            <Badge className={`text-xs ${STATUS_CONFIG[rec.status].color}`}>
                              {STATUS_CONFIG[rec.status].label}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default function ParentAttendancePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <AttendanceContent />
    </Suspense>
  )
}
