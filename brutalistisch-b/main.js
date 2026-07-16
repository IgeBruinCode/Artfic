/* Progressive enhancement: de pagina is volledig bruikbaar zonder dit script. */
(function () {
  "use strict";

  var registerLinks = document.querySelectorAll(".register__lijst a[href^='#']");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  window.gsap.registerPlugin(window.ScrollTrigger);
  var gsap = window.gsap;

  // Hoofdstukstatus: markeer in het register uitsluitend de actuele folio.
  registerLinks.forEach(function (link) {
    var doel = document.querySelector(link.getAttribute("href"));
    if (!doel) return;
    window.ScrollTrigger.create({
      trigger: doel,
      start: "top 40%",
      end: "bottom 40%",
      onToggle: function (self) {
        if (self.isActive) {
          registerLinks.forEach(function (ander) {
            ander.removeAttribute("aria-current");
            ander.classList.remove("is-actueel");
          });
          link.setAttribute("aria-current", "location");
          link.classList.add("is-actueel");
        }
      }
    });
  });

  // Decoratieve margewoorden driften hooguit 12px tegen de scrollrichting in.
  document.querySelectorAll("[data-marge]").forEach(function (el) {
    gsap.fromTo(el, { y: 12 }, {
      y: -12,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  // Redactionele regels lopen eenmalig van gedeeltelijke naar volledige breedte.
  document.querySelectorAll("[data-regel]").forEach(function (el) {
    gsap.from(el, {
      scaleX: 0.35,
      duration: 0.5,
      ease: "power2.out",
      clearProps: "transform",
      scrollTrigger: { trigger: el, start: "top 92%", once: true }
    });
  });

  // CTA-hover: korte skewreactie; klik- en focusgedrag hangt hier niet van af.
  document.querySelectorAll(".cta").forEach(function (cta) {
    cta.addEventListener("mouseenter", function () {
      gsap.to(cta, { skewX: -4, duration: 0.12, ease: "power1.out" });
    });
    cta.addEventListener("mouseleave", function () {
      gsap.to(cta, { skewX: 0, duration: 0.12, ease: "power1.out", clearProps: "transform" });
    });
  });
})();
