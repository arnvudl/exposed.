'use client';

import { useEffect, useRef, useState } from 'react';
import type { EvenementAnalyse } from '@/lib/wrapped/analyser';
import type { chapitre01, chapitre02, chapitre03, chapitre05, chapitre06, chapitre07 } from '@/lib/wrapped/chapitres';
import { formatDate, formatDureeDecoupee, formatDureeCourte } from '@/lib/wrapped/format';
import type { ZipEnMemoire } from '@/lib/wrapped/zip';
import s from './wrapped-test.module.css';

/* Page de test, jamais liee depuis la navigation : valide le flux complet
   (depot -> Worker -> calcul -> affichage progressif) et les chiffres reels
   dans le navigateur, avant de brancher ce meme calcul sur les vraies
   affiches du site. Rien ici n'est envoye nulle part : tout reste dans
   l'onglet, comme sur la vraie page /wrapped a venir. */

type C01 = ReturnType<typeof chapitre01>;
type C02 = ReturnType<typeof chapitre02>;
type C03 = ReturnType<typeof chapitre03>;
type C04 = [string, number][];
type C05 = ReturnType<typeof chapitre05>;
type C06 = ReturnType<typeof chapitre06>;
type C07 = ReturnType<typeof chapitre07>;

type ChapitresState = {
  1?: C01; 2?: C02; 3?: C03; 4?: C04; 5?: C05; 6?: C06; 7?: C07;
};

const CHAPITRES_META = [
  { numero: 1 as const, titre: 'Ton cercle réel', tab: 'var(--t1)' },
  { numero: 2 as const, titre: 'Tes groupes', tab: 'var(--t2)' },
  { numero: 3 as const, titre: 'Qui ne te suit pas en retour', tab: 'var(--t3)' },
  { numero: 4 as const, titre: 'Tes mots', tab: 'var(--t4)' },
  { numero: 5 as const, titre: 'Tes cinq records', tab: 'var(--t6)' },
  { numero: 6 as const, titre: 'Premier et dernier', tab: 'var(--t7)' },
  { numero: 7 as const, titre: 'Ton profil relationnel', tab: 'var(--t8)' },
];

const LABELS_ETAPE: Record<string, string> = {
  lecture_zip: 'Lecture de tes fichiers…',
  reconstruction: 'Reconstruction de tes conversations…',
};
const LABELS_CHAPITRE: Record<number, string> = {
  1: 'Ton cercle réel…', 2: 'Tes groupes…', 3: 'Qui ne te suit pas en retour…',
  4: 'Tes mots…', 5: 'Tes records…', 6: 'Premier et dernier…', 7: 'Ton profil…',
};

// Chaque etape reste affichee au moins ce temps-la avant la suivante : le
// calcul reel peut aller plus vite que ce qu'on a le temps de lire, et un
// enchainement instantane donne l'impression que rien ne s'est passe.
const PALIER_MS = 320;

export default function WrappedTest() {
  const [statut, setStatut] = useState<'attente' | 'chargement' | 'fini' | 'erreur'>('attente');
  const [labelEtape, setLabelEtape] = useState('');
  const [chapitresData, setChapitresData] = useState<ChapitresState>({});
  const [meta, setMeta] = useState<{ conversations: number; soi: string } | null>(null);
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [dragActif, setDragActif] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef<EvenementAnalyse[]>([]);
  const consommeRef = useRef(false);

  useEffect(() => () => workerRef.current?.terminate(), []);

  function appliquer(evt: EvenementAnalyse) {
    if (evt.type === 'etape') setLabelEtape(LABELS_ETAPE[evt.etape] ?? '');
    else if (evt.type === 'chapitre') {
      setLabelEtape(LABELS_CHAPITRE[evt.numero] ?? '');
      setChapitresData((prev) => ({ ...prev, [evt.numero]: evt.donnees }));
    } else if (evt.type === 'termine') {
      setMeta({ conversations: evt.conversations, soi: evt.soi });
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
      await new Promise((r) => setTimeout(r, PALIER_MS));
    }
    consommeRef.current = false;
  }

  async function demarrer(fichiersChoisis: File[]) {
    const fichiersZip = fichiersChoisis.filter((f) => f.name.toLowerCase().endsWith('.zip'));
    if (fichiersZip.length === 0) return;

    workerRef.current?.terminate();
    setStatut('chargement');
    setChapitresData({});
    setMeta(null);
    setMessageErreur(null);
    setLabelEtape('Lecture de tes fichiers…');
    queueRef.current = [];

    // Lu ici, sur le thread principal, tout de suite apres la selection :
    // c'est le moment ou la reference au fichier est la plus fiable. Passer
    // le `File` tel quel au Worker et le lire plus tard, la-bas, est ce qui
    // declenche « The requested file could not be read... » sur certains
    // fichiers (gros fichier, antivirus qui scanne un ZIP tout juste
    // telecharge). Un verrou d'antivirus est transitoire : quelques
    // tentatives espacees suffisent generalement a passer au travers.
    const zips: ZipEnMemoire[] = [];
    for (const f of fichiersZip) {
      let donnees: ArrayBuffer | null = null;
      for (let tentative = 1; tentative <= 4 && !donnees; tentative++) {
        try {
          donnees = await f.arrayBuffer();
        } catch {
          if (tentative === 4) break;
          setLabelEtape(`« ${f.name} » n’a pas répondu, nouvel essai (${tentative}/3)…`);
          await new Promise((r) => setTimeout(r, tentative * 800));
        }
      }
      if (!donnees) {
        setMessageErreur(
          `Impossible de lire « ${f.name} » après plusieurs tentatives. Le fichier est peut-être encore ` +
          `"en ligne uniquement" (OneDrive, Google Drive...) et pas téléchargé sur cet appareil, verrouillé ` +
          `par un antivirus, ou trop volumineux pour ce navigateur. Vérifie qu'il est bien disponible hors ` +
          `connexion et réessaie ; si ça persiste, redémarre le navigateur.`,
        );
        setStatut('erreur');
        return;
      }
      zips.push({ nom: f.name, donnees });
    }

    const worker = new Worker(new URL('./analyse.worker.ts', import.meta.url));
    workerRef.current = worker;
    worker.onmessage = (e: MessageEvent<EvenementAnalyse>) => {
      queueRef.current.push(e.data);
      if (!consommeRef.current) consommer();
    };
    // Transfere les buffers plutot que de les cloner : gratuit, et le Worker
    // en devient l'unique proprietaire.
    worker.postMessage({ zips }, zips.map((z) => z.donnees));
  }

  return (
    <div className={`wrap ${s.page}`}>
      <header className={s.tete}>
        <p className="kicker">Page de test — pas liée depuis le site</p>
        <h1 className="t-lg">Dépose ton export, en vrai.</h1>
        <p>
          Le calcul tourne entièrement dans cet onglet, dans un Web Worker : rien n’est envoyé
          nulle part. Sert à vérifier que les 7 chapitres donnent les mêmes résultats qu’en local
          avant de les brancher sur les vraies affiches.
        </p>
      </header>

      {statut !== 'chargement' && (
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
          <p className={s.zoneTitre}>Glisse tes fichiers ZIP ici</p>
          <p className={s.zoneSub}>Un ou plusieurs. Rien n’est décompressé ailleurs que dans ton navigateur.</p>
          <label className={s.zoneBouton}>
            Choisir des fichiers
            <input
              ref={fileRef}
              type="file"
              accept=".zip"
              multiple
              className={s.inputCache}
              onChange={(e) => demarrer(Array.from(e.target.files ?? []))}
            />
          </label>
        </div>
      )}

      {statut === 'chargement' && (
        <div className={s.chargement}>
          <span className={s.spin} aria-hidden="true" />
          <div>
            <p className={s.chargementLabel}>{labelEtape}</p>
            <p className={s.chargementSub}>Tout se passe dans cet onglet.</p>
          </div>
        </div>
      )}

      {statut === 'erreur' && (
        <div className={s.erreur}>Erreur : {messageErreur}</div>
      )}

      {(statut === 'chargement' || statut === 'fini') && (
        <div className={s.grille}>
          {CHAPITRES_META.map(({ numero, titre, tab }) => (
            <article key={numero} className={`${s.carte} ${!chapitresData[numero] ? s.carteVide : ''}`} style={{ '--tab': tab } as React.CSSProperties}>
              <p className={s.carteIndex}>Chapitre {String(numero).padStart(2, '0')}</p>
              <h2 className={s.carteTitre}>{titre}</h2>
              <div className={s.carteCorps}>
                {chapitresData[numero] ? <CorpsChapitre numero={numero} donnees={chapitresData} /> : <Squelette />}
              </div>
            </article>
          ))}
        </div>
      )}

      {statut === 'fini' && meta && (
        <p className={s.piedResultat}>
          {meta.conversations} conversations chargées. Toi = « {meta.soi} ».
        </p>
      )}
    </div>
  );
}

function Squelette() {
  return (
    <>
      <div className={s.squelette} style={{ width: '80%' }} />
      <div className={s.squelette} style={{ width: '60%' }} />
      <div className={s.squelette} style={{ width: '70%' }} />
    </>
  );
}

function CorpsChapitre({ numero, donnees }: { numero: number; donnees: ChapitresState }) {
  switch (numero) {
    case 1: return <Chapitre01 data={donnees[1]!} />;
    case 2: return <Chapitre02 data={donnees[2]!} />;
    case 3: return <Chapitre03 data={donnees[3]!} />;
    case 4: return <Chapitre04 data={donnees[4]!} />;
    case 5: return <Chapitre05 data={donnees[5]!} />;
    case 6: return <Chapitre06 data={donnees[6]!} />;
    case 7: return <Chapitre07 data={donnees[7]!} />;
    default: return null;
  }
}

function Chapitre01({ data }: { data: C01 }) {
  return (
    <div>
      {data.slice(0, 6).map((l) => (
        <div key={l.qui} className={s.ligne}><span>{l.qui}</span><span>{l.total}</span></div>
      ))}
    </div>
  );
}

function Chapitre02({ data }: { data: C02 }) {
  if (data.abandon) return <p>Aucun groupe assez actif sur {data.totalGroupes} au total.</p>;
  const cat = data.categories!;
  return (
    <div>
      <div className={s.recordK}>QG</div><div className={s.recordV}>{cat.qg?.titre}</div>
      <div className={s.recordK}>Le plus bondé</div><div className={s.recordV}>{cat.leBondé?.titre} ({cat.leBondé?.membres} membres)</div>
      <div className={s.recordK}>Tu débites ici</div><div className={s.recordV}>{cat.tuDebites?.titre}</div>
      <div className={s.recordK}>Ton groupe inutile</div><div className={s.recordV}>{cat.inutile?.titre}</div>
      <div className={s.recordK}>Le ring</div><div className={s.recordV}>{cat.leRing?.titre ?? '—'}</div>
    </div>
  );
}

function Chapitre03({ data }: { data: C03 }) {
  return (
    <div>
      <p>{data.following} abonnements, {data.followers} abonnés.</p>
      <p style={{ marginTop: '.6rem', fontWeight: 700 }}>{data.neSuiventPas.length} comptes ne te suivent pas en retour</p>
    </div>
  );
}

function Chapitre04({ data }: { data: C04 }) {
  return (
    <div className={s.motsNuage}>
      {data.map(([mot, n]) => (
        <span key={mot} style={{ fontSize: `${Math.min(1.4, 0.85 + n / (data[0]?.[1] || 1) * 0.7)}rem`, fontWeight: 700 }}>
          {mot}
        </span>
      ))}
    </div>
  );
}

function Chapitre05({ data }: { data: C05 }) {
  return (
    <div>
      {data.plusTardif && (
        <>
          <div className={s.recordK}>Plus tardif</div>
          <div className={s.recordV}>{formatDate(data.plusTardif.ts)} — {data.plusTardif.avec}</div>
          <div className={s.recordApercu}>« {data.plusTardif.message} »</div>
        </>
      )}
      {data.remisInflige && (
        <>
          <div className={s.recordK}>Remis le plus long (toi)</div>
          <div className={s.recordV}>{formatDureeDecoupee(data.remisInflige.debut, data.remisInflige.ts)} — {data.remisInflige.avec}</div>
        </>
      )}
      {data.reponseRapide && (
        <>
          <div className={s.recordK}>Réponse la plus rapide</div>
          <div className={s.recordV}>{formatDureeCourte(data.reponseRapide.ms)} — {data.reponseRapide.avec}</div>
        </>
      )}
      {data.jourRecord && (
        <>
          <div className={s.recordK}>Journée la plus intense</div>
          <div className={s.recordV}>{data.jourRecord.messages} messages — {data.jourRecord.date}</div>
        </>
      )}
    </div>
  );
}

function Chapitre06({ data }: { data: C06 }) {
  return (
    <div>
      {data.premier && (
        <>
          <div className={s.recordK}>Premier</div>
          <div className={s.recordV}>{formatDate(data.premier.ts)}</div>
          <div className={s.recordApercu}>« {data.premier.message} »</div>
        </>
      )}
      {data.dernier && (
        <>
          <div className={s.recordK}>Dernier</div>
          <div className={s.recordV}>{formatDate(data.dernier.ts)}</div>
          <div className={s.recordApercu}>« {data.dernier.message} »</div>
        </>
      )}
    </div>
  );
}

function Chapitre07({ data }: { data: C07 }) {
  return (
    <div>
      <div className={s.ligne}><span>Qui lance</span><span>{(data.axeQuiLance * 100).toFixed(0)}%</span></div>
      <div className={s.ligne}><span>Ampleur</span><span>{data.axeAmpleur}</span></div>
      <div className={s.ligne}><span>Vitesse</span><span>{data.axeVitesseMinutes.toFixed(1)} min</span></div>
      <div className={s.ligne}><span>Longueur</span><span>{data.axeLongueurCaracteres.toFixed(0)} car.</span></div>
    </div>
  );
}
