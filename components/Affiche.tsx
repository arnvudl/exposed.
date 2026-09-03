import styles from './Affiche.module.css';

/* Les huit formes du vocabulaire (cf. DESIGN.md). Elles tiennent toutes en un
   rectangle, un cercle, un arc ou une repetition : c'est le critere
   d'admission, parce que chaque affiche doit pouvoir etre redessinee dans un
   canvas au moment de l'export. */
export type NomDeForme =
  | 'barres' | 'disques' | 'stries' | 'arc'
  | 'cadre' | 'faisceau' | 'trame' | 'onglet';

/* Deux emplacements, et la difference est ce qui empeche une collision.

   `bande` : la forme vit dans la rangee libre entre le titre et le bas de
   l'affiche. Cette rangee est un `1fr` de la grille, donc elle grandit et
   retrecit avec le texte, et la forme est bornee par elle. Changer une phrase
   ne peut plus faire passer une forme sous un chiffre.

   `coin` : un accent pose en absolu sur l'affiche. Reserve au bord haut a
   droite et au bord bas a droite, les deux seules zones ou aucun texte ne va,
   puisque tout est aligne a gauche et court. */
export type Forme = {
  nom: NomDeForme;
  place?: 'bande' | 'coin';
  /** Largeur, en pourcentage. Depasser 100, ou decaler en negatif, fait
      deborder la forme du cadre, ce qui est demande sur au moins une. */
  w: number;
  /** `bande` : decalage horizontal. `coin` : position, avec `y`. */
  dx?: number;
  x?: number;
  y?: number;
  ton?: 'plein' | 'moyen' | 'faible';
};

export type DonneesAffiche = {
  piece: string;
  titre: string;
  chiffre?: string;
  /** Deux valeurs de meme poids, quand l'affiche porte une paire et non un
      record : un chiffre geant plus une phrase en petit obligeait a lire deux
      informations dans deux typographies differentes. */
  paire?: { k: string; v: string }[];
  note: string;
  /** Index de l'onglet de couleur, de 1 a 10. */
  ton: number;
  formes: Forme[];
};

function Dessin({ f }: { f: Forme }) {
  const coin = f.place === 'coin';
  const style = {
    width: `${f.w}%`,
    ...(coin
      ? { left: `${f.x}%`, top: `${f.y}%` }
      : { marginInlineStart: f.dx ? `${f.dx}%` : undefined }),
  } as React.CSSProperties;

  const classe = [
    styles.forme,
    coin ? styles.coin : styles.grande,
    styles[f.nom],
    styles[f.ton ?? 'plein'],
  ].join(' ');

  // Deux formes sont des piles d'elements, les autres sont un seul bloc.
  if (f.nom === 'barres' || f.nom === 'disques') {
    return <div className={classe} style={style}><i /><i /><i /></div>;
  }
  return <div className={classe} style={style} />;
}

export default function Affiche({
  a,
  className = '',
  incline = false,
}: {
  a: DonneesAffiche;
  className?: string;
  incline?: boolean;
}) {
  const bande = a.formes.filter((f) => f.place !== 'coin');
  const coins = a.formes.filter((f) => f.place === 'coin');

  return (
    <article
      className={`${styles.affiche} ${incline ? styles.incline : ''} ${className}`}
      style={{ '--tab': `var(--t${a.ton})` } as React.CSSProperties}
    >
      {coins.length > 0 && (
        <div className={styles.coins} aria-hidden="true">
          {coins.map((f, i) => <Dessin key={i} f={f} />)}
        </div>
      )}

      <div className={styles.corps}>
        <div>
          <p className={styles.piece}>{a.piece}</p>
          <h3 className={styles.titre}>{a.titre}</h3>
        </div>

        <div className={styles.bande} aria-hidden="true">
          {bande.map((f, i) => <Dessin key={i} f={f} />)}
        </div>

        <div className={styles.bas}>
          {a.paire && (
            <dl className={styles.paire}>
              {a.paire.map((e) => (
                <div key={e.k}>
                  <dt className={styles.paireK}>{e.k}</dt>
                  <dd className={styles.paireV}>{e.v}</dd>
                </div>
              ))}
            </dl>
          )}
          {a.chiffre && (
            // Un chiffre long (« Le Pilier », « 12 jan. ») ne tient pas a la
            // taille d'un nombre a deux chiffres. Deux tailles, pas d'ajustement
            // automatique, qui produirait des affiches toutes differentes.
            <p className={`${styles.chiffre} ${a.chiffre.length > 6 ? styles.chiffreLong : ''} num`}>
              {a.chiffre}
            </p>
          )}
          <p className={styles.note}>{a.note}</p>
          <p className={styles.marque}>exposed. / exemple</p>
        </div>
      </div>
    </article>
  );
}
