/* Progressive enhancement: de pagina is volledig bruikbaar zonder dit script. */
(function () {
  "use strict";

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var motionTargetSelector = ".commandobar__voortgang, .sectiecode, .blok__kop, .hero__woord, .hero__tekst > *, .hero__specs, .tekstblok, .platen .plaat, .pipeline__station, .pipeline__koppeling, .vragen .vraag, .fasen li, .welniet__vak, .specsheet__rij, .stappen li, .signaalstrook, .twenteplaat, .twenteplaat__code, .twenteplaat__stempel, .stem, .cta";
  var gsap;
  var animations = [];

  function track(animation) {
    animations.push(animation);
    return animation;
  }

  function stopMotion() {
    if (!gsap) return;
    animations.forEach(function (animation) {
      if (animation.scrollTrigger) animation.scrollTrigger.kill();
      animation.kill();
    });
    animations.length = 0;

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
    track(gsap.to(voortgang, {
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

  var heroTimeline = gsap.timeline({ defaults: { ease: "power4.out", overwrite: "auto" } });
  heroTimeline
    .from(".hero__woord", {
      yPercent: 125,
      rotation: function (index) { return index % 2 ? 7 : -7; },
      scale: 0.72,
      duration: 0.78,
      stagger: 0.075,
      immediateRender: false,
      clearProps: "transform"
    }, 0)
    .from(".hero__tekst > *", {
      x: -42,
      skewX: -5,
      duration: 0.52,
      stagger: 0.08,
      immediateRender: false,
      clearProps: "transform"
    }, 0.22)
    .from(".hero__specs", {
      x: 46,
      rotation: 4,
      scale: 0.9,
      duration: 0.65,
      immediateRender: false,
      clearProps: "transform"
    }, 0.18)
    .from(".commandticker", {
      xPercent: -105,
      rotation: -5,
      duration: 0.72,
      immediateRender: false,
      clearProps: "transform"
    }, 0.48);
  track(heroTimeline);

  document.querySelectorAll(".sectiecode, .blok__kop").forEach(function (el) {
    var revealTimeline = gsap.timeline({
      defaults: { overwrite: "auto" },
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
    revealTimeline.from(el, {
      x: -54,
      rotation: -2,
      duration: 0.5,
      ease: "power3.out",
      immediateRender: false,
      clearProps: "transform"
    });
    var accentWords = el.querySelectorAll(".tekstblok");
    if (accentWords.length) {
      revealTimeline.from(accentWords, {
        yPercent: 80,
        rotation: 6,
        scale: 0.8,
        duration: 0.42,
        stagger: 0.08,
        ease: "back.out(1.7)",
        immediateRender: false,
        clearProps: "transform"
      }, "<0.08");
    }
    track(revealTimeline);
  });

  var plaatOffsets = [-72, 72, -72];
  document.querySelectorAll(".platen .plaat").forEach(function (plaat, index) {
    track(gsap.from(plaat, {
      x: plaatOffsets[index],
      rotation: index % 2 ? 3 : -3,
      scale: 0.92,
      duration: 0.72,
      ease: "back.out(1.35)",
      immediateRender: false,
      clearProps: "transform",
      overwrite: "auto",
      scrollTrigger: { trigger: plaat, start: "top 88%", once: true }
    }));
  });

  var koppelingen = document.querySelectorAll(".pipeline__koppeling");
  if (koppelingen.length) {
    var pipelineTimeline = gsap.timeline({
      scrollTrigger: { trigger: ".pipeline", start: "top 84%", once: true }
    });
    pipelineTimeline
      .from(".pipeline__station", {
        x: function (index) { return index % 2 ? 36 : -36; },
        rotation: function (index) { return index % 2 ? 2 : -2; },
        duration: 0.5,
        stagger: 0.09,
        ease: "power3.out",
        immediateRender: false,
        clearProps: "transform",
        overwrite: "auto"
      })
      .from(koppelingen, {
        scale: 0.25,
        rotation: -45,
        duration: 0.36,
        stagger: 0.1,
        ease: "back.out(2)",
        immediateRender: false,
        clearProps: "transform",
        overwrite: "auto"
      }, "<0.18");
    track(pipelineTimeline);
  }

  document.querySelectorAll(".vragen, .fasen, .welniet, .specsheet, .stappen").forEach(function (groep) {
    var items = groep.querySelectorAll(":scope > *");
    if (!items.length) return;
    track(gsap.from(items, {
      x: function (index) { return index % 2 ? 36 : -36; },
      rotation: function (index) { return index % 2 ? 1.5 : -1.5; },
      duration: 0.46,
      stagger: 0.065,
      ease: "power3.out",
      immediateRender: false,
      clearProps: "transform",
      overwrite: "auto",
      scrollTrigger: { trigger: groep, start: "top 87%", once: true }
    }));
  });

  document.querySelectorAll(".signaalstrook").forEach(function (strook) {
    track(gsap.from(strook, {
      scaleX: 0.2,
      skewX: -8,
      transformOrigin: "left center",
      duration: 0.56,
      ease: "power4.out",
      immediateRender: false,
      clearProps: "transform",
      overwrite: "auto",
      scrollTrigger: { trigger: strook, start: "top 90%", once: true }
    }));
  });

  var twentePlaat = document.querySelector("[data-twenteplaat]");
  if (twentePlaat) {
    var twenteTimeline = gsap.timeline({
      scrollTrigger: { trigger: twentePlaat, start: "top 86%", once: true }
    });
    twenteTimeline
      .from(twentePlaat, {
        x: 84,
        rotation: 3,
        scale: 0.88,
        duration: 0.72,
        ease: "back.out(1.5)",
        immediateRender: false,
        clearProps: "transform",
        overwrite: "auto"
      })
      .from(".twenteplaat__code", {
        rotation: -12,
        scale: 0.7,
        duration: 0.5,
        ease: "back.out(2)",
        immediateRender: false,
        clearProps: "transform",
        overwrite: "auto"
      }, "<0.18")
      .from(".twenteplaat__stempel", {
        rotation: 180,
        scale: 0.25,
        duration: 0.54,
        ease: "back.out(2.4)",
        immediateRender: false,
        clearProps: "transform",
        overwrite: "auto"
      }, "<0.12");
    track(twenteTimeline);
  }

  var stemmenGrid = document.querySelector(".stemmen__grid");
  if (stemmenGrid) {
    track(gsap.from(".stem", {
      x: function (index) { return index % 2 ? 56 : -56; },
      rotation: function (index) { return index % 2 ? 3 : -3; },
      scale: 0.9,
      duration: 0.58,
      stagger: 0.075,
      ease: "back.out(1.3)",
      immediateRender: false,
      clearProps: "transform",
      overwrite: "auto",
      scrollTrigger: { trigger: stemmenGrid, start: "top 88%", once: true }
    }));
  }

  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".plaat, .stem, .twenteplaat").forEach(function (card) {
      var rotateXTo = gsap.quickTo(card, "rotationX", { duration: 0.32, ease: "power3.out" });
      var rotateYTo = gsap.quickTo(card, "rotationY", { duration: 0.32, ease: "power3.out" });
      card.addEventListener("pointermove", function (event) {
        if (motionQuery.matches) return;
        var rect = card.getBoundingClientRect();
        var px = (event.clientX - rect.x) / rect.width - 0.5;
        var py = (event.clientY - rect.y) / rect.height - 0.5;
        rotateXTo(py * -5);
        rotateYTo(px * 5);
      });
      card.addEventListener("pointerleave", function () {
        rotateXTo(0);
        rotateYTo(0);
      });
    });
  }

  document.querySelectorAll(".cta").forEach(function (cta) {
    cta.addEventListener("mouseenter", function () {
      if (motionQuery.matches) return;
      gsap.to(cta, { x: -3, y: -3, rotation: -1, duration: 0.14, ease: "power1.out", overwrite: "auto" });
    });
    cta.addEventListener("mouseleave", function () {
      if (motionQuery.matches) return;
      gsap.to(cta, { x: 0, y: 0, rotation: 0, duration: 0.14, ease: "power1.out", clearProps: "transform", overwrite: "auto" });
    });
  });
})();
