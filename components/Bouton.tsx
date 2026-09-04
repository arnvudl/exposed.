import Link from 'next/link';
import styles from './Bouton.module.css';

/* Un bloc plein, en display gras, jamais une boite a bord fin. Deux variantes,
   et un seul bouton par ecran (cf. DESIGN.md). Le chevron avance au survol :
   c'est la seule micro-interaction du composant. */
type Commun = { children: React.ReactNode; ton?: 'signal' | 'paper'; className?: string };

export function BoutonLien({
  href, children, ton = 'signal', className = '', target,
}: Commun & { href: string; target?: string }) {
  // Un lien externe s'ouvre dans un onglet neuf pour ne pas quitter le guide,
  // avec `rel` de securite. Les liens internes gardent le comportement Next.
  const externe = target === '_blank';
  return (
    <Link
      href={href}
      target={target}
      rel={externe ? 'noopener noreferrer' : undefined}
      className={`${styles.btn} ${styles[ton]} ${className}`}
    >
      {children} <span aria-hidden="true">&rsaquo;</span>
    </Link>
  );
}

export function Bouton({
  children, ton = 'signal', className = '', onClick, type = 'button',
}: Commun & { onClick?: () => void; type?: 'button' | 'submit' }) {
  return (
    <button type={type} onClick={onClick} className={`${styles.btn} ${styles[ton]} ${className}`}>
      {children} <span aria-hidden="true">&rsaquo;</span>
    </button>
  );
}
