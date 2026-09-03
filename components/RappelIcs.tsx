'use client';

import { Bouton } from './Bouton';
import { telechargerRappel } from '@/lib/ics';

export default function RappelIcs() {
  return (
    <Bouton ton="paper" onClick={() => telechargerRappel(24)}>
      Me le rappeler demain
    </Bouton>
  );
}
