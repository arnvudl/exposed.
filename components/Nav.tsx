import Link from 'next/link';
import styles from './Nav.module.css';

/* Quatre onglets. Le guide d'export est le point de blocage le plus courant
   (mauvais format, mauvaise categorie) : il merite un acces direct dans le
   header, pas juste un lien enterre dans la FAQ. Le bouton de soutien est le
   seul element en jaune de la barre : c'est une action de don, pas l'action
   principale du site. */
export default function Nav({ page }: { page?: 'accueil' | 'wrapped' | 'guide' | 'faq' }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.in}>
        <Link className="logo" href="/">
          exp<span className="logo__o"><span className="sr-only">o</span></span>sed.
        </Link>
        <div className={styles.links}>
          <Link href="/" aria-current={page === 'accueil' ? 'page' : undefined}>Accueil</Link>
          <Link href="/wrapped/" aria-current={page === 'wrapped' ? 'page' : undefined}>Wrapped</Link>
          <Link href="/guide/" aria-current={page === 'guide' ? 'page' : undefined}>Guide</Link>
          <Link href="/faq/" aria-current={page === 'faq' ? 'page' : undefined}>FAQ</Link>
        </div>
        <a
          className={styles.support}
          href="https://buymeacoffee.com/arnvudl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span aria-hidden="true">☕</span> Buy me a coffee
        </a>
      </div>
    </nav>
  );
}
