import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Public settings route — returns current term and year
export async function GET() {
  const adminDb = createAdminClient()
  const { data, error } = await adminDb
    .from('academic_settings')
    .select('current_term, current_year')
    .eq('singleton_key', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ settings: { current_term: 'First', current_year: new Date().getFullYear() } })
  }

  return NextResponse.json({ settings: data })
}
