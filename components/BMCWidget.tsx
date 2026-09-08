import styles from './BMCWidget.module.css';

/* Bouton flottant fait maison, pas le script officiel Buy me a coffee :
   cdnjs.buymeacoffee.com est classe comme tracker par la protection
   anti-tracage stricte d'Edge et l'ITP de Safari, qui bloquent le script
   par defaut. Un simple lien n'est jamais bloque au chargement, seulement
   au clic — et a ce moment-la, ouvrir un onglet est toujours autorise. */
export default function BMCWidget() {
  return (
    <a
      className={styles.bouton}
      href="https://buymeacoffee.com/arnvudl"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Buy me a coffee"
    >
      <span aria-hidden="true">☕</span>
    </a>
  );
}
