(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  var header = document.querySelector("[data-header]");

  function updateHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 18);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  function closeMenu() {
    if (!navToggle || !nav) return;
    navToggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    if (header) header.classList.remove("menu-open");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
      document.body.classList.toggle("nav-open", !open);
      if (header) header.classList.toggle("menu-open", !open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  var revealElements = document.querySelectorAll("[data-reveal], [data-reveal-group]");
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealElements.forEach(function (element) {
      element.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  }

  var sectionLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  var sections = Array.from(sectionLinks).map(function (link) {
    return document.querySelector(link.getAttribute("href"));
  }).filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(function (link) {
          var current = link.getAttribute("href") === "#" + entry.target.id;
          if (current) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-35% 0px -60% 0px" });

    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  document.querySelectorAll("[data-draw-path]").forEach(function (path) {
    var length = path.getTotalLength();
    path.style.setProperty("--path-length", String(length));
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = String(length);
  });

  if (!reduceMotion.matches && "animate" in Element.prototype) {
    document.querySelectorAll(".button").forEach(function (button) {
      var pressed = false;

      button.addEventListener("pointerdown", function () {
        pressed = true;
        button.animate([
          { transform: "scale(1)" },
          { transform: "scale(0.96)" }
        ], { duration: 110, easing: "ease-in", fill: "forwards" });
      });

      function release() {
        if (!pressed) return;
        pressed = false;
        button.animate([
          { transform: "scale(0.96)" },
          { transform: "scale(1)" }
        ], { duration: 320, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });
      }

      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("pointerleave", release);
    });
  }

  var motionIslands = document.querySelectorAll([
    ".client-proof",
    ".workflow-visual",
    ".layer-map",
    ".trust-principles",
    ".solar-system"
  ].join(","));

  motionIslands.forEach(function (island) {
    island.classList.add("motion-island");
  });

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    motionIslands.forEach(function (island) {
      island.classList.add("is-motion-active");
    });
  } else {
    var motionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-motion-active", entry.isIntersecting);
      });
    }, { rootMargin: "160px 0px", threshold: 0 });

    motionIslands.forEach(function (island) {
      motionObserver.observe(island);
    });
  }

  var solarSystem = document.querySelector("[data-solar-system]");
  if (solarSystem && window.gsap) {
    var orbitMedia = window.gsap.matchMedia();

    orbitMedia.add("(prefers-reduced-motion: no-preference)", function () {
      var orbitTweens = [];
      var orbitTracks = solarSystem.querySelectorAll("[data-orbit]");

      orbitTracks.forEach(function (track) {
        var start = Number(track.getAttribute("data-angle")) || 0;
        var duration = Number(track.getAttribute("data-duration")) || 36;
        var direction = track.getAttribute("data-direction") === "reverse" ? -1 : 1;
        var end = start + (360 * direction);
        var lock = track.querySelector(".planet__lock");

        orbitTweens.push(window.gsap.fromTo(track,
          { rotation: start },
          { rotation: end, duration: duration, ease: "none", repeat: -1 }
        ));

        if (lock) {
          orbitTweens.push(window.gsap.fromTo(lock,
            { rotation: -start },
            { rotation: -end, duration: duration, ease: "none", repeat: -1 }
          ));
        }
      });

      var orbitObserver;
      if ("IntersectionObserver" in window) {
        orbitObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            orbitTweens.forEach(function (tween) {
              tween.paused(!entry.isIntersecting);
            });
          });
        }, { rootMargin: "160px 0px", threshold: 0 });
        orbitObserver.observe(solarSystem);
      }

      return function () {
        if (orbitObserver) orbitObserver.disconnect();
        orbitTweens.forEach(function (tween) { tween.kill(); });
      };
    });
  }

  var canvas = document.querySelector("[data-shader]");
  if (canvas && window.ArtificFlowField) {
    window.ArtificFlowField.mount(canvas, reduceMotion);
  } else if (canvas) {
    canvas.classList.add("is-fallback");
  }
})();
