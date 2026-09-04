'use client';

import { useState } from 'react';
import s from '@/app/page.module.css';

type Profil = { nom: string; description: string };
type Style = React.CSSProperties;

const lignes = [[0, 1, 2], [3, 4, 5], [6, 7, 8, 9]];

export default function ListeProfils({ profils }: { profils: Profil[] }) {
  const [actif, setActif] = useState<number | null>(null);

  return (
    <div
      className={`${s.typesFlow} reveal`}
      style={{ '--d': '140ms' } as Style}
      role="list"
      aria-label="Les dix profils relationnels"
    >
      {lignes.map((ligne, li) => (
        <div key={li} className={s.profilLigne}>
          <div className={s.profilRow} role="presentation">
            {ligne.map((i) => (
              <span
                key={profils[i].nom}
                role="listitem"
                className={`${s.profilItem} ${actif === i ? s.profilActif : ''}`}
                style={{ '--tab': `var(--t${i + 1})` } as Style}
                onClick={() => setActif(actif === i ? null : i)}
              >
                {profils[i].nom}
              </span>
            ))}
          </div>
          {actif !== null && ligne.includes(actif) && (
            <p
              className={s.profilDesc}
              style={{ '--tab': `var(--t${actif + 1})` } as Style}
              aria-live="polite"
            >
              {profils[actif].description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
