/* Progressive enhancement: de pagina is volledig bruikbaar zonder dit script. */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  window.gsap.registerPlugin(window.ScrollTrigger);
  var gsap = window.gsap;

  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    gsap.from(el, {
      opacity: 0,
      y: 20,
      duration: 0.55,
      ease: "power2.out",
      clearProps: "opacity,transform",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true
      }
    });
  });

  var flowBlokken = document.querySelectorAll(".flow__pijl");
  if (flowBlokken.length) {
    gsap.from(flowBlokken, {
      opacity: 0,
      duration: 0.4,
      stagger: 0.2,
      ease: "power1.out",
      clearProps: "opacity",
      scrollTrigger: {
        trigger: ".flow",
        start: "top 80%",
        once: true
      }
    });
  }

  document.querySelectorAll(".cta").forEach(function (cta) {
    cta.addEventListener("mouseenter", function () {
      gsap.to(cta, { y: -2, duration: 0.18, ease: "power1.out" });
    });
    cta.addEventListener("mouseleave", function () {
      gsap.to(cta, { y: 0, duration: 0.18, ease: "power1.out", clearProps: "transform" });
    });
  });
})();
