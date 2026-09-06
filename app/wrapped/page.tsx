'use client';

import { useEffect, useRef, useState } from 'react';
import Nav from '@/components/Nav';
import Pied from '@/components/Pied';
import type { DonneesAffiche } from '@/components/Affiche';
import type { EvenementAnalyse } from '@/lib/wrapped/analyser';
import {
  mapChapitre01, mapChapitre02, mapChapitre03, mapChapitre04,
  mapChapitre05, mapChapitre06, mapChapitre07,
} from '@/lib/wrapped/mapper';
import StoryPlayer from './StoryPlayer';
import s from './wrapped.module.css';

const LABELS_ETAPE: Record<string, string> = {
  lecture_zip: 'Lecture de tes fichiers…',
  reconstruction: 'Reconstruction de tes conversations…',
};
const LABELS_CHAPITRE: Record<number, string> = {
  1: 'Ton cercle réel…', 2: 'Tes groupes…', 3: 'Qui ne te suit pas en retour…',
  4: 'Tes mots…', 5: 'Tes records…', 6: 'Premier et dernier…', 7: 'Ton profil…',
};

export default function Wrapped() {
  const [statut, setStatut] = useState<'attente' | 'chargement' | 'fini' | 'erreur'>('attente');
  const [labelEtape, setLabelEtape] = useState('');
  const [cartes, setCartes] = useState<DonneesAffiche[]>([]);
  // Donnees completes derriere une carte precise (ex. la liste entiere des
  // comptes qui ne suivent pas en retour), affichees hors du defilement de
  // la story : voir StoryPlayer, prop `details`.
  const [details, setDetails] = useState<Record<string, string[]>>({});
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [dragActif, setDragActif] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const queueRef = useRef<EvenementAnalyse[]>([]);
  const consommeRef = useRef(false);

  useEffect(() => () => workerRef.current?.terminate(), []);

  function appliquer(evt: EvenementAnalyse) {
    if (evt.type === 'etape') {
      setLabelEtape(LABELS_ETAPE[evt.etape] ?? '');
    } else if (evt.type === 'chapitre') {
      setLabelEtape(LABELS_CHAPITRE[evt.numero] ?? '');
      const nouvelles =
        evt.numero === 1 ? mapChapitre01(evt.donnees) :
        evt.numero === 2 ? mapChapitre02(evt.donnees) :
        evt.numero === 3 ? mapChapitre03(evt.donnees) :
        evt.numero === 4 ? mapChapitre04(evt.donnees) :
        evt.numero === 5 ? mapChapitre05(evt.donnees) :
        evt.numero === 6 ? mapChapitre06(evt.donnees) :
        mapChapitre07(evt.donnees);
      setCartes((prev) => [...prev, ...nouvelles]);
      if (evt.numero === 3) {
        setDetails((d) => ({ ...d, 'follow-back': evt.donnees.neSuiventPas }));
      }
    } else if (evt.type === 'termine') {
      setStatut('fini');
    } else if (evt.type === 'erreur') {
      setMessageErreur(evt.message);
      setStatut('erreur');
    }
  }

  async function consommer() {
    consommeRef.current = true;
    while (queueRef.current.length) {
      const evt = queueRef.current.shift()!;
      appliquer(evt);
      await new Promise((r) => setTimeout(r, 0));
    }
    consommeRef.current = false;
  }

  function demarrer(fichiersChoisis: File[]) {
    const fichiersZip = fichiersChoisis.filter((f) => f.name.toLowerCase().endsWith('.zip'));
    if (fichiersZip.length === 0) return;

    workerRef.current?.terminate();
    setStatut('chargement');
    setCartes([]);
    setDetails({});
    setMessageErreur(null);
    setLabelEtape('Lecture de tes fichiers…');
    queueRef.current = [];

    const worker = new Worker(new URL('./analyse.worker.ts', import.meta.url));
    workerRef.current = worker;
    worker.onmessage = (e: MessageEvent<EvenementAnalyse>) => {
      queueRef.current.push(e.data);
      if (!consommeRef.current) consommer();
    };
    worker.postMessage({ fichiers: fichiersZip });
  }

  function fermerStory() {
    workerRef.current?.terminate();
    setStatut('attente');
    setCartes([]);
  }

  if ((statut === 'chargement' || statut === 'fini') && cartes.length > 0) {
    return (
      <StoryPlayer
        cartes={cartes}
        details={details}
        enCoursDeChargement={statut === 'chargement'}
        onFermer={fermerStory}
      />
    );
  }

  return (
    <>
      <Nav page="wrapped" />

      <div className="wrap" style={{ paddingTop: 'clamp(3rem, 8vh, 6rem)', paddingBottom: 'clamp(4rem, 10vh, 7rem)' }}>
        <header className={s.tete}>
          <p className="kicker">Ton dossier</p>
          <h1 className="t-xl">Tes 7 chapitres.</h1>
          <p className="lede">
            Dépose le ou les fichiers ZIP qu’Instagram t’a envoyés. Tout se calcule dans ton
            navigateur : rien n’est envoyé nulle part, jamais.
          </p>
        </header>

        {statut === 'attente' && (
          <div
            className={`${s.zone} ${dragActif ? s.zoneActive : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragActif(true); }}
            onDragLeave={() => setDragActif(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActif(false);
              demarrer(Array.from(e.dataTransfer.files));
            }}
          >
            <p className={s.zoneTitre}>Glisse ton ou tes ZIP ici</p>
            <p className={s.zoneSub}>
              Instagram en envoie parfois plusieurs : dépose-les tous en même temps.
            </p>
            <label className={s.zoneBouton}>
              Choisir des fichiers
              <input
                type="file"
                accept=".zip"
                multiple
                className={s.inputCache}
                onChange={(e) => demarrer(Array.from(e.target.files ?? []))}
              />
            </label>
          </div>
        )}

        {statut === 'chargement' && cartes.length === 0 && (
          <div className={s.chargement}>
            <span className={s.spin} aria-hidden="true" />
            <div>
              <p className={s.chargementLabel}>{labelEtape}</p>
              <p className={s.chargementSub}>Tout reste dans cet onglet.</p>
            </div>
          </div>
        )}

        {statut === 'erreur' && (
          <div className={s.erreur}>{messageErreur}</div>
        )}
      </div>

      <Pied />
    </>
  );
}
