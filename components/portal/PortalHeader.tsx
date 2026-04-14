'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut, Globe, BookOpen } from 'lucide-react'
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
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }, [termLabel])

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY <= 0) {
        setHidden(false)
      } else if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true)
      } else if (currentY < lastScrollY.current) {
        setHidden(false)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-40 bg-background border-b border-border transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
      >
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
                <span className="hidden sm:inline">View Website</span>
              </Link>
            </Button>
            {role !== 'admin' && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${role}/policy`}>
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Handbook</span>
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>
      <div style={{ height: headerHeight || 81 }} />
    </>
  )
}
