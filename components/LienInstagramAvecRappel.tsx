'use client';

import { useEffect, useState } from 'react';
import RappelIcs from './RappelIcs';
import boutonStyles from './Bouton.module.css';
import s from './LienInstagramAvecRappel.module.css';

/** Le bouton qui ouvre le Centre de comptes Instagram dans un nouvel onglet
    (celui-ci reste en place, target _blank) : c'est le seul moment fiable
    pour proposer un rappel, juste avant l'attente de 48h — un popup au
    chargement de la page n'aurait aucune raison d'apparaitre a ce moment-la. */
export default function LienInstagramAvecRappel() {
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (!ouvert) return;
    function surEchap(e: KeyboardEvent) { if (e.key === 'Escape') setOuvert(false); }
    window.addEventListener('keydown', surEchap);
    return () => window.removeEventListener('keydown', surEchap);
  }, [ouvert]);

  return (
    <>
      <a
        href="https://accountscenter.instagram.com/info_and_permissions/dyi/"
        target="_blank"
        rel="noopener noreferrer"
        className={`${boutonStyles.btn} ${boutonStyles.signal}`}
        onClick={() => setOuvert(true)}
      >
        Ouvrir Instagram <span aria-hidden="true">&rsaquo;</span>
      </a>

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
