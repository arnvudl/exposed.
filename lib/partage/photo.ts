/* ============================================================
   PHOTO  /  import d'une photo personnelle, jamais envoyee nulle part
   Voir docs/CARTES_PERSONNALISABLES.md §7. La photo est lue en local,
   sous-echantillonnee tout de suite (une photo de telephone moderne
   depasse souvent 4000 px de large, inutile de garder cette resolution
   pour un canvas de 1080 px), et jamais persistee.
   ============================================================ */

const LARGEUR_MAX = 1080;

export async function chargerPhoto(fichier: File): Promise<ImageBitmap> {
  const brut = await createImageBitmap(fichier);
  if (brut.width <= LARGEUR_MAX) return brut;

  const ratio = LARGEUR_MAX / brut.width;
  const reduit = await createImageBitmap(brut, {
    resizeWidth: LARGEUR_MAX,
    resizeHeight: Math.round(brut.height * ratio),
    resizeQuality: 'high',
  });
  brut.close();
  return reduit;
}
