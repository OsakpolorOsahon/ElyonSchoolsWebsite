'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PortalHeaderProps {
  title: string
  subtitle: string
  role: 'admin' | 'teacher' | 'parent' | 'student'
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  parent: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  student: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
}

export function PortalHeader({ title, subtitle, role }: PortalHeaderProps) {
  const [termLabel, setTermLabel] = useState<string | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('academic_settings')
          .select('current_term, current_year')
          .eq('singleton_key', true)
          .single()
        if (data) {
          setTermLabel(`${data.current_term} Term ${data.current_year}`)
        }
      } catch {
      }
    }
    loadSettings()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <Badge className={roleColors[role]}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
            {termLabel && (
              <Badge variant="outline" className="text-xs" data-testid="badge-current-term">
                {termLabel}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Globe className="h-4 w-4 mr-1" />
              View Website
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}
