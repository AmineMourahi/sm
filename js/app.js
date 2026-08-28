(() => {
  const { lessons, site, subjects: subjectList = [] } = window.SB_DATA;
  const store = window.SBStore;
  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");

  const byId = Object.fromEntries(lessons.map((l) => [l.id, l]));
  const subjectsById = Object.fromEntries(subjectList.map((s) => [s.id, s]));
  const maths = lessons.filter((l) => l.subject === "math");
  const pcs = lessons.filter((l) => l.subject === "pc");
  const regionalSubjects = subjectList.filter((s) => s.group === "regional");

  const branchLabel = {
    algebre: "Algèbre",
    analyse: "Analyse",
    geometrie: "Géométrie",
    proba: "Dénombrement",
    physique: "Physique",
    chimie: "Chimie",
    nass: "نصوص",
    lugha: "علوم اللغة",
    taabir: "تعبير وإنشاء",
    oeuvre: "Œuvre intégrale",
    langue: "Langue",
    production: "Production écrite",
    aqida: "عقيدة",
    usra: "فقه الأسرة",
    iqtida: "اقتداء",
    qist: "قسط",
    hikma: "حكمة",
    quran: "سورة يوسف",
    histoire: "Histoire",
    geo: "Géographie",
  };

  function subjectMeta(id) {
    return (
      subjectsById[id] || {
        id,
        slug: id,
        name: id,
        nameLong: id,
        badge: id === "pc" ? "pc" : "maths",
        group: "core",
        search: "",
        lead: "",
      }
    );
  }

  function lessonsOf(subjectId) {
    return lessons.filter((l) => l.subject === subjectId);
  }

  function isRtlText(str) {
    return /[\u0600-\u06FF]/.test(String(str));
  }

  function chapterLabel(l) {
    const t = escapeHtml(l.chapter);
    return isRtlText(l.chapter) ? `<span lang="ar" dir="rtl" class="sb-arabic">${t}</span>` : t;
  }

  function fillClass(subjectId) {
    const badge = subjectMeta(subjectId).badge;
    return badge === "maths" ? "" : `sb-progress__fill--${badge}`;
  }

  function subjectPct(st, subjectId) {
    return (st.bySubject && st.bySubject[subjectId] && st.bySubject[subjectId].pct) || 0;
  }

  function videosOf(l) {
    if (Array.isArray(l.videos) && l.videos.length) {
      return l.videos.map((v, i) => ({
        youtubeId: v.youtubeId,
        title: v.title || l.videoTitle,
        durationMin: v.durationMin || 0,
        part: v.part || i + 1,
      }));
    }
    return [
      {
        youtubeId: l.youtubeId,
        title: l.videoTitle,
        durationMin: l.durationMin || 0,
        part: 1,
      },
    ];
  }

  function durationOf(l) {
    const vs = videosOf(l);
    const sum = vs.reduce((n, v) => n + (Number(v.durationMin) || 0), 0);
    return sum || l.durationMin || 0;
  }

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

  function fold(str) {
    return String(str)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function parseHash() {
    const raw = (location.hash || "#/").replace(/^#/, "") || "/";
    const qIndex = raw.indexOf("?");
    const path = qIndex === -1 ? raw : raw.slice(0, qIndex);
    const qs = qIndex === -1 ? "" : raw.slice(qIndex + 1);
    const parts = path.split("/").filter(Boolean);
    const params = new URLSearchParams(qs);
    return { parts, q: params.get("q") || "", f: params.get("f") || "" };
  }

  const scrollPos = Object.create(null);
  let lastKey = location.hash || "#/";
  const stack = [];
  let goingBack = false;

  function hashKey() {
    return location.hash || "#/";
  }

  function backLink(fallback, label = "Retour") {
    return `<a class="sb-back" href="${fallback}" data-back="${fallback}">← ${label}</a>`;
  }

  function goBack(fallback) {
    scrollPos[hashKey()] = window.scrollY;
    if (stack.length > 1) {
      stack.pop();
      const prev = stack[stack.length - 1];
      if (hashKey() === prev) {
        lastKey = prev;
        route();
        return;
      }
      goingBack = true;
      location.hash = prev;
      return;
    }
    const target = fallback || "#/";
    if (hashKey() === target) return;
    history.replaceState(null, "", target);
    stack[0] = target;
    lastKey = target;
    route();
  }

  function tokenMatch(hay, word) {
    if (word.length >= 4) return hay.includes(word);
    const esc = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp("(^|[^a-z0-9])" + esc + "(?=[^a-z0-9]|$)", "i").test(hay);
  }

  function searchLessons(query) {
    const q = fold(query).trim();
    if (!q) return [];
    const words = q.split(/\s+/).filter(Boolean);
    return lessons
      .map((l) => {
        const hay = fold(
          [
            l.chapter,
            l.branch,
            branchLabel[l.branch],
            l.channel,
            l.videoTitle,
            (l.videos || []).map((v) => v.title).join(" "),
            l.formula,
            (l.basics || []).join(" "),
            (l.basicsAr || []).join(" "),
            l.conclusion,
            l.conclusionAr || "",
            subjectMeta(l.subject).search,
            subjectMeta(l.subject).name,
            subjectMeta(l.subject).nameLong,
            "S" + l.semester,
          ].join(" ")
        );
        const hit = words.every((w) => tokenMatch(hay, w));
        if (!hit) return null;
        const titleHit = words.every((w) => tokenMatch(fold(l.chapter), w));
        return { lesson: l, score: titleHit ? 0 : 1 };
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score || a.lesson.chapter.localeCompare(b.lesson.chapter, "fr"))
      .map((x) => x.lesson);
  }

  function ytIframe(id, title, autoplay) {
    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      hl: "fr",
    });
    if (autoplay) params.set("autoplay", "1");
    const src = `https://www.youtube.com/embed/${encodeURIComponent(id)}?${params}`;
    return `<iframe src="${src}" title="${escapeHtml(title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
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

  function header(active, query) {
    const stats = store.stats(lessons);
    const q = query != null ? query : parseHash().q;
    return `
      <a class="sb-skip" href="#main">Aller au contenu</a>
      <header class="sb-header">
        <div class="sb-container sb-header__inner">
          <a class="sb-header__brand" href="#/" data-link>
            <img class="sb-logo" src="img/pfp.png" alt="" width="36" height="36" />
            <span>
              <span class="sb-header__name">Succès Bac <span>SM</span>!</span>
              <span class="sb-header__tag">1er Bac · Sciences Maths</span>
            </span>
          </a>
          <form class="sb-search" id="search-form" role="search" action="#/recherche">
            <label class="sb-search__label" for="search-input">Rechercher</label>
            <input id="search-input" class="sb-search__input" type="search" name="q" value="${escapeHtml(q)}" placeholder="Rechercher un cours…" autocomplete="off" />
            <button class="sb-search__btn" type="submit" aria-label="Lancer la recherche">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="7"/>
                <path d="M20 20l-3.2-3.2"/>
              </svg>
            </button>
            <div class="sb-search__suggest" id="search-suggest" hidden></div>
          </form>
          <nav class="sb-header__nav" aria-label="Navigation principale">
            <a href="#/" data-link class="${active === "home" ? "is-active" : ""}">Accueil</a>
            <a href="#/maths" data-link class="${active === "maths" ? "is-active" : ""}">Maths</a>
            <a href="#/pc" data-link class="${active === "pc" ? "is-active" : ""}">PC</a>
            <a href="#/regional" data-link class="${active === "regional" ? "is-active" : ""}">Régional</a>
            <a href="#/planning" data-link class="${active === "planning" ? "is-active" : ""}">Planning</a>
            <a href="#/stats" data-link class="${active === "stats" ? "is-active" : ""}">Stats (${stats.allPct}%)</a>
          </nav>
          <div class="sb-header__tools">
            <button class="sb-atelier__btn" type="button" id="atelier-btn" aria-expanded="false" aria-controls="atelier-panel" title="Apparence">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 2 L14.245 8.91 L21.511 8.91 L15.633 13.18 L17.878 20.09 L12 15.82 L6.122 20.09 L8.367 13.18 L2.489 8.91 L9.755 8.91 Z"/>
              </svg>
              <span class="sb-search__label">Apparence</span>
            </button>
            <div class="sb-atelier" id="atelier-panel" hidden>
              <p class="sb-atelier__label">Apparence</p>
              <div class="sb-theme" role="radiogroup" aria-label="Thème">
                <button type="button" class="sb-theme__btn" role="radio" data-theme-set="light">Jour</button>
                <button type="button" class="sb-theme__btn" role="radio" data-theme-set="dark">Nuit</button>
                <button type="button" class="sb-theme__btn" role="radio" data-theme-set="system">Auto</button>
              </div>
              <label class="sb-atelier__check">
                <input type="checkbox" id="ornaments-toggle" />
                Ornements zellige
              </label>
            </div>
            <button class="sb-header__toggle" type="button" aria-expanded="false" aria-controls="menu-mobile" id="burger">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
        <div class="sb-container sb-header__panel" id="menu-mobile">
          <a href="#/" data-link>Accueil</a>
          <a href="#/maths" data-link>Programme Maths</a>
          <a href="#/pc" data-link>Programme Physique-Chimie</a>
          <a href="#/regional" data-link>Matières du régional</a>
          <a href="#/planning" data-link>Planning SM / EX</a>
          <a href="#/arabe" data-link>Arabe</a>
          <a href="#/francais" data-link>Français</a>
          <a href="#/islam" data-link>Éducation islamique</a>
          <a href="#/hg" data-link>اجتماعيات</a>
          <a href="#/stats" data-link>Mes statistiques</a>
          <a href="#/notes" data-link>Toutes mes notes</a>
        </div>
      </header>`;
  }

  function footer() {
    return `
      <section class="sb-strip">
        <p class="sb-strip__arabic sb-arabic"><span class="sb-khatem" aria-hidden="true"></span>نجاح الباك<span class="sb-khatem" aria-hidden="true"></span></p>
        <p>Plateforme marocaine · 1er Bac SM et Sciences Expérimentales</p>
      </section>
      <footer class="sb-footer">
        <div class="sb-container sb-footer__inner">
          <p>Succès Bac SM! · Cahier du 1er Bac Sciences Maths · Maroc</p>
          <p>
            <a href="https://github.com/AmineMourahi/sm" target="_blank" rel="noopener">Code sur GitHub</a>
            · Séries YouTube du même cours · Conclusions pour réviser vite
          </p>
        </div>
      </footer>`;
  }

  function courseCard(l) {
    const done = store.isDone(l.id);
    const meta = subjectMeta(l.subject);
    const badge = meta.badge;
    const branch = branchLabel[l.branch] || "";
    const branchHtml = isRtlText(branch)
      ? `<span lang="ar" dir="rtl">${escapeHtml(branch)}</span>`
      : escapeHtml(branch);
    return `
      <a class="sb-course-card sb-course-card--${badge}" href="#/cours/${l.id}" data-link>
        <span class="sb-course-card__tab">S${l.semester}</span>
        <div class="sb-course-card__body">
          <div>
            <span class="sb-badge sb-badge--${badge}">${escapeHtml(meta.name)}</span>
            ${done ? '<span class="sb-badge sb-badge--done">Terminé</span>' : ""}
          </div>
          <h3 class="sb-course-card__title">${chapterLabel(l)}</h3>
          <p class="sb-course-card__meta">${branchHtml}${branch ? " · " : ""}${
            videosOf(l).length > 1 ? `${videosOf(l).length} vidéos · ` : ""
          }${durationOf(l)} min · ${escapeHtml(l.channel)}</p>
          <div class="sb-progress"><div class="sb-progress__fill ${fillClass(l.subject)}" style="width:${done ? 100 : 0}%"></div></div>
        </div>
      </a>`;
  }

  function renderHome() {
    const st = store.stats(lessons);
    const featured = [
      byId["logique-mathematique"],
      byId["derivation"],
      byId["acido-basiques"],
      byId["shir-ihya"],
      byId["iman-ghayb"],
      byId["boite-merveilles"],
    ].filter(Boolean);
    app.innerHTML = `
      ${header("home")}
      <main id="main">
        <section class="sb-hero">
          <div class="sb-hero__stars" aria-hidden="true"></div>
          <svg class="sb-hero__jewel sb-hero__jewel--tl" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 2 L14.245 8.91 L21.511 8.91 L15.633 13.18 L17.878 20.09 L12 15.82 L6.122 20.09 L8.367 13.18 L2.489 8.91 L9.755 8.91 Z"/>
          </svg>
          <svg class="sb-hero__jewel sb-hero__jewel--tr" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 2 L14.245 8.91 L21.511 8.91 L15.633 13.18 L17.878 20.09 L12 15.82 L6.122 20.09 L8.367 13.18 L2.489 8.91 L9.755 8.91 Z"/>
          </svg>
          <div class="sb-container sb-hero__layout">
            <div class="sb-hero__copy">
              <p class="sb-hero__kicker">${site.kicker}</p>
              <h1 class="sb-hero__title">Succès Bac <em>SM!</em></h1>
              <p class="sb-hero__lead">${site.tagline}</p>
              <div class="sb-hero__actions">
                <a class="sb-btn sb-btn--primary" href="#/maths" data-link>Programme Maths</a>
                <a class="sb-btn sb-btn--secondary" href="#/pc" data-link>Programme Physique-Chimie</a>
                <a class="sb-btn sb-btn--ghost" href="#/planning" data-link>Planning SM / EX</a>
              </div>
              <p class="sb-flag">
                <svg class="sb-flag__star" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3.2 L14.2 9.8 L21.2 9.9 L15.6 14 L17.7 20.8 L12 16.8 L6.3 20.8 L8.4 14 L2.8 9.9 L9.8 9.8 Z"/></svg>
                Maroc · français scientifique · ${lessons.length} cours · ta progression : <strong>${st.allPct}%</strong>
              </p>
            </div>
            <aside class="sb-hero__seal" aria-hidden="true">
              <div>
                <p class="sb-arabic">${site.arabic}</p>
                <p class="sb-hero__seal-meta">1er Bac · SM</p>
              </div>
            </aside>
          </div>
        </section>
        <section class="sb-section">
          <div class="sb-container">
            <div class="sb-pillars">
              <article class="sb-pillar">
                <div class="sb-pillar__icon sb-pillar__icon--maths">01</div>
                <div>
                  <h3>Mathématiques</h3>
                  <p>${maths.length} cours du programme SM : logique, analyse, géométrie de l’espace, arithmétique.</p>
                </div>
                <a class="sb-btn sb-btn--sm sb-btn--primary" href="#/maths" data-link>Ouvrir les maths</a>
              </article>
              <article class="sb-pillar">
                <div class="sb-pillar__icon sb-pillar__icon--pc">02</div>
                <div>
                  <h3>Physique-Chimie</h3>
                  <p>${pcs.length} cours : mécanique, énergie, électricité, optique, solutions, organique.</p>
                </div>
                <a class="sb-btn sb-btn--sm sb-btn--danger" href="#/pc" data-link>Ouvrir la PC</a>
              </article>
              <article class="sb-pillar">
                <div class="sb-pillar__icon sb-pillar__icon--gold">03</div>
                <div>
                  <h3>Régional</h3>
                  <p>${regionalSubjects.reduce((n, s) => n + lessonsOf(s.id).length, 0)} cours : arabe, français, éduc. islamique, اجتماعيات — même format que maths et PC.</p>
                </div>
                <a class="sb-btn sb-btn--sm sb-btn--ghost" href="#/regional" data-link>Ouvrir le régional</a>
              </article>
              <article class="sb-pillar">
                <div class="sb-pillar__icon sb-pillar__icon--ar">04</div>
                <div>
                  <h3>Planning</h3>
                  <p>1er Bac SM ou EX : quoi étudier, combien d’heures, régional et contrôles de classe en même temps.</p>
                </div>
                <a class="sb-btn sb-btn--sm sb-btn--ghost" href="#/planning" data-link>Ouvrir le planning</a>
              </article>
              <article class="sb-pillar">
                <div class="sb-pillar__icon sb-pillar__icon--gold">05</div>
                <div>
                  <h3>Stats & notes</h3>
                  <p>Vois où tu en es (1 %, 40 %, 100 %) et prends des notes à côté de chaque vidéo — un clic pour les cacher.</p>
                </div>
                <a class="sb-btn sb-btn--sm sb-btn--ghost" href="#/stats" data-link>Voir ma progression</a>
              </article>
            </div>
          </div>
        </section>
        <section class="sb-section" style="padding-top:0">
          <div class="sb-container">
            <div class="sb-section__head">
              <div>
                <h2 class="sb-section__title">Cours à ouvrir tout de suite</h2>
                <p class="sb-section__sub">Séries YouTube du même chapitre (séance 1, 2, 3…) + conclusion express si tu n’as pas le temps de tout regarder.</p>
              </div>
            </div>
            <div class="sb-grid sb-grid--atelier">${featured.map(courseCard).join("")}</div>
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
          <span class="sb-progress" style="width:120px"><span class="sb-progress__fill ${fillClass(subject)}" style="width:${pct}%;display:block;height:100%"></span></span>
        </button>
        <div class="sb-module__body">
          ${mod.items
            .map((l) => {
              const on = store.isDone(l.id);
              const branch = branchLabel[l.branch] || "";
              const branchHtml = isRtlText(branch)
                ? `<span lang="ar" dir="rtl">${escapeHtml(branch)}</span>`
                : escapeHtml(branch);
              return `<a class="sb-lesson-row ${on ? "is-done" : ""}" href="#/cours/${l.id}" data-link>
                <span style="display:flex;align-items:center;gap:.7rem">
                  <span class="sb-check ${on ? "is-on" : ""}"></span>
                  <span><strong>${chapterLabel(l)}</strong><br><small>${branchHtml}${branch ? " · " : ""}${videosOf(l).length > 1 ? videosOf(l).length + " vidéos · " : ""}${durationOf(l)} min</small></span>
                </span>
                <span class="sb-badge sb-badge--${subjectMeta(l.subject).badge}">${on ? "Fait" : "À faire"}</span>
              </a>`;
            })
            .join("")}
        </div>
      </article>`;
  }

  function renderProgramme(subjectId) {
    const meta = subjectMeta(subjectId);
    const list = lessonsOf(subjectId);
    const st = store.stats(lessons);
    const pct = subjectPct(st, subjectId);
    const title = meta.nameLong;
    const titleHtml = isRtlText(title)
      ? `<span lang="ar" dir="rtl" class="sb-arabic">${escapeHtml(title)}</span>`
      : escapeHtml(title);
    const lead = meta.lead || "";
    app.innerHTML = `
      ${header(meta.group === "regional" ? "regional" : meta.slug)}
      <main id="main">
        <div class="sb-container sb-pagehead">
          <p class="sb-breadcrumb">${backLink(meta.group === "regional" ? "#/regional" : "#/")}</p>
          <p class="sb-hero__kicker">Programme officiel · 1er Bac SM</p>
          <h1 class="sb-section__title">${titleHtml}</h1>
          <p class="sb-section__sub">${lead}</p>
          <p style="margin-top:1rem;font-family:var(--sb-font-display);font-size:1.4rem">${pct}% du programme ${escapeHtml(meta.name)} terminé</p>
          <div class="sb-progress" style="max-width:320px;height:8px;margin-top:.6rem">
            <div class="sb-progress__fill ${fillClass(subjectId)}" style="width:${pct}%"></div>
          </div>
        </div>
        <section class="sb-section" style="padding-top:0">
          <div class="sb-container sb-programme">
            ${groupModules(list).map((m) => moduleBlock(m, subjectId)).join("")}
          </div>
        </section>
      </main>
      ${footer()}`;
  }

  function renderRegional() {
    const st = store.stats(lessons);
    app.innerHTML = `
      ${header("regional")}
      <main id="main">
        <div class="sb-container sb-pagehead">
          <p class="sb-breadcrumb">${backLink("#/")}</p>
          <p class="sb-hero__kicker">Examen régional · 1er Bac SM et EX</p>
          <h1 class="sb-section__title">Matières du régional</h1>
          <p class="sb-section__sub">Arabe, français, éducation islamique et اجتماعيات : mêmes cartes, mêmes vidéos, mêmes conclusions express que maths et PC. Pour les heures et le mix contrôles / régional, ouvre le <a href="#/planning" data-link>planning SM / EX</a>.</p>
          <p style="margin-top:1rem;font-family:var(--sb-font-display);font-size:1.4rem">${st.regionalPct}% du régional terminé</p>
          <div class="sb-progress" style="max-width:320px;height:8px;margin-top:.6rem">
            <div class="sb-progress__fill sb-progress__fill--ar" style="width:${st.regionalPct}%"></div>
          </div>
        </div>
        <section class="sb-section" style="padding-top:0">
          <div class="sb-container">
            <div class="sb-pillars">
              ${regionalSubjects
                .map((s, i) => {
                  const n = lessonsOf(s.id).length;
                  const pct = subjectPct(st, s.id);
                  const nameHtml = isRtlText(s.nameLong)
                    ? `<span lang="ar" dir="rtl" class="sb-arabic">${escapeHtml(s.nameLong)}</span>`
                    : escapeHtml(s.nameLong);
                  return `<article class="sb-pillar">
                    <div class="sb-pillar__icon sb-pillar__icon--${s.badge}">${String(i + 1).padStart(2, "0")}</div>
                    <div>
                      <h3>${nameHtml}</h3>
                      <p>${n} cours · ${pct}% · ${escapeHtml(s.lead)}</p>
                    </div>
                    <a class="sb-btn sb-btn--sm sb-btn--ghost" href="#/${s.slug}" data-link>Ouvrir</a>
                  </article>`;
                })
                .join("")}
            </div>
          </div>
        </section>
      </main>
      ${footer()}`;
  }

  function formatHours(n) {
    const v = Math.round((Number(n) || 0) * 60);
    if (!v) return "—";
    const h = Math.floor(v / 60);
    const m = v % 60;
    if (!h) return `${m} min`;
    if (!m) return `${h} h`;
    return `${h} h ${m}`;
  }

  function trackBadge(track) {
    if (track === "reg") return '<span class="sb-badge sb-badge--ar">Régional</span>';
    if (track === "both") return '<span class="sb-badge sb-badge--islam">Classe + régional</span>';
    return '<span class="sb-badge sb-badge--maths">Contrôle</span>';
  }

  function chapterLists(ids) {
    return ids
      .map((subjectId) => {
        const meta = subjectMeta(subjectId);
        const list = lessonsOf(subjectId);
        if (!list.length) return "";
        const nameHtml = isRtlText(meta.nameLong)
          ? `<span lang="ar" dir="rtl" class="sb-arabic">${escapeHtml(meta.nameLong)}</span>`
          : escapeHtml(meta.nameLong);
        return `<article class="sb-plan-block">
          <h3>${nameHtml}</h3>
          ${groupModules(list)
            .map((mod) => {
              if (!mod.items.length) return "";
              return `<p class="sb-plan-sem">${mod.title}</p>
                <ul class="sb-plan-chapters">
                  ${mod.items
                    .map((l) => {
                      const on = store.isDone(l.id);
                      return `<li class="${on ? "is-done" : ""}"><a href="#/cours/${l.id}" data-link>${chapterLabel(l)}</a>${on ? " · fait" : ""}</li>`;
                    })
                    .join("")}
                </ul>`;
            })
            .join("")}
        </article>`;
      })
      .join("");
  }

  function renderPlanning(f) {
    const plan = window.SB_PLAN;
    if (!plan || !plan.streams) {
      app.innerHTML = `${header("planning")}<main class="sb-container sb-empty"><p>Planning indisponible.</p>${backLink("#/")}</main>${footer()}`;
      return;
    }
    const streamId = f === "ex" || f === "sm" ? f : store.getStream();
    store.setStream(streamId);
    const stream = plan.streams[streamId];
    const st = store.stats(lessons);
    const classTotal = stream.subjects.reduce((n, s) => n + (Number(s.classH) || 0), 0);
    const homeTotal = stream.subjects.reduce((n, s) => n + (Number(s.homeH) || 0), 0);
    const rows = stream.subjects
      .map((s) => {
        const nameHtml = isRtlText(s.name)
          ? `<span lang="ar" dir="rtl" class="sb-arabic">${escapeHtml(s.name)}</span>`
          : escapeHtml(s.name);
        const title = s.href
          ? `<a href="${s.href}" data-link>${nameHtml}</a>`
          : nameHtml;
        return `<tr data-track="${s.track}">
          <td>${title}<br><small>${escapeHtml(s.tip || "")}</small></td>
          <td>${formatHours(s.classH)}</td>
          <td>${formatHours(s.homeH)}</td>
          <td>${s.cc != null ? s.cc : "—"}</td>
          <td>${s.regional != null ? s.regional : "—"}</td>
          <td>${trackBadge(s.track)}</td>
        </tr>`;
      })
      .join("");
    const week = stream.week
      .map(
        (d) => `<article class="sb-plan-day">
          <h3>${escapeHtml(d.day)}</h3>
          <ul>
            ${d.slots
              .map(
                (slot) => `<li class="sb-plan-slot sb-plan-slot--${slot.track}">
                  <strong>${escapeHtml(slot.time)}</strong>
                  <span>${escapeHtml(slot.subject)}</span>
                </li>`
              )
              .join("")}
          </ul>
        </article>`
      )
      .join("");
    const phases = stream.mix
      .map(
        (p) => `<article class="sb-plan-phase">
          <p class="sb-plan-phase__split">${escapeHtml(p.split)}</p>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.text)}</p>
        </article>`
      )
      .join("");
    const scienceNote =
      streamId === "ex"
        ? `<p class="sb-section__sub">En EX, maths / PC / SVT se jouent aux <strong>contrôles de classe</strong> (coef 7 chacune). Les vidéos maths et PC du site suivent le programme <strong>SM</strong>, plus dense : prends-les pour les chapitres que ton prof a déjà faits. La SVT n’a pas encore de série ici — le cahier de classe reste la référence.</p>`
        : `<p class="sb-section__sub">En SM, maths (coef 9) et PC (coef 7) n’ont <strong>pas</strong> d’épreuve au régional : elles se jouent toute l’année aux devoirs. Les 17 + 27 cours du site couvrent ce pilier.</p>`;
    app.innerHTML = `
      ${header("planning")}
      <main id="main">
        <div class="sb-container sb-pagehead">
          <p class="sb-breadcrumb">${backLink("#/")}</p>
          <p class="sb-hero__kicker">Planning · année scolaire · régional ${escapeHtml(plan.regionalSession)}</p>
          <h1 class="sb-section__title">Quoi étudier, combien d’heures</h1>
          <p class="sb-section__sub">${escapeHtml(plan.note)}</p>
          <div class="sb-plan-switch" role="radiogroup" aria-label="Filière">
            <button type="button" class="sb-plan-switch__btn" data-stream="sm" role="radio" aria-checked="${streamId === "sm"}">1er Bac SM</button>
            <button type="button" class="sb-plan-switch__btn" data-stream="ex" role="radio" aria-checked="${streamId === "ex"}">1er Bac EX</button>
          </div>
          <p class="sb-plan-lead">${escapeHtml(stream.lead)}</p>
          <p style="margin-top:1rem;font-family:var(--sb-font-display);font-size:1.4rem">${escapeHtml(stream.nameLong)}</p>
          <p class="sb-section__sub">${formatHours(classTotal)} de classe · ${formatHours(homeTotal)} de travail maison · ${formatHours(classTotal + homeTotal)} en tout dans la semaine type</p>
        </div>
        <section class="sb-section" style="padding-top:0">
          <div class="sb-container">
            <div class="sb-plan-tracks">
              <article class="sb-plan-track">
                <p class="sb-plan-track__kicker">Piste 1</p>
                <h2>Contrôles de classe</h2>
                <p>Devoirs surveillés toute l’année. En SM : maths et PC d’abord. En EX : maths, PC et SVT à parts égales. Philosophie et 2e langue aussi, plus légères.</p>
              </article>
              <article class="sb-plan-track sb-plan-track--reg">
                <p class="sb-plan-track__kicker">Piste 2</p>
                <h2>Examen régional</h2>
                <p>Arabe, français, éduc. islamique, اجتماعيات. Session ${escapeHtml(plan.regionalSession)} · rattrapage ${escapeHtml(plan.regionalRetry)}. Compte 25 % du bac — à travailler dès septembre, ${st.regionalPct}% des cours du site déjà faits.</p>
                <p><a class="sb-btn sb-btn--sm sb-btn--ghost" href="#/regional" data-link>Ouvrir les cours du régional</a></p>
              </article>
            </div>
            <h2 class="sb-section__title" style="margin-top:2rem">Heures par matière</h2>
            <p class="sb-section__sub">Classe = lycée. Maison = soir et week-end. Les deux pistes en même temps : ne coupe jamais les sciences la semaine d’un devoir, ne zappe jamais le régional les semaines « calmes ».</p>
            <div class="sb-plan-tablewrap">
              <table class="sb-plan-table">
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Classe / sem.</th>
                    <th>Maison / sem.</th>
                    <th>Coef CC</th>
                    <th>Coef régional</th>
                    <th>Piste</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
                <tfoot>
                  <tr>
                    <th>Total</th>
                    <th>${formatHours(classTotal)}</th>
                    <th>${formatHours(homeTotal)}</th>
                    <th colspan="3">${formatHours(classTotal + homeTotal)} lycée + maison</th>
                  </tr>
                </tfoot>
              </table>
            </div>
            <h2 class="sb-section__title" style="margin-top:2rem">Semaine type (travail maison)</h2>
            <p class="sb-section__sub">Après les cours, pas à la place. Si un devoir tombe : décale le régional au week-end, ne saute pas les sciences.</p>
            <div class="sb-plan-week">${week}</div>
            <h2 class="sb-section__title" style="margin-top:2rem">L’année en trois temps</h2>
            <div class="sb-plan-phases">${phases}</div>
            <h2 class="sb-section__title" style="margin-top:2rem">Programme à couvrir</h2>
            ${scienceNote}
            <div class="sb-plan-blocks">
              ${streamId === "sm" ? chapterLists(["math", "pc", "ar", "fr", "islam", "hg"]) : chapterLists(["ar", "fr", "islam", "hg", "math", "pc"])}
            </div>
          </div>
        </section>
      </main>
      ${footer()}`;
    document.querySelectorAll("[data-stream]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.stream === "ex" ? "ex" : "sm";
        store.setStream(id);
        location.hash = `#/planning?f=${id}`;
      });
    });
  }

  function neighbors(lesson) {
    const pool = lessonsOf(lesson.subject);
    const i = pool.findIndex((x) => x.id === lesson.id);
    return { prev: pool[i - 1], next: pool[i + 1], i, n: pool.length, pool };
  }

  function lessonIndex(lesson) {
    const { pool, i, n } = neighbors(lesson);
    const name = subjectMeta(lesson.subject).name;
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
            <span class="sb-index__title">${chapterLabel(item)}</span>
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

  function conclusionBlock(l) {
    const lang = store.getLang();
    const arReady = Boolean(l.conclusionAr);
    const frList = (l.basics || []).map((b) => `<li>${b}</li>`).join("");
    const arList = (l.basicsAr || []).map((b) => `<li>${b}</li>`).join("");
    return `
      <article class="sb-conclusion${lang === "ar" && arReady ? " sb-conclusion--ar" : ""}">
        <div class="sb-conclusion__head">
          <h2 class="sb-conclusion__title" id="conclusion-title" ${lang === "ar" && arReady ? 'dir="rtl" lang="ar"' : 'lang="fr"'}>${
            lang === "ar" && arReady ? "الخلاصة — إن لم تشاهد الفيديو" : "Conclusion — si tu n’as pas tout regardé"
          }</h2>
          <div class="sb-langtabs" role="tablist" aria-label="Langue de la conclusion">
            <button type="button" class="sb-langtabs__btn" role="tab" id="lang-fr" data-lang="fr" aria-controls="pane-fr" aria-selected="${lang !== "ar"}">Français</button>
            <button type="button" class="sb-langtabs__btn" role="tab" id="lang-ar" data-lang="ar" aria-controls="pane-ar" aria-selected="${lang === "ar"}" ${arReady ? "" : "disabled"}>العربية</button>
          </div>
        </div>
        <div class="sb-conclusion__pane" id="pane-fr" data-pane="fr" lang="fr" role="tabpanel" aria-labelledby="lang-fr" ${lang === "ar" && arReady ? "hidden" : ""}>
          <p>${l.conclusion}</p>
          <h3 class="sb-conclusion__h3">Les bases à retenir</h3>
          <ul class="sb-conclusion__list">${frList}</ul>
        </div>
        <div class="sb-conclusion__pane sb-conclusion__pane--ar" id="pane-ar" data-pane="ar" lang="ar" dir="rtl" role="tabpanel" aria-labelledby="lang-ar" ${lang === "ar" && arReady ? "" : "hidden"}>
          <p>${l.conclusionAr || ""}</p>
          <h3 class="sb-conclusion__h3">الأساسيات التي يجب حفظها</h3>
          <ul class="sb-conclusion__list">${arList}</ul>
        </div>
        <p class="sb-callout" dir="ltr">${l.formula}</p>
      </article>`;
  }

  function bindLangTabs() {
    const tabs = document.querySelectorAll(".sb-langtabs__btn");
    if (!tabs.length) return;
    const title = document.getElementById("conclusion-title");
    const box = document.querySelector(".sb-conclusion");
    const panes = {
      fr: document.querySelector('[data-pane="fr"]'),
      ar: document.querySelector('[data-pane="ar"]'),
    };
    const apply = (lang) => {
      const ar = lang === "ar";
      store.setLang(ar ? "ar" : "fr");
      tabs.forEach((btn) => btn.setAttribute("aria-selected", String(btn.dataset.lang === lang)));
      if (panes.fr) panes.fr.hidden = ar;
      if (panes.ar) panes.ar.hidden = !ar;
      if (box) box.classList.toggle("sb-conclusion--ar", ar);
      if (title) {
        title.textContent = ar ? "الخلاصة — إن لم تشاهد الفيديو" : "Conclusion — si tu n’as pas tout regardé";
        title.lang = ar ? "ar" : "fr";
        if (ar) title.setAttribute("dir", "rtl");
        else title.removeAttribute("dir");
      }
    };
    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        apply(btn.dataset.lang);
      });
    });
  }

  function renderLesson(id) {
    const l = byId[id];
    if (!l) {
      app.innerHTML = `${header("home")}<main class="sb-container sb-empty"><p>Cours introuvable.</p>${backLink("#/")}</main>${footer()}`;
      return;
    }
    const done = store.isDone(l.id);
    const note = store.getNote(l.id);
    const open = store.notesOpen();
    const { prev, next } = neighbors(l);
    const meta = subjectMeta(l.subject);
    const subjectHref = `#/${meta.slug}`;
    const subjectName = meta.nameLong;
    const branch = branchLabel[l.branch] || meta.name;
    const branchHtml = isRtlText(branch)
      ? `<span lang="ar" dir="rtl">${escapeHtml(branch)}</span>`
      : escapeHtml(branch);
    const ytQuery =
      l.subject === "math" || l.subject === "pc"
        ? `${l.chapter} 1bac SM cours`
        : `${l.chapter} أولى باك 1bac Maroc`;
    const parts = videosOf(l);
    const first = parts[0];
    const playlist =
      parts.length > 1
        ? `<ol class="sb-playlist" aria-label="Séances du chapitre">
            ${parts
              .map(
                (v, i) => `<li>
              <button type="button" class="sb-playlist__item${i === 0 ? " is-current" : ""}" data-i="${i}" data-yt="${v.youtubeId}" data-title="${escapeHtml(v.title)}">
                <span class="sb-playlist__n">${i + 1}</span>
                <span class="sb-playlist__title">${escapeHtml(v.title)}</span>
                ${v.durationMin ? `<span class="sb-playlist__dur">${v.durationMin} min</span>` : ""}
              </button>
            </li>`
              )
              .join("")}
          </ol>`
        : "";
    app.innerHTML = `
      ${header(meta.group === "regional" ? "regional" : meta.slug)}
      <main id="main" class="sb-section">
        <div class="sb-container">
          <nav class="sb-breadcrumb">
            ${backLink(subjectHref)}
            <span aria-hidden="true">·</span>
            <a href="#/" data-link>Accueil</a> ·
            ${meta.group === "regional" ? `<a href="#/regional" data-link>Régional</a> · ` : ""}
            <a href="${subjectHref}" data-link>${isRtlText(subjectName) ? `<span lang="ar" dir="rtl" class="sb-arabic">${escapeHtml(subjectName)}</span>` : escapeHtml(subjectName)}</a> ·
            <span>S${l.semester}</span>
          </nav>
          <div style="display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-bottom:1rem">
            <span class="sb-badge sb-badge--${meta.badge}">${branchHtml}</span>
            <span class="sb-badge">${durationOf(l)} min</span>
            ${videosOf(l).length > 1 ? `<span class="sb-badge">${videosOf(l).length} vidéos</span>` : ""}
            ${done ? '<span class="sb-badge sb-badge--done">Cours terminé</span>' : ""}
          </div>
          <h1 class="sb-section__title">${chapterLabel(l)}</h1>
          <p class="sb-section__sub">${parts.length > 1 ? `${parts.length} vidéos à la suite` : "Vidéo"} : ${escapeHtml(first.title)} · ${escapeHtml(l.channel)}</p>

          <div class="sb-cours" style="margin-top:1.25rem">
            <div>
              <div class="sb-player" id="yt-box" data-yt="${first.youtubeId}">
                <div class="sb-player__frame" id="yt-frame">
                  <button type="button" class="sb-player__poster" id="yt-play" aria-label="Lire ${escapeHtml(first.title)}">
                    <img src="https://i.ytimg.com/vi/${first.youtubeId}/hqdefault.jpg" alt="">
                    <span class="sb-player__play">Lire la vidéo</span>
                  </button>
                </div>
              </div>
              ${playlist}
              <div class="sb-player__bar">
                <button class="sb-btn sb-btn--ghost" type="button" id="yt-reload">Relancer la vidéo</button>
                <a class="sb-btn sb-btn--ghost" href="https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery)}" target="_blank" rel="noopener">Autre vidéo</a>
              </div>
              <p class="sb-player__hint" id="yt-hint">${
                parts.length > 1
                  ? "Le chapitre est en plusieurs séances : lance la 1, puis la 2, etc. Même cours, à la suite."
                  : "Clique sur « Lire la vidéo » : le cours se lance ici, sans ouvrir YouTube."
              }</p>
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

          ${conclusionBlock(l)}

          <div class="sb-cours-nav" style="margin-top:1.25rem">
            ${prev ? `<a class="sb-btn sb-btn--ghost" href="#/cours/${prev.id}" data-link>← ${chapterLabel(prev)}</a>` : "<span></span>"}
            ${next ? `<a class="sb-btn sb-btn--ghost" href="#/cours/${next.id}" data-link>${chapterLabel(next)} →</a>` : "<span></span>"}
          </div>
        </div>
      </main>
      <button class="sb-fab-notes ${open ? "" : "is-visible"}" type="button" id="fab-notes">Mes notes</button>
      ${footer()}`;

    document.getElementById("toggle-notes").addEventListener("click", () => {
      const nextOpen = !store.notesOpen();
      store.setNotesOpen(nextOpen);
      renderLesson(id);
      bindChrome();
    });
    const fab = document.getElementById("fab-notes");
    fab.addEventListener("click", () => {
      store.setNotesOpen(true);
      renderLesson(id);
      bindChrome();
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
    let currentPart = 0;
    const showPart = (i, autoplay) => {
      currentPart = i;
      const v = parts[i];
      const frame = document.getElementById("yt-frame");
      const sub = document.querySelector(".sb-section__sub");
      document.querySelectorAll(".sb-playlist__item").forEach((btn) => {
        btn.classList.toggle("is-current", Number(btn.dataset.i) === i);
      });
      if (sub) {
        sub.textContent = `${parts.length > 1 ? `${parts.length} vidéos à la suite` : "Vidéo"} : ${v.title} · ${l.channel}`;
      }
      if (autoplay || frame.querySelector("iframe")) {
        frame.innerHTML = ytIframe(v.youtubeId, v.title, true);
      } else {
        const play = document.getElementById("yt-play");
        const img = play && play.querySelector("img");
        if (play) play.setAttribute("aria-label", "Lire " + v.title);
        if (img) img.src = `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`;
      }
    };
    const startVideo = () => {
      const v = parts[currentPart];
      document.getElementById("yt-frame").innerHTML = ytIframe(v.youtubeId, v.title, true);
    };
    document.getElementById("yt-play").addEventListener("click", startVideo);
    document.getElementById("yt-reload").addEventListener("click", startVideo);
    document.querySelectorAll(".sb-playlist__item").forEach((btn) => {
      btn.addEventListener("click", () => showPart(Number(btn.dataset.i), true));
    });
    document.getElementById("mark-done").addEventListener("click", () => {
      store.toggleDone(l.id, !store.isDone(l.id));
      toast(store.isDone(l.id) ? "Cours marqué terminé." : "Cours remis à faire.");
      renderLesson(id);
      bindChrome();
    });
    const list = document.querySelector(".sb-index__list");
    const currentRow = document.getElementById("index-current");
    if (list && currentRow) {
      list.scrollTop = currentRow.offsetTop - list.clientHeight / 2 + currentRow.clientHeight / 2;
    }
    bindLangTabs();
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
          <p class="sb-breadcrumb">${backLink("#/")}</p>
          <h1 class="sb-section__title">Ta progression</h1>
          <p class="sb-section__sub">Un pourcentage clair : maths, physique-chimie, matières du régional, et le programme entier.</p>
        </div>
        <section class="sb-section" style="padding-top:0">
          <div class="sb-container">
            <div class="sb-stats-hero">
              ${ring(st.mathPct, "var(--sb-ring-maths)", `Maths · ${st.mathDone}/${st.mathTotal} cours`)}
              ${ring(st.pcPct, "var(--sb-ring-pc)", `Physique-Chimie · ${st.pcDone}/${st.pcTotal} cours`)}
              ${ring(st.regionalPct, "var(--sb-ring-regional)", `Régional · ${st.regionalDone}/${st.regionalTotal} cours`)}
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
                <p class="sb-stat-card__value">${st.allPct === 100 ? "SM" : st.allDone}</p>
                <p class="sb-stat-card__label">${st.allPct === 100 ? "Programme bouclé" : "cours validés"}</p>
              </article>
            </div>
            ${last ? `<p style="margin-top:1.5rem">Dernier cours ouvert : <a href="#/cours/${last.id}" data-link>${chapterLabel(last)}</a></p>` : ""}
            <div class="sb-hero__actions" style="margin-top:1.25rem">
              <a class="sb-btn sb-btn--primary" href="#/" data-back="#/">← Retour</a>
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
        bindChrome();
      }
    });
  }

  function renderNotes() {
    const withNotes = lessons.filter((l) => store.getNote(l.id));
    app.innerHTML = `
      ${header("stats")}
      <main id="main" class="sb-section">
        <div class="sb-container">
          <p class="sb-breadcrumb">${backLink("#/stats")} · <a href="#/stats" data-link>Stats</a></p>
          <h1 class="sb-section__title">Mes notes</h1>
          <p class="sb-section__sub">Toutes tes notes, un clic pour revenir au cours.</p>
          ${
            withNotes.length
              ? withNotes
                  .map(
                    (l) => `<article class="sb-conclusion" style="margin-top:1rem">
                    <h2 class="sb-conclusion__title"><a href="#/cours/${l.id}" data-link>${chapterLabel(l)}</a></h2>
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

  function resolvedTheme() {
    const pref = store.getTheme();
    if (pref === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return pref === "dark" ? "dark" : "light";
  }

  function applyAppearance() {
    const theme = resolvedTheme();
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.ornaments = store.getOrnaments() ? "on" : "off";
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#16110e" : "#f7f1e5";
  }

  function syncAtelierUi() {
    const pref = store.getTheme();
    document.querySelectorAll("[data-theme-set]").forEach((btn) => {
      btn.setAttribute("aria-checked", String(btn.dataset.themeSet === pref));
    });
    const chk = document.getElementById("ornaments-toggle");
    if (chk) chk.checked = store.getOrnaments();
  }

  function bindAtelier() {
    const btn = document.getElementById("atelier-btn");
    const panel = document.getElementById("atelier-panel");
    if (!btn || !panel) return;
    syncAtelierUi();
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = panel.hidden;
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll("[data-theme-set]").forEach((el) => {
      el.addEventListener("click", () => {
        store.setTheme(el.dataset.themeSet);
        applyAppearance();
        syncAtelierUi();
        const label = { light: "Mode jour.", dark: "Mode nuit.", system: "Thème automatique." };
        toast(label[el.dataset.themeSet] || "Apparence enregistrée.");
      });
    });
    const chk = document.getElementById("ornaments-toggle");
    if (chk) {
      chk.addEventListener("change", () => {
        store.setOrnaments(chk.checked);
        applyAppearance();
        toast(chk.checked ? "Ornements affichés." : "Ornements masqués.");
      });
    }
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
    bindSearch();
    bindAtelier();
    document.querySelectorAll("[data-back]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        goBack(el.getAttribute("data-back") || "#/");
      });
    });
  }

  function renderSearch(query) {
    const q = (query || "").trim();
    const hits = q ? searchLessons(q) : [];
    app.innerHTML = `
      ${header("", q)}
      <main id="main">
        <div class="sb-container sb-pagehead">
          <p class="sb-breadcrumb">${backLink("#/")}</p>
          <h1 class="sb-section__title">Recherche</h1>
          <p class="sb-section__sub">${
            q
              ? hits.length
                ? `${hits.length} cours pour « ${escapeHtml(q)} »`
                : `Aucun cours pour « ${escapeHtml(q)} ». Essaie barycentre, pH, مقالة, Antigone…`
              : "Tape un chapitre, une formule ou une matière (maths, arabe, français, islam, اجتماعيات)."
          }</p>
        </div>
        <section class="sb-section" style="padding-top:0">
          <div class="sb-container">
            ${
              hits.length
                ? `<div class="sb-grid sb-grid--3">${hits.map(courseCard).join("")}</div>`
                : `<p class="sb-empty">${q ? "Aucun résultat." : "Le champ de recherche est en haut de la page."}</p>`
            }
          </div>
        </section>
      </main>
      ${footer()}`;
  }

  function bindSearch() {
    const form = document.getElementById("search-form");
    const input = document.getElementById("search-input");
    const box = document.getElementById("search-suggest");
    if (!form || !input || !box) return;

    const showSuggest = () => {
      const q = input.value.trim();
      const hits = searchLessons(q).slice(0, 8);
      if (!q || !hits.length) {
        box.hidden = true;
        box.innerHTML = "";
        return;
      }
      box.innerHTML = hits
        .map((l) => {
          const mat = subjectMeta(l.subject).name;
          return `<a class="sb-search__hit" href="#/cours/${l.id}" data-link>
            <strong>${l.chapter}</strong>
            <span>${mat} · S${l.semester}</span>
          </a>`;
        })
        .join("");
      box.hidden = false;
    };

    input.addEventListener("input", showSuggest);
    input.addEventListener("focus", showSuggest);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        form.requestSubmit();
      }
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = input.value.trim();
      location.hash = q ? `#/recherche?q=${encodeURIComponent(q)}` : "#/recherche";
    });
    input.addEventListener("blur", () => {
      setTimeout(() => {
        box.hidden = true;
      }, 180);
    });
  }

  function route() {
    const { parts, q, f } = parseHash();
    if (parts.length === 0) renderHome();
    else if (parts[0] === "regional") renderRegional();
    else if (parts[0] === "planning") renderPlanning(f);
    else if (parts[0] === "stats") renderStats();
    else if (parts[0] === "notes") renderNotes();
    else if (parts[0] === "recherche") renderSearch(q);
    else if (parts[0] === "cours" && parts[1]) renderLesson(parts[1]);
    else {
      const sub = subjectList.find((s) => s.slug === parts[0]);
      if (sub) renderProgramme(sub.id);
      else renderHome();
    }
    bindChrome();
    const y = scrollPos[hashKey()] || 0;
    window.scrollTo(0, y);
  }

  window.addEventListener("hashchange", () => {
    scrollPos[lastKey] = window.scrollY;
    const next = hashKey();
    if (goingBack) {
      goingBack = false;
    } else if (stack[stack.length - 2] === next) {
      stack.pop();
    } else if (stack[stack.length - 1] !== next) {
      stack.push(next);
    }
    lastKey = next;
    route();
  });

  if (!location.hash) history.replaceState(null, "", "#/");
  stack.push(hashKey());
  lastKey = hashKey();
  applyAppearance();
  document.addEventListener("click", (e) => {
    const panel = document.getElementById("atelier-panel");
    const btn = document.getElementById("atelier-btn");
    if (!panel || panel.hidden) return;
    if (panel.contains(e.target) || (btn && btn.contains(e.target))) return;
    panel.hidden = true;
    if (btn) btn.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const panel = document.getElementById("atelier-panel");
    const btn = document.getElementById("atelier-btn");
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    if (btn) {
      btn.setAttribute("aria-expanded", "false");
      btn.focus();
    }
  });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (store.getTheme() === "system") applyAppearance();
  });
  route();
})();
