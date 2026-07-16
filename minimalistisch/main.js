/* Progressive enhancement: de pagina is volledig bruikbaar zonder dit script. */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  window.gsap.registerPlugin(window.ScrollTrigger);
  var gsap = window.gsap;

  function enter(elements, trigger, stagger) {
    gsap.from(elements, {
      opacity: 0,
      y: 14,
      duration: 0.48,
      stagger: stagger || 0,
      ease: "power2.out",
      immediateRender: false,
      clearProps: "opacity,transform",
      scrollTrigger: {
        trigger: trigger,
        start: "top 88%",
        once: true
      }
    });
  }

  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    enter(el, el, 0);
  });

  document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
    enter(group.querySelectorAll(".module"), group, 0.08);
  });

  var flowPijlen = document.querySelectorAll(".flow__pijl");
  if (flowPijlen.length) {
    gsap.from(flowPijlen, {
      opacity: 0,
      duration: 0.4,
      stagger: 0.2,
      ease: "power1.out",
      immediateRender: false,
      overwrite: "auto",
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
      gsap.to(cta, { y: -2, duration: 0.18, ease: "power1.out", overwrite: "auto" });
    });
    cta.addEventListener("mouseleave", function () {
      gsap.to(cta, { y: 0, duration: 0.18, ease: "power1.out", overwrite: "auto", clearProps: "transform" });
    });
  });
})();
