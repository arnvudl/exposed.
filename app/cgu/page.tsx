import type { Metadata } from 'next';
import Link from 'next/link';
import PageTexte from '@/components/PageTexte';

export const metadata: Metadata = {
  title: 'Conditions d’utilisation',
  description: 'Les conditions d’utilisation d’Exposed : usage personnel, 15 ans ou plus, résultats sans garantie, cartes qui t’appartiennent.',
};

export default function Cgu() {
  return (
    <PageTexte
      kicker="Conditions d’utilisation"
      titre={<>Les règles<br />du jeu.</>}
      lede="Courtes, parce qu’il n’y a pas grand-chose à régler."
      majLe="6 septembre 2026"
      blocs={[
        {
          titre: 'Le service',
          corps: (
            <p>
              Exposed lit, dans ton navigateur, l’export de tes données Instagram et t’en
              présente une lecture en sept chapitres. C’est gratuit, sans compte, et ça peut
              évoluer ou s’arrêter à tout moment.
            </p>
          ),
        },
        {
          titre: 'Qui peut l’utiliser',
          corps: (
            <ul>
              <li>Tu as <strong>15 ans ou plus</strong>, l’âge de la majorité numérique en France.</li>
              <li>Tu déposes <strong>ton propre export</strong>, pour un usage personnel.</li>
              <li>Tu n’analyses pas l’export de quelqu’un d’autre sans son accord.</li>
            </ul>
          ),
        },
        {
          titre: 'Ce que valent les résultats',
          corps: (
            <>
              <p>
                Les chiffres viennent de ton export, tel qu’Instagram te le fournit. Ils sont
                donnés sans garantie d’exhaustivité ni d’exactitude : un export incomplet donne
                un dossier incomplet, et un compte de mots reste un compte de mots.
              </p>
              <p>
                Le profil de la dernière page est une lecture de tes habitudes, pas un
                diagnostic. Rien ici ne relève de la psychologie.
              </p>
            </>
          ),
        },
        {
          titre: 'Ce que tu partages',
          corps: (
            <p>
              Les cartes générées à partir de ton export t’appartiennent. Si tu les publies,
              tu es responsable de ce qu’elles montrent, y compris des noms d’autres personnes
              qui y figurent.
            </p>
          ),
        },
        {
          titre: 'Responsabilité',
          corps: (
            <p>
              Le service est fourni tel quel. L’éditeur ne peut être tenu responsable d’un
              dommage lié à son utilisation, à une indisponibilité, à une erreur dans les
              résultats, ou à l’usage que tu fais de ces résultats.
            </p>
          ),
        },
        {
          titre: 'Instagram et Meta',
          corps: (
            <p>
              Exposed n’est pas affilié à Instagram ni à Meta. Instagram est une marque de Meta
              Platforms, Inc. L’export de tes données est un droit que Meta te donne ; ce site
              se contente de le lire chez toi.
            </p>
          ),
        },
        {
          titre: 'Droit applicable et contact',
          corps: (
            <p>
              Ces conditions sont soumises au droit français. Pour toute question :{' '}
              <a href="mailto:arnaudleroy20@gmail.com">arnaudleroy20@gmail.com</a>. Voir aussi
              les <Link href="/mentions-legales/">mentions légales</Link> et la page{' '}
              <Link href="/confidentialite/">Confidentialité</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
