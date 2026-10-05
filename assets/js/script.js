/* ========================================
   UNJED-BENIN - Scripts partages
   Mode sombre, traduction FR/EN, menu mobile,
   cookies, reveal au scroll, formulaires
   ======================================== */

(function () {
  "use strict";

  /* ---------- 1. Mode sombre ---------- */
  const root = document.documentElement;
  const storedTheme = localStorage.getItem("unjed-theme");
  if (storedTheme === "dark") root.setAttribute("data-theme", "dark");

  function toggleTheme() {
    const isDark = root.getAttribute("data-theme") === "dark";
    if (isDark) {
      root.removeAttribute("data-theme");
      localStorage.setItem("unjed-theme", "light");
    } else {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("unjed-theme", "dark");
    }
  }

  /* ---------- 2. Traduction FR / EN ---------- */
  // On stocke le texte FR original dans data-fr au premier passage,
  // puis on remplace par data-en. Les elements traduisibles ont [data-en].
  const storedLang = localStorage.getItem("unjed-lang") || "fr";

  function applyLang(lang) {
    // Textes simples : [data-en] (innerHTML conservé en data-fr au 1er passage)
    document.querySelectorAll("[data-en]").forEach((el) => {
      if (!el.hasAttribute("data-fr")) {
        el.setAttribute("data-fr", el.innerHTML);
      }
      el.innerHTML = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-fr");
    });
    // Blocs HTML riches (ex. hero <h1> avec <br>/<span>) : [data-en-html]
    document.querySelectorAll("[data-en-html]").forEach((el) => {
      if (!el.hasAttribute("data-fr-html")) {
        el.setAttribute("data-fr-html", el.innerHTML);
      }
      var frHtml = el.getAttribute("data-fr-html");
      var enHtml = el.getAttribute("data-en-html");
      el.innerHTML = lang === "en" ? enHtml : frHtml;
    });
    // Cas mixte : data-fr + data-en-html ou data-fr-html seul
    document.querySelectorAll("[data-fr-html]:not([data-en-html])").forEach((el) => {
      if (lang === "fr") el.innerHTML = el.getAttribute("data-fr-html");
    });
    // Attributs traduisibles (placeholder)
    document.querySelectorAll("[data-en-placeholder]").forEach((el) => {
      if (!el.hasAttribute("data-fr-placeholder")) {
        el.setAttribute("data-fr-placeholder", el.getAttribute("placeholder") || "");
      }
      el.setAttribute(
        "placeholder",
        lang === "en" ? el.getAttribute("data-en-placeholder") : el.getAttribute("data-fr-placeholder")
      );
    });
    root.setAttribute("lang", lang);
    localStorage.setItem("unjed-lang", lang);
    document.querySelectorAll(".lang-current").forEach((s) => {
      s.textContent = lang === "en" ? "EN" : "FR";
    });
  }

  function toggleLang() {
    const current = localStorage.getItem("unjed-lang") || "fr";
    applyLang(current === "fr" ? "en" : "fr");
  }

  /* ---------- 3. Menu mobile ---------- */
  /* ---------- Menu mobile : délégation + overlay (insensible à l'ordre d'injection du header) ---------- */
  function getNav() { return document.querySelector(".main-nav"); }
  function getToggle() { return document.querySelector(".menu-toggle"); }

  function openMenu() {
    const nav = getNav(), toggle = getToggle();
    if (!nav) return;
    nav.classList.add("open");
    document.body.classList.add("nav-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Fermer le menu");
    }
    if (!document.querySelector(".nav-overlay")) {
      const ov = document.createElement("button");
      ov.type = "button";
      ov.className = "nav-overlay";
      ov.setAttribute("aria-label", "Fermer le menu");
      ov.setAttribute("tabindex", "-1");
      document.body.appendChild(ov);
    }
  }

  function closeMenu(returnFocus) {
    const nav = getNav(), toggle = getToggle();
    if (nav) nav.classList.remove("open");
    document.body.classList.remove("nav-open");
    const ov = document.querySelector(".nav-overlay");
    if (ov) ov.remove();
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Ouvrir le menu");
      if (returnFocus) toggle.focus();
    }
  }

  function isMenuOpen() {
    const nav = getNav();
    return !!(nav && nav.classList.contains("open"));
  }

  /* ---------- Dropdowns nav : un seul groupe ouvert, clic extérieur ferme ---------- */
  function closeDropdowns() {
    document.querySelectorAll(".nav-group.open").forEach((g) => {
      g.classList.remove("open");
      const t = g.querySelector(".nav-toggle");
      if (t) t.setAttribute("aria-expanded", "false");
    });
  }

  function toggleDropdown(btn) {
    const group = btn.closest(".nav-group");
    if (!group) return;
    const wasOpen = group.classList.contains("open");
    closeDropdowns();
    if (!wasOpen) {
      group.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    }
  }

  function setupMobileMenu() {
    // Un seul écouteur délégué : fonctionne même si le header est injecté après.
    if (setupMobileMenu._done) return;
    setupMobileMenu._done = true;
    document.addEventListener("click", (ev) => {
      if (ev.target.closest(".menu-toggle")) {
        isMenuOpen() ? closeMenu() : openMenu();
        return;
      }
      if (ev.target.closest("[data-close-menu]")) { closeMenu(); return; }
      if (ev.target.closest(".nav-toggle")) {
        toggleDropdown(ev.target.closest(".nav-toggle"));
        return;
      }
      if (!ev.target.closest(".site-header")) closeDropdowns();
      if (ev.target.closest(".nav-overlay")) { closeMenu(); return; }
      const link = ev.target.closest(".main-nav a");
      if (link) { closeDropdowns(); closeMenu(); }
    });
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && isMenuOpen()) closeMenu(true);
      else if (ev.key === "Escape") closeDropdowns();
    });
    // Images cassées : masquées proprement (le fond placeholder prend le relais)
    document.addEventListener("error", (ev) => {
      const t = ev.target;
      if (t && t.tagName === "IMG" && t.matches(".news-img img, .gallery img, .quicklink img, .video-thumb img, .split-img img")) {
        t.style.display = "none";
      }
    }, true);
  }

  /* ---------- Toggles thème/langue : délégation (header injecté en JS) ---------- */
  function setupGlobalToggles() {
    if (setupGlobalToggles._done) return;
    setupGlobalToggles._done = true;
    document.addEventListener("click", (ev) => {
      if (ev.target.closest("[data-theme-toggle]")) toggleTheme();
      else if (ev.target.closest("[data-lang-toggle]")) toggleLang();
    });
  }

  /* ---------- Init différé : rejoue quand le header injecté arrive ---------- */
  function whenHeaderReady(fn) {
    if (document.querySelector(".site-header")) { fn(); return; }
    const obs = new MutationObserver(() => {
      if (document.querySelector(".site-header")) { obs.disconnect(); fn(); }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => obs.disconnect(), 5000);
  }

  function heroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    if (!slides.length) return;
    // A11y : les pastilles deviennent de vrais boutons labellisés
    dots.forEach((dot, i) => {
      dot.setAttribute("type", "button");
      dot.setAttribute("aria-label", "Aller à la slide " + (i + 1));
    });
    // Pause si l'utilisateur préfère réduire les animations
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = 0;
    let timer;
    const show = (idx) => {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    };
    const next = () => show(current + 1);
    const startTimer = () => {
      if (reduceMotion) return; // respecte prefers-reduced-motion
      timer = setInterval(next, 5000);
    };
    startTimer();
    // Fonction propre de navigation : stoppe le minuteur, affiche, relance.
    const goToSlide = (i) => { clearInterval(timer); show(i); startTimer(); };
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goToSlide(i));
    });
    // API publique : changer de slide depuis la console ou un autre script.
    // Ex. : window.UNJED.goToSlide(2)
    window.UNJED = window.UNJED || {};
    window.UNJED.goToSlide = goToSlide;
    // Pause au survol / focus pour la lisibilité
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', () => clearInterval(timer));
      hero.addEventListener('mouseleave', () => { clearInterval(timer); startTimer(); });
    }
  }

  /* ---------- Banniere cookies (choix persistant accept/refuse) ---------- */
  function setupCookies() {
  var COOKIE_KEY = (window.UNJED_CONFIG && window.UNJED_CONFIG.COOKIE_KEY) || "unjed-cookie-ack";
  var CHOICE_KEY = "unjed-cookie-choice";
  function storedChoice() {
    try {
      return localStorage.getItem(CHOICE_KEY) || sessionStorage.getItem(COOKIE_KEY);
    } catch (e) { return null; }
  }
  function remember(value, persistent) {
    try {
      if (persistent) localStorage.setItem(CHOICE_KEY, value);
      else sessionStorage.setItem(COOKIE_KEY, "1");
    } catch (e) { /* stockage indisponible : la bannière reviendra, sans bloquer */ }
  }
  function attachCookie() {
    const banner = document.querySelector(".cookie-banner");
    if (!banner) return false;
    if (storedChoice()) { banner.remove(); return true; }
    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      banner.classList.add("show");
      const accept = banner.querySelector('[data-cookie-choice="accept"]');
      if (accept) accept.focus({ preventScroll: true });
    };
    setTimeout(show, 900);
    banner.querySelectorAll("[data-cookie-choice]").forEach((btn) =>
      btn.addEventListener("click", () => {
        remember(btn.getAttribute("data-cookie-choice") === "accept" ? "accepted" : "refused", true);
        banner.classList.remove("show");
      })
    );
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && banner.classList.contains("show")) {
        remember("dismissed", false); // simple report, redemandé à la prochaine visite
        banner.classList.remove("show");
      }
    });
    return true;
  }
  if (!attachCookie()) {
    const tid = setInterval(() => {
      if (attachCookie()) clearInterval(tid);
    }, 100);
    setTimeout(() => clearInterval(tid), 3000);
  }
}
  /* ---------- 5. Reveal au scroll ---------- */
  function setupReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
  }

  /* ---------- Lien actif : compare les noms de fichiers (robuste aux query/hash) ---------- */
  function setupActiveLink() {
    const fileOf = (url) => (url || "").split("?")[0].split("#")[0].split("/").pop() || "index.html";
    const current = fileOf(window.location.pathname);
    document.querySelectorAll(".main-nav a").forEach((a) => {
      if (fileOf(a.getAttribute("href")) === current) a.classList.add("active");
      else a.classList.remove("active");
    });
    // Parent de sous-menu surligné quand l'un de ses enfants est actif
    document.querySelectorAll(".nav-group").forEach((g) => {
      const hit = Array.from(g.querySelectorAll(".nav-sub a")).some(
        (a) => fileOf(a.getAttribute("href")) === current
      );
      const t = g.querySelector(".nav-toggle");
      if (t) t.classList.toggle("active", hit);
    });
  }

  /* ---------- 7. Voir plus / Voir moins membres ---------- */
  function setupSeeMore() {
    document.querySelectorAll(".member-see-more").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        const expand = document.getElementById(targetId);
        if (!expand) return;
        const isOpen = !expand.hidden;
        if (isOpen) {
          // Fermer
          expand.classList.remove("open");
          setTimeout(() => { expand.hidden = true; }, 350);
          btn.classList.remove("expanded");
          btn.innerHTML = 'Voir plus <span class="see-more-arrow">&#8595;</span>';
          btn.setAttribute("aria-expanded", "false");
        } else {
          // Ouvrir
          expand.hidden = false;
          // forcer reflow
          expand.offsetHeight;
          expand.classList.add("open");
          btn.classList.add("expanded");
          btn.innerHTML = 'Voir moins <span class="see-more-arrow">&#8595;</span>';
          btn.setAttribute("aria-expanded", "true");
          // Scroll doux vers la carte
          const scrollTarget = btn.closest(".member-card") || btn.closest(".see-more-block") || btn;
          scrollTarget.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    });
  }

  /* ---------- Formulaires : backend d'abord, repli Web3Forms ---------- */
  function apiBase() {
    if (window.UNJED && typeof window.UNJED.apiBase === "function") return window.UNJED.apiBase();
    if (window.UNJED_CONFIG && window.UNJED_CONFIG.API_BASE) return window.UNJED_CONFIG.API_BASE;
    return "https://unjedbenin.onrender.com";
  }

  function showSuccess(form, selector) {
    const success =
      (selector && form.querySelector(selector)) ||
      form.querySelector(".form-success") ||
      form.parentElement.querySelector(".form-success");
    if (success) {
      success.hidden = false;
      success.classList.add("show");
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function postJSON(path, payload, timeoutMs) {
    const ctrl = ("AbortController" in window) ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs || 9000) : null;
    return fetch(apiBase() + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined,
    }).then((res) =>
      res.json().then((data) => ({ ok: res.ok, data })).catch(() => ({ ok: res.ok, data: {} }))
    ).finally(() => { if (timer) clearTimeout(timer); });
  }

  // Envoi vers Web3Forms (service tiers déjà présent via access_key dans les pages).
  // Utilisé UNIQUEMENT si le backend est injoignable.
  function postWeb3Forms(form, extra) {
    const data = Object.assign({}, extra);
    new FormData(form).forEach((v, k) => { data[k] = v; });
    return fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  }

  // Newsletters inline (ex. bandeau vert actualités) : backend d'abord, Web3Forms en repli.
  function wireInlineNewsletter(form) {
    const key = form.getAttribute("data-web3form") || "";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = (new FormData(form).get("email") || "").toString().trim();
      const msg = form.querySelector(".form-message");
      const say = (t, ok) => {
        if (msg) {
          msg.textContent = t;
          msg.style.color = ok ? "#ffffff" : "#ffe08a";
        }
      };
      const done = () => {
        showSuccess(form);
        form.reset();
        const ok = form.parentElement.querySelector(".form-success");
        if (ok) { ok.hidden = false; ok.classList.add("show"); }
      };
      if (!email) { say("Veuillez saisir votre adresse email.", false); return; }
      const btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      postJSON("/api/subscribe", { email }).then((r) => {
        if (r.ok) { say("Merci pour votre abonnement !", true); done(); }
        else if (key) {
          postWeb3Forms(form, { access_key: key }).then((w) => {
            if (w && w.success !== false) { say("Merci pour votre abonnement !", true); done(); }
            else say((r.data && r.data.error) || "Inscription impossible.", false);
          }).catch(() => say("Service momentanément indisponible.", false));
        }
        else say((r.data && r.data.error) || "Inscription impossible.", false);
      }).catch(() => {
        if (!key) { say("Service momentanément indisponible.", false); return; }
        postWeb3Forms(form, { access_key: key }).then((w) => {
          if (w && w.success !== false) { say("Merci pour votre abonnement !", true); done(); }
          else say("Service momentanément indisponible.", false);
        }).catch(() => say("Service momentanément indisponible.", false));
      }).finally(() => { if (btn) btn.disabled = false; });
    });
  }

  function wireMembershipForm(form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      if ((fd.get("company") || "").toString().trim()) { form.reset(); return; } // honeypot anti-spam
      const get = (n) => ((fd.get(n) || "").toString().trim());
      const payload = {
        member_type: get("member_type") || "Personne physique",
        fullname: ((get("firstname") + " " + get("lastname")).trim() || get("fullname")),
        email: get("email"),
        phone: get("phone"),
        country: get("country"),
        country_other: get("country_other"),
        dept: get("dept"),
        region: get("region"),
        profile: get("profile"),
        profile_other: get("profile_other"),
        motivation: get("motivation"),
      };
      const btn = form.querySelector('[type="submit"]');
      if (btn) { btn.disabled = true; btn.dataset.busy = "1"; }
      postJSON("/api/adhesion", payload).then((r) => {
        if (r.ok) {
          showSuccess(form);
          form.reset();
        } else {
          // Backend joignable mais refus (validation) : on affiche l'erreur sans tiers.
          const err = (r.data && r.data.error) || "Vérifiez les champs puis réessayez.";
          postWeb3Forms(form).then(() => { showSuccess(form); form.reset(); })
            .catch(() => alert(err));
        }
      }).catch(() => {
        // Backend injoignable (Render en veille / hors-ligne) : repli Web3Forms.
        postWeb3Forms(form).then((w) => {
          if (w && w.success !== false) { showSuccess(form); form.reset(); }
          else alert("Service momentanément indisponible, réessayez plus tard.");
        }).catch(() => alert("Service momentanément indisponible, réessayez plus tard."));
      }).finally(() => { if (btn) { btn.disabled = false; delete btn.dataset.busy; } });
    });
  }

  function wireContactForm(form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      if ((fd.get("company") || "").toString().trim()) { showSuccess(form, "#contact-success"); form.reset(); return; } // honeypot
      const get = (n) => ((fd.get(n) || "").toString().trim());
      const payload = {
        name: get("cname") || get("name"),
        email: get("cemail") || get("email"),
        phone: get("cphone") || get("phone"),
        subject: get("csubject") || get("subject"),
        message: get("cmessage") || get("message"),
      };
      const btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      postJSON("/api/contact", payload).then((r) => {
        if (r.ok) { showSuccess(form, "#contact-success"); form.reset(); }
        else {
          postWeb3Forms(form).then(() => { showSuccess(form, "#contact-success"); form.reset(); })
            .catch(() => alert((r.data && r.data.error) || "Envoi impossible."));
        }
      }).catch(() => {
        postWeb3Forms(form).then((w) => {
          if (w && w.success !== false) { showSuccess(form, "#contact-success"); form.reset(); }
          else alert("Service momentanément indisponible, réessayez plus tard.");
        }).catch(() => alert("Service momentanément indisponible, réessayez plus tard."));
      }).finally(() => { if (btn) btn.disabled = false; });
    });
  }

  function setupForms() {
    const membership = document.getElementById("membership-form");
    if (membership) wireMembershipForm(membership);
    const contact = document.getElementById("contact-form");
    if (contact) wireContactForm(contact);
    document.querySelectorAll("form[data-web3form]").forEach((form) => {
      if (form.id === "membership-form" || form.id === "contact-form") return;
      wireInlineNewsletter(form);
    });
    // Autres formulaires démo (newsletter gérée dans components.js)
    document.querySelectorAll("form[data-demo-form]").forEach((form) => {
      if (form.id === "membership-form" || form.id === "contact-form") return;
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        showSuccess(form);
        form.reset();
      });
    });
    const newsletter = document.getElementById("newsletter-form");
    if (newsletter && !document.getElementById("footer-subscribe-form")) {
      newsletter.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = (new FormData(newsletter).get("email") || "").toString().trim();
        postJSON("/api/subscribe", { email }).then((r) => {
          if (r.ok) { showSuccess(newsletter); newsletter.reset(); }
          else alert((r.data && r.data.error) || "Inscription impossible.");
        }).catch(() => alert("Service momentanément indisponible."));
      });
    }
  }

  /* ---------- Header scrolled state (bordure/ombre uniquement au défilement) ---------- */
  function setupHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Compteurs animés (ex. "Notre impact") ---------- */
  function formatCounter(n) {
    // Séparateur de milliers espace (1 000), stable FR/EN
    return n.toLocaleString("fr-FR").replace(/[\u202F\u00A0]/g, " ");
  }

  function animateCount(el) {
    const target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    const suffix = el.getAttribute("data-suffix") || "";
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) { el.textContent = formatCounter(target) + suffix; return; }
    const duration = 1800;
    let start = null;
    const tick = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); // easeOutExpo
      el.textContent = formatCounter(Math.round(eased * target)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function setupCounters() {
    const els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(animateCount); return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach((el) => obs.observe(el));
  }

  /* ---------- Init ---------- */
  function init() {
    // Anti-FOUC thème : déjà appliqué en <head> via script inline si présent.
    setupGlobalToggles();
    setupMobileMenu();
    heroSlider();
    setupCookies();
    setupReveal();
    setupCounters();
    setupForms();
    setupSeeMore();
    setupHeaderScroll();
    applyLang(storedLang === "en" ? "en" : "fr"); // contenu statique tout de suite
    whenHeaderReady(() => { setupActiveLink(); applyLang(localStorage.getItem("unjed-lang") || "fr"); });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
