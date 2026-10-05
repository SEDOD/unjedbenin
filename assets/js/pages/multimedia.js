/* ========================================
   UNJED-BENIN - Page Multimédia
   Galerie photos + vidéos dynamiques depuis l'API.
   (extrait de multimedia.html — logique inchangée)
   ======================================== */
(function () {
  "use strict";

  var API_BASE = (window.UNJED && typeof window.UNJED.apiBase === "function" && window.UNJED.apiBase())
    || (window.UNJED_CONFIG && window.UNJED_CONFIG.API_BASE)
    || "https://unjedbenin.onrender.com";
  API_BASE = API_BASE.replace(/\/$/, "");

  function youtubeEmbedUrl(url) {
    var m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    return m ? "https://www.youtube.com/embed/" + m[1] : null;
  }

  fetch(API_BASE + "/api/posts?visibility=public")
    .then(function (res) { return res.json(); })
    .then(function (posts) {
      var galleryEl = document.getElementById("gallery-dynamic");
      var videosEl = document.getElementById("videos-dynamic");

      posts.filter(function (p) { return p.post_type === "image"; }).forEach(function (p) {
        if (!p.file_url) return;
        var fig = document.createElement("figure");
        fig.className = "gallery-item reveal";
        var img = document.createElement("img");
        img.src = API_BASE + p.file_url;
        img.alt = p.title;
        img.loading = "lazy";
        img.decoding = "async";
        var cap = document.createElement("figcaption");
        cap.textContent = p.title;
        fig.appendChild(img);
        fig.appendChild(cap);
        galleryEl.appendChild(fig);
      });

      posts.filter(function (p) { return p.post_type === "video"; }).forEach(function (p) {
        var article = document.createElement("article");
        article.className = "card video-card reveal";
        var embedUrl = p.external_url ? youtubeEmbedUrl(p.external_url) : null;
        var mediaHtml;
        if (embedUrl) {
          mediaHtml = '<div class="video-thumb"><iframe src="' + embedUrl + '" style="width:100%;aspect-ratio:16/9;border:0;" allowfullscreen loading="lazy"></iframe></div>';
        } else if (p.file_url) {
          mediaHtml = '<div class="video-thumb"><video src="' + API_BASE + p.file_url + '" controls style="width:100%;"></video></div>';
        } else if (p.external_url) {
          mediaHtml = '<div class="video-thumb"><a href="' + p.external_url + '" target="_blank" rel="noopener">Voir la vidéo</a></div>';
        } else {
          mediaHtml = "";
        }
        article.innerHTML = mediaHtml + '<div class="news-body"><h3></h3></div>';
        article.querySelector("h3").textContent = p.title;
        videosEl.appendChild(article);
      });
    })
    .catch(function () { /* backend injoignable : la galerie statique reste affichée normalement */ });
})();
