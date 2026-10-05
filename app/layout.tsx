import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { GA_ID, SITE_NAME, SITE_URL } from '@/lib/constants'
import '../styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `Actualidad, noticias y guías | ${SITE_NAME}`, template: `%s | ${SITE_NAME}` },
  description: 'Noticias y guías sobre política, economía, tecnología, deportes, gaming y tendencias, además de herramientas prácticas y ofertas seleccionadas.',
  openGraph: { type: 'website', siteName: SITE_NAME, locale: 'es_ES' },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

const iubendaConfig = `var _iub=_iub||[];_iub.csConfiguration={"siteId":4706473,"cookiePolicyId":59947253,"lang":"es","storage":{"useSiteId":true}};`

const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`

const siteSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'es-ES',
      description: 'Noticias, actualidad y guías prácticas sobre política, economía, tecnología, deportes, gaming y tendencias.',
    },
    {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="msvalidate.01" content="26683077CE62A57AE507DFDF4C488D53" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="text/javascript" dangerouslySetInnerHTML={{ __html: iubendaConfig }} />
        <Script src="https://cs.iubenda.com/autoblocking/4706473.js" strategy="beforeInteractive" />
        <Script src="https://cdn.iubenda.com/cs/gpp/stub.js" strategy="beforeInteractive" />
        <Script src="https://cdn.iubenda.com/cs/iubenda_cs.js" charSet="UTF-8" strategy="afterInteractive" />
      </head>
      <body>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        <Footer />
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
            <Script id="ga" strategy="lazyOnload">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
