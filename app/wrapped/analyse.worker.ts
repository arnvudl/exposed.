/* Le calcul tourne ici, hors du thread principal : deposer un ZIP de
   plusieurs Go ne doit jamais figer la page. zip.js lit chaque fichier par
   petits acces cibles (voir lib/wrapped/zip.ts), jamais en chargeant
   l'archive entiere en memoire. */
import { analyser } from '@/lib/wrapped/analyser';

self.onmessage = async (e: MessageEvent<{ fichiers: File[] }>) => {
  await analyser(e.data.fichiers, (evenement) => {
    (self as unknown as Worker).postMessage(evenement);
  });
};
