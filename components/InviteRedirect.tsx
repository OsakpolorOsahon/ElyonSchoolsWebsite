'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function InviteRedirect() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('type=invite') && hash.includes('access_token=')) {
      router.replace('/reset-password' + hash)
    }
  }, [router])

  return null
}
