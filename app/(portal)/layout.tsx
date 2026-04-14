import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PWAInstallBanner } from '@/components/pwa/PWASetup'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      {children}
      <PWAInstallBanner />
    </div>
  )
}
