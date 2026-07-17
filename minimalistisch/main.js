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
    ".modules-section",
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

  function prepareKineticHeading(heading) {
    var textNodes = [];
    var walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    var node;

    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim()) textNodes.push(node);
    }

    textNodes.forEach(function (textNode) {
      var parts = textNode.nodeValue.split(/(\s+)/);
      var fragment = document.createDocumentFragment();

      parts.forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }

        var word = document.createElement("span");
        var inner = document.createElement("span");
        word.className = "text-word";
        inner.className = "text-word__inner";
        inner.textContent = part;
        word.appendChild(inner);
        fragment.appendChild(word);
      });

      textNode.parentNode.replaceChild(fragment, textNode);
    });
  }

  var kineticHeadings = document.querySelectorAll("[data-kinetic-heading]");
  if (kineticHeadings.length && window.gsap) {
    var textMedia = window.gsap.matchMedia();

    textMedia.add("(prefers-reduced-motion: no-preference)", function () {
      var textObserver;

      kineticHeadings.forEach(function (heading) {
        prepareKineticHeading(heading);
        heading.classList.add("is-animating-heading");
        window.gsap.set(heading.querySelectorAll(".text-word__inner"), { yPercent: 112 });
      });

      function animateHeading(heading) {
        var words = heading.querySelectorAll(".text-word__inner");
        window.gsap.to(words, {
          yPercent: 0,
          duration: 0.78,
          ease: "power3.out",
          stagger: { each: 0.045, from: "start" },
          clearProps: "transform",
          onComplete: function () {
            heading.classList.remove("is-animating-heading");
          }
        });
      }

      if ("IntersectionObserver" in window) {
        textObserver = new IntersectionObserver(function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            animateHeading(entry.target);
            observer.unobserve(entry.target);
          });
        }, { rootMargin: "0px 0px -10% 0px", threshold: 0.18 });

        kineticHeadings.forEach(function (heading) { textObserver.observe(heading); });
      } else {
        kineticHeadings.forEach(animateHeading);
      }

      return function () {
        if (textObserver) textObserver.disconnect();
      };
    });
  }

  function ambientMarkup(type) {
    if (type === "grid") {
      return '<svg viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true"><path class="ambient-grid-line" d="M0 100H1440 M0 260H1440 M0 420H1440 M0 580H1440 M0 740H1440 M180 0V900 M420 0V900 M660 0V900 M900 0V900 M1140 0V900 M1380 0V900" /></svg><span class="ambient-node ambient-node--one"></span><span class="ambient-node ambient-node--two"></span><span class="ambient-node ambient-node--three"></span>';
    }

    if (type === "orbits") {
      return '<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g class="ambient-orbit"><ellipse cx="1110" cy="210" rx="310" ry="170" /><circle cx="1395" cy="165" r="7" /></g><g class="ambient-orbit"><ellipse cx="250" cy="720" rx="360" ry="210" /><circle cx="42" cy="550" r="6" /></g><g class="ambient-orbit"><ellipse cx="800" cy="470" rx="610" ry="350" /></g></svg><span class="ambient-node ambient-node--one"></span><span class="ambient-node ambient-node--two"></span><span class="ambient-node ambient-node--three"></span>';
    }

    return '<svg viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true"><path class="ambient-path" d="M-120 190C240 20 430 360 760 170S1260 40 1560 250" /><path class="ambient-path" d="M-180 610C180 390 480 760 820 530S1280 400 1580 650" /><path class="ambient-path" d="M120 980C340 670 650 770 890 620S1210 470 1500 700" /></svg><span class="ambient-node ambient-node--one"></span><span class="ambient-node ambient-node--two"></span><span class="ambient-node ambient-node--three"></span>';
  }

  var ambientSections = document.querySelectorAll("[data-ambient]");
  ambientSections.forEach(function (section) {
    var type = section.getAttribute("data-ambient") || "paths";
    var scene = document.createElement("div");
    scene.className = "ambient-scene ambient-scene--" + type;
    scene.setAttribute("aria-hidden", "true");
    scene.innerHTML = ambientMarkup(type);
    section.insertBefore(scene, section.firstChild);
  });

  if (ambientSections.length && window.gsap) {
    var ambientMedia = window.gsap.matchMedia();

    ambientMedia.add("(prefers-reduced-motion: no-preference)", function () {
      var ambientObservers = [];
      var ambientTweens = [];

      ambientSections.forEach(function (section) {
        var scene = section.querySelector(".ambient-scene");
        var sceneTweens = [];
        var paths = scene.querySelectorAll(".ambient-path");
        var grid = scene.querySelectorAll(".ambient-grid-line");
        var orbits = scene.querySelectorAll(".ambient-orbit");
        var nodes = scene.querySelectorAll(".ambient-node");

        if (paths.length) {
          sceneTweens.push(window.gsap.to(paths, {
            x: function (index) { return index % 2 ? -34 : 38; },
            y: function (index) { return 18 + (index * 7); },
            duration: 12,
            ease: "sine.inOut",
            stagger: 0.7,
            repeat: -1,
            yoyo: true,
            paused: true
          }));
        }

        if (grid.length) {
          sceneTweens.push(window.gsap.to(grid, {
            x: 24,
            y: 14,
            duration: 16,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            paused: true
          }));
        }

        if (orbits.length) {
          sceneTweens.push(window.gsap.to(orbits, {
            rotation: function (index) { return index % 2 ? -8 : 8; },
            duration: function (index) { return 15 + (index * 4); },
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            paused: true
          }));
        }

        sceneTweens.push(window.gsap.to(nodes, {
          x: function (index) { return 18 + (index * 9); },
          y: function (index) { return index % 2 ? -24 : 28; },
          duration: 9,
          ease: "sine.inOut",
          stagger: 0.8,
          repeat: -1,
          yoyo: true,
          paused: true
        }));

        ambientTweens.push.apply(ambientTweens, sceneTweens);

        if ("IntersectionObserver" in window) {
          var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              sceneTweens.forEach(function (tween) { tween.paused(!entry.isIntersecting); });
            });
          }, { rootMargin: "180px 0px", threshold: 0 });
          observer.observe(section);
          ambientObservers.push(observer);
        } else {
          sceneTweens.forEach(function (tween) { tween.play(); });
        }
      });

      return function () {
        ambientObservers.forEach(function (observer) { observer.disconnect(); });
        ambientTweens.forEach(function (tween) { tween.kill(); });
      };
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
