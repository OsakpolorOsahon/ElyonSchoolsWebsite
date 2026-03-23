import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'parent') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admissionNumber = request.nextUrl.searchParams.get('admissionNumber')
  if (!admissionNumber) {
    return NextResponse.json({ error: 'admissionNumber parameter is required' }, { status: 400 })
  }

  const adminDb = createAdminClient()

  const { data: student, error } = await adminDb
    .from('students')
    .select('id, admission_number, class, profiles!profile_id(full_name)')
    .eq('admission_number', admissionNumber)
    .eq('parent_profile_id', session.user.id)
    .single()

  if (error || !student) {
    return NextResponse.json({ error: 'Student not found or access denied' }, { status: 404 })
  }

  return NextResponse.json({ student })
}
