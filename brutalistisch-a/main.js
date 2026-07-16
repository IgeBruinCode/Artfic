/* Progressive enhancement: de pagina is volledig bruikbaar zonder dit script. */
(function () {
  "use strict";

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var motionTargetSelector = ".commandobar__voortgang, .sectiecode, .blok__kop, .platen .plaat, .pipeline__koppeling, .cta";
  var gsap;
  var scrollAnimations = [];

  function trackScrollAnimation(animation) {
    scrollAnimations.push(animation);
  }

  function stopMotion() {
    if (!gsap) return;
    scrollAnimations.forEach(function (animation) {
      if (animation.scrollTrigger) animation.scrollTrigger.kill();
      animation.kill();
    });
    scrollAnimations.length = 0;

    var targets = document.querySelectorAll(motionTargetSelector);
    gsap.killTweensOf(targets);
    gsap.set(targets, { clearProps: "transform" });
  }

  motionQuery.addEventListener("change", function (event) {
    if (event.matches) stopMotion();
  });

  if (motionQuery.matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  window.gsap.registerPlugin(window.ScrollTrigger);
  gsap = window.gsap;

  var voortgang = document.querySelector(".commandobar__voortgang");
  if (voortgang) {
    trackScrollAnimation(gsap.to(voortgang, {
      scaleX: 1,
      ease: "none",
      overwrite: "auto",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    }));
  }

  document.querySelectorAll(".sectiecode, .blok__kop").forEach(function (el) {
    trackScrollAnimation(gsap.from(el, {
      x: -18,
      duration: 0.35,
      ease: "power2.out",
      immediateRender: false,
      clearProps: "transform",
      overwrite: "auto",
      scrollTrigger: { trigger: el, start: "top 90%", once: true }
    }));
  });

  var plaatOffsets = [-18, -12, -6];
  document.querySelectorAll(".platen .plaat").forEach(function (plaat, index) {
    trackScrollAnimation(gsap.from(plaat, {
      x: plaatOffsets[index],
      duration: 0.4,
      ease: "power2.out",
      immediateRender: false,
      clearProps: "transform",
      overwrite: "auto",
      scrollTrigger: { trigger: plaat, start: "top 92%", once: true }
    }));
  });

  var koppelingen = document.querySelectorAll(".pipeline__koppeling");
  if (koppelingen.length) {
    trackScrollAnimation(gsap.from(koppelingen, {
      scale: 0.75,
      duration: 0.25,
      stagger: 0.1,
      ease: "power1.out",
      immediateRender: false,
      clearProps: "transform",
      overwrite: "auto",
      scrollTrigger: { trigger: ".pipeline", start: "top 85%", once: true }
    }));
  }

  document.querySelectorAll(".cta").forEach(function (cta) {
    cta.addEventListener("mouseenter", function () {
      if (motionQuery.matches) return;
      gsap.to(cta, { x: -3, y: -3, duration: 0.14, ease: "power1.out", overwrite: "auto" });
    });
    cta.addEventListener("mouseleave", function () {
      if (motionQuery.matches) return;
      gsap.to(cta, { x: 0, y: 0, duration: 0.14, ease: "power1.out", clearProps: "transform", overwrite: "auto" });
    });
  });
})();
