'use client';
import { useEffect } from 'react';

export default function BMCWidget() {
  useEffect(() => {
    const s = document.createElement('script');
    s.setAttribute('data-name', 'BMC-Widget');
    s.setAttribute('data-cfasync', 'false');
    s.setAttribute('data-id', 'arnvudl');
    s.setAttribute('data-description', 'Support me on Buy me a coffee!');
    s.setAttribute('data-message', "J'espère que t'aime le site. Si tu veux me soutenir");
    s.setAttribute('data-color', '#FF813F');
    s.setAttribute('data-position', 'Right');
    s.setAttribute('data-x_margin', '18');
    s.setAttribute('data-y_margin', '18');
    s.src = 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js';
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
