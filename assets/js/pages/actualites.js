/* ========================================
   UNJED-BENIN - Page Actualités
   Charge les publications publiques depuis l'API
   et remplace la grille statique.
   (extrait de actualites.html — logique inchangée)
   ======================================== */
(function () {
  var API_BASE = (window.UNJED && typeof window.UNJED.apiBase === "function" && window.UNJED.apiBase())
    || (window.UNJED_CONFIG && window.UNJED_CONFIG.API_BASE)
    || "https://unjedbenin.onrender.com";
  var grid = document.getElementById("news-grid");

  fetch(API_BASE + "/api/posts?visibility=public")
    .then(function (res) { return res.json(); })
    .then(function (posts) {
      var annonces = posts.filter(function (p) {
        return p.post_type === "announcement" || p.post_type === "document";
      });

      if (!annonces.length) return;

      // Remplace les faux articles par vos vraies publications
      grid.innerHTML = "";
      annonces.forEach(function (p) {
        var art = document.createElement("article");
        art.className = "card news-card";
        var body = document.createElement("div");
        body.className = "card-body";
        var tag = document.createElement("span");
        tag.className = "news-tag";
        tag.textContent = p.post_type === "document" ? "Décision / Document" : "Annonce";
        var date = document.createElement("span");
        date.className = "news-date";
        date.textContent = p.created_at || "";
        var h3 = document.createElement("h3");
        h3.style.marginTop = "8px";
        h3.textContent = p.title || "";
        var txt = document.createElement("p");
        txt.textContent = p.body || "";
        body.appendChild(tag);
        body.appendChild(date);
        body.appendChild(h3);
        body.appendChild(txt);
        if (p.file_url) {
          var plink = document.createElement("p");
          plink.style.marginTop = "10px";
          var a = document.createElement("a");
          a.href = API_BASE + p.file_url;
          a.className = "btn btn-outline";
          a.target = "_blank";
          a.rel = "noopener";
          a.textContent = "Télécharger le document";
          plink.appendChild(a);
          body.appendChild(plink);
        }
        art.appendChild(body);
        grid.appendChild(art);
      });
    })
    .catch(function (err) {
      console.error("Erreur chargement actualités:", err);
    });
})();
