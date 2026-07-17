(function () {
  "use strict";

  var deck = document.querySelector("[data-relationship-deck]");
  if (!deck) return;

  var track = deck.querySelector(".relationship-track");
  var slides = Array.prototype.slice.call(deck.querySelectorAll("[data-relation-id]"));
  var pagination = Array.prototype.slice.call(deck.querySelectorAll(".relationship-pagination a"));
  var mount = deck.querySelector("[data-deck-enhancement]");
  if (!track || !mount || slides.length === 0) return;

  var motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  var activeIndex = 0;
  var pendingIndex = null;
  var settleVersion = 0;

  function createDeckButton(text, ariaLabel) {
    var button = document.createElement("button");
    button.className = "deck-button";
    button.type = "button";
    button.textContent = text;
    button.setAttribute("aria-label", ariaLabel);
    return button;
  }

  var previousButton = createDeckButton("← Vorige", "Vorige klantrelatie");
  var nextButton = createDeckButton("Volgende →", "Volgende klantrelatie");
  var status = document.createElement("p");
  status.className = "deck-status";
  status.setAttribute("aria-live", "polite");
  status.setAttribute("aria-atomic", "true");
  mount.appendChild(previousButton);
  mount.appendChild(nextButton);
  mount.appendChild(status);

  function normalizeIndex(index) {
    return (index + slides.length) % slides.length;
  }

  function commitActive(index) {
    activeIndex = normalizeIndex(index);
    pagination.forEach(function (link, linkIndex) {
      if (linkIndex === activeIndex) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    status.textContent = "Relatie " + (activeIndex + 1) + " van " + slides.length + ": " + slides[activeIndex].getAttribute("data-relation-name");
  }

  function nearestSlideIndex() {
    var nearestIndex = activeIndex;
    var nearestDistance = Infinity;
    slides.forEach(function (slide, index) {
      var distance = Math.abs(slide.offsetLeft - track.scrollLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    return nearestIndex;
  }

  function settleMovement() {
    settleVersion += 1;
    if (pendingIndex !== null) {
      var settledIndex = pendingIndex;
      pendingIndex = null;
      commitActive(settledIndex);
      return;
    }
    var nearestIndex = nearestSlideIndex();
    if (nearestIndex !== activeIndex) commitActive(nearestIndex);
  }

  function scheduleSettle() {
    if (typeof window.requestAnimationFrame !== "function") return;
    var version = ++settleVersion;
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        if (version === settleVersion) settleMovement();
      });
    });
  }

  function moveTo(index) {
    var targetIndex = normalizeIndex(index);
    if (pendingIndex === null && targetIndex === activeIndex) return;
    pendingIndex = targetIndex;
    settleVersion += 1;
    slides[targetIndex].scrollIntoView({
      behavior: motionPreference.matches ? "auto" : "smooth",
      block: "nearest",
      inline: "start"
    });
    if (motionPreference.matches) settleMovement();
  }

  function navigationIndex() {
    return pendingIndex === null ? activeIndex : pendingIndex;
  }

  previousButton.addEventListener("click", function () { moveTo(navigationIndex() - 1); });
  nextButton.addEventListener("click", function () { moveTo(navigationIndex() + 1); });
  pagination.forEach(function (link, index) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      moveTo(index);
    });
  });
  track.addEventListener("keydown", function (event) {
    var nextIndex = null;
    if (event.key === "ArrowLeft") nextIndex = navigationIndex() - 1;
    if (event.key === "ArrowRight") nextIndex = navigationIndex() + 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = slides.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    moveTo(nextIndex);
  });
  track.addEventListener("scroll", scheduleSettle, { passive: true });
  track.addEventListener("scrollend", settleMovement);
  motionPreference.addEventListener("change", function (event) {
    if (event.matches && pendingIndex !== null) {
      slides[pendingIndex].scrollIntoView({ behavior: "auto", block: "nearest", inline: "start" });
      settleMovement();
    }
  });

  commitActive(0);
})();

(function () {
  "use strict";

  if (!document.documentElement || typeof document.querySelectorAll !== "function") return;

  var motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  var root = document.documentElement;
  var gsap = window.gsap;

  function wrapHeadingWords(heading) {
    if (heading.hasAttribute("data-motion-text")) return;
    var wordIndex = 0;
    Array.prototype.slice.call(heading.childNodes).forEach(function (node) {
      if (node.nodeType !== 3 || !node.nodeValue.trim()) return;
      var fragment = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }
        var mask = document.createElement("span");
        var word = document.createElement("span");
        mask.className = "motion-word";
        word.className = "motion-word__inner";
        word.textContent = part;
        word.style.setProperty("--word-index", String(wordIndex));
        mask.appendChild(word);
        fragment.appendChild(mask);
        wordIndex += 1;
      });
      node.replaceWith(fragment);
    });
    heading.setAttribute("data-motion-text", "");
  }

  var headings = Array.prototype.slice.call(document.querySelectorAll("h1, h2, h3, .module-block h4"));
  headings.forEach(wrapHeadingWords);

  var surfaceSelector = [
    "[data-motion-card]",
    ".proof-grid > p",
    ".relationship-card",
    ".journey li",
    ".build-boundary > p",
    ".portal-split > *",
    ".governance-card",
    ".partner-relay li",
    ".guidance-steps li"
  ].join(",");
  var surfaces = Array.prototype.slice.call(document.querySelectorAll(surfaceSelector));
  var directions = [
    { x: -58, y: 12, rotation: -1.2, origin: "0% 50%" },
    { x: 54, y: 18, rotation: 1.1, origin: "100% 50%" },
    { x: 0, y: 48, rotation: 0, origin: "50% 100%" },
    { x: 0, y: 18, rotation: -1.8, origin: "50% 50%" }
  ];
  surfaces.forEach(function (surface, index) {
    var direction = directions[index % directions.length];
    surface.setAttribute("data-motion-surface", "");
    surface.style.setProperty("--motion-origin", direction.origin);
  });

  var heroHeading = document.querySelector("h1");
  var scrollHeadings = headings.filter(function (heading) { return heading !== heroHeading; });
  var revealTargets = scrollHeadings.concat(surfaces);

  function markVisible(targets) {
    targets.forEach(function (target) { target.classList.add("is-inview"); });
  }

  if (!gsap) {
    markVisible(headings.concat(surfaces));
  } else {
    root.classList.add("motion-ready");
    var motionQueries = gsap.matchMedia();

    motionQueries.add("(prefers-reduced-motion: reduce)", function () {
      markVisible(headings.concat(surfaces));
      gsap.set(".motion-word__inner, [data-motion-surface]", {
        autoAlpha: 1,
        x: 0,
        y: 0,
        yPercent: 0,
        rotation: 0,
        skewY: 0,
        scale: 1,
        clearProps: "transform,opacity,visibility,willChange"
      });
    });

    motionQueries.add("(prefers-reduced-motion: no-preference)", function () {
      var revealObserver = null;
      var ambientObserver = null;
      var loadTimeline = null;
      var loadHandler = null;

      function headingWords(heading) {
        return Array.prototype.slice.call(heading.querySelectorAll(".motion-word__inner"));
      }

      function prepareHeading(heading) {
        gsap.set(headingWords(heading), { autoAlpha: 0, yPercent: 112, skewY: 5 });
      }

      function animateHeading(heading) {
        var words = headingWords(heading);
        heading.classList.add("is-inview");
        gsap.set(words, { willChange: "transform,opacity" });
        gsap.to(words, {
          autoAlpha: 1,
          yPercent: 0,
          skewY: 0,
          duration: 0.68,
          ease: "power4.out",
          stagger: 0.034,
          overwrite: "auto",
          clearProps: "transform,opacity,visibility,willChange"
        });
      }

      function prepareSurface(surface) {
        var index = surfaces.indexOf(surface);
        var direction = directions[index % directions.length];
        gsap.set(surface, {
          autoAlpha: 0,
          x: direction.x,
          y: direction.y,
          rotation: direction.rotation,
          scale: 0.975,
          transformOrigin: direction.origin
        });
      }

      function animateSurface(surface) {
        var index = surfaces.indexOf(surface);
        var siblingIndex = surface.parentElement ? Array.prototype.indexOf.call(surface.parentElement.children, surface) : 0;
        surface.classList.add("is-inview");
        gsap.set(surface, { willChange: "transform,opacity" });
        gsap.to(surface, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.52 + (index % 4) * 0.09,
          delay: Math.min(siblingIndex * 0.055, 0.22),
          ease: "power4.out",
          overwrite: "auto",
          clearProps: "transform,opacity,visibility,willChange"
        });
      }

      scrollHeadings.forEach(prepareHeading);
      surfaces.forEach(prepareSurface);

      var heroWords = heroHeading ? headingWords(heroHeading) : [];
      var heroDetails = Array.prototype.slice.call(document.querySelectorAll(".hero__copy > .eyebrow, .hero__copy > p, .hero__copy > .button-row, .hero-stamp"));
      var brandItems = Array.prototype.slice.call(document.querySelectorAll(".brand-home, .brand-stage__top > .button"));
      gsap.set(heroWords, { autoAlpha: 0, yPercent: 112, skewY: 5 });
      gsap.set(heroDetails, { autoAlpha: 0, y: 28 });
      gsap.set(brandItems, { autoAlpha: 0, y: -18 });

      loadHandler = function () {
        loadTimeline = gsap.timeline({
          defaults: { duration: 0.62, ease: "power4.out" },
          onComplete: function () { root.classList.add("motion-loaded"); }
        });
        loadTimeline
          .addLabel("brand", 0)
          .to(brandItems, { autoAlpha: 1, y: 0, stagger: 0.08, clearProps: "transform,opacity,visibility" }, "brand")
          .to(heroWords, { autoAlpha: 1, yPercent: 0, skewY: 0, stagger: 0.045, clearProps: "transform,opacity,visibility" }, "brand+=0.08")
          .to(heroDetails, { autoAlpha: 1, y: 0, stagger: 0.07, clearProps: "transform,opacity,visibility" }, "brand+=0.24");
        if (heroHeading) heroHeading.classList.add("is-inview");
      };

      if (document.readyState === "complete") window.requestAnimationFrame(loadHandler);
      else window.addEventListener("load", loadHandler, { once: true });

      if (typeof window.IntersectionObserver === "function") {
        revealObserver = new window.IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            if (entry.target.hasAttribute("data-motion-text")) animateHeading(entry.target);
            else animateSurface(entry.target);
            revealObserver.unobserve(entry.target);
          });
        }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
        revealTargets.forEach(function (target) { revealObserver.observe(target); });

        var ambientTargets = Array.prototype.slice.call(document.querySelectorAll(
          ".shader-field, .hero-orbit span, .hero-stamp__mark, .relationship-card__media, .platform-zone, .organisation-zone, .contact-zone, .contact-zone__burst"
        ));
        ambientTargets.forEach(function (target) { target.classList.add("ambient-paused"); });
        ambientObserver = new window.IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            entry.target.classList.toggle("ambient-paused", !entry.isIntersecting);
          });
        }, { rootMargin: "180px 0px" });
        ambientTargets.forEach(function (target) { ambientObserver.observe(target); });
      } else {
        scrollHeadings.forEach(animateHeading);
        surfaces.forEach(animateSurface);
      }

      return function () {
        if (revealObserver) revealObserver.disconnect();
        if (ambientObserver) ambientObserver.disconnect();
        if (loadTimeline) loadTimeline.kill();
        if (loadHandler) window.removeEventListener("load", loadHandler);
        Array.prototype.slice.call(document.querySelectorAll(".ambient-paused")).forEach(function (target) {
          target.classList.remove("ambient-paused");
        });
      };
    });
  }

  var header = document.querySelector("[data-sticky-header]");
  var navLinks = header ? Array.prototype.slice.call(header.querySelectorAll('.topic-switcher a[href^="#"]')) : [];
  var scrollTicking = false;

  function syncHeader() {
    scrollTicking = false;
    if (!header) return;
    var maximum = Math.max(1, root.scrollHeight - window.innerHeight);
    var progress = Math.min(1, Math.max(0, window.scrollY / maximum));
    header.style.setProperty("--scroll-progress", progress.toFixed(4));
    header.classList.toggle("is-scrolled", window.scrollY > 12);
    root.style.setProperty("--header-offset", Math.ceil(header.getBoundingClientRect().height + 24) + "px");
  }

  function requestHeaderSync() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(syncHeader);
  }

  if (header) {
    syncHeader();
    window.addEventListener("scroll", requestHeaderSync, { passive: true });
    window.addEventListener("resize", requestHeaderSync, { passive: true });
  }

  if (navLinks.length && typeof window.IntersectionObserver === "function") {
    var sectionObserver = new window.IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "#" + entry.target.id) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { threshold: 0.08, rootMargin: "-22% 0px -62% 0px" });
    navLinks.forEach(function (link) {
      var section = document.querySelector(link.getAttribute("href"));
      if (section) sectionObserver.observe(section);
    });
  }

  function initializeShader() {
    var canvas = document.querySelector("[data-shader-canvas]");
    var hero = document.querySelector(".hero");
    if (!canvas || !hero || typeof canvas.getContext !== "function") return;
    var gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power" });
    if (!gl) return;

    var vertexSource = "attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}";
    var fragmentSource = [
      "precision highp float;",
      "uniform vec2 u_resolution;",
      "uniform vec2 u_pointer;",
      "uniform float u_time;",
      "void main(){",
      "vec2 uv=gl_FragCoord.xy/u_resolution.xy;",
      "float aspect=u_resolution.x/u_resolution.y;",
      "vec2 p=(uv-0.5)*vec2(aspect,1.0);",
      "vec2 m=(u_pointer-0.5)*vec2(aspect,1.0);",
      "float md=max(length(p-m),0.08);",
      "p+=0.025*vec2(sin(p.y*8.0+u_time*0.34),cos(p.x*7.0-u_time*0.28));",
      "p+=0.018*vec2(-p.y,p.x)/md*sin(md*12.0-u_time*0.45);",
      "float mesh=sin((p.x+p.y)*7.0+u_time*0.35)*cos((p.x-p.y)*5.0-u_time*0.24);",
      "float bands=0.5+0.5*sin(p.x*10.0+p.y*4.0+mesh*1.8+u_time*0.3);",
      "float orb=smoothstep(0.8,0.05,length(p-vec2(0.32,0.08)));",
      "vec3 yellow=vec3(1.0,0.8392,0.0078);",
      "vec3 navy=vec3(0.0157,0.1333,0.2667);",
      "vec3 blue=vec3(0.1569,0.4863,0.9216);",
      "vec3 pale=vec3(0.8980,0.9294,0.9725);",
      "vec3 color=mix(yellow,pale,bands*0.58);",
      "color=mix(color,blue,orb*0.38);",
      "color=mix(color,navy,smoothstep(0.78,1.0,bands)*0.24);",
      "gl_FragColor=vec4(color,0.88);",
      "}"
    ].join("");

    function compile(type, source) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    var vertexShader = compile(gl.VERTEX_SHADER, vertexSource);
    var fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return;
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    var position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    var resolution = gl.getUniformLocation(program, "u_resolution");
    var pointerUniform = gl.getUniformLocation(program, "u_pointer");
    var timeUniform = gl.getUniformLocation(program, "u_time");
    var pointer = { x: 0.72, y: 0.28, targetX: 0.72, targetY: 0.28 };
    var frame = 0;
    var running = false;
    var inViewport = true;
    var lastDrawAt = 0;
    var frameInterval = 1000 / 40;
    var startedAt = window.performance && typeof window.performance.now === "function" ? window.performance.now() : 0;

    function resize() {
      var bounds = canvas.getBoundingClientRect();
      var ratioLimit = window.innerWidth < 700 ? 1.25 : 1.5;
      var ratio = Math.min(window.devicePixelRatio || 1, ratioLimit);
      var nextWidth = Math.max(1, Math.round(bounds.width * ratio));
      var nextHeight = Math.max(1, Math.round(bounds.height * ratio));
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
        gl.viewport(0, 0, nextWidth, nextHeight);
      }
    }

    function draw(now) {
      pointer.x += (pointer.targetX - pointer.x) * 0.035;
      pointer.y += (pointer.targetY - pointer.y) * 0.035;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(pointerUniform, pointer.x, pointer.y);
      gl.uniform1f(timeUniform, Math.max(0, now - startedAt) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function loop(now) {
      if (!running) return;
      if (now - lastDrawAt >= frameInterval) {
        lastDrawAt = now;
        draw(now);
      }
      frame = window.requestAnimationFrame(loop);
    }

    function start() {
      if (running || motionPreference.matches || !inViewport || document.hidden) return;
      resize();
      running = true;
      frame = window.requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    }

    hero.addEventListener("pointermove", function (event) {
      if (motionPreference.matches) return;
      var bounds = hero.getBoundingClientRect();
      pointer.targetX = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      pointer.targetY = 1 - Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
    }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
    motionPreference.addEventListener("change", function (event) {
      if (event.matches) {
        stop();
        resize();
        draw(startedAt);
      } else start();
    });
    if (typeof window.ResizeObserver === "function") {
      var resizeObserver = new window.ResizeObserver(resize);
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener("resize", resize, { passive: true });
    }
    if (typeof window.IntersectionObserver === "function") {
      var shaderObserver = new window.IntersectionObserver(function (entries) {
        inViewport = Boolean(entries[0] && entries[0].isIntersecting);
        if (inViewport) start();
        else stop();
      }, { rootMargin: "200px 0px" });
      shaderObserver.observe(hero);
    }
    resize();
    draw(startedAt);
    start();
  }

  initializeShader();
})();
