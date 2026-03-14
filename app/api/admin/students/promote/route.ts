'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const ALL_CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
]

const CLASS_SET = new Set(ALL_CLASSES)

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  if (profile?.role !== 'admin') return null
  return session
}

function getNextClass(currentClass: string): string | 'graduate' | null {
  if (!CLASS_SET.has(currentClass)) return null
  const idx = ALL_CLASSES.indexOf(currentClass)
  if (idx === ALL_CLASSES.length - 1) return 'graduate'
  return ALL_CLASSES[idx + 1]
}

export async function POST(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { studentIds, skipIds } = body as { studentIds?: string[], skipIds?: string[] }

  const supabase = createAdminClient()
  const skipSet = new Set(skipIds || [])

  const query = supabase
    .from('students')
    .select('id, class, status, repeating')
    .eq('status', 'active')

  if (studentIds && studentIds.length > 0) {
    query.in('id', studentIds)
  }

  const { data: students, error: fetchError } = await query

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })
  if (!students || students.length === 0) {
    return NextResponse.json({ error: 'No active students found' }, { status: 404 })
  }

  const results = { promoted: 0, graduated: 0, skipped: 0, errors: [] as string[] }
  const currentYear = new Date().getFullYear()

  for (const student of students) {
    if (skipSet.has(student.id) || student.repeating) {
      results.skipped++
      if (student.repeating && !skipSet.has(student.id)) {
        await supabase
          .from('students')
          .update({ repeating: false })
          .eq('id', student.id)
      }
      continue
    }

    const next = getNextClass(student.class)

    if (next === null) {
      results.errors.push(`Student ${student.id} has unknown class "${student.class}" — skipped`)
      continue
    }

    if (next === 'graduate') {
      const { error } = await supabase
        .from('students')
        .update({ status: 'graduated', graduation_year: currentYear })
        .eq('id', student.id)
      if (error) {
        results.errors.push(`Failed to graduate ${student.id}: ${error.message}`)
      } else {
        results.graduated++
      }
    } else {
      const { error } = await supabase
        .from('students')
        .update({ class: next })
        .eq('id', student.id)
      if (error) {
        results.errors.push(`Failed to promote ${student.id}: ${error.message}`)
      } else {
        results.promoted++
      }
    }
  }

  const hasErrors = results.errors.length > 0
  return NextResponse.json({
    success: !hasErrors,
    results,
  })
}
