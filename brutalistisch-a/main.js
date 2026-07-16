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
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    });
  }

  document.querySelectorAll(".sectiecode, [data-reveal]").forEach(function (el) {
    gsap.from(el, {
      x: -24,
      duration: 0.4,
      ease: "power2.out",
      clearProps: "transform",
      scrollTrigger: { trigger: el, start: "top 90%", once: true }
    });
  });

  document.querySelectorAll("[data-plaat]").forEach(function (el) {
    gsap.from(el, {
      y: 28,
      duration: 0.45,
      ease: "power2.out",
      clearProps: "transform",
      scrollTrigger: { trigger: el, start: "top 92%", once: true }
    });
  });

  var koppelingen = document.querySelectorAll(".pipeline__koppeling");
  if (koppelingen.length) {
    gsap.from(koppelingen, {
      scale: 0.5,
      duration: 0.3,
      stagger: 0.15,
      ease: "power1.out",
      clearProps: "transform",
      scrollTrigger: { trigger: ".pipeline", start: "top 85%", once: true }
    });
  }

  document.querySelectorAll(".cta").forEach(function (cta) {
    cta.addEventListener("mouseenter", function () {
      gsap.to(cta, { x: -3, y: -3, duration: 0.14, ease: "power1.out" });
    });
    cta.addEventListener("mouseleave", function () {
      gsap.to(cta, { x: 0, y: 0, duration: 0.14, ease: "power1.out", clearProps: "transform" });
    });
  });
})();
