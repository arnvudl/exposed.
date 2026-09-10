import type { Metadata } from 'next';
import Image from 'next/image';
import Nav from '@/components/Nav';
import Pied from '@/components/Pied';
import Mouvement from '@/components/Mouvement';
import Affiche from '@/components/Affiche';
import { BoutonLien } from '@/components/Bouton';
import LienDemo from '@/components/LienDemo';
import RappelIcs from '@/components/RappelIcs';
import ListeProfils from '@/components/ListeProfils';
import { revelations, afficheHero, afficheDossier, profils } from '@/content/revelations';
import s from './page.module.css';

export const metadata: Metadata = {
  title: { absolute: 'Exposed — Analyse tes données Instagram gratuitement' },
  description:
    'Télécharge tes données Instagram et découvre en quelques secondes tes abonnés fantômes, tes conversations les plus actives et ton profil complet. 100 % gratuit, tout se passe dans ton navigateur.',
  alternates: { canonical: 'https://getexposed.me' },
  openGraph: {
    title: 'Exposed — Analyse tes données Instagram',
    description:
      'Abonnés fantômes, conversations les plus actives, ton profil Instagram décortiqué. Gratuit, aucun compte requis.',
    url: 'https://getexposed.me',
  },
};

type Style = React.CSSProperties;

export default function Accueil() {
  return (
    <>
      <Nav page="accueil" />
      <Mouvement />

      <main>
      {/* ---------------------------- HERO ----------------------------
          Titre, sous-titre, une action. Pas de bandeau de reassurance,
          pas de tagline sous le bouton. */}
      <header className={s.hero}>
        <div className={s.heroGrid}>
          <div>
            <h1 className="t-xl">Ce que tes DMs<br />disent de toi.</h1>
            <p className={`lede ${s.heroSub}`}>
              Dépose les fichiers ZIP que t’envoie Instagram, souvent plusieurs. Ton navigateur les lit.
            </p>
            <div className={s.heroCta}>
              <BoutonLien href="/wrapped/">Ouvrir mon dossier</BoutonLien>
              <LienDemo />
            </div>
          </div>

          {/* Un vrai composant produit, pas un faux ecran construit en div. */}
          <div className={s.heroAffiche}>
            <Affiche a={afficheHero} incline />
          </div>
        </div>
      </header>

      {/* -------------------------- DOSSIER --------------------------
          L'affiche epinglee se redresse pendant que les trois phrases defilent. */}
      <section className={s.dossier}>
        <div className={s.dossierStage} data-scene>
          <div>
            <div className={s.dossierStep}>
              <div>
                <h2 className="t-lg reveal">Sept chapitres.</h2>
                <p className="lede reveal" style={{ '--d': '80ms', marginTop: '1rem' } as Style}>
                  Tes dix personnes, tes groupes, tes mots, tes records. Et ton profil à la fin.
                </p>
              </div>
            </div>
            <div className={s.dossierStep}>
              <div>
                <h2 className="t-lg reveal">Rien d’inventé.</h2>
                <p className="lede reveal" style={{ '--d': '80ms', marginTop: '1rem' } as Style}>
                  Tout vient de tes conversations : qui t’écrit, à quelle heure, combien de
                  fois, et avec quels mots.
                </p>
              </div>
            </div>
            <div className={s.dossierStep}>
              <div>
                <h2 className="t-lg reveal">
                  Et tu pourras<br />le partager.
                </h2>
              </div>
            </div>
          </div>

          <aside className={s.dossierAside} aria-hidden="true">
            <div className={s.dossierCarte} data-carte>
              <Affiche a={afficheDossier} />
            </div>
          </aside>
        </div>
      </section>

      {/* ------------------------ RÉVÉLATIONS ------------------------
          Unique micro-libelle en capitales de toute la page. */}
      <section className={s.reveals} aria-labelledby="rev-h">
        <div className={`wrap ${s.revealsHead}`}>
          <p className="kicker">Ce que tu vas lire</p>
          <h2 id="rev-h" className="t-lg reveal" style={{ marginTop: '1rem' }}>
            Les sept chapitres.
          </h2>
        </div>

        <div className={s.revealsStage} data-rail-scene>
          <div className={s.revealsViewport} data-rail-vue>
            <div className={s.revealsTrack} data-rail>
              {revelations.map((r) => (
                <Affiche key={r.piece} a={r} className={s.revealsAffiche} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------- CONFIDENTIALITÉ --------------------- */}
      <section className={s.privacy} id="confidentialite">
        <div className="wrap">
          <p className={`${s.privacyClaim} reveal`}>
            Tes messages ne quittent <em>jamais</em> ton téléphone.
          </p>
          <p className="lede reveal" style={{ '--d': '80ms', marginTop: '1.8rem' } as Style}>
            Ton fichier est ouvert directement par ton navigateur, comme une photo que tu
            regardes sans la publier. Rien n’est envoyé, rien n’est gardé. Tu fermes l’onglet
            et tout a disparu.
          </p>
          {/* Pas de la vertu : la vraie raison, pour qu'on te croie plus
              facilement que sur une simple promesse. */}
          <p className={`${s.privacyPourquoi} reveal`} style={{ '--d': '140ms' } as Style}>
            Et pour être cash : pas par grandeur d’âme. Garder tes données me coûterait{' '}
            <strong className={s.privacyFort}>des serveurs à payer</strong>, et un fichier
            stocké quelque part, c’est <strong className={s.privacyFort}>une responsabilité
            juridique</strong> dont je n’ai aucune envie.{' '}
            <strong className={s.privacyFort}>N’importe qui pourrait me poursuivre</strong> en
            cas de fuite. Ne rien garder, c’est juste le plus simple, pour moi comme pour toi.
          </p>
        </div>
      </section>

      {/* -------------------------- LE CHEMIN ------------------------ */}
      <section className={s.path} id="chemin">
        <div className="wrap">
          <h2 className="t-lg reveal">Il faut d’abord récupérer ton fichier.</h2>
          <p className="lede reveal" style={{ '--d': '80ms', marginTop: '1.2rem' } as Style}>
            Instagram ne te donne pas tes données tout de suite. Ça se fait une fois.
          </p>

          <div className={s.pathSteps}>
            <div className={`${s.pathStep} reveal`}>
              <p className={`${s.pathI} num`}>01</p>
              <div className={s.pathStepMain}>
                <div>
                  <h3 className={s.pathH}>Demande ton export</h3>
                  <p className={s.pathD}>
                    Dans Instagram : Réglages, Centre de comptes, Tes informations et
                    autorisations, Télécharger tes informations. Choisis le format
                    <strong> JSON</strong>, surtout pas HTML, et la période la plus longue possible.
                  </p>
                </div>
                <div className={s.pathShot}>
                  <Image
                    src="/guide/10-recap.png"
                    alt="Écran de demande d'export Instagram, format JSON sélectionné"
                    width={600}
                    height={1304}
                    sizes="(max-width: 640px) 70vw, 440px"
                  />
                </div>
              </div>
            </div>

            <div className={`${s.pathStep} reveal`}>
              <p className={`${s.pathI} num`}>02</p>
              <div>
                <h3 className={s.pathH}>Attends (ouais la partie chiante)</h3>
                <p className={s.pathD}>
                  Instagram met de quelques minutes à <strong>48 heures</strong> à préparer le
                  fichier, puis t’envoie une notification. C’est là que la plupart des gens
                  oublient de revenir.
                </p>
                <div className={s.pathRappel}>
                  <RappelIcs />
                </div>
              </div>
            </div>

            <div className={`${s.pathStep} reveal`}>
              <p className={`${s.pathI} num`}>03</p>
              <div>
                <h3 className={s.pathH}>Dépose tes fichiers</h3>
                <p className={s.pathD}>
                  Reviens ici et glisse tes ZIP. Instagram en envoie souvent plusieurs, dépose-les
                  tous, sans les décompresser. Rien à installer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- LES PROFILS ----------------------- */}
      <section className={s.types} id="profils">
        <div className="wrap">
          <h2 className="t-lg reveal">Dix profils. Le tien est à la dernière page.</h2>
          <p className="lede reveal" style={{ '--d': '80ms', marginTop: '1.2rem' } as Style}>
            Quatre axes le déterminent : qui lance, à combien de gens tu parles, à quelle
            vitesse tu réponds, et la longueur de tes messages.
          </p>
          <ListeProfils profils={profils} />
        </div>
      </section>

      {/* ------------------------- APPEL FINAL ----------------------- */}
      <section className={s.final}>
        <div className="wrap">
          <h2 className="t-xl reveal">Tout est déjà<br />dans tes messages.</h2>
          <div className="reveal" style={{ '--d': '100ms', marginTop: '2.6rem' } as Style}>
            <BoutonLien href="/wrapped/" ton="paper">Ouvrir mon dossier</BoutonLien>
          </div>
        </div>
      </section>
      </main>

      <Pied />
    </>
  );
}
