'use client';

import { useEffect, useRef, useState } from 'react';
import Affiche, { type DonneesAffiche } from '@/components/Affiche';
import { Bouton } from '@/components/Bouton';
import type { Fait } from '@/lib/partage/faits';
import Composer from './Composer';
import s from './StoryPlayer.module.css';

const DUREE_MS = 6000;

export default function StoryPlayer({
  cartes,
  details,
  faits,
  enCoursDeChargement,
  onFermer,
}: {
  cartes: DonneesAffiche[];
  /** Donnees completes derriere certaines cartes (cf. `DonneesAffiche.id`),
      montrees hors du defilement : une liste de 118 comptes n'a pas sa
      place dans une story qui avance toute seule. */
  details: Record<string, string[]>;
  /** Bibliotheque de faits pour le compositeur de partage (voir
      docs/CARTES_PERSONNALISABLES.md), independante des cartes affichees. */
  faits: Fait[];
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
  // Quatre raisons distinctes de retenir la story, qui ne s'annulent pas
  // entre elles : une pause posee au bouton survit a un tap pour changer de
  // carte, et le compositeur suspend tout tant qu'il est ouvert.
  const enPause = pauseManuelle || enAppui || vueDetail !== null || compositeurOuvert;

  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animRef = useRef<Animation | null>(null);
  const downTsRef = useRef(0);

  function avancer() {
    setIndex((i) => {
      if (i + 1 < cartes.length) { setEnAttente(false); return i + 1; }
      if (enCoursDeChargement) { setEnAttente(true); return i; }
      setTermine(true);
      return i;
    });
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
    <div className={s.scene}>
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
            {faits.length > 0 && (
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

      {compositeurOuvert && (
        <Composer faits={faits} faitInitial={faitInitial} onFermer={() => setCompositeurOuvert(false)} />
      )}

      <div className={s.corps}>
        {/* Les zones couvrent tout le corps, pas seulement la carte : sur
            desktop la carte est encadree de noir, et cet espace doit rester
            cliquable (exactement comme les stories, ou la zone de tap deborde
            largement le contenu visible). */}
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

        <div className={s.stage}>
          <Affiche a={carte} marque="exposed." />
          {enAttente && <div className={s.attente}>La suite arrive…</div>}
        </div>

        {carte.id && details[carte.id] && (
          <button className={s.voirTout} onClick={() => ouvrirDetail(carte.id!)}>
            Voir les {details[carte.id].length} comptes en entier
          </button>
        )}
      </div>

      {vueDetail && details[vueDetail] && (
        <div className={s.detail}>
          <div className={s.detailTete}>
            <p className={s.detailTitre}>{carte.titre} · {details[vueDetail].length}</p>
            <button className={s.fermer} onClick={fermerDetail} aria-label="Fermer la liste">&times;</button>
          </div>
          <ul className={s.detailListe}>
            {details[vueDetail].map((compte) => <li key={compte}>@{compte}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
