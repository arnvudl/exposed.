'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Nav from '@/components/Nav';
import Pied from '@/components/Pied';
import { BoutonLien } from '@/components/Bouton';
import type { DonneesAffiche } from '@/components/Affiche';
import type { EvenementAnalyse } from '@/lib/wrapped/analyser';
import {
  mapChapitre01, mapChapitre02, mapChapitre03, mapChapitre04,
  mapChapitre05, mapChapitre06, mapChapitre07, mapBonusMedias,
} from '@/lib/wrapped/mapper';
import { construireFaits, type DonneesBrutesChapitres } from '@/lib/partage/faits';
import type { Periode } from '@/lib/wrapped/parse';
import { genererDemo, CLE_DEMO } from '@/lib/wrapped/demo';
import {
  construireDevineTop, construireDevineVersusContacts, construireDevineVersusGroupes,
  construireDevineVersusMedia, type DonneesDevine, type ContextePeriode,
} from '@/lib/wrapped/jeu';
import StoryPlayer from './StoryPlayer';
import s from './wrapped.module.css';

type Raccourci = 'tout' | 3 | 6 | 12 | 'perso';
const MOIS_RACCOURCIS: { valeur: 3 | 6 | 12; label: string }[] = [
  { valeur: 3, label: '3 derniers mois' },
  { valeur: 6, label: '6 derniers mois' },
  { valeur: 12, label: '1 an' },
];
/** yyyy-mm-dd en heure locale (pas `toISOString`, qui bascule en UTC et peut
    afficher la veille du jour choisi selon le fuseau). */
function jourLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function debutJournee(jour: string): number { return new Date(`${jour}T00:00:00`).getTime(); }
function finJournee(jour: string): number { return new Date(`${jour}T23:59:59.999`).getTime(); }

const FMT_MOIS_ANNEE_DEVINE = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
/** "3 mars 2026", "1er septembre 2022" : pour donner du contexte a une
    devinette ("Entre le X et le Y, à qui..."), seulement quand l'utilisateur
    a vraiment choisi une periode -- jamais de date inventee sur un export
    complet ("Tout"). Le "1er" est ecrit a la main : `Intl.DateTimeFormat`
    n'a pas d'ordinal francais pour `day: 'numeric'`. */
function jourLong(jour: string): string {
  const d = new Date(`${jour}T00:00:00`);
  const quantieme = d.getDate() === 1 ? '1er' : String(d.getDate());
  return `${quantieme} ${FMT_MOIS_ANNEE_DEVINE.format(d)}`;
}

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
  // Resultats bruts des chapitres (pas les DonneesAffiche de la story) :
  // sert de source a la bibliotheque de faits du compositeur de partage,
  // qui a besoin de plus de detail que ce que montre une carte de story.
  const [donneesChapitres, setDonneesChapitres] = useState<DonneesBrutesChapitres>({});
  // Devinettes a poser juste avant certaines cartes, indexees par la
  // position qu'elles occuperont dans `cartes` (voir lib/wrapped/jeu.ts) :
  // un index sans entree veut juste dire « pas de question ici ».
  const [devines, setDevines] = useState<Record<number, DonneesDevine>>({});
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [dragActif, setDragActif] = useState(false);
  // Periode optionnelle a appliquer a l'analyse : par defaut « Tout », donc
  // aucun filtre, comportement identique a avant cette fonctionnalite.
  const [raccourci, setRaccourci] = useState<Raccourci>('tout');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');

  function appliquerRaccourci(r: 'tout' | 3 | 6 | 12) {
    setRaccourci(r);
    if (r === 'tout') { setDebut(''); setFin(''); return; }
    const maintenant = new Date();
    const bornDebut = new Date(maintenant);
    bornDebut.setMonth(bornDebut.getMonth() - r);
    setDebut(jourLocal(bornDebut));
    setFin(jourLocal(maintenant));
  }

  const workerRef = useRef<Worker | null>(null);
  const queueRef = useRef<EvenementAnalyse[]>([]);
  const consommeRef = useRef(false);
  // Miroir synchrone de `cartes`, pour connaitre l'index d'insertion d'une
  // devinette au moment ou un chapitre arrive (le state React ne se relit
  // pas de facon fiable entre deux evenements traites dans la meme boucle).
  const cartesRef = useRef<DonneesAffiche[]>([]);

  useEffect(() => () => workerRef.current?.terminate(), []);

  // Arrivee depuis le bouton demo de l'accueil ou du guide : la cle est
  // deposee juste avant la navigation, consommee une seule fois ici.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(CLE_DEMO) === '1') {
        sessionStorage.removeItem(CLE_DEMO);
        lancerDemo();
      }
    } catch {
      // sessionStorage indisponible (navigation privee stricte) : tant pis,
      // le bouton demo de cette page reste utilisable normalement.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La periode choisie par l'utilisateur (voir le formulaire plus bas),
  // formatee pour habiller une devinette de son contexte -- vide sur "Tout" :
  // jamais de date fabriquee. `debut`/`fin` sont geles a leur valeur du clic
  // sur "demarrer" (fermeture normale de `appliquer`, comme pour `periode`
  // envoyee au worker dans `demarrer`).
  const periodeDevine: ContextePeriode | undefined =
    debut && fin ? { debut: jourLong(debut), fin: jourLong(fin) } : undefined;

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
      // L'index ou ces cartes atterrissent, avant qu'on les y ajoute : c'est
      // la position a laquelle une devinette doit surgir pour precede la
      // premiere d'entre elles.
      const indexDebut = cartesRef.current.length;
      cartesRef.current = [...cartesRef.current, ...nouvelles];
      setCartes(cartesRef.current);
      setDonneesChapitres((d) => ({ ...d, [evt.numero]: evt.donnees }));
      if (evt.numero === 1) {
        const nouvellesDevines: Record<number, DonneesDevine> = {};
        const devineTop = construireDevineTop(evt.donnees, periodeDevine);
        if (devineTop) nouvellesDevines[indexDebut] = devineTop;
        // La deuxieme carte du chapitre 01 est le classement complet : une
        // deuxieme devinette, differente de la premiere, juste avant.
        if (nouvelles.length > 1) {
          const devineVersus = construireDevineVersusContacts(evt.donnees, periodeDevine);
          if (devineVersus) nouvellesDevines[indexDebut + 1] = devineVersus;
        }
        if (Object.keys(nouvellesDevines).length) {
          setDevines((d) => ({ ...d, ...nouvellesDevines }));
        }
      }
      if (evt.numero === 2) {
        const devineGroupes = construireDevineVersusGroupes(evt.donnees, periodeDevine);
        if (devineGroupes) setDevines((d) => ({ ...d, [indexDebut]: devineGroupes }));
      }
      if (evt.numero === 3) {
        setDetails((d) => ({ ...d, 'follow-back': evt.donnees.neSuiventPas }));
      }
    } else if (evt.type === 'medias') {
      // Pas un chapitre numerote (voir lib/wrapped/mapper.ts, mapBonusMedias) :
      // meme mecanique d'insertion, juste apres tout ce qui precede.
      const nouvelles = mapBonusMedias(evt.stats);
      if (nouvelles.length === 0) return;
      const indexDebut = cartesRef.current.length;
      cartesRef.current = [...cartesRef.current, ...nouvelles];
      setCartes(cartesRef.current);
      // Une seule devinette, sur le classement le plus fourni des deux
      // (vocaux prefere : plus personnel, plus amusant a deviner que les
      // photos) -- pas la peine d'en poser une par carte bonus.
      const devineMedia = evt.vocaux.length >= 2
        ? construireDevineVersusMedia(evt.vocaux, 'Qui t’envoie le plus de messages vocaux ?', 'devine-vocaux', periodeDevine)
        : construireDevineVersusMedia(evt.photos, 'Qui t’envoie le plus de photos ?', 'devine-photos', periodeDevine);
      if (devineMedia) setDevines((d) => ({ ...d, [indexDebut]: devineMedia }));
    } else if (evt.type === 'termine') {
      setStatut('fini');
    } else if (evt.type === 'erreur') {
      setMessageErreur(evt.message);
      setStatut('erreur');
    }
  }

  // Recalcule seulement quand un nouveau chapitre arrive, pas a chaque
  // rendu : construireFaits relit tout ce qui est deja connu a chaque appel.
  const faitsPartage = useMemo(() => construireFaits(donneesChapitres), [donneesChapitres]);

  async function consommer() {
    consommeRef.current = true;
    while (queueRef.current.length) {
      const evt = queueRef.current.shift()!;
      appliquer(evt);
      await new Promise((r) => setTimeout(r, 0));
    }
    consommeRef.current = false;
  }

  // Donnees inventees, generees dans l'onglet, jamais ecrites ni envoyees :
  // memes etats reactifs que la vraie analyse, juste sans worker ni fichier.
  function lancerDemo() {
    workerRef.current?.terminate();
    const { cartes: c, details: d, donneesChapitres: dc, devines: dv } = genererDemo();
    cartesRef.current = c;
    setCartes(c);
    setDetails(d);
    setDonneesChapitres(dc);
    setDevines(dv);
    setMessageErreur(null);
    setStatut('fini');
  }

  function demarrer(fichiersChoisis: File[]) {
    const fichiersZip = fichiersChoisis.filter((f) => f.name.toLowerCase().endsWith('.zip'));
    if (fichiersZip.length === 0) return;

    workerRef.current?.terminate();
    setStatut('chargement');
    cartesRef.current = [];
    setCartes([]);
    setDetails({});
    setDonneesChapitres({});
    setDevines({});
    setMessageErreur(null);
    setLabelEtape('Lecture de tes fichiers…');
    queueRef.current = [];

    const periode: Periode = {
      debut: debut ? debutJournee(debut) : undefined,
      fin: fin ? finJournee(fin) : undefined,
    };

    const worker = new Worker(new URL('./analyse.worker.ts', import.meta.url));
    workerRef.current = worker;
    worker.onmessage = (e: MessageEvent<EvenementAnalyse>) => {
      queueRef.current.push(e.data);
      if (!consommeRef.current) consommer();
    };
    worker.postMessage({ fichiers: fichiersZip, periode });
  }

  function fermerStory() {
    workerRef.current?.terminate();
    setStatut('attente');
    cartesRef.current = [];
    setCartes([]);
  }

  if ((statut === 'chargement' || statut === 'fini') && cartes.length > 0) {
    return (
      <StoryPlayer
        cartes={cartes}
        details={details}
        faits={faitsPartage}
        devines={devines}
        enCoursDeChargement={statut === 'chargement'}
        onFermer={fermerStory}
      />
    );
  }

  return (
    <>
      <Nav page="wrapped" />

      <main className="wrap" style={{ paddingTop: 'clamp(3rem, 8vh, 6rem)', paddingBottom: 'clamp(4rem, 10vh, 7rem)' }}>
        <header className={s.tete}>
          <p className="kicker">Ton dossier</p>
          <h1 className="t-xl">Tes 7 chapitres.</h1>
          <p className="lede">
            Dépose le ou les fichiers ZIP qu’Instagram t’a envoyés. Tout se calcule dans ton
            navigateur : rien n’est envoyé nulle part, jamais.
          </p>
          <div className={s.guideBouton}>
            <BoutonLien href="/guide/" ton="paper">Guide d’export</BoutonLien>
          </div>
        </header>

        {statut === 'erreur' && (
          <div className={s.erreur} role="alert">{messageErreur}</div>
        )}

        {/* Le filtre s'applique message par message pendant la lecture du
            ZIP (voir Accumulateur.horsPeriode) : deposer tout l'export et ne
            garder que les 3 derniers mois marche donc sans le redemander a
            Instagram. */}
        {(statut === 'attente' || statut === 'erreur') && (
          <div className={s.periode}>
            <p className={s.periodeLabel}>Période à analyser (optionnel)</p>
            <div className={s.raccourcis}>
              <button
                type="button"
                className={`${s.raccourciBouton} ${raccourci === 'tout' ? s.raccourciActif : ''}`}
                onClick={() => appliquerRaccourci('tout')}
              >
                Tout
              </button>
              {MOIS_RACCOURCIS.map(({ valeur, label }) => (
                <button
                  key={valeur}
                  type="button"
                  className={`${s.raccourciBouton} ${raccourci === valeur ? s.raccourciActif : ''}`}
                  onClick={() => appliquerRaccourci(valeur)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={s.dates}>
              <label className={s.dateChamp}>
                Du
                <input
                  type="date"
                  value={debut}
                  max={fin || undefined}
                  onChange={(e) => { setDebut(e.target.value); setRaccourci('perso'); }}
                />
              </label>
              <label className={s.dateChamp}>
                Au
                <input
                  type="date"
                  value={fin}
                  min={debut || undefined}
                  onChange={(e) => { setFin(e.target.value); setRaccourci('perso'); }}
                />
              </label>
            </div>
          </div>
        )}

        {/* La zone reste en place apres une erreur : on redepose le bon
            fichier sans recharger la page. */}
        {(statut === 'attente' || statut === 'erreur') && (
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
            {/* Au doigt, rien ne se glisse : le titre change sur les ecrans tactiles. */}
            <p className={s.zoneTitre}>
              <span className={s.souris}>Glisse ton ou tes ZIP ici</span>
              <span className={s.doigt}>Ajoute ton ou tes ZIP</span>
            </p>
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

        {(statut === 'attente' || statut === 'erreur') && (
          <button type="button" className={s.demoLien} onClick={lancerDemo}>
            Pas de fichier sous la main ? Voir une démo
          </button>
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

      </main>

      <Pied />
    </>
  );
}
