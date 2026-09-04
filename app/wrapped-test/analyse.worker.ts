/* Le calcul tourne ici, hors du thread principal : deposer un ZIP de
   plusieurs centaines de Mo ne doit jamais figer la page. */
import { analyser } from '@/lib/wrapped/analyser';

self.onmessage = async (e: MessageEvent<{ fichiers: File[] }>) => {
  await analyser(e.data.fichiers, (evenement) => {
    (self as unknown as Worker).postMessage(evenement);
  });
};
