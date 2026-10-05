/* ========================================
   UNJED-BENIN - Page Administration (back-office)
   Login admin + publications + abonnés via l'API.
   La sécurité est appliquée côté SERVEUR (session) ;
   cette page n'est qu'une interface.
   (extrait de administration.html — logique inchangée)
   ======================================== */
(function () {
  "use strict";

  var API_BASE = (window.UNJED && typeof window.UNJED.apiBase === "function" && window.UNJED.apiBase())
    || (window.UNJED_CONFIG && window.UNJED_CONFIG.API_BASE)
    || "https://unjedbenin.onrender.com";

  var loginPanel = document.getElementById("admin-login");
  var spacePanel = document.getElementById("admin-space");
  var loginForm = document.getElementById("admin-login-form");
  var loginError = document.getElementById("admin-login-error");
  var apiWarning = document.getElementById("admin-api-warning");
  var logoutBtn = document.getElementById("admin-logout");
  var nameLabel = document.getElementById("admin-name-label");
  var postForm = document.getElementById("post-form");
  var postError = document.getElementById("post-error");
  var postsList = document.getElementById("posts-list");
  var subscribersList = document.getElementById("subscribers-list");

  if (API_BASE.indexOf("127.0.0.1") === -1 && API_BASE.indexOf("localhost") === -1) {
    // En production le backend Render peut mettre ~60s à sortir de veille : on prévient.
    apiWarning.style.display = "block";
    apiWarning.textContent = "Connexion au serveur sécurisé… (le premier chargement peut prendre ~1 minute si le serveur sort de veille).";
  }

  function api(path, options) {
    options = options || {};
    options.credentials = "include";
    return fetch(API_BASE + path, options).then(function (res) {
      return res.json().then(function (data) {
        return { ok: res.ok, status: res.status, data: data };
      });
    });
  }

  function showSpace(admin) {
    loginPanel.style.display = "none";
    spacePanel.style.display = "block";
    nameLabel.textContent = admin.display_name;
    loadPosts();
    loadSubscribers();
  }
  function showLogin() {
    loginPanel.style.display = "block";
    spacePanel.style.display = "none";
  }

  // Vérifie si déjà connecté (session cookie)
  api("/api/admin/me").then(function (r) {
    if (r.ok && r.data.admin) showSpace(r.data.admin);
  }).catch(function () { /* backend pas encore joignable, on reste sur le login */ });

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    loginError.style.display = "none";
    var username = document.getElementById("admin-username").value.trim();
    var password = document.getElementById("admin-password").value;
    api("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password }),
    }).then(function (r) {
      if (r.ok) {
        showSpace(r.data.admin);
      } else {
        loginError.textContent = r.data.error || "Connexion impossible.";
        loginError.style.display = "block";
      }
    }).catch(function () {
      loginError.textContent = "Impossible de joindre le serveur d'administration.";
      loginError.style.display = "block";
    });
  });

  logoutBtn.addEventListener("click", function () {
    api("/api/admin/logout", { method: "POST" }).finally(showLogin);
  });

  function postTypeLabel(t) {
    return { announcement: "Annonce", document: "Document", link: "Lien", image: "Image", video: "Vidéo" }[t] || t;
  }

  function renderPosts(posts) {
    postsList.innerHTML = "";
    if (!posts.length) {
      postsList.innerHTML = '<p style="color:var(--text-muted);">Aucune publication pour le moment.</p>';
      return;
    }
    posts.forEach(function (post) {
      var card = document.createElement("div");
      card.className = "card reveal";

      var mediaHtml = "";
      if (post.file_url) {
        mediaHtml = '<p style="font-size:0.82rem;"><a href="' + API_BASE + post.file_url + '" target="_blank" rel="noopener">Voir le fichier</a></p>';
      }
      if (post.external_url) {
        mediaHtml += '<p style="font-size:0.82rem;"><a href="' + post.external_url + '" target="_blank" rel="noopener">' + post.external_url + '</a></p>';
      }
      card.innerHTML =
        '<p style="color:var(--text-muted);font-size:0.78rem;margin-bottom:4px;">' +
          postTypeLabel(post.post_type) + " · " + (post.visibility === "public" ? "Public" : "Membres") +
          (post.author ? " · " + post.author : "") +
        '</p>' +
        '<h3 style="margin-bottom:6px;"></h3>' +
        '<p></p>' +
        mediaHtml +
        '<button type="button" class="btn btn-outline" style="margin-top:10px;font-size:0.8rem;padding:6px 14px;">Supprimer</button>';
      card.querySelector("h3").textContent = post.title;
      card.querySelector("p:nth-of-type(2)").textContent = post.body || "";
      card.querySelector("button").addEventListener("click", function () {
        if (!confirm("Supprimer cette publication ?")) return;
        api("/api/posts/" + post.id, { method: "DELETE" }).then(function () { loadPosts(); });
      });
      postsList.appendChild(card);
    });
  }

  function loadPosts() {
    api("/api/posts").then(function (r) {
      if (r.ok) renderPosts(r.data);
    });
  }

  function loadSubscribers() {
    api("/api/admin/subscribers").then(function (r) {
      if (!r.ok) return;
      if (!r.data.length) {
        subscribersList.innerHTML = '<p style="color:var(--text-muted);">Aucun abonné pour le moment.</p>';
        return;
      }
      subscribersList.innerHTML = "<p style='color:var(--text-muted);font-size:0.85rem;'>" + r.data.length + " abonné(s) : " +
        r.data.map(function (s) { return s.email; }).join(", ") + "</p>";
    });
  }

  postForm.addEventListener("submit", function (e) {
    e.preventDefault();
    postError.style.display = "none";
    var formData = new FormData(postForm);
    api("/api/posts", { method: "POST", body: formData }).then(function (r) {
      if (r.ok) {
        postForm.reset();
        loadPosts();
      } else {
        postError.textContent = r.data.error || "Erreur lors de la publication.";
        postError.style.display = "block";
      }
    }).catch(function () {
      postError.textContent = "Impossible de joindre le serveur d'administration.";
      postError.style.display = "block";
    });
  });
})();
