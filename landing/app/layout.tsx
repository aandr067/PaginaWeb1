import type { Metadata, Viewport } from 'next';
import { inter, interTight } from './fonts';
import { services, site } from '@/content/site';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.meta.title,
    template: `%s · ${site.brand}`,
  },
  description: site.meta.description,
  applicationName: site.brand,
  authors: [{ name: site.legalName }],
  keywords: [
    'agentes de voz IA',
    'gimnasios',
    'cadenas de clubes deportivos',
    'automatización de marketing',
    'software a medida',
    'ciberseguridad',
    'Madrid',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: siteUrl,
    siteName: site.brand,
    title: site.meta.title,
    description: site.meta.description,
    images: [{ url: '/img/og-apf.jpg', width: 1200, height: 630, alt: site.meta.ogAlt }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.meta.title,
    description: site.meta.description,
    images: ['/img/og-apf.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  themeColor: '#07090E',
  colorScheme: 'dark',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: site.brand,
      legalName: site.legalName,
      url: siteUrl,
      email: site.email,
      description: site.meta.description,
      areaServed: 'ES',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Madrid',
        addressCountry: 'ES',
      },
    },
    ...services.items.map((service) => ({
      '@type': 'Service',
      name: service.title,
      serviceType: service.kicker,
      description: service.body.join(' '),
      provider: { '@id': `${siteUrl}/#organization` },
      areaServed: { '@type': 'Country', name: 'España' },
      audience: {
        '@type': 'BusinessAudience',
        name: 'Cadenas de gimnasios y clubes deportivos',
      },
    })),
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-ES" className={`${inter.variable} ${interTight.variable}`}>
      <head>
        {/* Marca el documento como «con JS» antes del primer pintado. Solo
            entonces el CSS oculta los bloques que espera revelar al hacer
            scroll: si este script no llega a ejecutarse, la página se ve
            entera en lugar de quedarse en negro. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          // El contenido es nuestro y estático: no hay entrada de usuario en el grafo.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
