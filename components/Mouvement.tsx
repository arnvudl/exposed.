'use client';

import { useEffect } from 'react';

/* Tout le mouvement de l'accueil tient ici.

   1. Les entrees passent par IntersectionObserver, une seule fois, jamais en
      sortie, avec un balayage de securite : l'observateur regroupe ses entrees
      quand on saute a une ancre ou qu'on defile tres vite, et des elements
      restent invisibles. `scrollend` n'est pas un ecouteur par image.

   2. Les deux effets lies au scroll sont pilotes par un seul ecouteur `scroll`
      groupe par requestAnimationFrame, qui n'ecrit que des `transform`. C'est
      l'exception assumee de DESIGN.md : `animation-timeline` est plus propre
      sur le papier mais se revele inactif ou fige dans plusieurs contextes
      embarques, sans lever d'erreur, et la page parait morte. */
export default function Mouvement() {
  useEffect(() => {
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    const nettoyage: Array<() => void> = [];

    let io: IntersectionObserver | null = null;
    const montrer = (el: Element) => { el.classList.add('is-in'); io?.unobserve(el); };

    if (reduit || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
    } else {
      io = new IntersectionObserver((entrees) => {
        for (const e of entrees) if (e.isIntersecting) montrer(e.target);
      }, { threshold: .2, rootMargin: '0px 0px -6% 0px' });
      items.forEach((el) => io!.observe(el));

      const balayer = () => {
        for (const el of items) {
          if (el.classList.contains('is-in')) continue;
          if (el.getBoundingClientRect().top < window.innerHeight * 0.94) montrer(el);
        }
      };
      addEventListener('scrollend', balayer, { passive: true });
      addEventListener('load', balayer);
      const surAncre = () => setTimeout(balayer, 120);
      addEventListener('hashchange', surAncre);
      const repli = setTimeout(balayer, 1200); // Safari sans `scrollend`
      nettoyage.push(() => {
        removeEventListener('scrollend', balayer);
        removeEventListener('load', balayer);
        removeEventListener('hashchange', surAncre);
        clearTimeout(repli);
        io?.disconnect();
      });
    }

    if (!reduit) {
      const progression = (el: Element) => {
        const r = el.getBoundingClientRect();
        const course = r.height - window.innerHeight;
        if (course <= 0) return 0;
        return Math.min(1, Math.max(0, -r.top / course));
      };

      const scrubs: Array<() => void> = [];
      const carte = document.querySelector<HTMLElement>('[data-carte]');
      const scene = document.querySelector<HTMLElement>('[data-scene]');
      const rail = document.querySelector<HTMLElement>('[data-rail]');
      const railScene = document.querySelector<HTMLElement>('[data-rail-scene]');
      const railVue = document.querySelector<HTMLElement>('[data-rail-vue]');

      // Sous 700 px l'affiche n'est plus epinglee (cf. page.module.css) : elle
      // sortirait de l'ecran avant de s'etre redressee, et DESIGN.md interdit
      // toute rotation sur mobile. On la laisse droite.
      const etroit = window.matchMedia('(max-width: 699px)');
      if (carte && scene) {
        scrubs.push(() => {
          if (etroit.matches) { carte.style.transform = ''; return; }
          const p = progression(scene);
          carte.style.transform =
            `rotate(${(-3 + 3 * p).toFixed(2)}deg) scale(${(0.94 + 0.06 * p).toFixed(3)})`;
        });
      }

      if (rail && railScene && railVue && getComputedStyle(railVue).position === 'sticky') {
        scrubs.push(() => {
          const p = progression(railScene);
          const course = Math.max(0, rail.scrollWidth - window.innerWidth);
          rail.style.transform = `translateX(${(-course * p).toFixed(1)}px)`;
        });
      }

      if (scrubs.length) {
        let enAttente = false;
        const jouer = () => { enAttente = false; for (const f of scrubs) f(); };
        const demander = () => {
          if (!enAttente) { enAttente = true; requestAnimationFrame(jouer); }
        };
        addEventListener('scroll', demander, { passive: true });
        addEventListener('resize', demander, { passive: true });
        jouer();
        nettoyage.push(() => {
          removeEventListener('scroll', demander);
          removeEventListener('resize', demander);
        });
      }
    }

    return () => nettoyage.forEach((f) => f());
  }, []);

  return null;
}
