import Link from 'next/link';
import styles from './Nav.module.css';

/* Trois onglets, cf. PRODUCT.md. Le bouton de soutien est le seul element
   cercle de la barre, en orange : c'est une action de don, pas l'action
   principale du site, elle ne prend donc pas le rouge. */
export default function Nav({ page }: { page?: 'accueil' | 'wrapped' | 'faq' }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.in}>
        <Link className="logo" href="/">
          exp<span className="logo__o"><span className="sr-only">o</span></span>sed.
        </Link>
        <div className={styles.links}>
          <Link href="/" aria-current={page === 'accueil' ? 'page' : undefined}>Accueil</Link>
          <Link href="/wrapped/" aria-current={page === 'wrapped' ? 'page' : undefined}>Wrapped</Link>
          <Link href="/faq/" aria-current={page === 'faq' ? 'page' : undefined}>FAQ</Link>
        </div>
        <Link className={styles.support} href="/faq/#soutenir">Soutenir</Link>
      </div>
    </nav>
  );
}
