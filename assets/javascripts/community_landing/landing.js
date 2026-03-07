(function () {
  "use strict";

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.from((c || document).querySelectorAll(s)); }

  // ═══════════════════════════════════════════════════════════════════
  // 1. THEME & PROGRESS BAR
  // ═══════════════════════════════════════════════════════════════════
  (function initTheme() {
    var stored = localStorage.getItem("cl-theme");
    if (stored) document.documentElement.setAttribute("data-theme", stored);
  })();

  $$(".cl-theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var isDark = current ? (current === "dark") : window.matchMedia("(prefers-color-scheme: dark)").matches;
      var next = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("cl-theme", next);
    });
  });

  var progressBar = $(".cl-progress-bar");

  // ═══════════════════════════════════════════════════════════════════
  // 2. NAVBAR & SCROLL
  // ═══════════════════════════════════════════════════════════════════
  var navbar = $("#cl-navbar");
  if (navbar) {
    var onScroll = function () {
      var scrolled = window.scrollY;
      navbar.classList.toggle("scrolled", scrolled > 50);

      if (progressBar) {
        var winHeight = document.documentElement.scrollHeight - window.innerHeight;
        var progress = (scrolled / winHeight) * 100;
        progressBar.style.width = progress + "%";
      }
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
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. ENHANCED REVEAL (Staggered)
  // ═══════════════════════════════════════════════════════════════════
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          if (entry.target.classList.contains("cl-stagger")) {
            $$("> *", entry.target).forEach(function (child, i) {
              child.style.transitionDelay = (i * 0.1) + "s";
            });
          }
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    $$(".cl-anim, .cl-stagger").forEach(function (el) { revealObserver.observe(el); });
  }

  // ═══════════════════════════════════════════════════════════════════
  // 4. MOUSE PARALLAX
  // ═══════════════════════════════════════════════════════════════════
  var heroImage = $(".cl-hero__image-img");
  var orbs = $$(".cl-orb");
  var parallaxEnabled = document.documentElement.getAttribute("data-parallax") === "true";

  if (parallaxEnabled && window.innerWidth > 1024) {
    window.addEventListener("mousemove", function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 2;
      var y = (e.clientY / window.innerHeight - 0.5) * 2;

      if (heroImage) {
        heroImage.style.transform = "rotateY(" + (x * 10) + "deg) rotateX(" + (-y * 10) + "deg) translate(" + (x * 20) + "px, " + (y * 20) + "px)";
      }

      orbs.forEach(function (orb, i) {
        var factor = (i + 1) * 15;
        orb.style.transform = "translate(" + (x * factor) + "px, " + (y * factor) + "px)";
      });
    }, { passive: true });
  }

  // ═══════════════════════════════════════════════════════════════════
  // 5. STAT COUNTER
  // ═══════════════════════════════════════════════════════════════════
  function animateCount(el) {
    if (el.classList.contains("counted")) return;
    el.classList.add("counted");
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target) || target === 0) return;

    var duration = 2000;
    var start = null;
    var ease = function (t) { return 1 - Math.pow(1 - t, 4); };

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.floor(target * ease(p)).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var statsObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          $$("[data-count]", e.target).forEach(animateCount);
        }
      });
    }, { threshold: 0.2 });
    var sr = $("#cl-stats-row"); if (sr) statsObs.observe(sr);
  }

})();
