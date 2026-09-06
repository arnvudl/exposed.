'use client';

import { useEffect, useRef, useState } from 'react';
import Affiche, { type DonneesAffiche } from '@/components/Affiche';
import { Bouton } from '@/components/Bouton';
import s from './StoryPlayer.module.css';

const DUREE_MS = 6000;

export default function StoryPlayer({
  cartes,
  enCoursDeChargement,
  onFermer,
}: {
  cartes: DonneesAffiche[];
  enCoursDeChargement: boolean;
  onFermer: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [enPause, setEnPause] = useState(false);
  const [enAttente, setEnAttente] = useState(false);
  const [termine, setTermine] = useState(false);

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
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartes.length, enCoursDeChargement]);

  const HOLD_SEUIL_MS = 250;
  function surAppui() { downTsRef.current = Date.now(); setEnPause(true); }
  function surRelache(direction: 'avant' | 'arriere') {
    const duree = Date.now() - downTsRef.current;
    setEnPause(false);
    if (duree < HOLD_SEUIL_MS) { if (direction === 'avant') avancer(); else reculer(); }
  }

  if (termine) {
    return (
      <div className={s.scene}>
        <button className={s.fermer} onClick={onFermer} aria-label="Fermer">&times;</button>
        <div className={s.fin}>
          <p className={s.finTitre}>C’est tout.</p>
          <p className={s.finSub}>Tes {cartes.length} cartes, calculées dans ton navigateur, jamais envoyées nulle part.</p>
          <div className={s.finBouton}>
            <Bouton ton="paper" onClick={onFermer}>Recommencer avec un autre fichier</Bouton>
          </div>
        </div>
      </div>
    );
  }

  const carte = cartes[index];

  return (
    <div className={s.scene}>
      <div className={s.barres}>
        {cartes.map((_, i) => (
          <div key={i} className={`${s.segment} ${i < index ? s.segmentFait : ''}`}>
            {i === index && <div ref={(el) => { segmentRefs.current[i] = el; }} className={s.segmentRemplissage} />}
          </div>
        ))}
      </div>
      <p className={s.entete}>{carte.piece}</p>
      <button className={s.fermer} onClick={onFermer} aria-label="Fermer">&times;</button>

      {/* Les zones couvrent tout l'ecran, pas seulement la carte : sur
          desktop la carte est encadree de noir, et cet espace doit rester
          cliquable (exactement comme les stories, ou la zone de tap deborde
          largement le contenu visible). */}
      <div className={s.zones}>
        <div
          className={s.zoneGauche}
          onPointerDown={surAppui}
          onPointerUp={() => surRelache('arriere')}
          onPointerLeave={() => setEnPause(false)}
        />
        <div
          className={s.zoneDroite}
          onPointerDown={surAppui}
          onPointerUp={() => surRelache('avant')}
          onPointerLeave={() => setEnPause(false)}
        />
      </div>

      <div className={s.stage}>
        <Affiche a={carte} marque="exposed." />
        {enAttente && <div className={s.attente}>La suite arrive…</div>}
      </div>
    </div>
  );
}
