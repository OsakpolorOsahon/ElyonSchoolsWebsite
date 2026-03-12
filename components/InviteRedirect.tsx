'use client'

import { useEffect } from 'react'

export function InviteRedirect() {
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('type=invite') && hash.includes('access_token=')) {
      window.location.href = '/reset-password' + hash
    }
  }, [])

  return null
}
