import styles from './Affiche.module.css';

/* Les huit formes du vocabulaire (cf. DESIGN.md). Elles tiennent toutes en un
   rectangle, un cercle, un arc ou une repetition : c'est le critere
   d'admission, parce que chaque affiche doit pouvoir etre redessinee dans un
   canvas au moment de l'export. */
export type NomDeForme =
  | 'barres' | 'disques' | 'stries' | 'arc'
  | 'cadre' | 'faisceau' | 'trame' | 'onglet';

export type Forme = {
  nom: NomDeForme;
  /** Position et largeur en pourcentage de l'affiche. Depasser 100 fait
      deborder la forme, ce qui est demande sur au moins une par affiche. */
  x: number;
  y: number;
  w: number;
  ton?: 'plein' | 'moyen' | 'faible';
  rot?: number;
};

export type DonneesAffiche = {
  piece: string;
  titre: string;
  chiffre?: string;
  note: string;
  /** Index de l'onglet de couleur, de 1 a 10. */
  ton: number;
  formes: Forme[];
};

function Dessin({ f }: { f: Forme }) {
  const style = {
    left: `${f.x}%`,
    top: `${f.y}%`,
    width: `${f.w}%`,
    transform: f.rot ? `rotate(${f.rot}deg)` : undefined,
  } as React.CSSProperties;

  const classe = `${styles.forme} ${styles[f.nom]} ${styles[f.ton ?? 'plein']}`;

  // Trois formes sont des piles d'elements, les autres sont un seul bloc.
  if (f.nom === 'barres') {
    return (
      <div className={classe} style={style}>
        <i /><i /><i />
      </div>
    );
  }
  if (f.nom === 'disques') {
    return (
      <div className={classe} style={style}>
        <i /><i /><i />
      </div>
    );
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
  return (
    <article
      className={`${styles.affiche} ${incline ? styles.incline : ''} ${className}`}
      style={{ '--tab': `var(--t${a.ton})` } as React.CSSProperties}
    >
      <div className={styles.formes} aria-hidden="true">
        {a.formes.map((f, i) => <Dessin key={i} f={f} />)}
      </div>

      <div className={styles.corps}>
        <p className={styles.piece}>{a.piece}</p>
        <h3 className={styles.titre}>{a.titre}</h3>
        <div className={styles.bas}>
          {a.chiffre && (
            // Un chiffre long (« Le Pilier », « 12 jan. ») ne tient pas a la
            // taille d'un nombre a deux chiffres. Deux tailles, pas d'ajustement
            // automatique, qui produirait des affiches toutes differentes.
            <p className={`${styles.chiffre} ${a.chiffre.length > 6 ? styles.chiffreLong : ''} num`}>
              {a.chiffre}
            </p>
          )}
          <p className={styles.note}>{a.note}</p>
        </div>
        <p className={styles.marque}>exposed. / exemple</p>
      </div>
    </article>
  );
}
