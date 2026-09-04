import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Pied from '@/components/Pied';
import Mouvement from '@/components/Mouvement';
import s from './faq.module.css';

export const metadata: Metadata = {
  title: 'FAQ. Exposed',
  description:
    'Confidentialité, fonctionnement, compatibilité, légal : les réponses sur Exposed, le Wrapped de tes DMs lu dans ton navigateur.',
};

type Item = { q: string; r: React.ReactNode };
type Section = { index: string; titre: string; id?: string; items: Item[] };

/* Le contenu vit ici, en clair. Chaque reponse tutoie et reste courte : c'est
   une page de reference, pas un argumentaire. La section C (recuperer le
   fichier) n'est pas une liste de questions mais un renvoi vers le guide
   d'export, ou ces questions vivent en entier. */
const sections: Section[] = [
  {
    index: 'A',
    titre: 'Tes données',
    items: [
      {
        q: 'Est-ce que mes messages sont envoyés, lus ou stockés quelque part ?',
        r: 'Non. Tout se passe dans ton navigateur, sur ton appareil. Ton fichier n’est jamais envoyé, on ne le voit pas, et il n’atterrit sur aucun serveur : il n’y en a pas. Personne, nous compris, ne peut lire tes conversations.',
      },
      {
        q: 'Comment je peux le vérifier moi-même ?',
        r: 'Tu n’as pas à nous croire sur parole. Avant de déposer ton fichier, ouvre les outils de ton navigateur (clic droit → Inspecter → onglet Réseau) : tu verras qu’aucune donnée ne part. Tu peux même couper ta connexion, le site marche quand même.',
      },
    ],
  },
  {
    index: 'B',
    titre: 'Comment ça marche',
    items: [
      {
        q: 'Comment le site analyse mes messages ?',
        r: 'Ton export Instagram, c’est juste des fichiers texte qui listent tes messages. Le site les lit et fait des comptes : qui t’écrit le plus, à quelle heure, combien de fois, avec quels mots.',
      },
      {
        q: 'Est-ce que c’est de l’intelligence artificielle ?',
        r: 'Non. Pas d’IA, pas d’algorithme mystérieux. C’est de l’arithmétique : on compte, on trie, on classe. Tu pourrais refaire les mêmes calculs à la main, ça prendrait juste très longtemps.',
      },
      {
        q: 'Est-ce que les résultats sont fiables ?',
        r: 'Oui, dans la limite de ce qu’Instagram te donne. Les chiffres viennent directement de ton export officiel. Si une conversation manque dans ton fichier, elle manquera dans ton dossier : on ne peut compter que ce qui est là.',
      },
      {
        q: 'Pourquoi il faut déposer un fichier et pas juste mon pseudo ?',
        r: 'Parce qu’avec juste ton pseudo, on n’aurait accès à rien, et c’est tant mieux. Tes messages t’appartiennent, Instagram te les donne à toi. Le fichier, c’est ta copie, que tu gardes en main du début à la fin.',
      },
      {
        q: 'J’ai reçu plusieurs fichiers ZIP, lesquels je dépose ?',
        r: 'Tous. Quand ton export est volumineux, Instagram le découpe en plusieurs ZIP (part 1, part 2…). Dépose-les tous ensemble, sans les décompresser : le site les recombine tout seul.',
      },
    ],
  },
  {
    index: 'F',
    titre: 'Compatibilité',
    items: [
      {
        q: 'Quels navigateurs et appareils sont supportés ?',
        r: 'Les navigateurs récents : Chrome, Safari, Firefox, Edge, sur ordinateur comme sur téléphone, iPhone compris. Sur mobile, un très gros fichier peut être lourd à charger ; si ça coince, essaie depuis un ordi.',
      },
      {
        q: 'Rien ne s’affiche après le dépôt, pourquoi ?',
        r: 'Deux causes classiques : le fichier est en HTML au lieu de JSON, ou ce n’est pas le bon ZIP. Vérifie que tu as bien demandé l’export en JSON. Si ça bloque encore, recharge la page et redépose le fichier.',
      },
    ],
  },
  {
    index: 'G',
    titre: 'Le projet',
    id: 'soutenir',
    items: [
      {
        q: 'Comment je peux soutenir le projet ?',
        r: (
          <>
            Exposed est gratuit et le restera. Si tu veux aider : tu peux m’offrir un café{' '}
            [lien Buy me a coffee à ajouter], ou juste en parler autour de toi. Pour un
            partenariat ou du sponsoring, écris-moi [contact à ajouter].
          </>
        ),
      },
      {
        q: 'Qui est derrière Exposed ?',
        r: 'Une personne, pas une boîte. Au départ, j’avais juste envie de voir à qui je parle le plus sur Instagram, alors j’ai poussé l’analyse aussi loin que je pouvais.',
      },
    ],
  },
  {
    index: 'H',
    titre: 'Légal',
    items: [
      {
        q: 'C’est légal d’analyser mes propres messages ?',
        r: 'Oui. Ce sont tes conversations, Instagram te les fournit officiellement via l’export. Tu as tout à fait le droit de les analyser pour toi.',
      },
      {
        q: 'Et les messages des autres personnes dans mes conversations ?',
        r: 'Une conversation implique forcément d’autres gens, et leurs messages sont dans ton export. Tout reste privé sur ton appareil : rien n’est publié ni partagé sans que tu le décides. Si tu exportes une image, réfléchis à ce que tu montres, et de qui.',
      },
      {
        q: 'Êtes-vous conformes au RGPD ?',
        r: 'Par construction. Le RGPD encadre les données qu’une entreprise collecte ; nous, on ne collecte rien. Tes données ne quittent pas ton appareil : il n’y a rien à déclarer, stocker ou protéger de notre côté.',
      },
    ],
  },
];

export default function Faq() {
  // Le renvoi vers le guide se glisse entre B et F, la ou vivait la section
  // « Récupérer ton fichier ».
  return (
    <>
      <Nav page="faq" />
      <Mouvement />

      <header className={`wrap ${s.tete}`} style={{ paddingTop: 'clamp(3rem, 8vh, 6rem)' }}>
        <p className="kicker">FAQ</p>
        <h1 className="t-xl reveal" style={{ marginTop: '1rem' }}>Les questions<br />qui reviennent.</h1>
        <p className={`lede reveal ${s.teteSub}`} style={{ '--d': '80ms' } as React.CSSProperties}>
          Où vont tes messages, comment le dossier se calcule, ce que dit la loi.
        </p>
      </header>

      {sections.map((sec) => (
        <section key={sec.index} className={s.bloc} id={sec.id}>
          <div className="wrap">
            <div className={s.blocTitre}>
              <span className={s.blocIndex}>{sec.index}</span>
              <h2 className="t-md reveal">{sec.titre}</h2>
            </div>

            <div className={s.liste}>
              {sec.items.map((it) => (
                <details key={it.q} className={`${s.item} reveal`}>
                  <summary className={s.q}>
                    <span>{it.q}</span>
                    <span className={s.signe} aria-hidden="true">+</span>
                  </summary>
                  <p className={s.a}>{it.r}</p>
                </details>
              ))}
            </div>

            {/* Le renvoi vers le guide remplace la liste « récupérer ton fichier ». */}
            {sec.index === 'B' && (
              <div className={`${s.renvoi} reveal`}>
                <p className={s.renvoiTexte}>
                  Récupérer ton fichier, choisir le bon format, gérer les blocages : tout est
                  réuni dans le guide d’export.
                </p>
                <a className={s.renvoiLien} href="/guide/">
                  Voir le guide d’export <span className="fleche" aria-hidden="true">→</span>
                </a>
              </div>
            )}
          </div>
        </section>
      ))}

      <Pied pub />
    </>
  );
}
