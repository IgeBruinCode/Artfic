/* Progressive enhancement: de pagina is volledig bruikbaar zonder dit script. */
(function () {
  "use strict";

  var motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motionPreference.matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var registerLinks = document.querySelectorAll(".register__lijst a[href^='#']");
  var ctaTargets = document.querySelectorAll(".cta");
  var motionTargets = document.querySelectorAll(".folio__nummer, [data-marge], [data-regel], .spread__deel, .cta");
  var editorialTweens = [];
  var scrollTriggers = [];

  gsap.registerPlugin(ScrollTrigger);

  function clearRegisterLink(link) {
    link.removeAttribute("aria-current");
    link.classList.remove("is-actueel");
  }

  function addEditorialEnter(target, fromVars, triggerStart) {
    var tween = gsap.from(target, Object.assign({}, fromVars, {
      duration: 0.42,
      ease: "power2.out",
      immediateRender: false,
      overwrite: "auto",
      clearProps: "transform",
      scrollTrigger: {
        trigger: target,
        start: triggerStart || "top 90%",
        once: true
      }
    }));
    editorialTweens.push(tween);
    if (tween.scrollTrigger) scrollTriggers.push(tween.scrollTrigger);
  }

  registerLinks.forEach(function (link) {
    var folio = document.querySelector(link.getAttribute("href"));
    if (!folio) return;

    scrollTriggers.push(ScrollTrigger.create({
      trigger: folio,
      start: "top 40%",
      end: "bottom 40%",
      onToggle: function (trigger) {
        if (!trigger.isActive) return;

        registerLinks.forEach(clearRegisterLink);
        link.setAttribute("aria-current", "location");
        link.classList.add("is-actueel");
      }
    }));
  });

  document.querySelectorAll(".folio__nummer, [data-marge]").forEach(function (label, index) {
    addEditorialEnter(label, { x: index % 2 === 0 ? -16 : 16 });
  });

  document.querySelectorAll("[data-regel]").forEach(function (regel) {
    addEditorialEnter(regel, { scaleX: 0.35 }, "top 92%");
  });

  var spreadOffset = window.innerWidth >= 1040 ? 18 : 8;
  document.querySelectorAll(".spread__deel").forEach(function (deel, index) {
    addEditorialEnter(deel, { x: index === 1 ? spreadOffset : -spreadOffset }, "top 88%");
  });

  function handleCtaEnter(event) {
    if (motionPreference.matches) return;
    gsap.to(event.currentTarget, {
      skewX: -4,
      duration: 0.12,
      ease: "power1.out",
      overwrite: "auto"
    });
  }

  function handleCtaLeave(event) {
    if (motionPreference.matches) return;
    gsap.to(event.currentTarget, {
      skewX: 0,
      duration: 0.12,
      ease: "power1.out",
      overwrite: "auto",
      clearProps: "transform"
    });
  }

  ctaTargets.forEach(function (cta) {
    cta.addEventListener("mouseenter", handleCtaEnter);
    cta.addEventListener("mouseleave", handleCtaLeave);
  });

  function stopMotion() {
    editorialTweens.forEach(function (tween) { tween.kill(); });
    scrollTriggers.forEach(function (scrollTrigger) { scrollTrigger.kill(); });
    gsap.killTweensOf(ctaTargets);
    gsap.set(motionTargets, { clearProps: "transform" });
    registerLinks.forEach(clearRegisterLink);
    editorialTweens.length = 0;
    scrollTriggers.length = 0;
  }

  motionPreference.addEventListener("change", function (event) {
    if (event.matches) stopMotion();
  });
})();
