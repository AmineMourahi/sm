window.SBStore = (() => {
  const KEY = "succes-bac-sm-v1";

  const empty = () => ({
    done: {},
    notes: {},
    notesOpen: true,
    lastLesson: null,
    lang: "fr",
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

  function stats(lessons) {
    const s = read();
    const math = lessons.filter((l) => l.subject === "math");
    const pc = lessons.filter((l) => l.subject === "pc");
    const count = (arr) => arr.filter((l) => s.done[l.id]).length;
    const pct = (n, d) => (d ? Math.round((1000 * n) / d) / 10 : 0);
    const mDone = count(math);
    const pDone = count(pc);
    const allDone = mDone + pDone;
    const notesCount = Object.keys(s.notes).length;
    return {
      mathDone: mDone,
      mathTotal: math.length,
      mathPct: pct(mDone, math.length),
      pcDone: pDone,
      pcTotal: pc.length,
      pcPct: pct(pDone, pc.length),
      allDone,
      allTotal: lessons.length,
      allPct: pct(allDone, lessons.length),
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
    stats,
    reset,
  };
})();
