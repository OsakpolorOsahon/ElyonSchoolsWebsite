import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const STORAGE_BUCKET = 'gallery'
const STORAGE_PATH = 'signatures/principal.png'
const MAX_SIZE_BYTES = 2 * 1024 * 1024

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

export async function POST(request: NextRequest) {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PNG or JPG images are allowed' }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File size must be under 2 MB' }, { status: 400 })
    }

    const adminDb = createAdminClient()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await adminDb.storage
      .from(STORAGE_BUCKET)
      .upload(STORAGE_PATH, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    const { data: urlData } = adminDb.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(STORAGE_PATH)

    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`

    const { error: dbError } = await adminDb
      .from('academic_settings')
      .upsert(
        { singleton_key: true, principal_signature_url: publicUrl },
        { onConflict: 'singleton_key' }
      )

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await verifyAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminDb = createAdminClient()

  await adminDb.storage.from(STORAGE_BUCKET).remove([STORAGE_PATH])

  const { error } = await adminDb
    .from('academic_settings')
    .upsert(
      { singleton_key: true, principal_signature_url: null },
      { onConflict: 'singleton_key' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
