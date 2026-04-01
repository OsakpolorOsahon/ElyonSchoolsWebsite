'use client'

import { useState, useEffect, useCallback } from 'react'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Users,
  Filter,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  ChevronDown,
  BarChart3,
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
  student_id: string
  students: {
    admission_number: string
    class: string
    profiles: { full_name: string } | null
  } | null
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  present:  { label: 'Present',  color: 'bg-green-100 text-green-700',  icon: <CheckCircle className="h-3.5 w-3.5" /> },
  absent:   { label: 'Absent',   color: 'bg-red-100 text-red-700',      icon: <XCircle className="h-3.5 w-3.5" /> },
  late:     { label: 'Late',     color: 'bg-amber-100 text-amber-700',  icon: <Clock className="h-3.5 w-3.5" /> },
  excused:  { label: 'Excused',  color: 'bg-blue-100 text-blue-700',    icon: <BookOpen className="h-3.5 w-3.5" /> },
}

const ALL_CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
]

const TERMS = ['First', 'Second', 'Third']

export default function AdminAttendancePage() {
  const { toast } = useToast()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [filterClass, setFilterClass] = useState('')
  const [filterTerm, setFilterTerm] = useState('')
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()))
  const [filterDate, setFilterDate] = useState('')

  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterClass) params.set('class', filterClass)
      if (filterTerm) params.set('term', filterTerm)
      if (filterYear) params.set('year', filterYear)
      if (filterDate) params.set('date', filterDate)

      const res = await fetch(`/api/admin/attendance?${params}`)
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
  }, [filterClass, filterTerm, filterYear, filterDate, toast])

  useEffect(() => {
    fetchRecords()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Compute per-student summary
  const studentSummary = records.reduce((acc, rec) => {
    const key = rec.student_id
    if (!acc[key]) {
      acc[key] = {
        id: rec.student_id,
        name: rec.students?.profiles?.full_name || 'Unknown',
        admissionNumber: rec.students?.admission_number || '',
        class: rec.students?.class || rec.class,
        present: 0, absent: 0, late: 0, excused: 0, total: 0,
      }
    }
    acc[key][rec.status] += 1
    acc[key].total += 1
    return acc
  }, {} as Record<string, { id: string; name: string; admissionNumber: string; class: string; present: number; absent: number; late: number; excused: number; total: number }>)

  const summaryRows = Object.values(studentSummary).sort((a, b) => a.name.localeCompare(b.name))

  const totalByStatus = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {} as Record<AttendanceStatus, number>)

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader
        title="Attendance Records"
        subtitle="View and analyse attendance across all classes"
        role="admin"
      />

      <main className="mx-auto max-w-7xl px-6 py-8 animate-fade-up">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Class</label>
                <div className="relative">
                  <select
                    value={filterClass}
                    onChange={e => setFilterClass(e.target.value)}
                    data-testid="select-filter-class"
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Classes</option>
                    {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Term</label>
                <div className="relative">
                  <select
                    value={filterTerm}
                    onChange={e => setFilterTerm(e.target.value)}
                    data-testid="select-filter-term"
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-ring"
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
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Specific Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  data-testid="input-filter-date"
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={fetchRecords} data-testid="button-apply-filters" className="flex-1">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                </Button>
                <Button variant="outline" onClick={() => { setFilterClass(''); setFilterTerm(''); setFilterYear(String(currentYear)); setFilterDate('') }} data-testid="button-clear-filters">
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview stats */}
        {records.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-4 mb-6 stagger-children">
            {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(status => (
              <Card key={status} className="hover-elevate">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${STATUS_CONFIG[status].color}`}>
                      {STATUS_CONFIG[status].icon}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{STATUS_CONFIG[status].label}</p>
                      <p className="text-2xl font-bold" data-testid={`stat-${status}`}>{totalByStatus[status] || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Per-student summary table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No attendance records found.</p>
              <p className="text-sm mt-1">Adjust your filters or wait for teachers to take attendance.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Summary ({summaryRows.length} student{summaryRows.length !== 1 ? 's' : ''})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground">Student</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Class</th>
                      <th className="text-center px-4 py-3 font-medium text-green-700">Present</th>
                      <th className="text-center px-4 py-3 font-medium text-red-700">Absent</th>
                      <th className="text-center px-4 py-3 font-medium text-amber-700">Late</th>
                      <th className="text-center px-4 py-3 font-medium text-blue-700">Excused</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Total</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryRows.map(row => {
                      const attendanceRate = row.total > 0
                        ? Math.round(((row.present + row.late) / row.total) * 100)
                        : 0
                      return (
                        <tr key={row.id} data-testid={`row-summary-${row.id}`} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-3">
                            <p className="font-medium">{row.name}</p>
                            <p className="text-xs text-muted-foreground">{row.admissionNumber}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{row.class}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge className="bg-green-100 text-green-700 text-xs">{row.present}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className="bg-red-100 text-red-700 text-xs">{row.absent}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className="bg-amber-100 text-amber-700 text-xs">{row.late}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className="bg-blue-100 text-blue-700 text-xs">{row.excused}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center font-medium">{row.total}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-semibold ${
                              attendanceRate >= 80 ? 'text-green-600' :
                              attendanceRate >= 60 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {attendanceRate}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
