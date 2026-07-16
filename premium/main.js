/* Progressive enhancement: uitsluitend korte transform-entrees; de statische
   HTML en CSS blijven zonder dit script volledig zichtbaar en bedienbaar. */
(function () {
  "use strict";

  var motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motionPreference.matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var tweens = [];
  var triggers = [];
  var ctaTweens = new Map();

  function selectAll(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  var headings = selectAll("[data-motion-heading]");
  var hairlines = selectAll("[data-hairline]");
  var ctaTargets = selectAll(".cta");
  var cleanupTargets = new Set(ctaTargets);

  gsap.registerPlugin(ScrollTrigger);

  function rememberTween(tween) {
    tweens.push(tween);
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  }

  function groupEntrance(targets, fromVars, triggerElement, start) {
    if (!targets.length || !triggerElement) return;
    targets.forEach(function (target) { cleanupTargets.add(target); });
    rememberTween(gsap.from(targets, Object.assign({}, fromVars, {
      duration: 0.48,
      stagger: 0.08,
      ease: "power2.out",
      immediateRender: false,
      overwrite: "auto",
      clearProps: "transform",
      scrollTrigger: {
        trigger: triggerElement,
        start: start || "top 88%",
        once: true
      }
    })));
  }

  headings.forEach(function (heading) {
    groupEntrance([heading], { y: 12 }, heading);
  });

  [
    { name: "evidence", selector: ".evidence-index__regel", from: { y: 10 } },
    {
      name: "maturity",
      selector: ".maturity-track__fase",
      from: { x: function (index) { return [-14, 0, 14][index]; } }
    },
    {
      name: "controle",
      selector: ".controle-architectuur__laag",
      from: { x: function (index) { return [-14, 0, 14][index]; } }
    },
    {
      name: "modules",
      selector: ".module-sequence__hoofdstuk",
      from: { x: function (index) { return [-16, 0, 16][index]; } }
    },
    { name: "assurance", selector: ".assurance-ledger__item", from: { y: 10 } }
  ].forEach(function (group) {
    groupEntrance(
      selectAll(group.selector),
      group.from,
      document.querySelector('[data-motion-group="' + group.name + '"]')
    );
  });

  hairlines.forEach(function (hairline) {
    groupEntrance([hairline], { scaleX: 0.35 }, hairline, "top 92%");
  });

  function handleCtaEnter(event) {
    if (motionPreference.matches) return;
    var cta = event.currentTarget;
    ctaTweens.set(cta, gsap.to(cta, {
      y: -2,
      duration: 0.18,
      ease: "power1.out",
      overwrite: "auto"
    }));
  }

  function handleCtaLeave(event) {
    if (motionPreference.matches) return;
    var cta = event.currentTarget;
    ctaTweens.set(cta, gsap.to(cta, {
      y: 0,
      duration: 0.18,
      ease: "power1.out",
      overwrite: "auto",
      clearProps: "transform"
    }));
  }

  ctaTargets.forEach(function (cta) {
    cta.addEventListener("mouseenter", handleCtaEnter);
    cta.addEventListener("mouseleave", handleCtaLeave);
  });

  function stopMotion() {
    tweens.forEach(function (tween) { tween.kill(); });
    triggers.forEach(function (trigger) { trigger.kill(); });
    ctaTweens.forEach(function (tween) { tween.kill(); });
    ctaTweens.clear();
    cleanupTargets.forEach(function (element) {
      element.style.removeProperty("transform");
    });
  }

  motionPreference.addEventListener("change", function (event) {
    if (event.matches) stopMotion();
  });
})();
