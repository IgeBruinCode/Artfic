/* Progressive enhancement: uitsluitend transform-animaties; de pagina is
   volledig leesbaar en bedienbaar zonder dit script. */
(function () {
  "use strict";

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motionQuery.matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var tweens = [];
  var triggers = [];
  var ctaTweens = new Map();

  function selectAll(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  var motionTargets = selectAll(
    ".bewijsrail__item, .module-card, .assurance-matrix__item, [data-verbinding], .cta"
  );
  var navLinks = selectAll(".saas-header__nav a[href^='#']");
  var ctaTargets = selectAll(".cta");

  gsap.registerPlugin(ScrollTrigger);

  function rememberTween(tween) {
    tweens.push(tween);
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  }

  function groupEntrance(targets, fromVars, triggerElement) {
    if (!targets.length || !triggerElement) return;
    rememberTween(gsap.from(targets, Object.assign({}, fromVars, {
      duration: 0.48,
      stagger: 0.1,
      ease: "power2.out",
      immediateRender: false,
      overwrite: "auto",
      clearProps: "transform",
      scrollTrigger: {
        trigger: triggerElement,
        start: "top 86%",
        once: true
      }
    })));
  }

  var bewijsrail = document.querySelector('[data-motion-group="bewijs"]');
  groupEntrance(selectAll(".bewijsrail__item"), { y: 12 }, bewijsrail);

  var modules = document.querySelector('[data-motion-group="modules"]');
  groupEntrance(
    selectAll(".module-card"),
    { x: function (index) { return [-16, 12, -12][index]; } },
    modules
  );

  var assurance = document.querySelector('[data-motion-group="assurance"]');
  groupEntrance(selectAll(".assurance-matrix__item"), { y: 12 }, assurance);

  var verbindingen = selectAll("[data-verbinding]");
  var trustConsole = document.querySelector(".trust-console");
  groupEntrance(verbindingen, { scaleY: 0 }, trustConsole);

  navLinks.forEach(function (link) {
    var doel = document.querySelector(link.getAttribute("href"));
    if (!doel) return;

    triggers.push(ScrollTrigger.create({
      trigger: doel,
      start: "top center",
      end: "bottom center",
      onToggle: function (trigger) {
        if (!trigger.isActive) {
          link.removeAttribute("aria-current");
          return;
        }
        navLinks.forEach(function (navLink) {
          navLink.removeAttribute("aria-current");
        });
        link.setAttribute("aria-current", "location");
      }
    }));
  });

  function handleCtaEnter(event) {
    if (motionQuery.matches) return;
    var cta = event.currentTarget;
    ctaTweens.set(cta, gsap.to(cta, {
      y: -2,
      duration: 0.18,
      ease: "power1.out",
      overwrite: "auto"
    }));
  }

  function handleCtaLeave(event) {
    if (motionQuery.matches) return;
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
    motionTargets.forEach(function (element) {
      element.style.removeProperty("transform");
    });
    navLinks.forEach(function (link) {
      link.removeAttribute("aria-current");
    });
  }

  motionQuery.addEventListener("change", function (event) {
    if (event.matches) stopMotion();
  });
})();
