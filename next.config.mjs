/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export statique : le site est un paquet de fichiers, sans serveur.
  // Aucune route d'API n'est possible, et c'est voulu : rien ne doit pouvoir
  // recevoir un message de l'utilisateur, meme par erreur.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};
export default nextConfig;
