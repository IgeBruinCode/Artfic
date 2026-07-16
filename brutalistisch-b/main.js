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
  var ownedAnimations = [];

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

  previousButton.addEventListener("click", function () {
    moveTo(navigationIndex() - 1);
  });

  nextButton.addEventListener("click", function () {
    moveTo(navigationIndex() + 1);
  });

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

  function startDecorativeMotion() {
    if (motionPreference.matches) return;

    document.querySelectorAll("[data-motion-card]").forEach(function (card, index) {
      if (typeof card.animate !== "function") return;

      var offset = 10 + (index % 3) * 4;
      var animation = card.animate([
        { transform: "translateY(" + offset + "px) rotate(0.4deg)" },
        { transform: "translateY(0) rotate(0deg)" }
      ], {
        duration: 360 + index * 22,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        fill: "none"
      });
      ownedAnimations.push(animation);
    });
  }

  function stopDecorativeMotion() {
    ownedAnimations.forEach(function (animation) {
      animation.cancel();
    });
    ownedAnimations.length = 0;
  }

  motionPreference.addEventListener("change", function (event) {
    if (!event.matches) {
      startDecorativeMotion();
      return;
    }

    stopDecorativeMotion();
    if (pendingIndex !== null) {
      slides[pendingIndex].scrollIntoView({ behavior: "auto", block: "nearest", inline: "start" });
      settleMovement();
    }
  });

  commitActive(0);
  startDecorativeMotion();
})();
