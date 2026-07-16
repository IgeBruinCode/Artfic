/* Progressive enhancement: de pagina is volledig bruikbaar zonder dit script. */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var registerLinks = document.querySelectorAll(".register__lijst a[href^='#']");

  gsap.registerPlugin(ScrollTrigger);

  registerLinks.forEach(function (link) {
    var folio = document.querySelector(link.getAttribute("href"));
    if (!folio) return;

    ScrollTrigger.create({
      trigger: folio,
      start: "top 40%",
      end: "bottom 40%",
      onToggle: function (trigger) {
        if (!trigger.isActive) return;

        registerLinks.forEach(function (registerLink) {
          registerLink.removeAttribute("aria-current");
          registerLink.classList.remove("is-actueel");
        });
        link.setAttribute("aria-current", "location");
        link.classList.add("is-actueel");
      }
    });
  });

  document.querySelectorAll("[data-marge]").forEach(function (margewoord) {
    gsap.fromTo(margewoord, { y: 12 }, {
      y: -12,
      ease: "none",
      scrollTrigger: { trigger: margewoord, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  document.querySelectorAll("[data-regel]").forEach(function (regel) {
    gsap.from(regel, {
      scaleX: 0.35,
      duration: 0.5,
      ease: "power2.out",
      clearProps: "transform",
      scrollTrigger: { trigger: regel, start: "top 92%", once: true }
    });
  });

  document.querySelectorAll(".cta").forEach(function (cta) {
    cta.addEventListener("mouseenter", function () {
      gsap.to(cta, { skewX: -4, duration: 0.12, ease: "power1.out" });
    });
    cta.addEventListener("mouseleave", function () {
      gsap.to(cta, { skewX: 0, duration: 0.12, ease: "power1.out", clearProps: "transform" });
    });
  });
})();
