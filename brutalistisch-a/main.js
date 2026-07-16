/* Progressive enhancement: de pagina is volledig bruikbaar zonder dit script. */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  window.gsap.registerPlugin(window.ScrollTrigger);
  var gsap = window.gsap;

  var voortgang = document.querySelector(".commandobar__voortgang");
  if (voortgang) {
    gsap.to(voortgang, {
      scaleX: 1,
      ease: "none",
      overwrite: "auto",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    });
  }

  document.querySelectorAll(".sectiecode, .blok__kop").forEach(function (el) {
    gsap.from(el, {
      x: -18,
      duration: 0.35,
      ease: "power2.out",
      immediateRender: false,
      clearProps: "transform",
      overwrite: "auto",
      scrollTrigger: { trigger: el, start: "top 90%", once: true }
    });
  });

  var plaatOffsets = [-18, -12, -6];
  document.querySelectorAll(".platen .plaat").forEach(function (plaat, index) {
    gsap.from(plaat, {
      x: plaatOffsets[index],
      duration: 0.4,
      ease: "power2.out",
      immediateRender: false,
      clearProps: "transform",
      overwrite: "auto",
      scrollTrigger: { trigger: plaat, start: "top 92%", once: true }
    });
  });

  var koppelingen = document.querySelectorAll(".pipeline__koppeling");
  if (koppelingen.length) {
    gsap.from(koppelingen, {
      scale: 0.75,
      duration: 0.25,
      stagger: 0.1,
      ease: "power1.out",
      immediateRender: false,
      clearProps: "transform",
      overwrite: "auto",
      scrollTrigger: { trigger: ".pipeline", start: "top 85%", once: true }
    });
  }

  document.querySelectorAll(".cta").forEach(function (cta) {
    cta.addEventListener("mouseenter", function () {
      gsap.to(cta, { x: -3, y: -3, duration: 0.14, ease: "power1.out", overwrite: "auto" });
    });
    cta.addEventListener("mouseleave", function () {
      gsap.to(cta, { x: 0, y: 0, duration: 0.14, ease: "power1.out", clearProps: "transform", overwrite: "auto" });
    });
  });
})();
