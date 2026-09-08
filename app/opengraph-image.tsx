import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/* Image de partage (og:image). Recree l'affiche du hero (voir
   content/revelations.ts, afficheHero) plutot que d'inventer un visuel a
   part : c'est deja l'exemple choisi pour representer le produit.

   Polices auto-hebergees dans assets/fonts/ (pas next/font, qui ne
   fonctionne pas ici) pour que le build ne depende d'aucun appel reseau. */

export const dynamic = 'force-static';
export const alt = 'Exposed. Ce que tes DMs disent de toi.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const [display, mono] = await Promise.all([
    readFile(join(process.cwd(), 'assets/fonts/BricolageGrotesque-800.ttf')),
    readFile(join(process.cwd(), 'assets/fonts/JetBrainsMono-500.ttf')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#E9BE3C',
          padding: '64px 72px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            width: 640,
            height: 640,
            borderRadius: '50%',
            background: '#141414',
            opacity: 0.94,
            right: -110,
            bottom: -260,
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontFamily: 'JetBrains Mono',
              fontSize: 22,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: '#141414',
            }}
          >
            Chapitre 05 · Records
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Bricolage Grotesque',
              fontWeight: 800,
              fontSize: 56,
              color: '#141414',
              marginTop: 20,
              maxWidth: 760,
            }}
          >
            Ta journée la plus intense
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Bricolage Grotesque',
              fontWeight: 800,
              fontSize: 160,
              lineHeight: 1,
              color: '#141414',
            }}
          >
            2 847
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'JetBrains Mono',
              fontSize: 24,
              color: '#141414',
              marginTop: 16,
              maxWidth: 540,
            }}
          >
            avec @lena.mrt, qui n’est pas dans tes close friends.
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'JetBrains Mono',
              fontSize: 22,
              color: '#141414',
              marginTop: 44,
            }}
          >
            <span style={{ display: 'flex' }}>exp</span>
            <span
              style={{
                display: 'flex',
                width: 13,
                height: 13,
                borderRadius: '50%',
                background: '#E8442A',
                margin: '0 2px',
              }}
            />
            <span style={{ display: 'flex' }}>sed.</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Bricolage Grotesque', data: display, weight: 800, style: 'normal' },
        { name: 'JetBrains Mono', data: mono, weight: 500, style: 'normal' },
      ],
    },
  );
}
