/* Rappel calendrier genere localement : aucune adresse e-mail, aucun serveur.
   Le fichier est construit dans le navigateur et telecharge directement. */
export function telechargerRappel(dansHeures = 24) {
  const d = new Date(Date.now() + dansHeures * 36e5);
  const z = (n: number) => String(n).padStart(2, '0');
  const tampon = (dt: Date) =>
    `${dt.getUTCFullYear()}${z(dt.getUTCMonth() + 1)}${z(dt.getUTCDate())}` +
    `T${z(dt.getUTCHours())}${z(dt.getUTCMinutes())}00Z`;

  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Exposed//FR',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@exposed`,
    `DTSTAMP:${tampon(new Date())}`,
    `DTSTART:${tampon(d)}`,
    `DTEND:${tampon(new Date(d.getTime() + 9e5))}`,
    'SUMMARY:Recuperer mon export Instagram',
    'DESCRIPTION:Ton fichier Instagram devrait etre pret. Reviens sur Exposed pour lire ton dossier.',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'exposed-rappel.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
