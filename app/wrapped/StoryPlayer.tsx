'use client';

import { useEffect, useRef, useState } from 'react';
import Affiche, { type DonneesAffiche } from '@/components/Affiche';
import { Bouton } from '@/components/Bouton';
import type { Fait } from '@/lib/partage/faits';
import type { DonneesDevine } from '@/lib/wrapped/jeu';
import Composer from './Composer';
import s from './StoryPlayer.module.css';

const DUREE_MS = 6000;
// Le temps laisse pour voir le bon/mauvais choix en couleur avant que la
// carte reelle n'apparaisse -- assez long pour lire, pas assez pour lasser.
const DUREE_FEEDBACK_MS = 1200;

type Pointage = { bonnes: number; total: number; serie: number; meilleureSerie: number };
const POINTAGE_VIDE: Pointage = { bonnes: 0, total: 0, serie: 0, meilleureSerie: 0 };

export default function StoryPlayer({
  cartes,
  details,
  detailsTexte,
  faits,
  devines,
  enCoursDeChargement,
  onFermer,
}: {
  cartes: DonneesAffiche[];
  /** Donnees completes derriere certaines cartes (cf. `DonneesAffiche.id`),
      montrees hors du defilement : une liste de 118 comptes n'a pas sa
      place dans une story qui avance toute seule. */
  details: Record<string, string[]>;
  /** Meme esprit que `details`, pour un texte long (prose) plutot qu'une
      liste d'elements courts -- le "plus long message" du chapitre 05.
      Deux maps separees plutot qu'une union dans une seule : le rendu
      (grille de pseudos vs. paragraphe qui coule) differe completement. */
  detailsTexte: Record<string, string>;
  /** Bibliotheque de faits pour le compositeur de partage (voir
      docs/CARTES_PERSONNALISABLES.md), independante des cartes affichees. */
  faits: Fait[];
  /** Devinettes a poser juste avant certaines cartes, indexees par position
      dans `cartes` (voir lib/wrapped/jeu.ts). */
  devines: Record<number, DonneesDevine>;
  enCoursDeChargement: boolean;
  onFermer: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [pauseManuelle, setPauseManuelle] = useState(false);
  const [enAppui, setEnAppui] = useState(false);
  const [enAttente, setEnAttente] = useState(false);
  const [termine, setTermine] = useState(false);
  const [vueDetail, setVueDetail] = useState<string | null>(null);
  const [compositeurOuvert, setCompositeurOuvert] = useState(false);
  // Les devinettes deja repondues : une fois dans cet ensemble, l'index ne
  // repose plus la question (utile si on revient en arriere avec la fleche).
  const [repondues, setRepondues] = useState<Set<number>>(new Set());
  // Le choix qui vient d'etre fait, le temps du feedback colore avant que la
  // vraie carte n'apparaisse. `null` = pas de reponse en attente d'affichage.
  const [choixFait, setChoixFait] = useState<number | null>(null);
  const [pointage, setPointage] = useState<Pointage>(POINTAGE_VIDE);
  // La devinette a poser pour la carte courante, si elle existe et n'a pas
  // deja ete repondue : tant qu'elle est vraie, la carte qu'elle precede
  // reste cachee et l'avance automatique est suspendue.
  const devineActuelle = devines[index] && !repondues.has(index) ? devines[index] : null;
  // Cinq raisons distinctes de retenir la story, qui ne s'annulent pas entre
  // elles : une pause posee au bouton survit a un tap pour changer de carte,
  // et une devinette non repondue bloque l'avance comme le compositeur.
  const enPause = pauseManuelle || enAppui || vueDetail !== null || compositeurOuvert || !!devineActuelle;

  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animRef = useRef<Animation | null>(null);
  const downTsRef = useRef(0);
  // Miroir de `devineActuelle` toujours a jour, pour la fonction `avancer`
  // capturee par la fermeture du clavier (effet a dependances volontairement
  // reduites plus bas) : sans ca, la fleche droite pourrait sauter une
  // devinette posee apres que le clavier ait ete branche.
  const devineActuelleRef = useRef<DonneesDevine | null>(null);
  devineActuelleRef.current = devineActuelle;

  function avancer() {
    if (devineActuelleRef.current) return;
    setIndex((i) => {
      if (i + 1 < cartes.length) { setEnAttente(false); return i + 1; }
      if (enCoursDeChargement) { setEnAttente(true); return i; }
      setTermine(true);
      return i;
    });
  }

  // Enregistre le choix, met a jour le pointage, puis laisse le temps de
  // voir la couleur avant de reveler la vraie carte (marquer la devinette
  // comme repondue la fait disparaitre).
  function repondre(i: number) {
    if (!devineActuelle || choixFait !== null) return;
    const optionChoisie = devineActuelle.options[i];
    setChoixFait(i);
    setPointage((p) => {
      const serie = optionChoisie.correcte ? p.serie + 1 : 0;
      return {
        bonnes: p.bonnes + (optionChoisie.correcte ? 1 : 0),
        total: p.total + 1,
        serie,
        meilleureSerie: Math.max(p.meilleureSerie, serie),
      };
    });
    const indexRepondu = index;
    setTimeout(() => {
      setChoixFait(null);
      setRepondues((r) => new Set(r).add(indexRepondu));
    }, DUREE_FEEDBACK_MS);
  }
  function reculer() {
    setIndex((i) => Math.max(0, i - 1));
  }

  // Une carte de plus vient d'arriver pendant qu'on l'attendait : on avance
  // tout de suite au lieu de laisser la barre pleine sans rien faire.
  useEffect(() => {
    if (enAttente && index + 1 < cartes.length) {
      setEnAttente(false);
      setIndex((i) => i + 1);
    }
  }, [cartes.length, enAttente, index]);

  // L'avance automatique de la carte active. Suspendue pendant l'attente
  // d'une carte pas encore calculee, et annulee/relancee a chaque carte.
  useEffect(() => {
    if (termine || enAttente) return;
    const el = segmentRefs.current[index];
    if (!el) return;
    el.style.width = '0%';
    const anim = el.animate([{ width: '0%' }, { width: '100%' }], { duration: DUREE_MS, easing: 'linear', fill: 'forwards' });
    animRef.current = anim;
    if (enPause) anim.pause();
    let annule = false;
    anim.onfinish = () => { if (!annule) avancer(); };
    return () => { annule = true; anim.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, enAttente, termine]);

  useEffect(() => {
    if (enPause) animRef.current?.pause(); else animRef.current?.play();
  }, [enPause]);

  // Clavier : fleches pour naviguer, Echap pour sortir. Le tactile passe par
  // les zones de tap ; le clavier sert la souris et l'accessibilite.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') avancer();
      else if (e.key === 'ArrowLeft') reculer();
      else if (e.key === 'Escape') onFermer();
      else if (e.key === ' ') { e.preventDefault(); setPauseManuelle((p) => !p); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartes.length, enCoursDeChargement]);

  const HOLD_SEUIL_MS = 250;
  function surAppui() { downTsRef.current = Date.now(); setEnAppui(true); }
  function surRelache(direction: 'avant' | 'arriere') {
    const duree = Date.now() - downTsRef.current;
    setEnAppui(false);
    if (duree < HOLD_SEUIL_MS) { if (direction === 'avant') avancer(); else reculer(); }
  }

  // La liste complete se lit a son rythme, jamais en tapant sur un
  // defilement automatique : la story est retenue tant qu'elle est ouverte.
  function ouvrirDetail(id: string) { setVueDetail(id); }
  function fermerDetail() { setVueDetail(null); }

  // Telechargement local pur (Blob + <a download>), aucun appel reseau :
  // meme promesse "rien ne sort de ton appareil" que le reste du site, ce
  // fichier va juste du navigateur vers le disque de l'utilisateur.
  function exporterDetail(id: string, comptes: string[]) {
    const contenu = comptes.map((c) => `@${c}`).join('\n');
    const blob = new Blob([contenu], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exposed-${id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (termine) {
    return (
      <div className={s.scene}>
        <div className={s.finFermer}>
          <button className={s.fermer} onClick={onFermer} aria-label="Fermer">&times;</button>
        </div>
        <div className={s.corps}>
          <div className={s.fin}>
            <p className={s.finTitre}>C’est tout.</p>
            <p className={s.finSub}>Tes {cartes.length} cartes, calculées dans ton navigateur, jamais envoyées nulle part.</p>
            {pointage.total > 0 && (
              <p className={s.finJeu}>
                {pointage.bonnes}/{pointage.total} bonnes réponses aux devinettes, meilleure série : {pointage.meilleureSerie}.
              </p>
            )}
            <div className={s.finBouton}>
              <Bouton ton="paper" onClick={onFermer} className={s.finBoutonTexte}>Recommencer avec un autre fichier</Bouton>
            </div>
            <div className={s.finBmc}>
              <p className={s.finBmcMsg}>J’espère que t’as aimé le site.</p>
              <a
                className={s.finBmcBtn}
                href="https://buymeacoffee.com/arnvudl"
                target="_blank"
                rel="noopener noreferrer"
              >
                ☕ Buy me a coffee
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const carte = cartes[index];
  // Rapproche la carte affichee d'un fait du meme chapitre (meme prefixe
  // « Chapitre NN ») pour pre-cocher quelque chose de pertinent a
  // l'ouverture du compositeur ; aucune correspondance exacte n'est
  // garantie (une carte peut ne pas avoir d'equivalent en fait), et c'est
  // sans consequence : l'utilisateur choisit lui-meme ensuite.
  const prefixeCarte = carte.piece.split('·')[0].trim();
  const faitInitial = faits.find((f) => f.label.split('·')[0].trim() === prefixeCarte);

  return (
    <div className={s.scene} style={{ '--lueur': `var(--t${carte.ton})` } as React.CSSProperties}>
      {/* Un vrai bandeau, dans le flux normal : les barres/entete/controles
          reservent leur propre hauteur au lieu d'etre poses en absolu
          par-dessus la carte, ce qui pouvait les faire chevaucher son coin
          haut droit (voir docs, bug rapporte sur iPhone). */}
      <div className={s.header}>
        <div className={s.barres}>
          {cartes.map((_, i) => (
            <div key={i} className={`${s.segment} ${i < index ? s.segmentFait : ''}`}>
              {i === index && <div ref={(el) => { segmentRefs.current[i] = el; }} className={s.segmentRemplissage} />}
            </div>
          ))}
        </div>
        <div className={s.headerLigne}>
          <p className={s.entete}>{carte.piece}</p>
          <div className={s.controles}>
            <button
              className={s.pause}
              onClick={() => setPauseManuelle((p) => !p)}
              aria-label={pauseManuelle ? 'Reprendre' : 'Mettre en pause'}
            >
              {pauseManuelle ? '▶' : '❚❚'}
            </button>
            {/* Pas de partage tant que la devinette n'est pas repondue : rien
                de la vraie carte n'est encore revele. */}
            {faits.length > 0 && !devineActuelle && (
              <button
                className={s.partager}
                onClick={() => setCompositeurOuvert(true)}
                aria-label="Personnaliser et partager cette carte"
              >
                Partager
              </button>
            )}
            <button className={s.fermer} onClick={onFermer} aria-label="Fermer">&times;</button>
          </div>
        </div>
      </div>

      {!devineActuelle && carte.alerte && (
        // Dans le flux normal, entre le bandeau et la carte -- jamais DANS
        // la carte : celle-ci est en `overflow: hidden` a hauteur fixe, et
        // ce texte doit rester lisible meme quand la carte affiche deja une
        // liste de dix lignes qui remplit tout l'espace disponible. Meme
        // grammaire que .alerte du guide (span rouge en tete de phrase,
        // reste en encre normale) : pas d'encadre, le site n'en a nulle
        // part ailleurs pour un avertissement.
        <p className={s.alerte} role="alert">
          <span className={s.alerteFort}>Chiffre incomplet.</span> {carte.alerte}
        </p>
      )}

      {compositeurOuvert && (
        <Composer faits={faits} faitInitial={faitInitial} onFermer={() => setCompositeurOuvert(false)} />
      )}

      <div className={s.corps}>
        {/* Les zones couvrent tout le corps, pas seulement la carte : sur
            desktop la carte est encadree de noir, et cet espace doit rester
            cliquable (exactement comme les stories, ou la zone de tap deborde
            largement le contenu visible). Absentes pendant une devinette : on
            repond en touchant un choix, pas en tapant pour avancer. */}
        {!devineActuelle && (
          <div className={s.zones}>
            <div
              className={s.zoneGauche}
              onPointerDown={surAppui}
              onPointerUp={() => surRelache('arriere')}
              onPointerLeave={() => setEnAppui(false)}
            />
            <div
              className={s.zoneDroite}
              onPointerDown={surAppui}
              onPointerUp={() => surRelache('avant')}
              onPointerLeave={() => setEnAppui(false)}
            />
          </div>
        )}

        <div className={s.stage}>
          {devineActuelle ? (
            <div className={s.devine}>
              <p className={s.devineQuestion}>{devineActuelle.question}</p>
              <div className={s.devineOptions}>
                {devineActuelle.options.map((o, i) => {
                  const revele = choixFait !== null;
                  const classe = !revele ? '' : o.correcte ? s.devineCorrecte
                    : i === choixFait ? s.devineRatee : s.devineEstompee;
                  return (
                    <button
                      key={o.texte}
                      type="button"
                      className={`${s.devineOption} ${classe}`}
                      onClick={() => repondre(i)}
                      disabled={revele}
                    >
                      {o.texte}
                    </button>
                  );
                })}
              </div>
              {pointage.serie >= 2 && choixFait === null && (
                <p className={s.devineSerie}>{pointage.serie} bonnes réponses d’affilée.</p>
              )}
            </div>
          ) : (
            <>
              <Affiche a={carte} marque="exposed." />
              {enAttente && <div className={s.attente}>La suite arrive…</div>}
            </>
          )}
        </div>

        {!devineActuelle && carte.id && details[carte.id] && (
          <button className={s.voirTout} onClick={() => ouvrirDetail(carte.id!)}>
            Voir les {details[carte.id].length} comptes en entier
          </button>
        )}
        {!devineActuelle && carte.id && !details[carte.id] && detailsTexte[carte.id] && (
          <button className={s.voirTout} onClick={() => ouvrirDetail(carte.id!)}>
            Voir le message en entier
          </button>
        )}
      </div>

      {vueDetail && details[vueDetail] && (
        <div className={s.detail}>
          <div className={s.detailTete}>
            <p className={s.detailTitre}>{carte.titre} · {details[vueDetail].length}</p>
            <div className={s.detailActions}>
              <button className={s.partager} onClick={() => exporterDetail(vueDetail, details[vueDetail])}>
                Exporter
              </button>
              <button className={s.fermer} onClick={fermerDetail} aria-label="Fermer la liste">&times;</button>
            </div>
          </div>
          <ul className={s.detailListe}>
            {details[vueDetail].map((compte) => <li key={compte}>@{compte}</li>)}
          </ul>
        </div>
      )}

      {vueDetail && !details[vueDetail] && detailsTexte[vueDetail] && (
        <div className={s.detail}>
          <div className={s.detailTete}>
            <p className={s.detailTitre}>{carte.titre}</p>
            <div className={s.detailActions}>
              <button className={s.fermer} onClick={fermerDetail} aria-label="Fermer le message">&times;</button>
            </div>
          </div>
          <p className={s.detailTexte}>{detailsTexte[vueDetail]}</p>
        </div>
      )}
    </div>
  );
}
