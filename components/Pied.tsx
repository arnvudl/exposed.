import Link from 'next/link';
import styles from './Pied.module.css';

/* L'emplacement publicitaire natif ne vit que sur l'accueil et la FAQ. Jamais
   sur la page qui lit les messages : aucun script tiers n'y est charge. */
export default function Pied({ pub = false }: { pub?: boolean }) {
  return (
    <footer className={styles.foot}>
      <div className="wrap">
        {pub && (
          <div className={styles.adslot}>
            Emplacement publicitaire natif. Accueil uniquement, jamais sur la page d’analyse.
          </div>
        )}

        <div className={styles.grid}>
          <div>
            <Link className="logo" href="/" aria-label="Exposed, accueil">
              exp<span className="logo__o" aria-hidden="true" />sed.
            </Link>
            <p className={styles.baseline}>You might see some things. We show them.</p>
          </div>
          <div>
            <h4>Produit</h4>
            <ul>
              <li><Link href="/#chemin">Wrapped</Link></li>
              <li><Link href="/faq/">FAQ</Link></li>
              <li><Link href="/guide/">Guide d’export</Link></li>
            </ul>
          </div>
          <div>
            <h4>Les profils</h4>
            <ul>
              <li><Link href="/#profils">Les dix profils</Link></li>
              <li><Link href="/faq/#soutenir">Soutenir</Link></li>
            </ul>
          </div>
          <div>
            <h4>Légal</h4>
            <ul>
              <li><Link href="/confidentialite/">Confidentialité</Link></li>
              <li><Link href="/mentions-legales/">Mentions légales</Link></li>
              <li><Link href="/cgu/">CGU</Link></li>
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
