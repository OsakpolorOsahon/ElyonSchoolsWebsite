import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { PWASetup } from '@/components/pwa/PWASetup'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const BASE_URL = 'https://elyonschools.edu.ng'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Elyon Schools — Excellence in Education Since 1994',
    template: '%s | Elyon Schools',
  },
  description: 'Elyon Schools provides quality education from nursery through secondary levels. Join our community of learners and achieve academic excellence in Nigeria.',
  keywords: ['school', 'education', 'Nigeria', 'admission', 'nursery school', 'primary school', 'secondary school', 'best school Nigeria', 'Elyon Schools'],
  authors: [{ name: 'Elyon Schools', url: BASE_URL }],
  creator: 'Elyon Schools',
  publisher: 'Elyon Schools',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Elyon Schools — Excellence in Education Since 1994',
    description: 'Quality education from nursery through secondary levels in Nigeria. Apply now for the new academic session.',
    url: BASE_URL,
    siteName: 'Elyon Schools',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elyon Schools — Excellence in Education Since 1994',
    description: 'Quality education from nursery through secondary levels in Nigeria.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        <meta name="theme-color" content="#14532d" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Elyon Schools" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Elyon Schools" />
        <meta name="msapplication-TileColor" content="#14532d" />
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
