/* ========================================
   UNJED-BENIN - Page Jeu éducatif
   Mots mêlés + texte à réordonner + onglets.
   (extrait de jeu.html — logique inchangée)
   ======================================== */
(function () {
  "use strict";

  /* ==========================================================
     MOTS MELES
     ========================================================== */
  var WS_WORDS = ["JEUNESSE","LEADERSHIP","SOLIDARITE","ENGAGEMENT","FORMATION","INCLUSION","EXCELLENCE","INTEGRITE","CITOYENNETE","BENIN","UNJED","DEVELOPPEMENT"];
  var WS_SIZE = 15;
  var wsGridEl = document.getElementById("ws-grid");
  var wsListEl = document.getElementById("ws-word-list");
  var wsStatusEl = document.getElementById("ws-status");
  var wsPlacements = [];
  var wsFoundWords = {};
  var wsSelecting = false;
  var wsStartCell = null;
  var wsCurrentCells = [];

  var WS_DIRS = [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]];

  function wsBuild() {
    wsFoundWords = {};
    var grid = [];
    for (var r = 0; r < WS_SIZE; r++) { grid.push(new Array(WS_SIZE).fill("")); }
    var placements = [];
    var wordsSorted = WS_WORDS.slice().sort(function (a, b) { return b.length - a.length; });

    wordsSorted.forEach(function (word) {
      var placed = false;
      for (var attempt = 0; attempt < 400 && !placed; attempt++) {
        var dir = WS_DIRS[Math.floor(Math.random() * WS_DIRS.length)];
        var row = Math.floor(Math.random() * WS_SIZE);
        var col = Math.floor(Math.random() * WS_SIZE);
        var endRow = row + dir[0] * (word.length - 1);
        var endCol = col + dir[1] * (word.length - 1);
        if (endRow < 0 || endRow >= WS_SIZE || endCol < 0 || endCol >= WS_SIZE) continue;

        var cells = [];
        var ok = true;
        for (var i = 0; i < word.length; i++) {
          var rr = row + dir[0] * i;
          var cc = col + dir[1] * i;
          var existing = grid[rr][cc];
          if (existing !== "" && existing !== word[i]) { ok = false; break; }
          cells.push([rr, cc]);
        }
        if (!ok) continue;

        cells.forEach(function (cell, idx) { grid[cell[0]][cell[1]] = word[idx]; });
        placements.push({ word: word, cells: cells });
        placed = true;
      }
    });

    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var r2 = 0; r2 < WS_SIZE; r2++) {
      for (var c2 = 0; c2 < WS_SIZE; c2++) {
        if (!grid[r2][c2]) grid[r2][c2] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
    return { grid: grid, placements: placements };
  }

  function wsRender() {
    var built = wsBuild();
    wsPlacements = built.placements;
    wsFoundWords = {};
    wsGridEl.innerHTML = "";
    wsGridEl.style.gridTemplateColumns = "repeat(" + WS_SIZE + ", 1fr)";
    wsGridEl.style.gridTemplateRows = "repeat(" + WS_SIZE + ", 1fr)";

    for (var r = 0; r < WS_SIZE; r++) {
      for (var c = 0; c < WS_SIZE; c++) {
        var cellEl = document.createElement("div");
        cellEl.className = "ws-cell";
        cellEl.textContent = built.grid[r][c];
        cellEl.dataset.r = r;
        cellEl.dataset.c = c;
        wsGridEl.appendChild(cellEl);
      }
    }

    wsListEl.innerHTML = "";
    wsPlacements.forEach(function (p) {
      var li = document.createElement("li");
      li.textContent = p.word;
      li.id = "ws-word-" + p.word;
      wsListEl.appendChild(li);
    });

    wsStatusEl.textContent = "";
    wsSelecting = false;
    wsStartCell = null;
    wsCurrentCells = [];
  }

  function wsCellAt(r, c) {
    return wsGridEl.querySelector('.ws-cell[data-r="' + r + '"][data-c="' + c + '"]');
  }

  function wsClearSelecting() {
    wsGridEl.querySelectorAll(".ws-cell.selecting").forEach(function (el) { el.classList.remove("selecting"); });
  }

  function wsCellsBetween(start, end) {
    var dr = end[0] - start[0];
    var dc = end[1] - start[1];
    var steps = Math.max(Math.abs(dr), Math.abs(dc));
    if (steps === 0) return [start];
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null; // pas une ligne droite valide
    var stepR = dr === 0 ? 0 : dr / Math.abs(dr);
    var stepC = dc === 0 ? 0 : dc / Math.abs(dc);
    var cells = [];
    for (var i = 0; i <= steps; i++) {
      cells.push([start[0] + stepR * i, start[1] + stepC * i]);
    }
    return cells;
  }

  function wsSameCells(a, b) {
    if (a.length !== b.length) return false;
    var aSet = a.map(function (x) { return x[0] + "-" + x[1]; }).sort();
    var bSet = b.map(function (x) { return x[0] + "-" + x[1]; }).sort();
    return aSet.every(function (v, i) { return v === bSet[i]; });
  }

  function wsFinishSelection() {
    if (wsCurrentCells.length > 1) {
      wsPlacements.forEach(function (p) {
        if (wsFoundWords[p.word]) return;
        if (wsSameCells(p.cells, wsCurrentCells)) {
          wsFoundWords[p.word] = true;
          wsCurrentCells.forEach(function (cell) {
            var el = wsCellAt(cell[0], cell[1]);
            if (el) el.classList.add("found");
          });
          var li = document.getElementById("ws-word-" + p.word);
          if (li) li.classList.add("found");
        }
      });
    }
    wsClearSelecting();
    wsSelecting = false;
    wsStartCell = null;
    wsCurrentCells = [];

    var foundCount = Object.keys(wsFoundWords).length;
    if (foundCount === wsPlacements.length) {
      wsStatusEl.textContent = "Bravo, vous avez trouvé tous les mots !";
    } else {
      wsStatusEl.textContent = foundCount + " / " + wsPlacements.length + " mots trouvés";
    }
  }

  function wsPointerDown(e) {
    var target = e.target.closest(".ws-cell");
    if (!target) return;
    wsSelecting = true;
    wsStartCell = [parseInt(target.dataset.r, 10), parseInt(target.dataset.c, 10)];
    wsCurrentCells = [wsStartCell];
    target.classList.add("selecting");
  }

  function wsPointerMove(e) {
    if (!wsSelecting) return;
    var point = e.touches ? e.touches[0] : e;
    var el = document.elementFromPoint(point.clientX, point.clientY);
    var target = el ? el.closest(".ws-cell") : null;
    if (!target) return;
    var current = [parseInt(target.dataset.r, 10), parseInt(target.dataset.c, 10)];
    var cells = wsCellsBetween(wsStartCell, current);
    if (!cells) return;
    wsClearSelecting();
    wsCurrentCells = cells;
    cells.forEach(function (cell) {
      var cEl = wsCellAt(cell[0], cell[1]);
      if (cEl) cEl.classList.add("selecting");
    });
  }

  function wsPointerUp() {
    if (!wsSelecting) return;
    wsFinishSelection();
  }

  wsGridEl.addEventListener("mousedown", wsPointerDown);
  wsGridEl.addEventListener("mousemove", wsPointerMove);
  document.addEventListener("mouseup", wsPointerUp);
  wsGridEl.addEventListener("touchstart", function (e) { wsPointerDown(e); }, { passive: true });
  wsGridEl.addEventListener("touchmove", function (e) { wsPointerMove(e); e.preventDefault(); }, { passive: false });
  document.addEventListener("touchend", wsPointerUp);

  document.getElementById("ws-restart").addEventListener("click", wsRender);
  wsRender();

  /* ==========================================================
     TEXTE A REORDONNER
     ========================================================== */
  var SCRAMBLE_SENTENCES = [
    "L'UNJED-BENIN forme et mobilise la jeunesse béninoise.",
    "Notre union défend l'inclusion, la solidarité et l'excellence.",
    "Chaque jeune engagé peut représenter l'organisation avec fierté.",
    "La transparence guide toutes les actions de nos responsables.",
    "Ensemble, nous construisons un Bénin durable et solidaire."
  ];
  var REWARD_TEXT = "L'UNJED-BENIN, c'est une jeunesse béninoise unie, formée et engagée, qui avance avec discipline, transparence et solidarité pour construire un Bénin meilleur.";

  var scrambleIndex = 0;
  var scrambleScore = 0;
  var scrambleAnswerOrder = [];
  var answerEl = document.getElementById("scramble-answer");
  var bankEl = document.getElementById("scramble-bank");
  var feedbackEl = document.getElementById("scramble-feedback");
  var progressEl = document.getElementById("scramble-progress");
  var rewardEl = document.getElementById("scramble-reward");
  var rewardTextEl = document.getElementById("scramble-reward-text");

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function scrambleLoadSentence() {
    feedbackEl.textContent = "";
    feedbackEl.className = "scramble-feedback";
    rewardEl.classList.remove("show");
    answerEl.innerHTML = "";
    scrambleAnswerOrder = [];
    progressEl.textContent = "Phrase " + (scrambleIndex + 1) + " / " + SCRAMBLE_SENTENCES.length;

    var sentence = SCRAMBLE_SENTENCES[scrambleIndex];
    var words = sentence.split(" ");
    var shuffled = shuffle(words);

    bankEl.innerHTML = "";
    shuffled.forEach(function (word, idx) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "scramble-chip";
      chip.textContent = word;
      chip.dataset.word = word;
      chip.dataset.uid = idx;
      chip.addEventListener("click", function () {
        if (chip.classList.contains("placed")) return;
        chip.classList.add("placed");
        var placedChip = document.createElement("span");
        placedChip.className = "scramble-chip";
        placedChip.textContent = word;
        placedChip.addEventListener("click", function () {
          placedChip.remove();
          chip.classList.remove("placed");
          scrambleAnswerOrder = scrambleAnswerOrder.filter(function (w) { return w.uid !== idx; });
        });
        answerEl.appendChild(placedChip);
        scrambleAnswerOrder.push({ word: word, uid: idx });
      });
      bankEl.appendChild(chip);
    });
  }

  document.getElementById("scramble-check").addEventListener("click", function () {
    var built = scrambleAnswerOrder.map(function (w) { return w.word; }).join(" ");
    var correct = SCRAMBLE_SENTENCES[scrambleIndex];
    if (built === correct) {
      feedbackEl.textContent = "Correct !";
      feedbackEl.className = "scramble-feedback ok";
      scrambleScore++;
      setTimeout(function () {
        if (scrambleIndex < SCRAMBLE_SENTENCES.length - 1) {
          scrambleIndex++;
          scrambleLoadSentence();
        } else {
          rewardTextEl.textContent = "Score : " + scrambleScore + " / " + SCRAMBLE_SENTENCES.length + ". " + REWARD_TEXT;
          rewardEl.classList.add("show");
        }
      }, 700);
    } else {
      feedbackEl.textContent = "Ce n'est pas encore ça, réessayez.";
      feedbackEl.className = "scramble-feedback ko";
    }
  });

  document.getElementById("scramble-reset").addEventListener("click", scrambleLoadSentence);
  document.getElementById("scramble-restart").addEventListener("click", function () {
    scrambleIndex = 0;
    scrambleScore = 0;
    scrambleLoadSentence();
  });

  scrambleLoadSentence();

  /* ==========================================================
     ONGLETS
     ========================================================== */
  document.querySelectorAll(".game-tab-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".game-tab-btn").forEach(function (b) { b.classList.remove("active"); });
      document.querySelectorAll(".game-panel").forEach(function (p) { p.classList.remove("active"); });
      btn.classList.add("active");
      document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
    });
  });
})();
