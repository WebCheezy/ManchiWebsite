import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { CartProvider } from '@/lib/cart'
import { AvailabilityProvider } from '@/lib/availability/availability-context'
import { BranchAvailabilityProvider } from '@/lib/browse/branch-availability-context'
import {
  getSerializedFoodAvailability,
  getSerializedSideAvailability,
} from '@/lib/db/availability.server'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Manchi - Authentic Nigerian Cuisine',
  description:
    'Delicious Nigerian food delivered fast to your door. Order Jollof Rice, Egusi Soup, Suya, Pounded Yam and more from Manchi.',
  generator: 'v0.app',
  icons: {
    // Use custom Manchi favicon
    icon: [
      {
        url: '/logos/fav-manchi (1).png',
        type: 'image/png',
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#C84B31',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [foodAvailability, sideAvailability] = await Promise.all([
    getSerializedFoodAvailability(),
    getSerializedSideAvailability(),
  ])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AvailabilityProvider foods={foodAvailability} sides={sideAvailability}>
            <CartProvider>
              <BranchAvailabilityProvider>{children}</BranchAvailabilityProvider>
            </CartProvider>
          </AvailabilityProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
