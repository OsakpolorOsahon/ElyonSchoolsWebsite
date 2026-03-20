'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { 
    name: 'Academics', 
    href: '/academics',
    children: [
      { name: 'Nursery School', href: '/academics/nursery' },
      { name: 'Primary School', href: '/academics/primary' },
      { name: 'High School', href: '/academics/secondary' },
    ]
  },
  { name: 'Admissions', href: '/admissions' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'News & Events', href: '/news' },
  { name: 'Payments', href: '/payments' },
  { name: 'Contact', href: '/contact' },
]

const roleDashboardMap: Record<string, string> = {
  admin: '/admin',
  teacher: '/teacher',
  parent: '/parent',
  student: '/student',
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dashboardHref, setDashboardHref] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      if (profile?.role && roleDashboardMap[profile.role]) {
        setDashboardHref(roleDashboardMap[profile.role])
      }
    })
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-3" data-testid="link-home-logo">
              <Image
                src="/logo.png"
                alt="Elyon Schools Logo"
                width={48}
                height={48}
                className="h-12 w-auto"
                priority
              />
              <div>
                <p className="text-base font-bold text-primary leading-tight">Elyon Schools</p>
                <p className="text-xs text-muted-foreground hidden sm:block">Excellence in Education</p>
              </div>
            </Link>
          </div>

          <div className="flex lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              data-testid="button-mobile-menu"
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
          </div>

          <div className="hidden lg:flex lg:gap-x-1">
            {navigation.map((item) => (
              item.children ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-1" data-testid={`button-nav-${item.name.toLowerCase()}`}>
                      {item.name}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.name} asChild>
                        <Link href={child.href} data-testid={`link-nav-${child.name.toLowerCase().replace(/\s+/g, '-')}`}>
                          {child.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-testid={`link-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-2">
            {dashboardHref ? (
              <Link href={dashboardHref}>
                <Button variant="outline" data-testid="button-back-to-dashboard">
                  Back to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" data-testid="button-sign-in">
                  Sign In
                </Button>
              </Link>
            )}
            <Link href="/admissions/apply">
              <Button data-testid="button-apply-now">
                Apply Now
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {mobileMenuOpen && (
        <div role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 z-[200] bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-[210] w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border shadow-xl">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Image
                  src="/logo.png"
                  alt="Elyon Schools Logo"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <span className="text-lg font-bold text-primary">Elyon Schools</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="button-close-mobile-menu"
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-border">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    item.children ? (
                      <div key={item.name} className="space-y-2">
                        <div className="block rounded-lg px-3 py-2 text-base font-semibold text-foreground">
                          {item.name}
                        </div>
                        <div className="pl-4 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              onClick={() => setMobileMenuOpen(false)}
                              data-testid={`link-mobile-${child.name.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block rounded-lg px-3 py-2 text-base font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid={`link-mobile-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {item.name}
                      </Link>
                    )
                  ))}
                </div>
                <div className="py-6 space-y-3">
                  {dashboardHref ? (
                    <Link href={dashboardHref} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full" data-testid="button-mobile-back-to-dashboard">
                        Back to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full" data-testid="button-mobile-sign-in">
                        Sign In
                      </Button>
                    </Link>
                  )}
                  <Link href="/admissions/apply" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full" data-testid="button-mobile-apply-now">
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
