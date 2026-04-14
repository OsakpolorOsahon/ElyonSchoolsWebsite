import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { PWASetup } from '@/components/pwa/PWASetup'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Elyon Schools - Excellence in Education Since 1994',
  description: 'Elyon Schools provides quality education from nursery through secondary levels. Join our community of learners and achieve academic excellence.',
  keywords: ['school', 'education', 'Nigeria', 'admission', 'primary school', 'secondary school'],
  openGraph: {
    title: 'Elyon Schools - Excellence in Education Since 1994',
    description: 'Quality education from nursery through secondary levels',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a3a6b" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Elyon Schools" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Elyon Schools" />
        <meta name="msapplication-TileColor" content="#1a3a6b" />
        <meta name="msapplication-TileImage" content="/logo.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          <PWASetup />
          {children}
        </Providers>
      </body>
    </html>
  )
}
