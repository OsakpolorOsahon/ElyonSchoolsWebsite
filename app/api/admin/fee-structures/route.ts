import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3',
]

const VALID_TERMS = ['First', 'Second', 'Third']
const VALID_FEE_TYPES = ['tuition', 'pta_levy', 'books', 'uniform', 'technology_fee', 'sports_fee', 'lab_fee', 'exam_fee']

async function requireAdmin(request: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const adminDb = createAdminClient()
  const { data: profile } = await adminDb.from('profiles').select('role').eq('id', session.user.id).single()
  if (!profile || profile.role !== 'admin') return null
  return { session, adminDb }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { data, error } = await auth.adminDb
    .from('fee_structures')
    .select('*')
    .order('year', { ascending: false })
    .order('term')
    .order('class')
    .order('fee_type')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ fee_structures: data })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const body = await request.json()
  const { class: cls, term, year, fee_type, amount, id } = body

  if (!cls || !term || !year || !fee_type || amount === undefined || amount === null) {
    return NextResponse.json({ error: 'class, term, year, fee_type, and amount are required' }, { status: 400 })
  }

  if (!VALID_CLASSES.includes(cls)) {
    return NextResponse.json({ error: `Invalid class. Must be one of: ${VALID_CLASSES.join(', ')}` }, { status: 400 })
  }
  if (!VALID_TERMS.includes(term)) {
    return NextResponse.json({ error: `Invalid term. Must be one of: ${VALID_TERMS.join(', ')}` }, { status: 400 })
  }
  if (!VALID_FEE_TYPES.includes(fee_type)) {
    return NextResponse.json({ error: `Invalid fee type. Must be one of: ${VALID_FEE_TYPES.join(', ')}` }, { status: 400 })
  }
  if (typeof year !== 'number' || year < 2000 || year > 2100) {
    return NextResponse.json({ error: 'Year must be between 2000 and 2100' }, { status: 400 })
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Amount must be a positive number greater than zero' }, { status: 400 })
  }

  if (id) {
    const { error } = await auth.adminDb
      .from('fee_structures')
      .update({ class: cls, term, year, fee_type, amount })
      .eq('id', id)
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A fee structure for this class/term/year/type already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  const { error } = await auth.adminDb
    .from('fee_structures')
    .insert({ class: cls, term, year, fee_type, amount })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A fee structure for this class/term/year/type already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await auth.adminDb.from('fee_structures').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
