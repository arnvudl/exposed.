import type { Metadata } from 'next';
import PageTexte from '@/components/PageTexte';

export const metadata: Metadata = {
  title: 'Confidentialité. Exposed',
  description:
    'Ton export Instagram est lu dans ton navigateur et ne quitte jamais ton appareil. Ce que ce site collecte (rien), et comment le vérifier.',
};

export default function Confidentialite() {
  return (
    <PageTexte
      kicker="Confidentialité"
      titre={<>Ce qu’on<br />ne collecte pas.</>}
      lede="Ton export ne quitte jamais ton appareil. Voilà, en détail, ce que ça veut dire."
      majLe="6 septembre 2026"
      blocs={[
        {
          titre: 'Tes messages',
          corps: (
            <>
              <p>
                Le fichier ZIP que tu déposes est ouvert par ton navigateur, sur ton appareil,
                dans un processus isolé (un <em>Web Worker</em>). Il n’est envoyé nulle part :
                ce site est un ensemble de fichiers statiques, il n’a aucun serveur capable de
                recevoir quoi que ce soit.
              </p>
              <p>
                Rien n’est enregistré non plus, ni sur un serveur, ni dans ton navigateur.
                Quand tu fermes l’onglet, ton dossier disparaît. Pour le revoir, tu redéposes
                ton fichier.
              </p>
              <p>
                Nous ne voyons donc ni tes conversations, ni les noms de tes contacts, ni tes
                résultats. Nous ne pouvons pas les voir, et c’est voulu.
              </p>
            </>
          ),
        },
        {
          titre: 'Les autres personnes dans tes conversations',
          corps: (
            <>
              <p>
                Une conversation implique forcément d’autres gens, et leurs messages sont dans
                ton export, exactement comme dans ton application Instagram. Ils restent sur
                ton appareil, au même titre que les tiens.
              </p>
              <p>
                Si tu partages une capture de ton dossier, c’est toi qui choisis ce que tu
                montres, et de qui. Pense aux personnes nommées dessus.
              </p>
            </>
          ),
        },
        {
          titre: 'Comment le vérifier toi-même',
          corps: (
            <>
              <p>
                Tu n’as pas à nous croire sur parole. Avant de déposer ton fichier, ouvre les
                outils de ton navigateur (F12, ou clic droit puis « Inspecter ») et l’onglet
                « Réseau ». Il liste tout ce que la page envoie ou reçoit. Pendant que ton
                dossier se calcule, il reste vide.
              </p>
              <p>
                Tu peux aussi couper ta connexion une fois la page chargée : le site fonctionne
                quand même.
              </p>
            </>
          ),
        },
        {
          titre: 'Ce que ce site traite quand même',
          corps: (
            <>
              <p>
                Comme pour n’importe quel site, l’hébergeur (Vercel) reçoit l’adresse IP de ton
                appareil quand il t’envoie les pages, et peut la garder quelques jours dans ses
                journaux techniques. Ces journaux ne contiennent jamais ton fichier ni son
                contenu : ton fichier ne passe pas par là.
              </p>
              <ul>
                <li>Pas de cookie, pas de traceur, pas de mesure d’audience.</li>
                <li>Pas de publicité, et aucun script tiers sur la page qui lit tes messages.</li>
                <li>Les polices sont hébergées avec le site : aucun appel vers Google Fonts.</li>
                <li>Si tu m’écris par e-mail, ton message est conservé le temps de te répondre.</li>
              </ul>
            </>
          ),
        },
        {
          titre: 'Tes droits',
          corps: (
            <>
              <p>
                Le RGPD te donne un droit d’accès, de rectification et d’effacement sur les
                données qu’un site détient sur toi. Ici, il n’y en a aucune : il n’y a rien à
                consulter, rien à corriger, rien à effacer.
              </p>
              <p>
                Pour toute question, écris à{' '}
                <a href="mailto:arnaudleroy20@gmail.com">arnaudleroy20@gmail.com</a>. Tu peux
                aussi saisir la CNIL.
              </p>
            </>
          ),
        },
        {
          titre: 'Si ça change un jour',
          corps: (
            <p>
              Si le site ajoute un jour une mesure d’audience sans cookie, un lien de don ou un
              sponsor, ce sera écrit ici avant d’être mis en place, et jamais sur la page qui
              lit tes messages.
            </p>
          ),
        },
      ]}
    />
  );
}
