(function () {
  const M = window.ARENA_DEMOS || {};
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const get = (p) => M[(p && p.animation && p.animation.type) || ""] || null;

  window.arenaDemoPreview = function (problem) {
    const d = get(problem);
    if (!d || !d.frames || !d.frames.length) return "";
    return `<img src="assets/${d.frames[0].src}" alt="${esc(problem.title)} 演示首帧" loading="lazy">`;
  };

  window.renderArenaDemo = function (el, problem, opts = {}) {
    if (!el) return;
    const type = (problem.animation || {}).type || "none";
    const d = get(problem);
    if (!d || !d.frames || !d.frames.length) {
      el.innerHTML = `<div class="player"><div class="player-head"><span>DEMO</span><span class="qid">${problem.id}</span><span>·</span><span>${esc(type)}</span></div><div class="player-empty">这个演示暂时没有可用画面。</div></div>`;
      return;
    }
    const frames = d.frames;
    let i = 0, timer = 0;

    el.innerHTML = `<div class="lab-layout">
      <div class="player">
        <div class="player-head"><span>DEMO</span><span class="qid">${problem.id}</span><span>·</span><span>${esc(type)}</span><span class="sp"></span><span id="pIdx">01 / ${String(frames.length).padStart(2, "0")}</span></div>
        <div class="player-stage" id="pStage"><img src="assets/${frames[0].src}" alt="${esc(problem.title)} 演示第 1 帧"></div>
        <div class="player-caption" id="pCap">${esc(frames[0].caption || "")}</div>
        <div class="player-ctrl">
          <button class="pbtn" data-act="prev" type="button">← 上一步</button>
          <button class="pbtn" data-act="play" type="button" id="pPlay">▶ 播放</button>
          <button class="pbtn" data-act="next" type="button">下一步 →</button>
          <button class="pbtn" data-act="reset" type="button">↺</button>
          <span class="sp"></span>
          <span class="idx" id="pStep">STEP 01 / ${String(frames.length).padStart(2, "0")}</span>
          <input id="pRange" type="range" min="0" max="${frames.length - 1}" value="0" aria-label="演示进度">
        </div>
      </div>
      ${opts.compact ? "" : `<aside class="player-side">
        <div class="card">
          <div class="card-head"><span class="k">DEMO NOTES</span></div>
          <p class="caption">画面取自 ARENA LAB 原演示，按同一组数据逐步播放；拖动进度条可以回到任意一帧。</p>
          <div class="facts">
            <div><b>帧数</b>${frames.length}</div>
            <div><b>题目</b>${problem.id}</div>
            <div><b>分类</b>${esc(problem.track)}</div>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><span class="k">PROBLEM</span></div>
          <a href="q.html?id=${problem.id}" style="font-family:var(--serif);font-size:18px;font-weight:700;line-height:1.4;display:block">${esc(problem.title)}</a>
          <p class="side-note">${esc(problem.track)} · ${esc(problem.difficulty)} · ${problem.minutes} MIN</p>
        </div>
      </aside>`}
    </div>`;

    const stage = el.querySelector("#pStage");
    const cap = el.querySelector("#pCap");
    const idx = el.querySelector("#pIdx");
    const step = el.querySelector("#pStep");
    const range = el.querySelector("#pRange");
    const play = el.querySelector("#pPlay");

    function draw() {
      stage.innerHTML = `<img src="assets/${frames[i].src}" alt="${esc(problem.title)} 演示第 ${i + 1} 帧">`;
      cap.textContent = frames[i].caption || "";
      const n = String(frames.length).padStart(2, "0");
      idx.textContent = String(i + 1).padStart(2, "0") + " / " + n;
      step.textContent = "STEP " + String(i + 1).padStart(2, "0") + " / " + n;
      range.value = i;
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = 0;
      if (play) play.textContent = "▶ 播放";
    }
    function next() {
      if (i < frames.length - 1) { i += 1; draw(); } else stop();
    }
    function toggle() {
      if (timer) { stop(); return; }
      if (i >= frames.length - 1) { i = 0; draw(); }
      play.textContent = "❙❙ 暂停";
      timer = setInterval(next, 1100);
    }

    el.querySelectorAll(".pbtn").forEach((b) => b.addEventListener("click", () => {
      const act = b.dataset.act;
      if (act === "prev") { stop(); if (i > 0) { i -= 1; draw(); } }
      else if (act === "next") { stop(); next(); }
      else if (act === "reset") { stop(); i = 0; draw(); }
      else if (act === "play") toggle();
    }));
    range.addEventListener("input", () => { stop(); i = Number(range.value); draw(); });
  };
})();
