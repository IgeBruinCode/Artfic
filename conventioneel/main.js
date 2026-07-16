/* Progressive enhancement: uitsluitend transform-animaties; de pagina is
   volledig leesbaar en bedienbaar zonder dit script. */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll("[data-reveal]").forEach(function (element) {
    gsap.from(element, {
      y: 16,
      duration: 0.5,
      ease: "power2.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: element,
        start: "top 88%",
        once: true
      }
    });
  });

  var verbindingen = document.querySelectorAll("[data-verbinding]");
  if (verbindingen.length) {
    gsap.from(verbindingen, {
      scaleY: 0,
      duration: 0.45,
      stagger: 0.2,
      ease: "power1.out",
      clearProps: "transform",
      scrollTrigger: {
        trigger: ".trust-console",
        start: "top 85%",
        once: true
      }
    });
  }

  var navLinks = document.querySelectorAll(".saas-header__nav a[href^='#']");
  navLinks.forEach(function (link) {
    var doel = document.querySelector(link.getAttribute("href"));
    if (!doel) return;

    ScrollTrigger.create({
      trigger: doel,
      start: "top center",
      end: "bottom center",
      onToggle: function (trigger) {
        if (!trigger.isActive) {
          if (link.getAttribute("aria-current")) link.removeAttribute("aria-current");
          return;
        }

        navLinks.forEach(function (navLink) {
          navLink.removeAttribute("aria-current");
        });
        link.setAttribute("aria-current", "location");
      }
    });
  });

  document.querySelectorAll(".cta").forEach(function (cta) {
    cta.addEventListener("mouseenter", function () {
      gsap.to(cta, { y: -2, duration: 0.18, ease: "power1.out" });
    });
    cta.addEventListener("mouseleave", function () {
      gsap.to(cta, { y: 0, duration: 0.18, ease: "power1.out", clearProps: "transform" });
    });
  });
})();
