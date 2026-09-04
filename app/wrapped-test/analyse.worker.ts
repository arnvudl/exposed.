/* Le calcul tourne ici, hors du thread principal : deposer un ZIP de
   plusieurs Go ne doit jamais figer la page.

   Les `File` sont passes tels quels (structuredClone les garde utilisables,
   sans copier les octets). zip.js les lit ensuite par petits acces cibles
   via `Blob.slice()`, jamais en chargeant tout le ZIP en un bloc memoire :
   voir lib/wrapped/zip.ts pour pourquoi c'etait la vraie cause de
   « The requested file could not be read... » sur les gros exports. */
import { analyser } from '@/lib/wrapped/analyser';

self.onmessage = async (e: MessageEvent<{ fichiers: File[] }>) => {
  await analyser(e.data.fichiers, (evenement) => {
    (self as unknown as Worker).postMessage(evenement);
  });
};
