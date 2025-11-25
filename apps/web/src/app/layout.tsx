import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import '../index.css'
import { DataProvider } from '@/lib/data-context'
import { AuthProvider } from '@/lib/auth-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { PwaProvider } from '@/components/pwa-provider'
import { PwaInstallBanner } from '@/components/pwa-install-banner'

const _geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const _geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Ascomp INC Service Portal',
  description: 'Ascomp INC field-service and maintenance workflow portal.',
  applicationName: 'Ascomp INC',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ascomp',
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/LOGO/Ascomp.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon/apple-touch-icon.png', rel: 'apple-touch-icon', sizes: '180x180' },
    ],
    apple: '/favicon/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_geist.variable} ${_geistMono.variable} font-sans antialiased bg-white text-slate-900`}>
        <PwaProvider>
          <AuthProvider>
            <SidebarProvider>
              <DataProvider>{children}</DataProvider>
              <Analytics />
            </SidebarProvider>
          </AuthProvider>
          <PwaInstallBanner />
        </PwaProvider>
      </body>
    </html>
  )
}
