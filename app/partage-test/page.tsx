'use client';

/* ============================================================
   PAGE DE TEST TEMPORAIRE — etapes 1-5 de docs/CARTES_PERSONNALISABLES.md.
   Verifie le moteur de rendu (six themes, 1 a 3 faits, avec ou sans photo
   personnelle) avant de brancher quoi que ce soit a la vraie interface. A
   supprimer a l'etape 7 (nettoyage), comme app/wrapped-test/ l'a ete pour
   son propre chantier.
   ============================================================ */
import { useEffect, useRef, useState } from 'react';
import { dessinerCarte, LARGEUR, HAUTEUR } from '@/lib/partage/rendu';
import { THEMES } from '@/lib/partage/themes';
import type { Fait } from '@/lib/partage/faits';
import { chargerPhoto } from '@/lib/partage/photo';

const FAITS_TEST: Fait[] = [
  { type: 'atomique', label: 'Chapitre 07 · Ton profil relationnel', chiffre: 'L’Ouvert', note: 'Tu réponds à tout le monde, tu parles à tout le monde.' },
  { type: 'mini-liste', label: 'Chapitre 01 · Ton top 3 contacts', lignes: [{ rang: 1, texte: '@lou · 68 355' }, { rang: 2, texte: '@marco · 41 208' }, { rang: 3, texte: '@nina · 22 940' }] },
  { type: 'paire', label: 'Chapitre 06 · Le premier message', quand: '25 oct. 2020', avec: '@lou', citation: 'lou : « on peut même pas dire »' },
];

export default function PartageTest() {
  const [idTheme, setIdTheme] = useState(THEMES[0].id);
  const [selection, setSelection] = useState<boolean[]>([true, false, false]);
  const [photo, setPhoto] = useState<ImageBitmap | null>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  const faitsChoisis = FAITS_TEST.filter((_, i) => selection[i]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const theme = THEMES.find((t) => t.id === idTheme) ?? THEMES[0];
    dessinerCarte(ctx, theme, faitsChoisis, photo ?? undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idTheme, photo, JSON.stringify(selection)]);

  async function surImportPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setPhoto(await chargerPhoto(fichier));
  }

  function basculer(i: number) {
    setSelection((s) => {
      const n = [...s];
      n[i] = !n[i];
      if (!n.some(Boolean)) n[i] = true; // au moins 1 fait toujours choisi
      return n;
    });
  }

  function telecharger() {
    ref.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exposed-test-${idTheme}-${faitsChoisis.length}faits.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  return (
    <div style={{
      background: '#0D0B0A', minHeight: '100vh', padding: '2rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem',
      fontFamily: 'monospace', color: '#F4F1EC',
    }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setIdTheme(t.id)}
            style={{
              padding: '8px 14px', fontFamily: 'monospace', cursor: 'pointer',
              background: idTheme === t.id ? '#F4F1EC' : 'transparent',
              color: idTheme === t.id ? '#0D0B0A' : '#F4F1EC',
              border: '1px solid #F4F1EC', borderRadius: 4,
            }}
          >
            {t.nom}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {FAITS_TEST.map((f, i) => (
          <button
            key={f.label}
            onClick={() => basculer(i)}
            style={{
              padding: '8px 14px', fontFamily: 'monospace', cursor: 'pointer', fontSize: 12,
              background: selection[i] ? '#5FA85C' : 'transparent',
              color: selection[i] ? '#0D0B0A' : '#F4F1EC',
              border: '1px solid #5FA85C', borderRadius: 4,
            }}
          >
            {selection[i] ? '☑' : '☐'} {f.type} {i + 1}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <label style={{ padding: '8px 14px', border: '1px solid #F4F1EC', borderRadius: 4, cursor: 'pointer' }}>
          Importer une photo
          <input type="file" accept="image/*" onChange={surImportPhoto} style={{ display: 'none' }} />
        </label>
        {photo && (
          <button
            onClick={() => setPhoto(null)}
            style={{ padding: '8px 14px', fontFamily: 'monospace', cursor: 'pointer', border: '1px solid #F4F1EC', borderRadius: 4, background: 'transparent', color: '#F4F1EC' }}
          >
            Retirer la photo
          </button>
        )}
      </div>

      <canvas
        ref={ref}
        width={LARGEUR}
        height={HAUTEUR}
        style={{ width: 270, height: 480, borderRadius: 8 }}
      />
      <button
        onClick={telecharger}
        style={{ padding: '10px 20px', fontFamily: 'monospace', cursor: 'pointer' }}
      >
        Télécharger
      </button>
    </div>
  );
}
