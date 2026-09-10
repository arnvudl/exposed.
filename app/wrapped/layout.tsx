import type { Metadata } from 'next';

/* La page qui lit les messages n'a rien a faire dans un moteur de recherche :
   elle n'a pas de contenu, seulement un depot de fichier. */
export const metadata: Metadata = {
  title: 'Ton dossier',
  robots: { index: false, follow: false },
};

export default function WrappedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
