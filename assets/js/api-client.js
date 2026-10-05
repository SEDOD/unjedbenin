/* ============================================================
   UNJED-BENIN — Petit client API partagé (fetch + JSON/FormData)
   Utilisé par : footer newsletter, adhésion, contact,
   actualités, multimédia, administration.
   ============================================================ */
(function () {
  "use strict";

  function apiBase() {
    if (window.UNJED && typeof window.UNJED.apiBase === "function") return window.UNJED.apiBase();
    if (window.UNJED_CONFIG && window.UNJED_CONFIG.API_BASE) return window.UNJED_CONFIG.API_BASE;
    return "https://unjedbenin.onrender.com";
  }

  function request(path, options) {
    options = options || {};
    if (!options.credentials) options.credentials = "include";
    return fetch(apiBase() + path, options).then(function (res) {
      var ct = res.headers.get("content-type") || "";
      if (ct.indexOf("application/json") !== -1) {
        return res.json().then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      }
      return res.text().then(function (text) {
        return { ok: res.ok, status: res.status, data: { raw: text } };
      });
    });
  }

  function postJSON(path, payload) {
    return request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });
  }

  window.UNJED = window.UNJED || {};
  window.UNJED.apiBase = window.UNJED.apiBase || apiBase;
  window.UNJED.api = { request: request, postJSON: postJSON };
})();
