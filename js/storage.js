window.SBStore = (() => {
  const KEY = "succes-bac-sm-v1";

  const empty = () => ({
    done: {},
    notes: {},
    notesOpen: true,
    lastLesson: null,
    lang: "fr",
    theme: "light",
    ornaments: true,
  });

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return empty();
      return { ...empty(), ...JSON.parse(raw) };
    } catch {
      return empty();
    }
  }

  function write(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
    return state;
  }

  function isDone(id) {
    return Boolean(read().done[id]);
  }

  function toggleDone(id, value) {
    const s = read();
    if (value === false) delete s.done[id];
    else s.done[id] = Date.now();
    s.lastLesson = id;
    return write(s);
  }

  function getNote(id) {
    return read().notes[id] || "";
  }

  function setNote(id, text) {
    const s = read();
    if (text.trim()) s.notes[id] = text;
    else delete s.notes[id];
    return write(s);
  }

  function notesOpen() {
    return read().notesOpen !== false;
  }

  function setNotesOpen(open) {
    const s = read();
    s.notesOpen = open;
    return write(s);
  }

  function getLang() {
    return read().lang === "ar" ? "ar" : "fr";
  }

  function setLang(lang) {
    const s = read();
    s.lang = lang === "ar" ? "ar" : "fr";
    return write(s);
  }

  function getTheme() {
    const t = read().theme;
    return t === "dark" || t === "system" ? t : "light";
  }

  function setTheme(theme) {
    const s = read();
    s.theme = theme === "dark" || theme === "system" ? theme : "light";
    return write(s);
  }

  function getOrnaments() {
    return read().ornaments !== false;
  }

  function setOrnaments(on) {
    const s = read();
    s.ornaments = Boolean(on);
    return write(s);
  }

  function stats(lessons) {
    const s = read();
    const count = (arr) => arr.filter((l) => s.done[l.id]).length;
    const pct = (n, d) => (d ? Math.round((1000 * n) / d) / 10 : 0);
    const math = lessons.filter((l) => l.subject === "math");
    const pc = lessons.filter((l) => l.subject === "pc");
    const regional = lessons.filter((l) => l.subject !== "math" && l.subject !== "pc");
    const mDone = count(math);
    const pDone = count(pc);
    const rDone = count(regional);
    const allDone = count(lessons);
    const bySubject = {};
    lessons.forEach((l) => {
      if (!bySubject[l.subject]) bySubject[l.subject] = { done: 0, total: 0, pct: 0 };
      bySubject[l.subject].total += 1;
      if (s.done[l.id]) bySubject[l.subject].done += 1;
    });
    Object.keys(bySubject).forEach((id) => {
      const row = bySubject[id];
      row.pct = pct(row.done, row.total);
    });
    const notesCount = Object.keys(s.notes).length;
    return {
      mathDone: mDone,
      mathTotal: math.length,
      mathPct: pct(mDone, math.length),
      pcDone: pDone,
      pcTotal: pc.length,
      pcPct: pct(pDone, pc.length),
      regionalDone: rDone,
      regionalTotal: regional.length,
      regionalPct: pct(rDone, regional.length),
      allDone,
      allTotal: lessons.length,
      allPct: pct(allDone, lessons.length),
      bySubject,
      notesCount,
      lastLesson: s.lastLesson,
    };
  }

  function reset() {
    localStorage.removeItem(KEY);
    return empty();
  }

  return {
    read,
    isDone,
    toggleDone,
    getNote,
    setNote,
    notesOpen,
    setNotesOpen,
    getLang,
    setLang,
    getTheme,
    setTheme,
    getOrnaments,
    setOrnaments,
    stats,
    reset,
  };
})();
