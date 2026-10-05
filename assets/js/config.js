/* ============================================================
   UNJED-BENIN — Configuration centrale frontend
   Nouvelle architecture 2026 : un seul point de vérité pour
   l'URL du backend, la langue et le thème. Chargé AVANT
   components.js et script.js sur chaque page :
     <script src="assets/js/config.js"></script>
     <script src="components.js"></script>
     <script src="script.js"></script>
   ============================================================ */
(function () {
  "use strict";

  var PROD_API = "https://unjedbenin.onrender.com";
  var isLocal = /^(localhost|127\.0\.0\.1)/.test(window.location.hostname);
  // En local on peut surcharger via ?api=http://127.0.0.1:5000
  // (schéma http(s) imposé : un ?api=javascript:... ne doit jamais devenir base d'appels).
  var qsApi = null;
  try {
    var q = new URLSearchParams(window.location.search).get("api") || "";
    if (/^https?:\/\//i.test(q)) qsApi = q.replace(/\/+$/, "");
  } catch (e) { /* ignore */ }

  window.UNJED = window.UNJED || {};
  window.UNJED_CONFIG = Object.assign({}, window.UNJED_CONFIG, {
    API_BASE: qsApi || (isLocal ? "http://127.0.0.1:5000" : PROD_API),
    ORG: "UNJED-BENIN",
    DEFAULT_LANG: "fr",
    THEME_KEY: "unjed-theme",
    LANG_KEY: "unjed-lang",
    COOKIE_KEY: "unjed-cookie-ack",
  });
  window.UNJED.apiBase = function () {
    return (window.UNJED_CONFIG && window.UNJED_CONFIG.API_BASE) || PROD_API;
  };
})();
