import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

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

export async function GET() {
  const session = await verifyAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_ts', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ events: data })
}

export async function POST(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, start_ts, end_ts, location, category } = body

  if (!title || !start_ts || !end_ts) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('events')
    .insert({
      title,
      description: description || null,
      start_ts,
      end_ts,
      location: location || null,
      category: category || 'Other',
      created_by: session.user.id,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id })
}

export async function PATCH(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, title, description, start_ts, end_ts, location, category } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  if (!title || !start_ts || !end_ts) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('events')
    .update({ title, description: description || null, start_ts, end_ts, location: location || null, category: category || 'Other' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
