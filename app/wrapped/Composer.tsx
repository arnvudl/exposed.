'use client';

/* ============================================================
   COMPOSITEUR  /  personnaliser une carte puis la telecharger
   Voir docs/CARTES_PERSONNALISABLES.md §8. Suit le meme principe que la
   vue detail de StoryPlayer : un ecran plein cran qui suspend la story
   tant qu'il est ouvert, ferme proprement au clic sur ×.

   L'affiche occupe tout l'ecran (retour utilisateur : "l'apercu doit etre
   la carte en plein ecran"). Fond et Faits sont deux tiroirs qui glissent
   depuis les bords gauche/droit par-dessus, pas des colonnes qui se
   partagent l'espace avec elle : on les ouvre pour regler, on les referme
   pour regarder.
   ============================================================ */
import { useEffect, useMemo, useRef, useState } from 'react';
import { dessinerCarte, LARGEUR, HAUTEUR, MAX_FAITS } from '@/lib/partage/rendu';
import { THEMES, type IdTheme } from '@/lib/partage/themes';
import type { Fait } from '@/lib/partage/faits';
import { chargerPhoto } from '@/lib/partage/photo';
import s from './Composer.module.css';

function libelleFait(f: Fait): string {
  const titre = f.label.split('·').slice(1).join('·').trim();
  if (f.type === 'atomique') return `${titre} — ${f.chiffre}`;
  if (f.type === 'paire') return `${titre} — ${f.avec}`;
  return titre;
}
function clefFait(f: Fait): string { return `${f.label}|${f.type}`; }

type Tiroir = 'fond' | 'faits' | null;

export default function Composer({
  faits, faitInitial, onFermer,
}: {
  faits: Fait[];
  faitInitial?: Fait;
  onFermer: () => void;
}) {
  const [idTheme, setIdTheme] = useState<IdTheme>(THEMES[0].id);
  const [photo, setPhoto] = useState<ImageBitmap | null>(null);
  const [selection, setSelection] = useState<Fait[]>(faitInitial ? [faitInitial] : []);
  const [tiroir, setTiroir] = useState<Tiroir>(null);
  const ref = useRef<HTMLCanvasElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Un leger debounce : on ne redessine pas a chaque changement instantane
    // (plusieurs cases cochees rapidement), cf. §8 du doc.
    debounceRef.current = setTimeout(() => {
      const theme = THEMES.find((t) => t.id === idTheme) ?? THEMES[0];
      dessinerCarte(ctx, theme, selection, photo ?? undefined);
    }, 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [idTheme, photo, selection]);

  function basculerTiroir(nom: Exclude<Tiroir, null>) {
    setTiroir((t) => (t === nom ? null : nom));
  }

  function basculerFait(f: Fait) {
    setSelection((sel) => {
      if (sel.some((x) => clefFait(x) === clefFait(f))) return sel.filter((x) => clefFait(x) !== clefFait(f));
      if (sel.length >= MAX_FAITS) return sel;
      return [...sel, f];
    });
  }

  async function surImportPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setPhoto(await chargerPhoto(fichier));
  }

  function telecharger() {
    ref.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exposed.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  // Regroupe les faits par chapitre, dans l'ordre ou ils arrivent (celui
  // de l'analyse), pour que la liste se lise comme le reste du dossier.
  const parChapitre = useMemo(() => {
    const groupes = new Map<string, Fait[]>();
    for (const f of faits) {
      const cle = f.label.split('·')[0].trim();
      if (!groupes.has(cle)) groupes.set(cle, []);
      groupes.get(cle)!.push(f);
    }
    return [...groupes.entries()];
  }, [faits]);

  const themeActuel = THEMES.find((t) => t.id === idTheme)?.nom ?? '';

  return (
    <div className={s.scene}>
      <div className={s.tete}>
        <p className={s.titre}>Personnaliser</p>
        <button className={s.fermer} onClick={onFermer} aria-label="Fermer">&times;</button>
      </div>

      {/* Tout ce qui suit reste confine sous l'entete (position:relative sur
          .corps, position:absolute dessous) : les tiroirs glissent depuis
          les bords de CETTE zone, jamais par-dessus le titre ni le bouton
          fermer. */}
      <div className={s.corps}>
        <div className={s.zonePrincipale}>
          <canvas ref={ref} width={LARGEUR} height={HAUTEUR} className={s.canvas} />
        </div>

        <button
          className={s.telecharger}
          onClick={telecharger}
          disabled={selection.length === 0}
        >
          Télécharger
        </button>

        {/* Deux poignees, une par bord, avec l'etat actuel dessus : pas
            besoin d'ouvrir pour savoir quel theme ou combien de faits sont
            choisis. */}
        <button
          className={s.ongletGauche}
          onClick={() => basculerTiroir('fond')}
          aria-expanded={tiroir === 'fond'}
          aria-label="Régler le fond"
        >
          Fond<span className={s.ongletValeur}>{themeActuel}{photo ? ' + photo' : ''}</span>
        </button>
        <button
          className={s.ongletDroit}
          onClick={() => basculerTiroir('faits')}
          aria-expanded={tiroir === 'faits'}
          aria-label="Choisir les faits"
        >
          Faits<span className={s.ongletValeur}>{selection.length}/{MAX_FAITS}</span>
        </button>

        {tiroir && <div className={s.fondEcran} onClick={() => setTiroir(null)} aria-hidden="true" />}

        <div className={`${s.tiroir} ${s.tiroirGauche} ${tiroir === 'fond' ? s.tiroirOuvert : ''}`}>
          {/* Deux categories distinctes plutot qu'une seule liste de 6
              themes + un import de photo optionnel au milieu : soit un fond
              uni (aucune photo, jamais), soit un des themes pense pour
              accueillir une photo. Choisir "Le Dossier" efface une photo
              deja importee pour garantir un fond vraiment uni. */}
          <p className={s.tiroirTitre}>Fond seul</p>
          <div className={s.themes}>
            <button
              className={`${s.themeBouton} ${idTheme === THEMES[0].id ? s.themeActif : ''}`}
              onClick={() => { setIdTheme(THEMES[0].id); setPhoto(null); }}
            >
              {THEMES[0].nom}
            </button>
          </div>

          <p className={s.tiroirTitre} style={{ marginTop: '1.6rem' }}>Photo</p>
          <div className={s.themes}>
            {THEMES.slice(1).map((t) => (
              <button
                key={t.id}
                className={`${s.themeBouton} ${idTheme === t.id ? s.themeActif : ''}`}
                onClick={() => setIdTheme(t.id)}
              >
                {t.nom}
              </button>
            ))}
          </div>
          <label className={s.photoBouton}>
            {photo ? 'Changer la photo' : 'Importer une photo'}
            <input type="file" accept="image/*" onChange={surImportPhoto} className={s.inputCache} />
          </label>
          {photo && (
            <button className={s.photoRetirer} onClick={() => setPhoto(null)}>Retirer la photo</button>
          )}
        </div>

        <div className={`${s.tiroir} ${s.tiroirDroit} ${tiroir === 'faits' ? s.tiroirOuvert : ''}`}>
          <p className={s.tiroirTitre}>Faits · {selection.length}/{MAX_FAITS}</p>
          <div className={s.listeFaits}>
            {parChapitre.map(([chapitre, items]) => (
              <div key={chapitre} className={s.groupeChapitre}>
                <p className={s.chapitreLabel}>{chapitre}</p>
                {items.map((f) => {
                  const choisi = selection.some((x) => clefFait(x) === clefFait(f));
                  const desactive = !choisi && selection.length >= MAX_FAITS;
                  return (
                    <button
                      key={clefFait(f)}
                      className={`${s.faitBouton} ${choisi ? s.faitChoisi : ''}`}
                      disabled={desactive}
                      onClick={() => basculerFait(f)}
                    >
                      {libelleFait(f)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
