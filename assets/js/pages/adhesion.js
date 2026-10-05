/* ========================================
   UNJED-BENIN - Page Adhésion
   Affiche le tarif selon le type de membre.
   Fonction GLOBALE car appelée depuis les
   attributs onchange du formulaire.
   (extrait de adhesion.html — logique inchangée)
   ======================================== */
function updateTarif() {
  var box = document.getElementById("tarif-box");
  var text = document.getElementById("tarif-text");
  var hidden = document.getElementById("tarif_applique");
  var type = document.querySelector('input[name="member_type"]:checked');
  if (!type) { box.style.display = "none"; return; }
  var isMorale = type.value === "Personne morale";
  var droits = isMorale ? "10 000 FCFA" : "2 500 FCFA";
  var cotisation = isMorale ? "3 000 FCFA / mois" : "1 000 FCFA / mois";
  text.textContent = "Droits d'adhésion (" + type.value + ") : " + droits + " — Cotisation : " + cotisation;
  hidden.value = type.value + " — Droits: " + droits + " — Cotisation: " + cotisation;
  box.style.display = "block";
}
