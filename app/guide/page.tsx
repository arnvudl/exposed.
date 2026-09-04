import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Pied from '@/components/Pied';
import Mouvement from '@/components/Mouvement';
import { BoutonLien } from '@/components/Bouton';
import s from './guide.module.css';

export const metadata: Metadata = {
  title: 'Guide d’export. Exposed',
  description:
    'Récupérer ton fichier Instagram, étape par étape, depuis ton téléphone. Format JSON, puis tu déposes tes fichiers ZIP.',
};

type Style = React.CSSProperties;

/* Les captures sont prises sur le telephone, en vertical : chaque etape qui
   montre un ecran a un cadre 9:16 a remplir. L'etape « quelles infos » se fait
   au texte, elle ne se capture pas bien. */
type Etape = {
  titre: string;
  corps: React.ReactNode;
  shot?: string; // legende du cadre a remplir ; absent = pas d'image
};

const etapes: Etape[] = [
  {
    titre: 'Ouvre tes réglages',
    corps: (
      <>
        Depuis ton profil, appuie sur le menu <strong>☰</strong> en haut à droite, puis sur{' '}
        <strong>Paramètres et confidentialité</strong>.
      </>
    ),
    shot: 'Capture : le menu du profil, avec « Paramètres et confidentialité ».',
  },
  {
    titre: 'Va dans le Centre de comptes',
    corps: (
      <>
        Ouvre <strong>Centre de comptes</strong>, puis{' '}
        <strong>Tes informations et autorisations</strong>, puis{' '}
        <strong>Télécharger tes informations</strong>.
      </>
    ),
    shot: 'Capture : l’écran « Tes informations et autorisations ».',
  },
  {
    titre: 'Crée une demande',
    corps: (
      <>
        Appuie sur <strong>Créer une demande de téléchargement</strong>, choisis ton compte,
        puis <strong>Télécharger sur ton appareil</strong>.
      </>
    ),
    shot: 'Capture : le bouton « Créer une demande de téléchargement ».',
  },
  {
    titre: 'Choisis quelles infos',
    corps: (
      <>
        Sélectionne <strong>Une partie de tes informations</strong>, puis coche les quatre
        catégories qui nourrissent ton dossier :
        <ul className={s.liste}>
          <li><strong>Messages</strong></li>
          <li><strong>Contacts</strong></li>
          <li><strong>Abonné(e)s et suivi(e)s</strong></li>
          <li><strong>Abonnements</strong></li>
        </ul>
        Tu peux tout prendre si tu veux, mais ces quatre-là suffisent et gardent le fichier
        plus léger.
      </>
    ),
    // Pas de cadre : cette etape se fait au texte.
  },
  {
    titre: 'Un seul réglage à ne pas rater',
    corps: (
      <>
        Une seule chose est vraiment obligatoire, le reste t’appartient :
        <ul className={s.liste}>
          <li><strong>Format : <em>JSON</em>.</strong> C’est la seule à ne pas rater. En HTML, le site ne peut rien lire.</li>
          <li><strong>Période :</strong> celle que tu veux. Plus c’est long, plus ton dossier est complet, mais c’est toi qui décides.</li>
          <li>
            <strong>Qualité des médias :</strong> baisse-la si le stockage te manque.{' '}
            <span className={s.sain}>On ne lit que le texte de tes messages, jamais tes photos</span>, donc
            ça n’enlève rien à ton dossier et ça allège le fichier.
          </li>
        </ul>
      </>
    ),
    shot: 'Capture : l’écran des options, avec le format JSON entouré.',
  },
  {
    titre: 'Lance, puis attends',
    corps: (
      <>
        Appuie sur <strong>Créer les fichiers</strong>. Instagram prépare ton export : de
        quelques minutes à <strong>48 heures</strong> selon la période choisie. Il t’envoie une
        notification dès que ton fichier est prêt à télécharger.
      </>
    ),
    shot: 'Capture : l’écran de confirmation « Ta demande est en cours ».',
  },
  {
    titre: 'Télécharge, puis dépose',
    corps: (
      <>
        Quand Instagram t’envoie la notification, ouvre-la et télécharge. Si ton export est
        volumineux, <strong>Instagram le découpe en plusieurs fichiers</strong> (part 1, part 2…) :
        télécharge-les tous. Pas besoin de les décompresser, reviens sur Exposed et glisse-les
        tels quels, le site les recombine.
      </>
    ),
    shot: 'Capture : la notification Instagram avec le ou les fichiers prêts à télécharger.',
  },
];

export default function Guide() {
  return (
    <>
      <Nav />
      <Mouvement />

      <header className={`wrap ${s.tete}`} style={{ paddingTop: 'clamp(3rem, 8vh, 6rem)' }}>
        <p className="kicker">Guide d’export</p>
        <h1 className="t-xl reveal" style={{ marginTop: '1rem' }}>Récupérer ton<br />fichier Instagram.</h1>
        <p className={`lede reveal ${s.teteSub}`} style={{ '--d': '80ms' } as Style}>
          Tu fais la demande sur Instagram, et il te les envoie dans les plus brefs délais
          (plus la période choisie est longue, plus tu devras attendre).
        </p>

        {/* Le raccourci direct vers le Centre de comptes, pour ceux qui veulent
            aller droit au but sans dérouler tout le guide. */}
        <div className={`${s.cta} reveal`} style={{ '--d': '140ms' } as Style}>
          <BoutonLien
            href="https://accountscenter.instagram.com/info_and_permissions/dyi/"
            target="_blank"
          >
            Ouvrir Instagram
          </BoutonLien>
        </div>
      </header>

      <div className="wrap">
        <div className={s.steps}>
          {etapes.map((e, i) => (
            <div key={e.titre} className={`${s.step} reveal`}>
              <p className={`${s.stepIndex} num`}>{String(i + 1).padStart(2, '0')}</p>
              <div className={`${s.stepMain} ${e.shot ? '' : s.sansImage}`}>
                <div>
                  <h2 className={s.stepH}>{e.titre}</h2>
                  <div className={s.stepD}>{e.corps}</div>
                </div>
                {e.shot && (
                  <div className={s.shot} aria-hidden="true">
                    <span>{e.shot}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* La sortie : on renvoie vers le depot. */}
        <div className={`${s.fin} reveal`}>
          <h2 className={s.finH}>Tes fichiers sont prêts ?</h2>
          <p className={s.finD}>
            Reviens à l’accueil et dépose tes ZIP, tous en même temps. Ils sont lus directement
            dans ton navigateur, rien ne sort de ton appareil.
          </p>
          <div className={s.finCta}>
            <BoutonLien href="/#chemin">Déposer mon fichier</BoutonLien>
          </div>
        </div>
      </div>

      <Pied pub />
    </>
  );
}
