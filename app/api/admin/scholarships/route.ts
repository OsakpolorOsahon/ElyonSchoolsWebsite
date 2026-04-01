import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const adminDb = createAdminClient()
  const { data: profile } = await adminDb.from('profiles').select('role').eq('id', session.user.id).single()
  if (profile?.role !== 'admin') return null
  return { session, adminDb }
}

export async function GET(request: NextRequest) {
  const ctx = await requireAdmin()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('student_id')

  let query = ctx.adminDb
    .from('scholarships')
    .select('*, students(admission_number, class, profiles!profile_id(full_name))')
    .order('created_at', { ascending: false })

  if (studentId) {
    query = query.eq('student_id', studentId) as typeof query
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ scholarships: data || [] })
}

export async function POST(request: NextRequest) {
  const ctx = await requireAdmin()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { student_id, name, coverage_type, coverage_value, fee_types, applies_to_term, applies_to_year, notes } = body

  if (!student_id || !name || !coverage_type || coverage_value === undefined || coverage_value === null) {
    return NextResponse.json({ error: 'student_id, name, coverage_type and coverage_value are required' }, { status: 400 })
  }

  if (!['full', 'percentage', 'fixed'].includes(coverage_type)) {
    return NextResponse.json({ error: 'coverage_type must be full, percentage, or fixed' }, { status: 400 })
  }

  const val = Number(coverage_value)
  if (isNaN(val) || val < 0) {
    return NextResponse.json({ error: 'coverage_value must be a non-negative number' }, { status: 400 })
  }

  if (coverage_type === 'percentage' && val > 100) {
    return NextResponse.json({ error: 'Percentage cannot exceed 100' }, { status: 400 })
  }

  const { data, error } = await ctx.adminDb
    .from('scholarships')
    .insert({
      student_id,
      name: name.trim(),
      coverage_type,
      coverage_value: val,
      fee_types: Array.isArray(fee_types) && fee_types.length > 0 ? fee_types : null,
      applies_to_term: applies_to_term || null,
      applies_to_year: applies_to_year ? Number(applies_to_year) : null,
      notes: notes?.trim() || null,
      active: true,
      created_by: ctx.session.user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ scholarship: data })
}

export async function PATCH(request: NextRequest) {
  const ctx = await requireAdmin()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const patch: Record<string, unknown> = {}

  if (updates.name !== undefined) patch.name = String(updates.name).trim()
  if (updates.coverage_type !== undefined) {
    if (!['full', 'percentage', 'fixed'].includes(updates.coverage_type)) {
      return NextResponse.json({ error: 'Invalid coverage_type' }, { status: 400 })
    }
    patch.coverage_type = updates.coverage_type
  }
  if (updates.coverage_value !== undefined) {
    const val = Number(updates.coverage_value)
    if (isNaN(val) || val < 0) return NextResponse.json({ error: 'Invalid coverage_value' }, { status: 400 })
    patch.coverage_value = val
  }
  if (updates.fee_types !== undefined) {
    patch.fee_types = Array.isArray(updates.fee_types) && updates.fee_types.length > 0 ? updates.fee_types : null
  }
  if (updates.applies_to_term !== undefined) patch.applies_to_term = updates.applies_to_term || null
  if (updates.applies_to_year !== undefined) patch.applies_to_year = updates.applies_to_year ? Number(updates.applies_to_year) : null
  if (updates.notes !== undefined) patch.notes = updates.notes?.trim() || null
  if (updates.active !== undefined) patch.active = Boolean(updates.active)

  const { data, error } = await ctx.adminDb
    .from('scholarships')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ scholarship: data })
}

export async function DELETE(request: NextRequest) {
  const ctx = await requireAdmin()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await ctx.adminDb.from('scholarships').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
