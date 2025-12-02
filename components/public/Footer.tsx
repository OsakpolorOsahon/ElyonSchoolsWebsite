import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

const footerNavigation = {
  school: [
    { name: 'About Us', href: '/about' },
    { name: 'Our History', href: '/about#history' },
    { name: 'Leadership', href: '/about#leadership' },
    { name: 'Facilities', href: '/about#facilities' },
    { name: 'Gallery', href: '/gallery' },
  ],
  academics: [
    { name: 'Nursery School', href: '/academics/nursery' },
    { name: 'Primary School', href: '/academics/primary' },
    { name: 'Secondary School', href: '/academics/secondary' },
    { name: 'Curriculum', href: '/academics#curriculum' },
    { name: 'Extracurriculars', href: '/academics#extracurriculars' },
  ],
  admissions: [
    { name: 'How to Apply', href: '/admissions' },
    { name: 'Apply Online', href: '/admissions/apply' },
    { name: 'Check Status', href: '/admissions/status' },
    { name: 'Fees & Payments', href: '/payments' },
    { name: 'FAQs', href: '/admissions#faq' },
  ],
  connect: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'News & Updates', href: '/news' },
    { name: 'Events Calendar', href: '/events' },
    { name: 'Parent Portal', href: '/auth/login' },
    { name: 'Student Portal', href: '/auth/login' },
  ],
}

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'YouTube', href: '#', icon: Youtube },
]

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-1">
                <Image
                  src="/logo.png"
                  alt="Elyon Schools"
                  width={56}
                  height={56}
                  className="h-14 w-auto"
                />
              </div>
              <div>
                <p className="text-xl font-bold">Elyon Schools</p>
                <p className="text-sm text-primary-foreground/80">Est. 1994</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-primary-foreground/80">
              Nurturing young minds from Nursery through Secondary education. 
              Building tomorrow&apos;s leaders with excellence in academics, 
              character, and values.
            </p>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span>123 Education Avenue, Lagos, Nigeria</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>+234 803 123 4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>info@elyonschools.edu.ng</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 flex-shrink-0" />
                <span>Mon - Fri: 7:30 AM - 4:00 PM</span>
              </div>
            </div>

            <div className="flex gap-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  data-testid={`link-social-${item.name.toLowerCase()}`}
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold">Our School</h3>
                <ul className="mt-6 space-y-4">
                  {footerNavigation.school.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                        data-testid={`link-footer-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold">Academics</h3>
                <ul className="mt-6 space-y-4">
                  {footerNavigation.academics.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                        data-testid={`link-footer-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold">Admissions</h3>
                <ul className="mt-6 space-y-4">
                  {footerNavigation.admissions.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                        data-testid={`link-footer-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold">Connect</h3>
                <ul className="mt-6 space-y-4">
                  {footerNavigation.connect.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                        data-testid={`link-footer-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-primary-foreground/20 pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-xs text-primary-foreground/60">
              &copy; {new Date().getFullYear()} Elyon Schools. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-primary-foreground/60">
              <Link href="/privacy" className="hover:text-primary-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
