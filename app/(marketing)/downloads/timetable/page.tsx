'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft } from 'lucide-react'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const primaryTimetable = [
  { time: '7:30 – 8:00', subjects: ['Assembly/Devotion', 'Assembly/Devotion', 'Assembly/Devotion', 'Assembly/Devotion', 'Assembly/Devotion'] },
  { time: '8:00 – 9:00', subjects: ['English Language', 'Mathematics', 'English Language', 'Mathematics', 'English Language'] },
  { time: '9:00 – 10:00', subjects: ['Mathematics', 'English Language', 'Basic Science', 'Social Studies', 'Mathematics'] },
  { time: '10:00 – 10:20', subjects: ['BREAK', 'BREAK', 'BREAK', 'BREAK', 'BREAK'] },
  { time: '10:20 – 11:20', subjects: ['Social Studies', 'Basic Science', 'Mathematics', 'English Language', 'Computer Studies'] },
  { time: '11:20 – 12:20', subjects: ['Computer Studies', 'Creative Arts', 'Social Studies', 'Basic Technology', 'Cultural & Creative Arts'] },
  { time: '12:20 – 1:00', subjects: ['LUNCH', 'LUNCH', 'LUNCH', 'LUNCH', 'LUNCH'] },
  { time: '1:00 – 2:00', subjects: ['Religious Studies', 'Physical Education', 'Agricultural Science', 'French', 'Physical Education'] },
  { time: '2:00 – 3:00', subjects: ['Civic Education', 'Music', 'French', 'Agricultural Science', 'Closing/Clubs'] },
]

const secondaryTimetable = [
  { time: '7:30 – 8:00', subjects: ['Assembly', 'Assembly', 'Assembly', 'Assembly', 'Assembly'] },
  { time: '8:00 – 9:00', subjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology'] },
  { time: '9:00 – 10:00', subjects: ['Mathematics', 'English Language', 'Chemistry', 'Biology', 'Mathematics'] },
  { time: '10:00 – 10:20', subjects: ['BREAK', 'BREAK', 'BREAK', 'BREAK', 'BREAK'] },
  { time: '10:20 – 11:20', subjects: ['Physics', 'Biology', 'Mathematics', 'English Language', 'Economics'] },
  { time: '11:20 – 12:20', subjects: ['Chemistry', 'Economics', 'Geography', 'Further Math', 'Government'] },
  { time: '12:20 – 1:00', subjects: ['LUNCH', 'LUNCH', 'LUNCH', 'LUNCH', 'LUNCH'] },
  { time: '1:00 – 2:00', subjects: ['Literature', 'Computer Science', 'Civic Education', 'French', 'Agric. Science'] },
  { time: '2:00 – 3:00', subjects: ['Government', 'Literature', 'Yoruba/French', 'Computer Science', 'Clubs/Sports'] },
]

export default function TimetablePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden bg-muted/30 border-b px-6 py-3 flex items-center justify-between">
        <Link href="/admissions">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => typeof window !== 'undefined' && window.print()}
        >
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </Button>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 print:py-2">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">ELYON SCHOOLS</h1>
          <p className="text-muted-foreground">Academic Timetable — 2024/2025 Session</p>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-primary mb-4 text-center">PRIMARY SCHOOL TIMETABLE</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-2 border text-left w-28">Time</th>
                  {days.map(d => <th key={d} className="p-2 border text-center">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {primaryTimetable.map((row, i) => (
                  <tr key={i} className={row.subjects[0] === 'BREAK' || row.subjects[0] === 'LUNCH' ? 'bg-amber-50' : i % 2 === 0 ? 'bg-muted/20' : ''}>
                    <td className="p-2 border font-medium text-xs">{row.time}</td>
                    {row.subjects.map((s, j) => (
                      <td key={j} className={`p-2 border text-center text-xs ${s === 'BREAK' || s === 'LUNCH' ? 'font-bold text-amber-700' : ''}`}>{s}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-primary mb-4 text-center">SECONDARY SCHOOL TIMETABLE (JSS/SSS)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-2 border text-left w-28">Time</th>
                  {days.map(d => <th key={d} className="p-2 border text-center">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {secondaryTimetable.map((row, i) => (
                  <tr key={i} className={row.subjects[0] === 'BREAK' || row.subjects[0] === 'LUNCH' ? 'bg-amber-50' : i % 2 === 0 ? 'bg-muted/20' : ''}>
                    <td className="p-2 border font-medium text-xs">{row.time}</td>
                    {row.subjects.map((s, j) => (
                      <td key={j} className={`p-2 border text-center text-xs ${s === 'BREAK' || s === 'LUNCH' ? 'font-bold text-amber-700' : ''}`}>{s}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="text-center text-xs text-muted-foreground border-t pt-4">
          Note: This timetable is subject to change. Subject teachers will notify students of any adjustments.<br />
          Elyon Schools | 123 Education Avenue, Ikeja, Lagos | +234 803 123 4567
        </div>
      </div>
    </div>
  )
}
