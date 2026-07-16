// Variant Premium — subtiele progressive enhancement met GSAP + ScrollTrigger (CDN).
// De pagina is zonder dit bestand volledig leesbaar en bedienbaar: er wordt uitsluitend
// met kleine transforms gewerkt, nooit met verbergen of doorzichtigheid.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  window.gsap.registerPlugin(window.ScrollTrigger);
  const gsap = window.gsap;

  // Sectiekoppen en modulehoofdstukken schuiven eenmalig maximaal 14px in.
  for (const el of document.querySelectorAll('[data-hoofdstuk]')) {
    gsap.from(el, {
      y: 14,
      duration: 0.6,
      ease: 'power2.out',
      clearProps: 'transform',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  }

  // Decoratieve hairlines bouwen van gedeeltelijke naar volledige breedte op.
  for (const el of document.querySelectorAll('[data-hairline]')) {
    gsap.from(el, {
      scaleX: 0.35,
      duration: 0.8,
      ease: 'power2.out',
      clearProps: 'transform',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  }

  // Decoratieve indexnummers krijgen een zeer kleine scrub-verschuiving.
  for (const el of document.querySelectorAll('[data-index]')) {
    gsap.fromTo(el, { x: -6 }, {
      x: 6,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
    });
  }

  // Korte 2px hover-lift op CTA's; transform wordt daarna opgeruimd.
  for (const el of document.querySelectorAll('.cta')) {
    el.addEventListener('mouseenter', () => gsap.to(el, { y: -2, duration: 0.18, ease: 'power1.out' }));
    el.addEventListener('mouseleave', () => gsap.to(el, { y: 0, duration: 0.18, ease: 'power1.out', clearProps: 'transform' }));
  }
})();
