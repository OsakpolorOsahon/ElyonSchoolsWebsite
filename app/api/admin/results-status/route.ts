import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ALL_CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
]

export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const adminDb = createAdminClient()
  const { data: profile } = await adminDb.from('profiles').select('role').eq('id', session.user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const { data: latestExam } = await adminDb
    .from('exams')
    .select('id, name, term, year')
    .order('year', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!latestExam) {
    return NextResponse.json({ exam: null, classes: [] })
  }

  const { data: results } = await adminDb
    .from('student_results')
    .select('student_id, students!inner(class)')
    .eq('exam_id', latestExam.id)

  const classesWithResults = new Set<string>()
  for (const r of (results || [])) {
    const studentClass = (r as unknown as { student_id: string; students: { class: string }[] }).students?.[0]?.class
    if (studentClass) classesWithResults.add(studentClass)
  }

  const classStatuses = ALL_CLASSES.map(cls => ({
    class: cls,
    hasResults: classesWithResults.has(cls),
  }))

  return NextResponse.json({
    exam: latestExam,
    classes: classStatuses,
  })
}
