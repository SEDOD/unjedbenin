/* ========================================
   UNJED-BENIN - Header / Footer / Cookies partages
   Injectes dans chaque page via data-include.
   Charge AVANT script.js.
   ======================================== */

(function () {
  "use strict";

  const NAV = [
    { href: "index.html", fr: "Accueil", en: "Home" },
    { href: "presentation.html", fr: "Présentation", en: "About" },
    { href: "projets.html", fr: "Projets &amp; Activités", en: "Projects &amp; Activities" },
    { href: "actualites.html", fr: "Actualités", en: "News" },
    { href: "adhesion.html", fr: "Adhésion", en: "Membership" },
    { href: "partenariats.html", fr: "Partenariats", en: "Partnerships" },
    { href: "multimedia.html", fr: "Multimédia", en: "Media" },
    { href: "contact.html", fr: "Contact", en: "Contact" },
  ];

  const FOOTER_LINKS = [
    { href: "index.html", fr: "Accueil", en: "Home" },
    { href: "presentation.html", fr: "Présentation", en: "About" },
    { href: "projets.html", fr: "Nos Projets &amp; Activités", en: "Our Projects &amp; Activities" },
    { href: "actualites.html", fr: "Actualités", en: "News" },
    { href: "adhesion.html", fr: "Adhésion", en: "Membership" },
    { href: "partenariats.html", fr: "Partenariats", en: "Partnerships" },
    { href: "multimedia.html", fr: "Multimédia", en: "Media" },
    { href: "contact.html", fr: "Contact", en: "Contact" },
    { href: "presentation.html#organigramme", fr: "Notre Équipe &amp; Organigramme Institutionnel", en: "Our Team &amp; Institutional Org Chart" },
  ];

  const SOCIALS = {
    facebook: "https://www.facebook.com/profile.php?id=61586752325666",
    youtube: "https://www.youtube.com/@UNJED-BENIN",
    linkedin: "https://www.linkedin.com/in/ong-unjed-b%C3%A9nin-8ba930408",
    x: "https://x.com/unjedbenin",
    tiktok: "https://tiktok.com/@unjedbenin",
    instagram: "https://instagram.com/unjedbenin",
    whatsapp: "https://whatsapp.com/channel/0029VbBqSIvFcow3caasg82C",
  };

  const ICONS = {
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.4A3 3 0 0 0 .5 6.5 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.1C4.5 20 12 20 12 20s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.5zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.23.8 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.24 2.25h3.31l-7.23 8.26L23 21.75h-6.66l-5.22-6.82-5.97 6.82H1.84l7.73-8.84L1 2.25h6.83l4.71 6.23 5.7-6.23zm-1.16 17.52h1.83L7.01 4.13H5.04l12.04 15.64z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.3v13.04c0 1.5-1.22 2.71-2.72 2.71a2.72 2.72 0 0 1 0-5.43c.28 0 .54.04.79.12V9.9a6.04 6.04 0 0 0-.79-.05A6.02 6.02 0 1 0 15.54 16V9.01a7.55 7.55 0 0 0 4.46 1.43V7.14a4.28 4.28 0 0 1-3.4-1.32z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.52.01-4.76.07-.97.04-1.5.21-1.85.34-.46.18-.8.4-1.15.74-.34.35-.56.69-.74 1.15-.13.35-.3.88-.34 1.85-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.04.97.21 1.5.34 1.85.18.46.4.8.74 1.15.35.34.69.56 1.15.74.35.13.88.3 1.85.34 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.97-.04 1.5-.21 1.85-.34.46-.18.8-.4 1.15-.74.34-.35.56-.69.74-1.15.13-.35.3-.88.34-1.85.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.97-.21-1.5-.34-1.85a3.1 3.1 0 0 0-.74-1.15 3.1 3.1 0 0 0-1.15-.74c-.35-.13-.88-.3-1.85-.34-1.24-.06-1.61-.07-4.76-.07zm0 2.76a5.46 5.46 0 1 1 0 10.92 5.46 5.46 0 0 1 0-10.92zm0 9a3.54 3.54 0 1 0 0-7.08 3.54 3.54 0 0 0 0 7.08zm6.95-9.22a1.28 1.28 0 1 1-2.55 0 1.28 1.28 0 0 1 2.55 0z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35zM12 2a10 10 0 0 0-8.6 15.07L2 22l5.05-1.32A10 10 0 1 0 12 2zm0 18.18a8.16 8.16 0 0 1-4.16-1.14l-.3-.18-3 .79.8-2.92-.19-.3A8.18 8.18 0 1 1 12 20.18z"/></svg>',
  };

  function buildHeader() {
    const links = NAV.map(
      (n) => `<a href="${n.href}" data-en="${n.en}">${n.fr}</a>`
    ).join("");

    // Inject Font Awesome if not already present
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fa = document.createElement('link');
      fa.rel = 'stylesheet';
      fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
      document.head.appendChild(fa);
    }

    return `
    <header class="site-header">
      <div class="flag-strip"><span class="s-green"></span><span class="s-yellow"></span><span class="s-red"></span></div>
      <div class="container header-inner">
        <a href="index.html" class="brand" aria-label="UNJED-BENIN accueil">
          <img src="public/images/logo.jpeg" alt="Logo UNJED-BENIN" />
          <span class="brand-text">
            <span class="brand-name">UNJED-BENIN</span>
            <span class="brand-tagline">Inclusion · Solidarité · Excellence</span>
          </span>
        </a>
        <nav class="main-nav" aria-label="Navigation principale">${links}</nav>
        <div class="header-actions">
          <button class="icon-btn lang-btn" data-lang-toggle type="button" aria-label="Changer de langue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span class="lang-current">FR</span>
          </button>
          <button class="icon-btn" data-theme-toggle type="button" aria-label="Changer le thème">
            <svg class="theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            <svg class="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </button>
          <button class="icon-btn menu-toggle" type="button" aria-label="Ouvrir le menu" aria-expanded="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>
    </header>`;
  }

  function buildFooter() {
    const quick = FOOTER_LINKS.map(
      (n) => `<li><a href="${n.href}" data-en="${n.en}">${n.fr}</a></li>`
    ).join("");

    const socialLinks = Object.keys(SOCIALS)
      .map(
        (key) =>
          `<a href="${SOCIALS[key]}" target="_blank" rel="noopener" aria-label="${key}">${ICONS[key]}</a>`
      )
      .join("");

    return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="footer-brand">
              <img src="public/images/logo.jpeg" alt="Logo UNJED-BENIN" />
              <span class="brand-name">UNJED-BENIN</span>
            </div>
            <p data-en="The National Union of Engaged Youth for the Development of Benin is an apolitical and secular organization dedicated to training, mobilizing and empowering Beninese youth.">
              L'Union Nationale des Jeunes Engagés pour le Développement du Bénin est une organisation apolitique et laïque, dédiée à la formation, la mobilisation et la valorisation de la jeunesse béninoise.
            </p>
            <div class="socials">${socialLinks}</div>
            <form id="footer-subscribe-form" style="margin-top:18px;display:flex;gap:6px;flex-wrap:wrap;">
              <input type="email" id="footer-subscribe-email" required placeholder="Votre email" data-en-placeholder="Your email"
                style="flex:1;min-width:160px;padding:9px 12px;border-radius:8px;border:1px solid var(--border);background:var(--card-bg);color:var(--text);font-size:0.85rem;" />
              <button type="submit" class="btn btn-green" style="padding:9px 14px;font-size:0.85rem;" data-en="Subscribe">S'abonner</button>
            </form>
            <p id="footer-subscribe-msg" style="font-size:0.78rem;margin-top:6px;display:none;"></p>
          </div>
          <div>
            <h4 data-en="Quick links">Liens rapides</h4>
            <ul class="footer-links">${quick}</ul>
          </div>
          <div>
            <h4 data-en="Resources">Ressources</h4>
            <ul class="footer-links">
              <li><a href="presentation.html" data-en="Our history">Notre histoire</a></li>
              <li><a href="multimedia.html" data-en="Documents">Documents</a></li>
              <li><a href="actualites.html" data-en="Press releases">Communiqués</a></li>
              <li><a href="adhesion.html" data-en="Become a member">Devenir membre</a></li>
              <li><a href="jeu.html" data-en="Educational game">Jeu éducatif</a></li>
              <li><a href="administration.html" data-en="Administration">Administration</a></li>
            </ul>
          </div>
          <div>
            <h4 data-en="Contact">Contact</h4>
            <ul class="footer-contact">
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>Zogbadjè, Abomey-Calavi, Bénin</span></li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span><a href="https://wa.me/229160752129" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;">(+229) 01 60 75 21 29</a><br><a href="https://wa.me/229160137141" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;">(+229) 01 60 13 71 41</a></span></li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span>unjedbenin@gmail.com</span></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">
          © <span id="year"></span> <strong>UNJED-BENIN</strong> — <span data-en="Inclusion, Solidarity, Excellence. All rights reserved.">Inclusion, Solidarité, Excellence. Tous droits réservés.</span>
        </div>
      </div>
    </footer>`;
  }

  function buildCookie() {
    return `
    <div class="cookie-banner" role="dialog" aria-label="Information cookies">
      <p data-en="<strong>Cookies.</strong> This site uses cookies to improve your experience and analyze traffic. By continuing to browse, you accept their use."><strong>Cookies.</strong> Ce site utilise des cookies pour améliorer votre expérience et analyser le trafic. En poursuivant votre navigation, vous acceptez leur utilisation.</p>
      <div class="cookie-actions">
        <button class="btn btn-red" data-cookie-close type="button" data-en="Refuse">Refuser</button>
        <button class="btn btn-green" data-cookie-close type="button" data-en="Accept">Accepter</button>
      </div>
    </div>`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const headerMount = document.querySelector("[data-header]");
    const footerMount = document.querySelector("[data-footer]");
    if (headerMount) headerMount.outerHTML = buildHeader();
    if (footerMount) footerMount.outerHTML = buildFooter();
    document.body.insertAdjacentHTML("beforeend", buildCookie());

    // Populate any [data-social] container (e.g. contact page)
    document.querySelectorAll("[data-social]").forEach((el) => {
      el.innerHTML = Object.keys(SOCIALS)
        .map(
          (key) =>
            `<a href="${SOCIALS[key]}" target="_blank" rel="noopener" aria-label="${key}">${ICONS[key]}</a>`
        )
        .join("");
    });

    const yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();

    // Formulaire d'abonnement (footer) -> appelle le backend

    const SUBSCRIBE_API_BASE = "https://VOTRE-USERNAME.pythonanywhere.com";
    const subForm = document.getElementById("footer-subscribe-form");
    if (subForm) {
      subForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailInput = document.getElementById("footer-subscribe-email");
        const msg = document.getElementById("footer-subscribe-msg");
        fetch(SUBSCRIBE_API_BASE + "/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput.value.trim() }),
        })
          .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
          .then(({ ok, data }) => {
            msg.style.display = "block";
            if (ok) {
              msg.style.color = "var(--green)";
              msg.textContent = data.already ? "Vous êtes déjà abonné." : "Merci, votre abonnement est confirmé !";
              subForm.reset();
            } else {
              msg.style.color = "#C0392B";
              msg.textContent = data.error || "Une erreur est survenue.";
            }
          })
          .catch(() => {
            msg.style.display = "block";
            msg.style.color = "#C0392B";
            msg.textContent = "Impossible de joindre le serveur pour le moment.";
          });
      });
    }
  });
})();
