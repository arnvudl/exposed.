import Link from 'next/link';
import styles from './Pied.module.css';

export default function Pied() {
  return (
    <footer className={styles.foot}>
      <div className="wrap">
        <div className={styles.grid}>
          <div>
            <Link className="logo" href="/">
              exp<span className="logo__o"><span className="sr-only">o</span></span>sed.
            </Link>
            <p className={styles.baseline}>You might see some things. We show them.</p>
          </div>
          <div>
            <p className={styles.colonne}>Produit</p>
            <ul>
              <li><Link href="/wrapped/">Wrapped</Link></li>
              <li><Link href="/faq/">FAQ</Link></li>
              <li><Link href="/guide/">Guide d’export</Link></li>
            </ul>
          </div>
          <div>
            <p className={styles.colonne}>Les profils</p>
            <ul>
              <li><Link href="/#profils">Les dix profils</Link></li>
              <li>
                <a href="https://buymeacoffee.com/arnvudl" target="_blank" rel="noopener noreferrer">
                  Soutenir
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className={styles.colonne}>Légal</p>
            <ul>
              <li><Link href="/confidentialite/">Confidentialité</Link></li>
              <li><Link href="/mentions-legales/">Mentions légales</Link></li>
              <li><Link href="/cgu/">CGU</Link></li>
              <li><a href="mailto:arnaudleroy20@gmail.com">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.legal}>
          <span>Exposed n’est pas affilié à Instagram ni à Meta.</span>
          <span>Instagram est une marque de Meta Platforms, Inc.</span>
        </div>
      </div>
    </footer>
  );
}
