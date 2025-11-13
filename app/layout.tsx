import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

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
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
