// ═══════════════════════════════════════════════════════════════════
// Community Landing v2 — JS
// Theme detection, scroll animations, stat counters, horizontal scroll
// ═══════════════════════════════════════════════════════════════════
(function () {
  "use strict";

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.from((c || document).querySelectorAll(s)); }

  // ═══════════════════════════════════════════════════════════════════
  // 1. THEME DETECTION + TOGGLE
  // ═══════════════════════════════════════════════════════════════════
  (function initTheme() {
    var stored = localStorage.getItem("cl-theme");
    if (stored) {
      document.documentElement.setAttribute("data-theme", stored);
    }
  })();

  $$(".cl-theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var isDark;

      if (current) {
        isDark = current === "dark";
      } else {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }

      var next = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("cl-theme", next);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 2. RANDOM HERO IMAGE
  // ═══════════════════════════════════════════════════════════════════
  (function initHeroImage() {
    var container = $(".cl-hero__image[data-hero-images]");
    if (!container) return;
    try {
      var images = JSON.parse(container.getAttribute("data-hero-images"));
      if (!images || images.length < 2) return;
      var img = $(".cl-hero__image-img", container);
      if (!img) return;
      var pick = images[Math.floor(Math.random() * images.length)];
      img.style.opacity = "0";
      img.src = pick;
      img.onload = function () { img.style.opacity = ""; img.classList.add("loaded"); };
      img.onerror = function () { img.src = images[0]; img.style.opacity = ""; img.classList.add("loaded"); };
    } catch (e) { /* invalid JSON, keep default first image */ }
  })();

  // ═══════════════════════════════════════════════════════════════════
  // 3. NAVBAR SCROLL
  // ═══════════════════════════════════════════════════════════════════
  var navbar = $("#cl-navbar");
  if (navbar) {
    var onScroll = function () {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var hamburger = $("#cl-hamburger");
  var navLinks = $("#cl-nav-links");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("open");
    });
    $$("a, button", navLinks).forEach(function (el) {
      el.addEventListener("click", function () {
        hamburger.classList.remove("active");
        navLinks.classList.remove("open");
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // 4. SCROLL REVEAL ANIMATIONS
  // ═══════════════════════════════════════════════════════════════════
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    $$(".cl-reveal").forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // 5. STAT COUNTER ANIMATION
  // ═══════════════════════════════════════════════════════════════════
  function formatNumber(n) { return n.toLocaleString("en-US"); }

  function animateCount(el) {
    if (el.classList.contains("counted")) return;
    el.classList.add("counted");
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target) || target === 0) { el.textContent = "0"; return; }

    var duration = 1800;
    var start = null;
    function ease(t) { return 1 - Math.pow(1 - t, 4); }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = formatNumber(Math.floor(target * ease(p)));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNumber(target);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var statsObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          $$("[data-count]", e.target).forEach(animateCount);
          if (e.target.hasAttribute("data-count")) animateCount(e.target);
        }
      });
    }, { threshold: 0.2 });

    var sr = $("#cl-stats-row"); if (sr) statsObs.observe(sr);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 6. HORIZONTAL SCROLL — drag support for trending discussions
  // ═══════════════════════════════════════════════════════════════════
  $$(".cl-topics__scroll").forEach(function (scroll) {
    var isDown = false, startX, scrollLeft;

    scroll.addEventListener("mousedown", function (e) {
      isDown = true;
      scroll.style.cursor = "grabbing";
      startX = e.pageX - scroll.offsetLeft;
      scrollLeft = scroll.scrollLeft;
    });
    scroll.addEventListener("mouseleave", function () {
      isDown = false;
      scroll.style.cursor = "";
    });
    scroll.addEventListener("mouseup", function () {
      isDown = false;
      scroll.style.cursor = "";
    });
    scroll.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - scroll.offsetLeft;
      var walk = (x - startX) * 1.5;
      scroll.scrollLeft = scrollLeft - walk;
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // 7. APP BADGE DETECTION
  // ═══════════════════════════════════════════════════════════════════
  var ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/.test(ua)) $$(".cl-app-badge--ios").forEach(function (e) { e.classList.add("highlighted"); });
  else if (/Android/.test(ua)) $$(".cl-app-badge--android").forEach(function (e) { e.classList.add("highlighted"); });

})();
