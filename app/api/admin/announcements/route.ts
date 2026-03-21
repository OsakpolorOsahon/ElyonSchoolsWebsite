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
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ announcements: data })
}

export async function POST(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, body: content, target_audience, is_published } = body

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      title,
      body: content,
      target_audience: target_audience || 'all',
      is_published: is_published ?? true,
      created_by: session.user.id,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, id: data.id })
}

export async function PATCH(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, is_published, title, body: content, target_audience } = body

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const updateData: Record<string, any> = {}
  if (is_published !== undefined) updateData.is_published = is_published
  if (title !== undefined) {
    if (!title.trim()) return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
    updateData.title = title.trim()
  }
  if (content !== undefined) {
    if (!content.trim()) return NextResponse.json({ error: 'Body cannot be empty' }, { status: 400 })
    updateData.body = content.trim()
  }
  if (target_audience !== undefined) updateData.target_audience = target_audience

  if (Object.keys(updateData).length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('announcements').update(updateData).eq('id', id)

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
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
