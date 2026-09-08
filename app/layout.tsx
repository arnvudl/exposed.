import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import BMCWidget from '@/components/BMCWidget';
import './globals.css';

/* Deux familles, pas trois. Auto-hebergees par next/font : aucun appel a un
   domaine tiers au chargement de la page. */
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--display',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://getexposed.me'),
  title: {
    template: '%s · Exposed',
    default: 'Exposed — Analyse tes données Instagram gratuitement',
  },
  description:
    'Découvre ce que tes données Instagram révèlent : abonnés fantômes, conversations les plus actives, ton profil complet. Gratuit, sans compte, tout reste dans ton navigateur.',
  keywords: [
    'analyser données instagram',
    'instagram wrapped',
    'voir mes données instagram',
    'analyse compte instagram gratuit',
    'abonnés fantômes instagram',
    'données personnelles instagram',
    'export instagram json',
    'instagram statistics',
  ],
  openGraph: {
    siteName: 'Exposed',
    locale: 'fr_BE',
    type: 'website',
    url: 'https://getexposed.me',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@arnvudl',
    site: '@arnvudl',
  },
  alternates: {
    canonical: 'https://getexposed.me',
  },
};

export const viewport: Viewport = {
  themeColor: '#0D0B0A',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `suppressHydrationWarning` : la classe `js` est posee par le script en
    // ligne ci-dessous, avant l'hydratation. React verrait sinon un attribut
    // qui a change entre le serveur et le client.
    <html lang="fr" suppressHydrationWarning className={`${display.variable} ${mono.variable}`}>
      <head>
        {/* Pose la classe avant le premier rendu : sans elle, les elements a
            reveler apparaitraient puis disparaitraient le temps de l'hydratation.
            Sans JavaScript, la classe n'est jamais posee et la page est complete. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body>
        {children}
        <BMCWidget />
      </body>
    </html>
  );
}
