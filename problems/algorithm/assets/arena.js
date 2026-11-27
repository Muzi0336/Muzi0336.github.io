/* 算法栏目共享工具：本地进度、代码高亮、参数解析 */
(function () {
  const D = window.ARENA;
  const KEY = "arena.v1";

  const A = {
    data: D,
    qp(name) {
      return new URLSearchParams(location.search).get(name);
    },
    esc(s) {
      return String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    },
    attr(s) {
      return A.esc(s).replace(/"/g, "&quot;");
    },
    byId(id) {
      return D.problems.find((p) => String(p.id) === String(id));
    },
    track(i) {
      return D.tracks[i] || D.tracks[0];
    },
    statusOf(id) {
      return A.state.status[id] || "todo";
    },
    isBook(id) {
      return !!A.state.book[id];
    },
    isWrong(id) {
      return !!(A.state.wrong && A.state.wrong[id]);
    },
    wrongCount() {
      return Object.keys(A.state.wrong || {}).length;
    },
    toggleWrong(id) {
      A.state.wrong = A.state.wrong || {};
      if (A.state.wrong[id]) delete A.state.wrong[id];
      else A.state.wrong[id] = Date.now();
      A.save();
      return !!A.state.wrong[id];
    },
    clearRecords(id) {
      delete A.state.status[id];
      delete A.state.quiz[id];
      delete A.state.code[id];
      if (A.state.wrong) delete A.state.wrong[id];
      A.save();
    },
    markLesson(slug) {
      A.state.lessons[slug] = Date.now();
      A.save();
    },
    lessonRead(slug) {
      return !!A.state.lessons[slug];
    },
    setStatus(id, status) {
      if (status === "todo") delete A.state.status[id];
      else A.state.status[id] = status;
      A.save();
    },
    toggleBook(id) {
      if (A.state.book[id]) delete A.state.book[id];
      else A.state.book[id] = Date.now();
      A.save();
      return !!A.state.book[id];
    },
    getCode(id, lang) {
      return (A.state.code[id] || {})[lang] || "";
    },
    setCode(id, lang, text) {
      if (!A.state.code[id]) A.state.code[id] = {};
      A.state.code[id][lang] = text;
      A.save();
    },
    summary() {
      const ids = Object.keys(A.state.status);
      let done = 0, reading = 0;
      ids.forEach((id) => {
        if (A.state.status[id] === "done") done++;
        else if (A.state.status[id] === "reading") reading++;
      });
      return {
        done,
        reading,
        total: D.problems.length,
        book: Object.keys(A.state.book).length,
        lessons: Object.keys(A.state.lessons).length,
        percent: Math.round((done / D.problems.length) * 100),
      };
    },
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(A.state)); } catch (e) {}
    },
    reset() {
      A.state = { status: {}, book: {}, quiz: {}, lessons: {}, code: {}, wrong: {} };
      A.save();
    },
    highlight(code, lang) {
      let s = A.esc(code || "");
      const kw = lang === "python"
        ? "False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|print|input|range|len|int|str|list|dict|set|tuple|sum|min|max|sorted|enumerate|zip"
        : "auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|restrict|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|class|namespace|template|typename|public|private|protected|virtual|override|new|delete|using|bool|true|false|nullptr|constexpr|noexcept|vector|string|pair|map|set|queue|stack|priority_queue|unordered_map|unordered_set|cout|cin|endl|std|printf|scanf|fgets|strlen|malloc|free|memset|sort|max|min|swap|abs";
      const re = new RegExp(
        "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|#[A-Za-z]+|\"\"\"[\\s\\S]*?\"\"\"|'''[\\s\\S]*?'''|\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'|\\b\\d+(?:\\.\\d+)?\\b|\\b(?:" + kw + ")\\b)",
        "g"
      );
      return s.replace(re, (m) => {
        if (/^\/\//.test(m) || /^\/\*/.test(m) || /^"""/.test(m) || /^'''/.test(m)) return '<span class="tok-c">' + m + "</span>";
        if (/^#/.test(m)) return '<span class="tok-p">' + m + "</span>";
        if (/^["']/.test(m)) return '<span class="tok-s">' + m + "</span>";
        if (/^\d/.test(m)) return '<span class="tok-n">' + m + "</span>";
        return '<span class="tok-k">' + m + "</span>";
      });
    },
    copy(text, btn) {
      const done = () => {
        if (!btn) return;
        const old = btn.textContent;
        btn.textContent = "已复制";
        setTimeout(() => (btn.textContent = old), 1400);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallback(text, done));
      } else fallback(text, done);
    },
    fmtTime(ts) {
      if (!ts) return "";
      const d = new Date(ts);
      return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0");
    },
  };

  function fallback(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    ta.remove();
  }

  let state = { status: {}, book: {}, quiz: {}, lessons: {}, code: {}, wrong: {} };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = Object.assign(state, JSON.parse(raw));
  } catch (e) {}
  if (!state.wrong) state.wrong = {};
  A.state = state;

  window.A = A;
})();
