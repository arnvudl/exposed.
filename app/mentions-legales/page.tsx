import type { Metadata } from 'next';
import Link from 'next/link';
import PageTexte from '@/components/PageTexte';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Éditeur, hébergeur et contact du site Exposed, le Wrapped de tes DMs Instagram lu dans ton navigateur.',
};

export default function MentionsLegales() {
  return (
    <PageTexte
      kicker="Mentions légales"
      titre={<>Qui est derrière<br />ce site.</>}
      lede="Ce que la loi demande d’afficher, et rien de plus."
      majLe="6 septembre 2026"
      blocs={[
        {
          titre: 'Éditeur',
          corps: (
            <>
              <p>
                Exposed est un site personnel, édité à titre non professionnel par{' '}
                <strong>arnvudl</strong>, qui en est aussi le directeur de la publication.
              </p>
              <p>
                Contact : <a href="mailto:arnaudleroy20@gmail.com">arnaudleroy20@gmail.com</a>.
              </p>
              <p>
                Conformément à l’article 6-III de la loi pour la confiance dans l’économie
                numérique, un éditeur non professionnel peut ne pas publier son identité
                complète, à condition de l’avoir communiquée à son hébergeur. C’est le cas.
              </p>
            </>
          ),
        },
        {
          titre: 'Hébergeur',
          corps: (
            <>
              <p><strong>Vercel Inc.</strong></p>
              <p>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
              <p><a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a></p>
            </>
          ),
        },
        {
          titre: 'Tes données',
          corps: (
            <p>
              Ton export Instagram ne quitte jamais ton appareil et ce site ne collecte rien.
              Tout est détaillé sur la page{' '}
              <Link href="/confidentialite/">Confidentialité</Link>.
            </p>
          ),
        },
        {
          titre: 'Propriété intellectuelle',
          corps: (
            <>
              <p>
                Le nom Exposed, le logo, les textes, la charte graphique et les affiches de ce
                site sont la propriété de leur auteur. Toute reproduction à des fins
                commerciales sans accord est interdite.
              </p>
              <p>
                Les cartes générées à partir de ton export t’appartiennent : tu en fais ce que
                tu veux.
              </p>
            </>
          ),
        },
        {
          titre: 'Instagram et Meta',
          corps: (
            <p>
              Exposed n’est pas affilié à Instagram ni à Meta, et n’est ni approuvé ni
              sponsorisé par eux. Instagram est une marque de Meta Platforms, Inc. Aucun
              élément visuel de Meta n’est utilisé sur ce site.
            </p>
          ),
        },
      ]}
    />
  );
}
