/* Le calcul tourne ici, hors du thread principal : deposer un ZIP de
   plusieurs centaines de Mo ne doit jamais figer la page.

   Les fichiers sont lus en ArrayBuffer AVANT d'arriver ici (voir page.tsx),
   pas passes comme des `File` bruts : Chrome peut perdre la reference au
   fichier entre la selection et sa lecture dans le Worker (« The requested
   file could not be read... »), surtout pour les gros fichiers ou les
   fichiers OneDrive/Drive pas encore telecharges localement. Lire tot, sur
   le thread principal, evite le probleme au lieu de le contourner. */
import { analyser } from '@/lib/wrapped/analyser';
import type { ZipEnMemoire } from '@/lib/wrapped/zip';

self.onmessage = async (e: MessageEvent<{ zips: ZipEnMemoire[] }>) => {
  await analyser(e.data.zips, (evenement) => {
    (self as unknown as Worker).postMessage(evenement);
  });
};
