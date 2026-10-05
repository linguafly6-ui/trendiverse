import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { GA_ID, SITE_NAME, SITE_URL } from '@/lib/constants'
import '../styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Virales, Gaming, Herramientas y Chollos`, template: `%s | ${SITE_NAME}` },
  description: 'Lo más viral, guías y códigos de juegos, micro-herramientas útiles y los mejores chollos.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: { type: 'website', siteName: SITE_NAME, locale: 'es_ES', url: SITE_URL },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

const iubendaConfig = `var _iub=_iub||[];_iub.csConfiguration={"siteId":4706473,"cookiePolicyId":59947253,"lang":"es","storage":{"useSiteId":true}};`

const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="msvalidate.01" content="26683077CE62A57AE507DFDF4C488D53" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="text/javascript" dangerouslySetInnerHTML={{ __html: iubendaConfig }} />
        <script type="text/javascript" src="https://cs.iubenda.com/autoblocking/4706473.js" />
        <script type="text/javascript" src="//cdn.iubenda.com/cs/gpp/stub.js" />
        <script type="text/javascript" src="//cdn.iubenda.com/cs/iubenda_cs.js" charSet="UTF-8" async />
      </head>
      <body>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        <Footer />
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
