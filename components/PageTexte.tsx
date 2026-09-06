import Nav from '@/components/Nav';
import Pied from '@/components/Pied';
import styles from './PageTexte.module.css';

/* Le gabarit des pages qui se lisent de haut en bas (legales, notamment) :
   une tete comme la FAQ, puis des blocs titre + paragraphes. Pas de
   revelation au defilement, ces pages doivent etre lisibles d'un coup. */
export type Bloc = { titre: string; corps: React.ReactNode };

export default function PageTexte({
  kicker, titre, lede, blocs, majLe,
}: {
  kicker: string;
  titre: React.ReactNode;
  lede: string;
  blocs: Bloc[];
  /** Date de derniere mise a jour, affichee en bas. */
  majLe: string;
}) {
  return (
    <>
      <Nav />
      <main>
      <header className={`wrap ${styles.tete}`}>
        <p className="kicker">{kicker}</p>
        <h1 className="t-xl" style={{ marginTop: '1rem' }}>{titre}</h1>
        <p className={`lede ${styles.teteSub}`}>{lede}</p>
      </header>

      {blocs.map((b) => (
        <section key={b.titre} className={styles.bloc}>
          <div className="wrap">
            <h2 className="t-md">{b.titre}</h2>
            <div className={styles.corps}>{b.corps}</div>
          </div>
        </section>
      ))}

      <div className="wrap">
        <p className={styles.maj}>Dernière mise à jour : {majLe}</p>
      </div>
      </main>
      <Pied />
    </>
  );
}
