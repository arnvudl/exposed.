'use client';

import { useEffect, useRef, useState } from 'react';
import RappelIcs from './RappelIcs';
import s from './RappelSurScroll.module.css';

/** Un marqueur invisible + une modale : quand le marqueur entre dans le
    viewport (place juste avant le dernier bloc de la page), l'utilisateur
    a lu tout le guide et arrive au bout -- le bon moment pour proposer un
    rappel, plutot qu'un clic precis sur un bouton qu'il n'a peut-etre pas
    encore vu. Ne se declenche qu'une fois par visite. */
export default function RappelSurScroll() {
  const [ouvert, setOuvert] = useState(false);
  const dejaMontreRef = useRef(false);
  const marqueurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marqueur = marqueurRef.current;
    if (!marqueur) return;
    // threshold: 0 (pas .3) : un <div> vide a une hauteur nulle, son ratio
    // d'intersection ne peut jamais atteindre 30% de lui-meme -- il ne se
    // declenchait jamais. threshold 0 se contente d'un seul pixel visible.
    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting && !dejaMontreRef.current) {
          dejaMontreRef.current = true;
          setOuvert(true);
        }
      },
      { threshold: 0 },
    );
    observateur.observe(marqueur);
    return () => observateur.disconnect();
  }, []);

  useEffect(() => {
    if (!ouvert) return;
    function surEchap(e: KeyboardEvent) { if (e.key === 'Escape') setOuvert(false); }
    window.addEventListener('keydown', surEchap);
    return () => window.removeEventListener('keydown', surEchap);
  }, [ouvert]);

  return (
    <>
      <div ref={marqueurRef} aria-hidden="true" className={s.marqueur} />

      {ouvert && (
        <div className={s.fond} role="dialog" aria-modal="true" aria-label="Rappel" onClick={() => setOuvert(false)}>
          <div className={s.boite} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={s.fermer} onClick={() => setOuvert(false)} aria-label="Fermer">
              &times;
            </button>
            <p className={s.titre}>On ne va pas se revoir avant un moment.</p>
            <p className={s.texte}>
              Instagram peut prendre jusqu’à 48 heures. Programme un rappel maintenant,
              plutôt que de compter sur une notification que tu vas rater.
            </p>
            <div className={s.cta}>
              <RappelIcs />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
