import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
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
  title: 'Exposed. Ce que tes DMs disent de toi',
  description:
    'Un Wrapped pour tes DMs Instagram, lu entièrement dans ton navigateur. Aucun message ne quitte ta machine.',
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
        <Script
          id="bmc-button"
          strategy="lazyOnload"
          src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js"
          data-name="bmc-button"
          data-slug="arnvudl"
          data-color="#FFDD00"
          data-emoji="☕"
          data-font="Lato"
          data-text="Buy me a coffee"
          data-outline-color="#000000"
          data-font-color="#000000"
          data-coffee-color="#ffffff"
        />
      </body>
    </html>
  );
}
