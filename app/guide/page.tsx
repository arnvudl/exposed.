import type { Metadata } from 'next';
import Image from 'next/image';
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

/* Dix captures reelles, prises sur le compte du site, avec le bon bouton
   entoure en rouge a chaque etape. */
type Etape = {
  titre: string;
  corps: React.ReactNode;
  shot: string; // chemin dans /public/guide
};

const etapes: Etape[] = [
  {
    titre: 'Ouvre ton profil',
    corps: (
      <>
        Depuis ton profil Instagram, appuie sur le menu <strong>☰</strong> en haut à droite.
      </>
    ),
    shot: '/guide/01-menu-profil.png',
  },
  {
    titre: 'Ouvre le Centre de comptes',
    corps: (
      <>
        Dans <strong>Paramètres et activité</strong>, appuie sur <strong>Centre de comptes</strong>{' '}
        (<span className={s.orig}>Accounts Centre</span>), tout en haut.
      </>
    ),
    shot: '/guide/02-parametres.png',
  },
  {
    titre: 'Tes informations et autorisations',
    corps: (
      <>
        Dans le Centre de comptes, appuie sur{' '}
        <strong>Tes informations et autorisations</strong> (<span className={s.orig}>Your information and permissions</span>).
      </>
    ),
    shot: '/guide/03-centre-comptes.png',
  },
  {
    titre: 'Exporte tes informations',
    corps: (
      <>
        Appuie sur <strong>Exporter tes informations</strong> (<span className={s.orig}>Export your information</span>).
      </>
    ),
    shot: '/guide/04-export-infos.png',
  },
  {
    titre: 'Vers ton appareil, pas ailleurs',
    corps: (
      <>
        Choisis <strong>Exporter vers l’appareil</strong>. L’autre option envoie tes messages à un
        service externe : ce n’est pas celle-là.
      </>
    ),
    shot: '/guide/05-export-appareil.png',
  },
  {
    titre: 'Décoche tout pour repartir de zéro',
    corps: (
      <>
        Instagram coche tout par défaut. Appuie sur <strong>Tout effacer</strong> (
        <span className={s.orig}>Clear all</span>) en haut de la liste avant de choisir toi-même.
      </>
    ),
    shot: '/guide/06-tout-decocher.png',
  },
  {
    titre: 'Coche Abonnements et Messages',
    corps: (
      <>
        Dans <strong>Ton activité Instagram</strong>, coche seulement{' '}
        <strong>Abonnements</strong> (<span className={s.orig}>Subscriptions</span>) et <strong>Messages</strong>. Le
        reste ne nourrit pas ton dossier.
      </>
    ),
    shot: '/guide/07-abonnements-messages.png',
  },
  {
    titre: 'Coche tout dans Connexions',
    corps: (
      <>
        Plus bas, dans <strong>Connexions</strong>, coche <strong>Contacts</strong> et{' '}
        <strong>Abonné(e)s et suivi(e)s</strong> (<span className={s.orig}>Followers and following</span>). Laisse{' '}
        <strong>Informations personnelles</strong> décoché.
      </>
    ),
    shot: '/guide/08-connexions.png',
  },
  {
    titre: 'Format : JSON, sans exception',
    corps: (
      <>
        <span className={s.alerte}>La seule chose à ne surtout pas rater.</span> Choisis{' '}
        <strong>JSON</strong>, jamais HTML. En HTML, le site ne peut rien lire de ton fichier.
      </>
    ),
    shot: '/guide/09-format-json.png',
  },
  {
    titre: 'Vérifie, puis lance',
    corps: (
      <>
        Relis le récapitulatif : les catégories cochées, le format <strong>JSON</strong>. Puis
        appuie sur <strong>Créer les fichiers</strong> (<span className={s.orig}>Start export</span>). Instagram
        t’envoie une notification dès que c’est prêt, de quelques minutes à 48 heures.
      </>
    ),
    shot: '/guide/10-recap.png',
  },
];

export default function Guide() {
  return (
    <>
      <Nav page="guide" />
      <Mouvement />

      <main>
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
              <div className={s.stepMain}>
                <div>
                  <h2 className={s.stepH}>{e.titre}</h2>
                  <div className={s.stepD}>{e.corps}</div>
                </div>
                <div className={s.shot}>
                  <Image
                    src={e.shot}
                    alt={e.titre}
                    width={402}
                    height={874}
                    sizes="(max-width: 720px) 60vw, 232px"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* La sortie : on renvoie vers le depot. */}
        <div className={`${s.fin} reveal`}>
          <h2 className={s.finH}>Tes fichiers sont prêts ?</h2>
          <p className={s.finD}>
            Dépose tes ZIP, tous en même temps. Ils sont lus directement dans ton navigateur,
            rien ne sort de ton appareil.
          </p>
          <div className={s.finCta}>
            <BoutonLien href="/wrapped/">Déposer mon fichier</BoutonLien>
          </div>
        </div>
      </div>
      </main>

      <Pied />
    </>
  );
}
