'use client';

import { useEffect, useRef, useState } from 'react';
import s from '@/app/page.module.css';

type Profil = { nom: string; description: string };
type Style = React.CSSProperties;

export default function ListeProfils({ profils }: { profils: Profil[] }) {
  const [actif, setActif] = useState<number | null>(null);
  // Regroupement des 10 mots par rangee VISUELLE, mesure (pas devine) sur
  // une copie invisible identique : combien de mots tiennent par rangee
  // depend de la largeur d'ecran, jamais d'un compte fixe. La description
  // s'affiche comme un bloc normal juste apres la rangee active, entre deux
  // <div class=profilRow> distincts — plus fiable qu'un item
  // `flex-basis: 100%` insere au milieu d'une rangee flex, qui produisait un
  // vrai bug de mise en page (le mot suivant partait hors cadre) des que le
  // mot clique n'etait pas le dernier de sa rangee.
  const [rangees, setRangees] = useState<number[][]>([profils.map((_, i) => i)]);
  const refsMesure = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    function mesurer() {
      const tops = refsMesure.current.map((el) => el?.offsetTop ?? 0);
      const groupes: number[][] = [];
      for (let i = 0; i < tops.length; i++) {
        if (i === 0 || tops[i] !== tops[i - 1]) groupes.push([i]);
        else groupes[groupes.length - 1].push(i);
      }
      if (groupes.length > 0) setRangees(groupes);
    }
    mesurer();
    window.addEventListener('resize', mesurer);
    return () => window.removeEventListener('resize', mesurer);
  }, [profils]);

  return (
    <div
      className={`${s.typesFlow} reveal`}
      style={{ '--d': '140ms' } as Style}
      role="list"
      aria-label="Les dix profils relationnels"
    >
      {/* Copie de mesure : memes mots, meme police, mais invisible et hors
          du flux. Sert uniquement a savoir comment ils s'enroulent
          naturellement a la largeur actuelle, jamais affectee par la
          description (qui, elle, n'existe que dans la copie visible plus
          bas). */}
      <div className={s.profilRow} aria-hidden="true" style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}>
        {profils.map((p, i) => (
          <span
            key={p.nom}
            ref={(el) => { refsMesure.current[i] = el; }}
            className={s.profilItem}
          >
            {p.nom}
          </span>
        ))}
      </div>

      {rangees.map((rangee, ri) => (
        <div key={ri} className={s.profilLigne}>
          <div className={s.profilRow} role="presentation">
            {rangee.map((i) => (
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
          {actif !== null && rangee.includes(actif) && (
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
