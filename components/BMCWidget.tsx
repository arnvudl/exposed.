'use client';
import { useEffect } from 'react';

export default function BMCWidget() {
  useEffect(() => {
    const s = document.createElement('script');
    // button.prod.min.js plutot que widget.prod.min.js : un clic ouvre
    // buymeacoffee.com dans un nouvel onglet, sans overlay a rendre en place.
    // Le widget (overlay) casse en blanc sur Safari iOS reel (detection
    // d'appareil differente de l'emulation desktop), jamais reproduit ici.
    s.setAttribute('data-name', 'bmc-button');
    s.setAttribute('data-slug', 'arnvudl');
    s.setAttribute('data-color', '#FFDD00');
    s.setAttribute('data-emoji', '☕');
    s.setAttribute('data-font', 'Lato');
    s.setAttribute('data-text', 'Buy me a coffee');
    s.setAttribute('data-outline-color', '#000000');
    s.setAttribute('data-font-color', '#000000');
    s.setAttribute('data-coffee-color', '#ffffff');
    s.src = 'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js';
    // Le widget s'initialise sur l'evenement DOMContentLoaded : deja passe au
    // moment ou ce script est injecte cote client, donc on le redeclenche.
    s.onload = () => {
      const evt = document.createEvent('Event');
      evt.initEvent('DOMContentLoaded', false, false);
      window.dispatchEvent(evt);
    };
    document.head.appendChild(s);
    return () => { if (document.head.contains(s)) document.head.removeChild(s); };
  }, []);
  return null;
}
