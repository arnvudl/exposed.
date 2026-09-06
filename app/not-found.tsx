import Nav from '@/components/Nav';
import Pied from '@/components/Pied';
import { BoutonLien } from '@/components/Bouton';

export default function NotFound() {
  return (
    <>
      <Nav />
      <main
        className="wrap"
        style={{
          paddingTop: 'clamp(3rem, 8vh, 6rem)',
          paddingBottom: 'clamp(4rem, 10vh, 7rem)',
          minHeight: 'calc(100dvh - var(--nav))',
        }}
      >
        <p className="kicker">Erreur 404</p>
        <h1 className="t-xl" style={{ marginTop: '1rem' }}>Cette page<br />n’existe pas.</h1>
        <p className="lede" style={{ marginTop: '1.4rem' }}>
          L’adresse est peut-être mal recopiée, ou la page a bougé. Rien n’a été perdu :
          ce site ne garde rien.
        </p>
        <div style={{ marginTop: '2.4rem' }}>
          <BoutonLien href="/">Retour à l’accueil</BoutonLien>
        </div>
      </main>
      <Pied />
    </>
  );
}
