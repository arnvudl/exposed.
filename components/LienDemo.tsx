'use client';

import { useRouter } from 'next/navigation';
import { CLE_DEMO } from '@/lib/wrapped/demo';
import styles from './Bouton.module.css';

/** Meme rendu qu'un Bouton (ton papier), mais lance la demo sur /wrapped au
    lieu d'y attendre un fichier : depose la cle avant de naviguer, /wrapped
    la consomme des l'arrivee (voir app/wrapped/page.tsx). */
export default function LienDemo({ className = '' }: { className?: string }) {
  const router = useRouter();

  function lancer() {
    try {
      sessionStorage.setItem(CLE_DEMO, '1');
    } catch {
      // Navigation privee stricte : la demo ne se lancera pas toute seule,
      // mais /wrapped propose son propre bouton demo une fois arrive.
    }
    router.push('/wrapped/');
  }

  return (
    <button type="button" onClick={lancer} className={`${styles.btn} ${styles.paper} ${className}`}>
      Voir une démo <span aria-hidden="true">&rsaquo;</span>
    </button>
  );
}
