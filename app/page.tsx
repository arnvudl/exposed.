import Nav from '@/components/Nav';
import Pied from '@/components/Pied';
import Mouvement from '@/components/Mouvement';
import Affiche from '@/components/Affiche';
import { BoutonLien } from '@/components/Bouton';
import RappelIcs from '@/components/RappelIcs';
import { revelations, afficheHero, afficheDossier, types } from '@/content/revelations';
import s from './page.module.css';

type Style = React.CSSProperties;

export default function Accueil() {
  return (
    <>
      <Nav page="accueil" />
      <Mouvement />

      {/* ---------------------------- HERO ----------------------------
          Titre, sous-titre, une action. Pas de bandeau de reassurance,
          pas de tagline sous le bouton. */}
      <header className={s.hero}>
        <div className={s.heroGrid}>
          <div>
            <h1 className="t-xl">Ce que tes DMs<br />disent de toi.</h1>
            <p className={`lede ${s.heroSub}`}>
              Dépose le ZIP que t’envoie Instagram. Tout est lu dans ton navigateur. Rien ne part.
            </p>
            <div className={s.heroCta}>
              <BoutonLien href="/#chemin">Ouvrir mon dossier</BoutonLien>
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
                <h2 className="t-lg reveal">Huit révélations.</h2>
                <p className="lede reveal" style={{ '--d': '80ms', marginTop: '1rem' } as Style}>
                  Une par écran. Tu peux refaire chaque calcul à la main.
                </p>
              </div>
            </div>
            <div className={s.dossierStep}>
              <div>
                <h2 className="t-lg reveal">Rien d’inventé.</h2>
                <p className="lede reveal" style={{ '--d': '80ms', marginTop: '1rem' } as Style}>
                  On compte tes messages et on croise tes listes d’abonnés. C’est de
                  l’arithmétique, rien de plus.
                </p>
              </div>
            </div>
            <div className={s.dossierStep}>
              <div>
                <span className="stamp reveal">Confidentiel</span>
                <h2 className="t-lg reveal" style={{ '--d': '80ms', marginTop: '1.2rem' } as Style}>
                  Et personne d’autre<br />ne le lit.
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
            Les huit pages du dossier.
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

          <div className={s.privacyCols}>
            <div className="reveal">
              <p className={`${s.privacyK} num`}>0</p>
              <p className={s.privacyV}>message envoyé sur internet. Tout se passe sur ta machine.</p>
            </div>
            <div className="reveal" style={{ '--d': '90ms' } as Style}>
              <p className={`${s.privacyK} num`}>0</p>
              <p className={s.privacyV}>compte à créer. Pas de mot de passe, pas d’adresse e-mail.</p>
            </div>
            <div className="reveal" style={{ '--d': '180ms' } as Style}>
              <p className={`${s.privacyK} num`}>1</p>
              <p className={s.privacyV}>fichier à déposer, le tien. Puis tu le refermes.</p>
            </div>
          </div>
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
              <div>
                <h3 className={s.pathH}>Demande ton export</h3>
                <p className={s.pathD}>
                  Dans Instagram : Réglages, Centre de comptes, Tes informations et
                  autorisations, Télécharger tes informations. Choisis le format
                  <strong> JSON</strong>, surtout pas HTML, et la période la plus longue possible.
                </p>
                {/* TODO : capture reelle de l'ecran Instagram, 1200x800. */}
                <p className={s.pathShot}>
                  Capture à insérer : l’écran de demande d’export Instagram, avec le choix JSON entouré.
                </p>
              </div>
            </div>

            <div className={`${s.pathStep} reveal`}>
              <p className={`${s.pathI} num`}>02</p>
              <div>
                <h3 className={s.pathH}>Attends</h3>
                <p className={s.pathD}>
                  Instagram met de quelques minutes à <strong>48 heures</strong> à préparer le
                  fichier, puis t’envoie un lien. Mets-toi un rappel : c’est là que la plupart
                  des gens oublient de revenir.
                </p>
                <p className={s.pathRemind}><RappelIcs /></p>
              </div>
            </div>

            <div className={`${s.pathStep} reveal`}>
              <p className={`${s.pathI} num`}>03</p>
              <div>
                <h3 className={s.pathH}>Dépose le ZIP</h3>
                <p className={s.pathD}>Reviens ici et glisse le fichier. Rien à installer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- LES TYPES ----------------------- */}
      <section className={s.types} id="types">
        <div className="wrap">
          <h2 className="t-lg reveal">Dix types. Le tien est à la dernière page.</h2>
          <p className="lede reveal" style={{ '--d': '80ms', marginTop: '1.2rem' } as Style}>
            Quatre axes le déterminent : qui lance, à combien de gens tu parles, à quelle
            vitesse tu réponds, et la longueur de tes messages.
          </p>
          <ul
            className={`${s.typesFlow} reveal`}
            style={{ '--d': '140ms' } as Style}
            aria-label="Les dix types relationnels"
          >
            {types.map((t, i) => (
              <li
                key={t}
                className={i === 0 ? s.typeMoi : undefined}
                style={{ '--tab': `var(--t${i + 1})` } as Style}
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------- APPEL FINAL ----------------------- */}
      <section className={s.final}>
        <div className="wrap">
          <h2 className="t-xl reveal">Tout est déjà<br />dans tes messages.</h2>
          <div className="reveal" style={{ '--d': '100ms', marginTop: '2.6rem' } as Style}>
            <BoutonLien href="/#chemin" ton="paper">Ouvrir mon dossier</BoutonLien>
          </div>
        </div>
      </section>

      <Pied pub />
    </>
  );
}
