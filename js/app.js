(() => {
  const { lessons, site } = window.SB_DATA;
  const store = window.SBStore;
  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");

  const byId = Object.fromEntries(lessons.map((l) => [l.id, l]));
  const maths = lessons.filter((l) => l.subject === "math");
  const pcs = lessons.filter((l) => l.subject === "pc");

  const branchLabel = {
    algebre: "Algèbre",
    analyse: "Analyse",
    geometrie: "Géométrie",
    proba: "Dénombrement",
    physique: "Physique",
    chimie: "Chimie",
  };

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => toastEl.classList.remove("is-on"), 2200);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pctFill(n) {
    return `stroke-dasharray: ${2 * Math.PI * 52}; stroke-dashoffset: ${
      2 * Math.PI * 52 * (1 - n / 100)
    }`;
  }

  function ring(pct, color, caption) {
    return `
      <div class="sb-progress-ring">
        <div class="sb-progress-ring__chart">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--sb-ring-track)" stroke-width="8"/>
            <circle cx="60" cy="60" r="52" fill="none" stroke="${color}" stroke-width="8"
              stroke-linecap="round" style="${pctFill(pct)}"/>
          </svg>
          <div class="sb-progress-ring__label">${pct}%</div>
        </div>
        <div class="sb-progress-ring__caption">${caption}</div>
      </div>`;
  }

  function header(active) {
    const stats = store.stats(lessons);
    return `
      <a class="sb-skip" href="#main">Aller au contenu</a>
      <header class="sb-header">
        <div class="sb-container sb-header__inner">
          <a class="sb-header__brand" href="#/" data-link>
            <svg class="sb-logo" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill="#c8102e"/>
              <path fill="#006233" d="M12 4.2 L13.9 9.9 L20 10 L15.2 13.6 L17 19.4 L12 16.1 L7 19.4 L8.8 13.6 L4 10 L10.1 9.9 Z"/>
            </svg>
            <span>
              <span class="sb-header__name">Succès Bac <span>SM</span>!</span>
              <span class="sb-header__tag">1er Bac · Sciences Maths</span>
            </span>
          </a>
          <nav class="sb-header__nav" aria-label="Navigation principale">
            <a href="#/" data-link class="${active === "home" ? "is-active" : ""}">Accueil</a>
            <a href="#/maths" data-link class="${active === "maths" ? "is-active" : ""}">Maths</a>
            <a href="#/pc" data-link class="${active === "pc" ? "is-active" : ""}">Physique-Chimie</a>
            <a href="#/stats" data-link class="${active === "stats" ? "is-active" : ""}">Mes stats (${stats.allPct}%)</a>
          </nav>
          <button class="sb-header__toggle" type="button" aria-expanded="false" aria-controls="menu-mobile" id="burger">
            <span></span><span></span><span></span>
          </button>
        </div>
        <div class="sb-container sb-header__panel" id="menu-mobile">
          <a href="#/" data-link>Accueil</a>
          <a href="#/maths" data-link>Programme Maths</a>
          <a href="#/pc" data-link>Programme Physique-Chimie</a>
          <a href="#/stats" data-link>Mes statistiques</a>
          <a href="#/notes" data-link>Toutes mes notes</a>
        </div>
      </header>`;
  }

  function footer() {
    return `
      <section class="sb-strip">
        <p class="sb-strip__arabic sb-arabic">نجاح الباك</p>
        <p>Plateforme marocaine · 1er Bac Sciences Mathématiques uniquement</p>
      </section>
      <footer class="sb-footer">
        <div class="sb-container sb-footer__inner">
          <p>Succès Bac SM! · Maths & Physique-Chimie · Programme officiel MEN</p>
          <p>Vidéos YouTube de professeurs populaires · Conclusions rédigées pour réviser vite</p>
        </div>
      </footer>`;
  }

  function courseCard(l) {
    const done = store.isDone(l.id);
    const badge = l.subject === "math" ? "maths" : "pc";
    return `
      <a class="sb-course-card" href="#/cours/${l.id}" data-link>
        <div class="sb-course-card__media ${l.subject === "pc" ? "sb-course-card__media--pc" : ""}">
          S${l.semester}
        </div>
        <div class="sb-course-card__body">
          <div>
            <span class="sb-badge sb-badge--${badge}">${l.subject === "math" ? "Maths" : l.branch === "chimie" ? "Chimie" : "Physique"}</span>
            ${done ? '<span class="sb-badge sb-badge--done">Terminé</span>' : ""}
          </div>
          <h3 class="sb-course-card__title">${l.chapter}</h3>
          <p class="sb-course-card__meta">${branchLabel[l.branch]} · ${l.durationMin} min · ${l.channel}</p>
          <div class="sb-progress"><div class="sb-progress__fill ${l.subject === "pc" ? "sb-progress__fill--pc" : ""}" style="width:${done ? 100 : 0}%"></div></div>
        </div>
      </a>`;
  }

  function renderHome() {
    const st = store.stats(lessons);
    const featured = [
      byId["logique-mathematique"],
      byId["derivation"],
      byId["acido-basiques"],
      byId["energie-mecanique"],
      byId["suites-numeriques"],
      byId["champ-electrostatique"],
    ];
    app.innerHTML = `
      ${header("home")}
      <main id="main">
        <section class="sb-hero">
          <div class="sb-container">
            <p class="sb-hero__kicker">${site.kicker}</p>
            <h1 class="sb-hero__title">Succès Bac SM!</h1>
            <p class="sb-hero__arabic sb-arabic">${site.arabic}</p>
            <p class="sb-hero__lead">${site.tagline}</p>
            <div class="sb-hero__actions">
              <a class="sb-btn sb-btn--primary" href="#/maths" data-link>Programme Maths</a>
              <a class="sb-btn sb-btn--secondary" href="#/pc" data-link>Programme Physique-Chimie</a>
            </div>
            <p class="sb-flag">
              <svg class="sb-flag__star" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3.2 L14.2 9.8 L21.2 9.9 L15.6 14 L17.7 20.8 L12 16.8 L6.3 20.8 L8.4 14 L2.8 9.9 L9.8 9.8 Z"/></svg>
              Maroc · français scientifique · ${lessons.length} cours · ta progression : <strong>${st.allPct}%</strong>
            </p>
          </div>
        </section>
        <section class="sb-section">
          <div class="sb-container">
            <div class="sb-pillars">
              <article class="sb-pillar">
                <div class="sb-pillar__icon sb-pillar__icon--maths">Σ</div>
                <h3>Mathématiques</h3>
                <p>${maths.length} cours du programme SM : logique, analyse, géométrie de l’espace, arithmétique.</p>
                <p style="margin-top:.8rem"><a class="sb-btn sb-btn--sm sb-btn--primary" href="#/maths" data-link>Ouvrir les maths</a></p>
              </article>
              <article class="sb-pillar">
                <div class="sb-pillar__icon sb-pillar__icon--pc">⚛</div>
                <h3>Physique-Chimie</h3>
                <p>${pcs.length} cours : mécanique, énergie, électricité, optique, solutions, organique.</p>
                <p style="margin-top:.8rem"><a class="sb-btn sb-btn--sm sb-btn--danger" href="#/pc" data-link>Ouvrir la PC</a></p>
              </article>
              <article class="sb-pillar">
                <div class="sb-pillar__icon sb-pillar__icon--gold">%</div>
                <h3>Stats & notes</h3>
                <p>Vois où tu en es (1 %, 40 %, 100 %) et prends des notes à côté de chaque vidéo — un clic pour les cacher.</p>
                <p style="margin-top:.8rem"><a class="sb-btn sb-btn--sm sb-btn--ghost" href="#/stats" data-link>Voir ma progression</a></p>
              </article>
            </div>
          </div>
        </section>
        <section class="sb-section" style="padding-top:0">
          <div class="sb-container">
            <div class="sb-section__head">
              <div>
                <h2 class="sb-section__title">Cours à ouvrir tout de suite</h2>
                <p class="sb-section__sub">Vidéo populaire + conclusion express si tu n’as pas le temps de tout regarder.</p>
              </div>
            </div>
            <div class="sb-grid sb-grid--3">${featured.map(courseCard).join("")}</div>
          </div>
        </section>
      </main>
      ${footer()}`;
  }

  function groupModules(list) {
    const s1 = list.filter((l) => l.semester === 1);
    const s2 = list.filter((l) => l.semester === 2);
    return [
      { title: "Semestre 1", items: s1 },
      { title: "Semestre 2", items: s2 },
    ];
  }

  function moduleBlock(mod, subject) {
    const done = mod.items.filter((l) => store.isDone(l.id)).length;
    const pct = Math.round((100 * done) / mod.items.length);
    return `
      <article class="sb-module is-open">
        <button class="sb-module__head" type="button" aria-expanded="true">
          <span>
            <h3 class="sb-module__title">${mod.title}</h3>
            <p class="sb-module__meta">${done}/${mod.items.length} cours · ${pct}%</p>
          </span>
          <span class="sb-progress" style="width:120px"><span class="sb-progress__fill ${subject === "pc" ? "sb-progress__fill--pc" : ""}" style="width:${pct}%;display:block;height:100%"></span></span>
        </button>
        <div class="sb-module__body">
          ${mod.items
            .map((l) => {
              const on = store.isDone(l.id);
              return `<a class="sb-lesson-row ${on ? "is-done" : ""}" href="#/cours/${l.id}" data-link>
                <span style="display:flex;align-items:center;gap:.7rem">
                  <span class="sb-check ${on ? "is-on" : ""}"></span>
                  <span><strong>${l.chapter}</strong><br><small>${branchLabel[l.branch]} · ${l.durationMin} min</small></span>
                </span>
                <span class="sb-badge sb-badge--${l.subject === "math" ? "maths" : "pc"}">${on ? "Fait" : "À faire"}</span>
              </a>`;
            })
            .join("")}
        </div>
      </article>`;
  }

  function renderProgramme(subject) {
    const list = subject === "math" ? maths : pcs;
    const st = store.stats(lessons);
    const pct = subject === "math" ? st.mathPct : st.pcPct;
    const title = subject === "math" ? "Mathématiques" : "Physique-Chimie";
    const lead =
      subject === "math"
        ? "Programme 1er Bac SM : logique, fonctions, géométrie, dénombrement, arithmétique. Chaque cours a une vidéo et une conclusion pour les jours de flemme."
        : "Programme 1er Bac SM : mécanique et énergie, chimie des solutions, champs, optique, chimie organique.";
    app.innerHTML = `
      ${header(subject === "math" ? "maths" : "pc")}
      <main id="main">
        <div class="sb-container sb-pagehead">
          <p class="sb-hero__kicker">Programme officiel · 1er Bac SM</p>
          <h1 class="sb-section__title">${title}</h1>
          <p class="sb-section__sub">${lead}</p>
          <p style="margin-top:1rem;font-family:var(--sb-font-display);font-size:1.4rem">${pct}% du programme ${subject === "math" ? "maths" : "PC"} terminé</p>
          <div class="sb-progress" style="max-width:320px;height:8px;margin-top:.6rem">
            <div class="sb-progress__fill ${subject === "pc" ? "sb-progress__fill--pc" : ""}" style="width:${pct}%"></div>
          </div>
        </div>
        <section class="sb-section" style="padding-top:0">
          <div class="sb-container sb-programme">
            ${groupModules(list).map((m) => moduleBlock(m, subject)).join("")}
          </div>
        </section>
      </main>
      ${footer()}`;
  }

  function neighbors(lesson) {
    const pool = lesson.subject === "math" ? maths : pcs;
    const i = pool.findIndex((x) => x.id === lesson.id);
    return { prev: pool[i - 1], next: pool[i + 1], i, n: pool.length, pool };
  }

  function lessonIndex(lesson) {
    const { pool, i, n } = neighbors(lesson);
    const name = lesson.subject === "math" ? "Maths" : "PC";
    const rows = pool
      .map((item, idx) => {
        const on = store.isDone(item.id);
        const current = item.id === lesson.id;
        const semBreak =
          idx === 0 || item.semester !== pool[idx - 1].semester
            ? `<p class="sb-index__sem">Semestre ${item.semester}</p>`
            : "";
        return `${semBreak}<a class="sb-index__item ${current ? "is-current" : ""} ${on ? "is-done" : ""}" href="#/cours/${item.id}" data-link ${current ? 'id="index-current"' : ""}>
            <span class="sb-index__num">${idx + 1}</span>
            <span class="sb-index__title">${item.chapter}</span>
            ${on ? '<span class="sb-check is-on" aria-hidden="true"></span>' : ""}
          </a>`;
      })
      .join("");
    return `
      <aside class="sb-index" aria-label="Autres cours">
        <div class="sb-index__head">
          <h3>Autres cours · ${name}</h3>
          <span>${i + 1} / ${n}</span>
        </div>
        <div class="sb-index__list">${rows}</div>
      </aside>`;
  }

  function renderLesson(id) {
    const l = byId[id];
    if (!l) {
      app.innerHTML = `${header("home")}<main class="sb-container sb-empty"><p>Cours introuvable.</p><a href="#/">Retour</a></main>${footer()}`;
      return;
    }
    const done = store.isDone(l.id);
    const note = store.getNote(l.id);
    const open = store.notesOpen();
    const { prev, next } = neighbors(l);
    const subjectHref = l.subject === "math" ? "#/maths" : "#/pc";
    const subjectName = l.subject === "math" ? "Maths" : "Physique-Chimie";
    app.innerHTML = `
      ${header(l.subject === "math" ? "maths" : "pc")}
      <main id="main" class="sb-section">
        <div class="sb-container">
          <nav class="sb-breadcrumb">
            <a href="#/" data-link>Accueil</a> ·
            <a href="${subjectHref}" data-link>${subjectName}</a> ·
            <span>S${l.semester}</span>
          </nav>
          <div style="display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-bottom:1rem">
            <span class="sb-badge sb-badge--${l.subject === "math" ? "maths" : "pc"}">${branchLabel[l.branch]}</span>
            <span class="sb-badge">${l.durationMin} min</span>
            ${done ? '<span class="sb-badge sb-badge--done">Cours terminé</span>' : ""}
          </div>
          <h1 class="sb-section__title">${l.chapter}</h1>
          <p class="sb-section__sub">Vidéo : ${l.videoTitle} · ${l.channel}</p>

          <div class="sb-cours" style="margin-top:1.25rem">
            <div>
              <div class="sb-player" id="yt-box" data-yt="${l.youtubeId}">
                <div class="sb-player__frame" id="yt-frame">
                  <a class="sb-player__poster" href="https://www.youtube.com/watch?v=${l.youtubeId}" target="_blank" rel="noopener">
                    <img src="https://i.ytimg.com/vi/${l.youtubeId}/hqdefault.jpg" alt="${l.videoTitle}">
                    <span class="sb-player__play">Lire sur YouTube</span>
                  </a>
                </div>
              </div>
              <div class="sb-player__bar">
                <a class="sb-btn sb-btn--primary" href="https://www.youtube.com/watch?v=${l.youtubeId}" target="_blank" rel="noopener">Ouvrir la vidéo sur YouTube</a>
                <button class="sb-btn sb-btn--ghost" type="button" id="yt-embed">Essayer dans la page</button>
                <a class="sb-btn sb-btn--ghost" href="https://www.youtube.com/results?search_query=${encodeURIComponent(l.chapter + " 1bac SM cours")}" target="_blank" rel="noopener">Autre vidéo</a>
              </div>
              <p class="sb-player__hint">YouTube bloque souvent le lecteur intégré en local (erreur 153). Ouvre la vidéo sur YouTube — la conclusion du cours est juste en dessous.</p>
            </div>
            <div class="sb-cours-side">
              ${lessonIndex(l)}
              <aside class="sb-notes ${open ? "" : "sb-notes--collapsed"}" id="notes-panel">
              <div class="sb-notes__head">
                <h3>Mes notes</h3>
                <button class="sb-btn sb-btn--sm sb-btn--ghost" type="button" id="toggle-notes">${open ? "Cacher" : "Afficher"}</button>
              </div>
              <div class="sb-notes__body">
                <textarea id="note-field" placeholder="Écris ici tes formules, pièges, exemples…"></textarea>
                <p class="sb-notes__hint" id="note-hint">Sauvegarde automatique sur cet appareil.</p>
              </div>
            </aside>
            </div>
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:.6rem;margin:1.25rem 0">
            <button class="sb-btn ${done ? "sb-btn--ghost" : "sb-btn--primary"}" type="button" id="mark-done">
              ${done ? "Marquer comme non terminé" : "J’ai terminé ce cours"}
            </button>
            <a class="sb-btn sb-btn--secondary" href="#/stats" data-link>Voir mes stats</a>
          </div>

          <article class="sb-conclusion">
            <h2 class="sb-conclusion__title">Conclusion — si tu n’as pas tout regardé</h2>
            <p>${l.conclusion}</p>
            <h3 style="font-size:1.05rem;margin:1rem 0 .4rem">Les bases à retenir</h3>
            <ul class="sb-conclusion__list">${l.basics.map((b) => `<li>${b}</li>`).join("")}</ul>
            <p class="sb-callout">${l.formula}</p>
          </article>

          <div class="sb-cours-nav" style="margin-top:1.25rem">
            ${prev ? `<a class="sb-btn sb-btn--ghost" href="#/cours/${prev.id}" data-link>← ${prev.chapter}</a>` : "<span></span>"}
            ${next ? `<a class="sb-btn sb-btn--ghost" href="#/cours/${next.id}" data-link>${next.chapter} →</a>` : "<span></span>"}
          </div>
        </div>
      </main>
      <button class="sb-fab-notes ${open ? "" : "is-visible"}" type="button" id="fab-notes">Mes notes</button>
      ${footer()}`;

    document.getElementById("toggle-notes").addEventListener("click", () => {
      const nextOpen = !store.notesOpen();
      store.setNotesOpen(nextOpen);
      renderLesson(id);
    });
    const fab = document.getElementById("fab-notes");
    fab.addEventListener("click", () => {
      store.setNotesOpen(true);
      renderLesson(id);
    });
    const field = document.getElementById("note-field");
    field.value = note;
    let t;
    field.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        store.setNote(l.id, field.value);
        document.getElementById("note-hint").textContent = "Enregistré.";
      }, 250);
    });
    document.getElementById("yt-embed").addEventListener("click", () => {
      const frame = document.getElementById("yt-frame");
      const ytId = l.youtubeId;
      frame.innerHTML = `<iframe src="embed.html?v=${encodeURIComponent(ytId)}" title="${l.videoTitle}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="origin" allowfullscreen></iframe>`;
    });
    document.getElementById("mark-done").addEventListener("click", () => {
      store.toggleDone(l.id, !store.isDone(l.id));
      toast(store.isDone(l.id) ? "Cours marqué terminé." : "Cours remis à faire.");
      renderLesson(id);
    });
    const list = document.querySelector(".sb-index__list");
    const currentRow = document.getElementById("index-current");
    if (list && currentRow) {
      list.scrollTop = currentRow.offsetTop - list.clientHeight / 2 + currentRow.clientHeight / 2;
    }
  }

  function renderStats() {
    const st = store.stats(lessons);
    const last = st.lastLesson ? byId[st.lastLesson] : null;
    const withNotes = lessons.filter((l) => store.getNote(l.id));
    app.innerHTML = `
      ${header("stats")}
      <main id="main">
        <div class="sb-container sb-pagehead">
          <p class="sb-hero__kicker">Tableau de bord</p>
          <p class="sb-breadcrumb"><a href="#/" data-link>← Accueil</a></p>
          <h1 class="sb-section__title">Ta progression</h1>
          <p class="sb-section__sub">Un pourcentage clair : maths, physique-chimie, et le programme entier.</p>
        </div>
        <section class="sb-section" style="padding-top:0">
          <div class="sb-container">
            <div class="sb-stats-hero">
              ${ring(st.mathPct, "var(--sb-ring-maths)", `Maths · ${st.mathDone}/${st.mathTotal} cours`)}
              ${ring(st.pcPct, "var(--sb-ring-pc)", `Physique-Chimie · ${st.pcDone}/${st.pcTotal} cours`)}
              ${ring(st.allPct, "var(--sb-ring-global)", `Programme · ${st.allDone}/${st.allTotal} cours`)}
            </div>
            <div class="sb-grid sb-grid--3" style="margin-top:2rem">
              <article class="sb-stat-card">
                <p class="sb-stat-card__value">${st.allPct}%</p>
                <p class="sb-stat-card__label">du programme 1er Bac SM</p>
              </article>
              <article class="sb-stat-card">
                <p class="sb-stat-card__value">${st.notesCount}</p>
                <p class="sb-stat-card__label">cours avec des notes</p>
              </article>
              <article class="sb-stat-card">
                <p class="sb-stat-card__value">${st.mathPct === 100 && st.pcPct === 100 ? "SM" : st.allDone}</p>
                <p class="sb-stat-card__label">${st.mathPct === 100 && st.pcPct === 100 ? "Programme bouclé" : "cours validés"}</p>
              </article>
            </div>
            ${last ? `<p style="margin-top:1.5rem">Dernier cours ouvert : <a href="#/cours/${last.id}" data-link>${last.chapter}</a></p>` : ""}
            <div class="sb-hero__actions" style="margin-top:1.25rem">
              <a class="sb-btn sb-btn--primary" href="#/" data-link>← Retour à l’accueil</a>
              ${last ? `<a class="sb-btn sb-btn--secondary" href="#/cours/${last.id}" data-link>Reprendre le cours</a>` : ""}
              <a class="sb-btn sb-btn--ghost" href="#/notes" data-link>Toutes mes notes</a>
              <button class="sb-btn sb-btn--sm sb-btn--ghost" type="button" id="reset-progress">Réinitialiser</button>
            </div>
          </div>
        </section>
      </main>
      ${footer()}`;
    document.getElementById("reset-progress").addEventListener("click", () => {
      if (confirm("Effacer progression et notes sur cet appareil ?")) {
        store.reset();
        toast("Progression remise à zéro.");
        renderStats();
      }
    });
  }

  function renderNotes() {
    const withNotes = lessons.filter((l) => store.getNote(l.id));
    app.innerHTML = `
      ${header("stats")}
      <main id="main" class="sb-section">
        <div class="sb-container">
          <p class="sb-breadcrumb"><a href="#/" data-link>← Accueil</a> · <a href="#/stats" data-link>Stats</a></p>
          <h1 class="sb-section__title">Mes notes</h1>
          <p class="sb-section__sub">Toutes tes notes, un clic pour revenir au cours.</p>
          ${
            withNotes.length
              ? withNotes
                  .map(
                    (l) => `<article class="sb-conclusion" style="margin-top:1rem">
                    <h2 class="sb-conclusion__title"><a href="#/cours/${l.id}" data-link>${l.chapter}</a></h2>
                    <p style="white-space:pre-wrap">${escapeHtml(store.getNote(l.id))}</p>
                  </article>`
                  )
                  .join("")
              : `<p class="sb-empty">Pas encore de notes. Ouvre un cours et écris à droite de la vidéo.</p>`
          }
        </div>
      </main>
      ${footer()}`;
  }

  function bindChrome() {
    const burger = document.getElementById("burger");
    const panel = document.getElementById("menu-mobile");
    if (burger && panel) {
      burger.addEventListener("click", () => {
        const open = panel.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", String(open));
      });
    }
    document.querySelectorAll(".sb-module__head").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mod = btn.closest(".sb-module");
        const open = !mod.classList.contains("is-open");
        mod.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
      });
    });
  }

  function route() {
    const hash = location.hash.slice(1) || "/";
    const parts = hash.split("/").filter(Boolean);
    if (parts.length === 0) renderHome();
    else if (parts[0] === "maths") renderProgramme("math");
    else if (parts[0] === "pc") renderProgramme("pc");
    else if (parts[0] === "stats") renderStats();
    else if (parts[0] === "notes") renderNotes();
    else if (parts[0] === "cours" && parts[1]) renderLesson(parts[1]);
    else renderHome();
    bindChrome();
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", route);
  if (!location.hash) location.hash = "#/";
  route();
})();
