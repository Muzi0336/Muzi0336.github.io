/* 算法演示：把 17 个演示类型展开成可逐帧播放的 SVG 场景 */
(function () {
  const W = 900, H = 380;
  const C = {
    bg: "#12151a", panel: "#1b2026", line: "#39434c", line2: "#2a323a",
    text: "#e8e4da", muted: "#8b8f89", dim: "#5f666d",
    accent: "#e65324", green: "#7fb08e", blue: "#82aecb", yellow: "#d9b36a", red: "#c96b5f"
  };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const T = (x, y, s, o = {}) => ({ t: "t", x, y, s: String(s), size: o.size || 13, fill: o.fill || C.text, anchor: o.anchor || "middle", mono: o.mono !== false, weight: o.weight || 400, opacity: o.opacity == null ? 1 : o.opacity });
  const R = (x, y, w, h, o = {}) => ({ t: "r", x, y, w, h, fill: o.fill || C.panel, stroke: o.stroke || C.line, sw: o.sw == null ? 1 : o.sw, rx: o.rx || 0, opacity: o.opacity == null ? 1 : o.opacity });
  const Cc = (cx, cy, r, o = {}) => ({ t: "c", cx, cy, r, fill: o.fill || C.panel, stroke: o.stroke || C.line, sw: o.sw == null ? 1 : o.sw, opacity: o.opacity == null ? 1 : o.opacity });
  const L = (x1, y1, x2, y2, o = {}) => ({ t: "l", x1, y1, x2, y2, stroke: o.stroke || C.line, sw: o.sw == null ? 1 : o.sw, dash: o.dash || "", opacity: o.opacity == null ? 1 : o.opacity });

  function svg(shapes) {
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img">` + shapes.map((s) => {
      if (s.t === "r") return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.rx}" fill="${s.fill}" stroke="${s.sw ? s.stroke : "none"}" stroke-width="${s.sw}" opacity="${s.opacity}"/>`;
      if (s.t === "c") return `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="${s.fill}" stroke="${s.sw ? s.stroke : "none"}" stroke-width="${s.sw}" opacity="${s.opacity}"/>`;
      if (s.t === "l") return `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="${s.stroke}" stroke-width="${s.sw}" stroke-dasharray="${s.dash}" opacity="${s.opacity}"/>`;
      return `<text x="${s.x}" y="${s.y}" font-family="${s.mono ? "JetBrains Mono, monospace" : "Noto Sans SC, sans-serif"}" font-size="${s.size}" font-weight="${s.weight}" fill="${s.fill}" text-anchor="${s.anchor}" opacity="${s.opacity}">${esc(s.s)}</text>`;
    }).join("") + "</svg>";
  }

  function head(title, sub) {
    return [T(28, 32, title, { anchor: "start", size: 11, fill: C.muted }), T(W - 28, 32, sub || "", { anchor: "end", size: 10, fill: C.dim })];
  }

  function arrayRow(vals, x0, y, w, h, gap, o = {}) {
    const out = [];
    vals.forEach((v, i) => {
      const x = x0 + i * (w + gap);
      const active = o.active === i, done = o.done && o.done.includes(i);
      out.push(R(x, y, w, h, { fill: active ? "#2c1f1a" : done ? "#1d2a22" : C.panel, stroke: active ? C.accent : done ? C.green : C.line, sw: active ? 1.4 : 1 }));
      out.push(T(x + w / 2, y + h / 2 + 4, v, { size: o.size || 12, fill: active ? C.accent : done ? C.green : C.text }));
    });
    return out;
  }

  function gridView(grid, x0, y0, cw, ch, o = {}) {
    const out = [];
    grid.forEach((row, r) => row.forEach((v, c) => {
      const x = x0 + c * cw, y = y0 + r * ch;
      const key = r + "," + c;
      const fill = o.fill && o.fill[key], stroke = o.stroke && o.stroke[key];
      out.push(R(x + 2, y + 2, cw - 4, ch - 4, { fill: fill || C.panel, stroke: stroke || C.line, sw: stroke ? 1.4 : 1 }));
      if (v !== "" && v != null) out.push(T(x + cw / 2, y + ch / 2 + 4, v, { size: o.size || 12, fill: o.text && o.text[key] ? o.text[key] : C.text }));
    }));
    return out;
  }

  // ---------- 01 cipher ----------
  function cipher(input) {
    const s = String(input || "Igopt]vzun").slice(0, 12);
    const n = s.length, bw = 46, gap = 8, x0 = (W - n * (bw + gap) + gap) / 2;
    const frames = [];
    const row = (chars, y, active, doneCount) => {
      const out = [];
      chars.forEach((ch, i) => {
        const x = x0 + i * (bw + gap);
        out.push(R(x, y, bw, 48, { fill: i === active ? "#2c1f1a" : i < doneCount ? "#1d2a22" : C.panel, stroke: i === active ? C.accent : i < doneCount ? C.green : C.line, sw: i === active ? 1.5 : 1 }));
        out.push(T(x + bw / 2, y + 30, ch, { size: 16, fill: i === active ? C.accent : i < doneCount ? C.green : C.text }));
      });
      return out;
    };
    frames.push({
      shapes: [...head("CIPHER / ASCII 偏移", `n = ${n}`), T(28, 92, "密文", { anchor: "start", size: 11, fill: C.muted }), T(28, 172, "原文", { anchor: "start", size: 11, fill: C.muted }), ...row([...s], 70, -1, 0), ...row(Array(n).fill("·"), 150, -1, 0), T(W / 2, 270, "第 i 位减去 i：ord(s[i]) − i", { size: 12, fill: C.muted })],
      caption: "从左到右扫描。第 1 位减 1，第 2 位减 2，依此类推。"
    });
    let plain = "";
    for (let i = 1; i <= n; i++) {
      const ch = String.fromCharCode(s.charCodeAt(i - 1) - i);
      plain += ch;
      frames.push({
        shapes: [...head("CIPHER / ASCII 偏移", `step ${i} / ${n}`), T(28, 92, "密文", { anchor: "start", size: 11, fill: C.muted }), T(28, 172, "原文", { anchor: "start", size: 11, fill: C.muted }), ...row([...s], 70, i - 1, i - 1), ...row([...plain.padEnd(n, "·")], 150, i - 1, i), T(W / 2, 270, `chr(ord('${s[i - 1]}') − ${i}) = '${ch}'`, { size: 12, fill: C.muted }), T(W / 2, 300, plain, { size: 20, fill: C.green })],
        caption: `第 ${i} 位：${s[i - 1]} 的 ASCII 码减 ${i}，得到 ${ch}。`
      });
    }
    return { frames, facts: [["时间", "O(n)"], ["空间", "O(1) / 输出 O(n)"], ["演示数据", s]] };
  }

  // ---------- 02 intervalEnergy ----------
  function intervalEnergy() {
    const pts = [0, 2, 5, 9, 14], energy = [3, 1, 4, 2];
    const x = (v) => 90 + v / 14 * 720, total = energy.reduce((a, b) => a + b, 0);
    const base = [T(28, 70, "区间与能量", { anchor: "start", size: 11, fill: C.muted })];
    pts.forEach((p, i) => { base.push(L(x(p), 100, x(p), 280, { stroke: C.line2 })); base.push(T(x(p), 300, p, { size: 10, fill: C.muted })); });
    energy.forEach((e, i) => base.push(R(x(pts[i]) + 2, 260 - e * 16, x(pts[i + 1]) - x(pts[i]) - 4, e * 16, { fill: "#20262d", stroke: C.line })));
    const frames = [];
    const seq = [[2, 2], [1, 2], [1, 3], [0, 3]];
    let prevEnd = 2;
    seq.forEach((st, fi) => {
      const [l, r] = st;
      const shapes = [...head("INTERVAL DP / 区间扩展", `[${l}, ${r}]`)].concat(base);
      shapes.push(R(x(pts[l]), 100, x(pts[r + 1]) - x(pts[l]), 180, { fill: "rgba(230,83,36,.10)", stroke: C.accent, sw: 1 }));
      const rest = total - energy.slice(l, r + 1).reduce((a, b) => a + b, 0);
      const dist = fi === 0 ? 0 : Math.abs(pts[l] - pts[prevEnd]);
      prevEnd = l;
      shapes.push(T(690, 96, `剩余能量 ${rest}`, { anchor: "end", size: 11, fill: C.text }));
      shapes.push(T(690, 120, `本次距离 ${dist}`, { anchor: "end", size: 11, fill: C.muted }));
      shapes.push(T(690, 150, `本步代价 ${rest * dist}`, { anchor: "end", size: 11, fill: C.yellow }));
      frames.push({ shapes, caption: fi === 0 ? "从起点 c−1 起手，区间长度为 1。" : `把区间扩展到 [${l}, ${r}]：代价 = 剩余能量 × 移动距离 = ${rest} × ${dist}。` });
    });
    return { frames, facts: [["时间", "O(n²)"], ["状态", "dp[l][r][0/1]"], ["演示数据", "5 个点、4 段能量"]] };
  }

  // ---------- 03 graph ----------
  function graph() {
    const nodes = { A: [70, 200], B: [200, 90], C: [200, 300], D: [350, 200], E: [520, 90], F: [680, 200] };
    const edges = [["A", "B", 2], ["A", "C", 3], ["B", "D", 2], ["C", "D", 1], ["D", "E", 4], ["B", "E", 7], ["E", "F", 1]];
    const frames = [];
    const ways = { A: 1, B: 0, C: 0, D: 0, E: 0, F: 0 }, sum = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    function scene(active, done, caption) {
      const sh = [...head("DAG / 路径数与总时长", "拓扑序")];
      edges.forEach(([u, v, w]) => {
        sh.push(L(nodes[u][0], nodes[u][1], nodes[v][0], nodes[v][1], { stroke: done.has(u) ? C.blue : C.line, sw: 1.2 }));
        const mx = (nodes[u][0] + nodes[v][0]) / 2, my = (nodes[u][1] + nodes[v][1]) / 2;
        sh.push(T(mx + 6, my - 4, w, { size: 9, fill: C.muted }));
      });
      Object.entries(nodes).forEach(([k, [nx, ny]]) => {
        const on = active === k, d = done.has(k);
        sh.push(Cc(nx, ny, 22, { fill: on ? "#2c1f1a" : d ? "#1d2a22" : C.panel, stroke: on ? C.accent : d ? C.green : C.line, sw: on ? 1.6 : 1 }));
        sh.push(T(nx, ny + 5, k, { size: 13, fill: on ? C.accent : d ? C.green : C.text }));
      });
      sh.push(T(760, 70, "节点  ways  sum", { anchor: "start", size: 9.5, fill: C.muted }));
      Object.keys(nodes).forEach((k, i) => {
        sh.push(T(760, 95 + i * 23, k, { anchor: "start", size: 10, fill: done.has(k) ? C.accent : C.muted }));
        sh.push(T(822, 95 + i * 23, ways[k], { anchor: "end", size: 10, fill: C.text }));
        sh.push(T(878, 95 + i * 23, sum[k], { anchor: "end", size: 10, fill: C.yellow }));
      });
      return { shapes: sh, caption };
    }
    frames.push(scene(null, new Set(), "初始化：ways[s] = 1，sum[s] = 0，其余为 0。"));
    const order = ["A", "B", "C", "D", "E", "F"], done = new Set();
    order.forEach((u) => {
      edges.forEach(([a, b, w]) => {
        if (a !== u) return;
        ways[b] += ways[a]; sum[b] += sum[a] + ways[a] * w;
      });
      done.add(u);
      frames.push(scene(u, new Set(done), `处理 ${u}：把 ways 与 sum 沿着出边推给后继。`));
    });
    return { frames, facts: [["时间", "O(n + m)"], ["结构", "拓扑排序 + 递推"], ["演示数据", "6 节点 · 7 条边"]] };
  }

  // ---------- 04 palindromeCut ----------
  function palindromeCut() {
    const s = "aabac";
    const isPal = (a, b) => { let i = a, j = b; while (i < j) { if (s[i] !== s[j]) return false; i++; j--; } return true; };
    const dp = [-1], from = [0];
    for (let i = 1; i <= s.length; i++) {
      let best = Infinity, bj = 0;
      for (let j = 0; j < i; j++) if (isPal(j, i - 1) && dp[j] + 1 < best) { best = dp[j] + 1; bj = j; }
      dp[i] = best; from[i] = bj;
    }
    const frames = [];
    const x0 = 250, bw = 58, gap = 10;
    for (let i = 0; i <= s.length; i++) {
      const sh = [...head("PALINDROME CUT / 最少切割", `dp[${i}] = ${dp[i]}`)];
      for (let k = 0; k < s.length; k++) {
        const x = x0 + k * (bw + gap);
        const inRange = k < i;
        sh.push(R(x, 120, bw, 54, { fill: inRange ? "#1d2a22" : C.panel, stroke: inRange ? C.green : C.line }));
        sh.push(T(x + bw / 2, 154, s[k], { size: 18, fill: inRange ? C.green : C.muted }));
      }
      if (i > 0) {
        const cut = from[i];
        if (cut > 0) sh.push(L(x0 + cut * (bw + gap) - gap / 2, 108, x0 + cut * (bw + gap) - gap / 2, 186, { stroke: C.accent, sw: 1.4, dash: "4 3" }));
        sh.push(T(x0 + i * (bw + gap) - gap / 2, 210, `dp[${i}]=${dp[i]}`, { size: 10, fill: C.accent }));
      }
      sh.push(T(W / 2, 280, `dp[${i}] = min dp[j] + 1（s[j..${i - 1}] 是回文）`, { size: 11, fill: C.muted }));
      frames.push({ shapes: sh, caption: i === 0 ? "dp[0] = −1：空串不需要切。" : `前 ${i} 个字符最少切 ${dp[i]} 刀；最后一刀落在 j = ${from[i]} 之后。` });
    }
    return { frames, facts: [["时间", "O(n²)"], ["状态", "dp[i] 前缀最少切割"], ["演示数据", s]] };
  }

  // ---------- 05 threeSum ----------
  function threeSum() {
    const arr = [-4, -1, -1, 0, 1, 2];
    const frames = [];
    const x0 = 200, bw = 60, gap = 12;
    function scene(i, l, r, note) {
      const sh = [...head("THREE SUM / 双指针", note || "")];
      arr.forEach((v, k) => {
        const x = x0 + k * (bw + gap);
        const on = k === i || k === l || k === r;
        sh.push(R(x, 120, bw, 54, { fill: on ? "#2c1f1a" : C.panel, stroke: on ? C.accent : C.line }));
        sh.push(T(x + bw / 2, 154, v, { size: 17, fill: on ? C.accent : C.text }));
      });
      if (i != null) { sh.push(T(x0 + i * (bw + gap) + bw / 2, 100, "i", { size: 10, fill: C.accent })); sh.push(L(x0 + i * (bw + gap) + bw / 2, 104, x0 + i * (bw + gap) + bw / 2, 116, { stroke: C.accent })); }
      if (l != null) { sh.push(T(x0 + l * (bw + gap) + bw / 2, 200, "l", { size: 10, fill: C.blue })); sh.push(L(x0 + l * (bw + gap) + bw / 2, 176, x0 + l * (bw + gap) + bw / 2, 192, { stroke: C.blue })); }
      if (r != null) { sh.push(T(x0 + r * (bw + gap) + bw / 2, 200, "r", { size: 10, fill: C.green })); sh.push(L(x0 + r * (bw + gap) + bw / 2, 176, x0 + r * (bw + gap) + bw / 2, 192, { stroke: C.green })); }
      if (i != null) sh.push(T(W / 2, 280, `sum = ${arr[i]} + ${arr[l]} + ${arr[r]}`, { size: 12, fill: C.yellow }));
      return { shapes: sh, caption: note ? note + "。" : "" };
    }
    frames.push({ shapes: [...head("THREE SUM / 先排序", "[-4, -1, -1, 0, 1, 2]"), ...arrayRow(arr, x0, 120, bw, 54, gap)], caption: "先排序，再固定一个数，用左右指针夹出另外两个。" });
    frames.push(scene(1, 2, 5, "sum = 0，记录 (-1, -1, 2)"));
    frames.push(scene(1, 3, 4, "sum = 0，记录 (-1, 0, 1)"));
    frames.push(scene(2, 3, 5, "i 重复，跳过"));
    frames.push(scene(3, 4, 5, "sum = 3 > 0，右指针左移"));
    return { frames, facts: [["时间", "O(n²)"], ["关键", "排序 + 去重"], ["演示数据", arr.join(", ")]] };
  }

  // ---------- 06 grid ----------
  function grid() {
    const cost = [[1, 3, 1], [1, 5, 1], [4, 2, 1]];
    const dp = cost.map(r => r.slice());
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      if (!r && !c) continue;
      const up = r ? dp[r - 1][c] : Infinity, left = c ? dp[r][c - 1] : Infinity;
      dp[r][c] = Math.min(up, left) + cost[r][c];
    }
    const cells = [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]];
    const frames = [];
    for (let k = 0; k < cells.length; k++) {
      const [r, c] = cells[k];
      const sh = [...head("GRID DP / 最小路径和", `${r},${c}`)];
      const fill = {}, text = {};
      for (let i = 0; i <= k; i++) { const [a, b] = cells[i]; fill[a + "," + b] = "#1d2a22"; }
      fill[r + "," + c] = "#2c1f1a"; text[r + "," + c] = C.accent;
      sh.push(...gridView(dp.map((row, ri) => row.map((v, ci) => ri <= r ? v : "")), 280, 90, 110, 70, { fill, text, stroke: { [r + "," + c]: C.accent } }));
      const from = !r && !c ? "起点" : !r ? `左 ${dp[r][c - 1]}` : !c ? `上 ${dp[r - 1][c]}` : `min(上 ${dp[r - 1][c]}, 左 ${dp[r][c - 1]})`;
      sh.push(T(280, 330, `dp[${r}][${c}] = ${from} + ${cost[r][c]} = ${dp[r][c]}`, { anchor: "start", size: 12, fill: C.muted }));
      frames.push({ shapes: sh, caption: `填 (${r}, ${c})：从上方或左方取较小值，再加当前格代价。` });
    }
    return { frames, facts: [["时间", "O(NM)"], ["状态", "dp[i][j] 到格子最小代价"], ["演示数据", "3 × 3"]] };
  }

// ---------- 07 water ----------
  function water() {
    const h = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
    const x0 = 60, bw = 52, gap = 8, base = 300, unit = 44;
    const levels = [], left = [], right = [];
    let lm = 0, rm = 0;
    h.forEach((v, i) => left[i] = lm = Math.max(lm, v));
    for (let i = h.length - 1; i >= 0; i--) right[i] = rm = Math.max(rm, v);
    h.forEach((v, i) => levels[i] = Math.min(left[i], right[i]));
    const frames = [];
    const steps = [[0, 11, 0, 0, 0], [2, 11, 1, 0, 1], [3, 10, 2, 1, 1], [4, 10, 2, 2, 3], [4, 9, 2, 3, 6]];
    steps.forEach(([l, r, lmax, rmax, total]) => {
      const sh = [...head("TRAPPING RAIN / 双指针", `l=${l}  r=${r}`)];
      h.forEach((v, i) => {
        const x = x0 + i * (bw + gap);
        sh.push(R(x, base - v * unit, bw, v * unit, { fill: "#20262d", stroke: C.line }));
        if (i >= l && i <= r && levels[i] > v) {
          sh.push(R(x, base - levels[i] * unit, bw, (levels[i] - v) * unit, { fill: "rgba(130,174,203,.22)", stroke: "none", sw: 0 }));
        }
      });
      sh.push(L(x0 + l * (bw + gap), 70, x0 + l * (bw + gap), base, { stroke: C.blue, sw: 1.6 }));
      sh.push(L(x0 + r * (bw + gap) + bw, 70, x0 + r * (bw + gap) + bw, base, { stroke: C.green, sw: 1.6 }));
      sh.push(T(x0 + l * (bw + gap) + bw / 2, 60, "l", { size: 10, fill: C.blue }));
      sh.push(T(x0 + r * (bw + gap) + bw / 2, 60, "r", { size: 10, fill: C.green }));
      sh.push(T(28, 330, `leftMax ${lmax} / rightMax ${rmax} / 已接 ${total}`, { anchor: "start", size: 11, fill: C.muted }));
      frames.push({ shapes: sh, caption: `处理较矮的一侧：水高由左右最大值的较小者决定。当前累计 ${total}。` });
    });
    return { frames, facts: [["时间", "O(n)"], ["空间", "O(1)"], ["演示数据", h.join(", ")]] };
  }

  // ---------- 08 surrounded ----------
  function surrounded() {
    const board = [
      ["X","X","X","X","X"],
      ["X","O","O","O","X"],
      ["X","O","O","X","X"],
      ["X","O","X","O","X"],
      ["X","X","X","O","X"]
    ];
    const safe = new Set(), q = [];
    const key = (r, c) => r + "," + c;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if ((r === 0 || c === 0 || r === 4 || c === 4) && board[r][c] === "O") { safe.add(key(r, c)); q.push([r, c]); }
    while (q.length) { const [r, c] = q.shift(); [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr, dc]) => { const nr = r + dr, nc = c + dc; if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && board[nr][nc] === "O" && !safe.has(key(nr, nc))) { safe.add(key(nr, nc)); q.push([nr, nc]); } }); }
    const frames = [];
    for (let step = 0; step <= 5; step++) {
      const sh = [...head("SURROUNDED / 边界连通", step === 0 ? "初始" : `BFS ${step}`)];
      const fill = {}, text = {};
      board.forEach((row, r) => row.forEach((v, c) => {
        const k = key(r, c);
        if (v === "O" && safe.has(k)) { fill[k] = "#1d2a22"; text[k] = C.green; }
        if (step === 5 && v === "O" && !safe.has(k)) { fill[k] = "#2c1f1a"; text[k] = C.accent; }
      }));
      sh.push(...gridView(board, 300, 70, 64, 54, { fill, text, size: 15 }));
      sh.push(T(300, 330, step === 5 ? "边界可达的 O 保留；被围住的 O 翻成 X。" : "从四条边上的 O 出发，四方向扩散，能到达的都安全。", { anchor: "start", size: 11, fill: C.muted }));
      frames.push({ shapes: sh, caption: step === 0 ? "先圈出边界上的 O。" : step === 5 ? "扫描全图：安全 O 保留，其余 O 改为 X。" : "BFS 把与边界连通的 O 标记为安全。" });
    }
    return { frames, facts: [["时间", "O(mn)"], ["关键", "反向从边界 BFS"], ["演示数据", "5 × 5"]] };
  }

  // ---------- 09 gasStation ----------
  function gasStation() {
    const gas = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2];
    const frames = [];
    const cx = 450, cy = 190, rad = 118;
    let start = 0, tank = 0, total = 0;
    for (let i = 0; i <= gas.length; i++) {
      const sh = [...head("GAS STATION / 环路加油", `start = ${start}`)];
      const n = gas.length;
      for (let k = 0; k < n; k++) {
        const ang = -Math.PI / 2 + k * 2 * Math.PI / n;
        const x = cx + Math.cos(ang) * rad, y = cy + Math.sin(ang) * rad;
        const on = k === (i % n), isStart = k === start;
        sh.push(Cc(x, y, 27, { fill: on ? "#2c1f1a" : C.panel, stroke: on ? C.accent : isStart ? C.yellow : C.line, sw: on || isStart ? 1.6 : 1 }));
        sh.push(T(x, y - 2, k + 1, { size: 13, fill: on ? C.accent : C.text }));
        sh.push(T(x, y + 15, `+${gas[k]} / −${cost[k]}`, { size: 8, fill: C.muted }));
        if (isStart) sh.push(T(x, y - 36, "start", { size: 8, fill: C.yellow }));
      }
      sh.push(T(cx, cy - 6, `tank ${tank}`, { size: 13, fill: tank < 0 ? C.red : C.green }));
      sh.push(T(cx, cy + 16, `total ${total}`, { size: 9, fill: C.muted }));
      frames.push({ shapes: sh, caption: i === gas.length ? `扫描完成，total ≥ 0，起点 ${start} 可行。` : `第 ${i + 1} 站：tank ${tank >= 0 ? "+" : ""}${gas[i] - cost[i]} → ${tank}` });
      if (i < gas.length) {
        total += gas[i] - cost[i]; tank += gas[i] - cost[i];
        if (tank < 0) { start = i + 1; tank = 0; }
      }
    }
    return { frames, facts: [["时间", "O(n)"], ["空间", "O(1)"], ["演示数据", gas.join(" / ")]] };
  }

  // ---------- 10 skyline ----------
  function skyline() {
    const bs = [[2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]];
    const xs = [...new Set(bs.flatMap(b => [b[0], b[1]]))].sort((a, b) => a - b);
    const heights = xs.map(x => Math.max(0, ...bs.filter(b => x >= b[0] && x < b[1]).map(b => b[2])));
    const frames = [];
    const X = v => 70 + (v - 1) / 24 * 790, Y = h => 300 - h * 12;
    for (let k = 0; k < xs.length; k++) {
      const x = xs[k], h = heights[k];
      const sh = [...head("SKYLINE / 扫描线", `x = ${x}`)];
      bs.forEach(([l, r, hh]) => sh.push(R(X(l), Y(hh), X(r) - X(l), hh * 12, { fill: "#20262d", stroke: C.line })));
      sh.push(L(X(x), 60, X(x), 320, { stroke: C.accent, sw: 1.4, dash: "5 4" }));
      let prev = -1;
      for (let i = 0; i <= k; i++) {
        if (heights[i] !== prev) { sh.push(Cc(X(xs[i]), Y(heights[i]), 3.4, { fill: C.yellow, stroke: C.yellow, sw: 1 })); prev = heights[i]; }
      }
      sh.push(T(70, 340, `当前最高 ${h}`, { anchor: "start", size: 11, fill: C.muted }));
      frames.push({ shapes: sh, caption: `扫描到 x=${x}，当前最高高度 ${h}；高度变化处记录关键点。` });
    }
    return { frames, facts: [["时间", "O(n log n)"], ["结构", "事件 + 最大堆"], ["演示数据", "5 栋建筑"]] };
  }

  // ---------- 11 multiSource ----------
  function multiSource() {
    const src = [[0,0],[2,2],[4,3]], rows = 5, cols = 5;
    const dist = Array.from({length: rows}, () => Array(cols).fill(-1));
    const q = [];
    src.forEach(([r,c]) => { dist[r][c] = 0; q.push([r,c]); });
    while (q.length) { const [r,c] = q.shift(); [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc]) => { const nr=r+dr,nc=c+dc; if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&dist[nr][nc]<0){dist[nr][nc]=dist[r][c]+1;q.push([nr,nc]);} }); }
    const frames = [];
    const maxd = Math.max(...dist.flat());
    for (let d = 0; d <= maxd; d++) {
      const sh = [...head("MULTI-SOURCE BFS / 距离场", `distance = ${d}`)];
      const fill = {}, text = {};
      dist.forEach((row, r) => row.forEach((v, c) => { if (v >= 0) { fill[r+","+c] = v === 0 ? "#2c1f1a" : "#1d2a22"; text[r+","+c] = v === 0 ? C.accent : C.text; } }));
      sh.push(...gridView(dist.map(row => row.map(v => v < 0 ? "" : v)), 320, 60, 64, 52, { fill, text, size: 13 }));
      sh.push(T(300, 340, "所有 0 同时入队，每一层向外扩一格。", { anchor: "start", size: 11, fill: C.muted }));
      frames.push({ shapes: sh, caption: d === 0 ? "把所有 0 的位置设为距离 0，同时入队。" : `第 ${d} 层：从上一层所有格子向四方向扩展。` });
    }
    return { frames, facts: [["时间", "O(nm)"], ["关键", "多源 BFS"], ["演示数据", "5 × 5 · 3 个源点"]] };
  }

  // ---------- 12 maxSubarray ----------
  function maxSubarray() {
    const vals = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
    const frames = [];
    const x0 = 110, bw = 66, gap = 10, base = 260, unit = 26;
    let cur = vals[0], best = vals[0];
    for (let i = 0; i < vals.length; i++) {
      if (i > 0) cur = Math.max(vals[i], cur + vals[i]);
      best = Math.max(best, cur);
      const sh = [...head("MAX SUBARRAY / 前缀最大和", `i = ${i}`)];
      vals.forEach((v, k) => {
        const x = x0 + k * (bw + gap), h = Math.abs(v) * unit;
        sh.push(R(x, v >= 0 ? base - h : base, bw, h, { fill: k === i ? "#2c1f1a" : "#20262d", stroke: k === i ? C.accent : C.line }));
        sh.push(T(x + bw / 2, v >= 0 ? base - h - 6 : base + h + 12, v, { size: 10, fill: k === i ? C.accent : C.muted }));
      });
      sh.push(L(x0 - 8, base, x0 + vals.length * (bw + gap), base, { stroke: C.line }));
      sh.push(T(28, 90, `current ${cur}`, { anchor: "start", size: 12, fill: C.green }));
      sh.push(T(28, 112, `best ${best}`, { anchor: "start", size: 12, fill: C.yellow }));
      frames.push({ shapes: sh, caption: i === 0 ? `current = best = ${cur}。` : `current = max(${vals[i]}, 之前 ${cur - vals[i]} + ${vals[i]}) = ${cur}；best = ${best}。` });
    }
    return { frames, facts: [["时间", "O(n)"], ["空间", "O(1)"], ["演示数据", vals.join(", ")]] };
  }

// ---------- 13 keyNode ----------
  function keyNode() {
    const nodes = [[3,450,60],[1,300,140],[4,600,140],[2,380,230],[5,680,230]];
    const edges = [[0,1],[0,2],[1,3],[2,4]];
    const frames = [];
    const order = [0,1,3,2,4];
    let count = 0, maxv = -Infinity;
    order.forEach((ni) => {
      const [v,x,y] = nodes[ni];
      const isKey = v > maxv;
      const before = maxv;
      if (isKey) { count++; maxv = v; }
      const sh = [...head("KEY NODE / 祖先最大值", `count = ${count}`)];
      edges.forEach(([a,b]) => sh.push(L(nodes[a][1], nodes[a][2], nodes[b][1], nodes[b][2], { stroke: C.line })));
      nodes.forEach(([nv,nx,ny], k) => {
        const on = k === ni, key = on && isKey;
        sh.push(Cc(nx, ny, 24, { fill: on ? "#2c1f1a" : C.panel, stroke: key ? C.yellow : on ? C.accent : C.line, sw: key ? 2 : 1.2 }));
        sh.push(T(nx, ny + 5, nv, { size: 13, fill: key ? C.yellow : on ? C.accent : C.text }));
      });
      sh.push(T(28, 300, isKey ? `${v} > ${before === -Infinity ? "−∞" : before}，计数 +1` : `${v} 不大于祖先最大值 ${maxv}，不计数`, { anchor: "start", size: 11, fill: isKey ? C.yellow : C.muted }));
      frames.push({ shapes: sh, caption: isKey ? `${v} 比路径上所有祖先都大，关键节点 +1。` : `${v} 不满足严格大于祖先最大值，跳过。` });
    });
    return { frames, facts: [["时间", "O(n)"], ["遍历", "DFS 带祖先最大值"], ["演示数据", "[3,1,4,null,2,5]"]] };
  }

  // ---------- 14 tree ----------
  function tree() {
    const nodes = [[1,450,60],[2,300,140],[3,600,140],[4,360,230],[5,520,230]];
    const edges = [[0,1],[0,2],[1,3],[2,4]];
    const frames = [];
    for (let k = 0; k < nodes.length; k++) {
      const sh = [...head("TREE / 层序建树", `node ${nodes[k][0]}`)];
      edges.forEach(([a,b]) => {
        const on = (a === k || b === k) && b <= k;
        sh.push(L(nodes[a][1], nodes[a][2], nodes[b][1], nodes[b][2], { stroke: on ? C.green : C.line, sw: on ? 1.5 : 1 }));
      });
      nodes.forEach(([v,x,y], i) => {
        const on = i === k, built = i <= k;
        sh.push(Cc(x, y, 22, { fill: on ? "#2c1f1a" : built ? "#1d2a22" : C.panel, stroke: on ? C.accent : built ? C.green : C.line, sw: on ? 1.6 : 1 }));
        sh.push(T(x, y + 5, v, { size: 13, fill: on ? C.accent : built ? C.green : C.muted }));
      });
      frames.push({ shapes: sh, caption: k === 0 ? "根节点入队，开始按层序读入孩子。" : `读入并挂上节点 ${nodes[k][0]}，继续层序建树。` });
    }
    const sh = [...head("TREE / 后序遍历", "4 5 2 3 1")];
    edges.forEach(([a,b]) => sh.push(L(nodes[a][1], nodes[a][2], nodes[b][1], nodes[b][2], { stroke: C.line })));
    nodes.forEach(([v,x,y], i) => {
      sh.push(Cc(x, y, 22, { fill: "#1d2a22", stroke: C.green }));
      sh.push(T(x, y + 5, v, { size: 13, fill: C.green }));
      sh.push(T(x, y + 38, [4,5,2,3,1][i], { size: 9, fill: C.muted }));
    });
    sh.push(T(28, 330, "后序：左 → 右 → 根", { anchor: "start", size: 11, fill: C.muted }));
    frames.push({ shapes: sh, caption: "建树完成后，用栈做后序遍历并输出非空节点。" });
    return { frames, facts: [["时间", "O(n)"], ["遍历", "层序建树 + 后序输出"], ["演示数据", "1 2 3 # 4 5"]] };
  }

  // ---------- 15 probabilityGraph ----------
  function probabilityGraph() {
    const nodes = { A:[90,200], B:[310,90], C:[310,300], D:[600,200] };
    const edges = [["A","B",0.8],["A","C",0.5],["B","D",0.9],["B","C",0.7],["C","D",0.6]];
    const best = {A:1,B:0,C:0,D:0}, par = {A:"",B:"",C:"",D:""};
    const frames = [];
    const done = new Set();
    function scene(active, note) {
      const sh = [...head("MAX PROBABILITY / 最大概率路径", note || "")];
      edges.forEach(([u,v,w]) => {
        const a = nodes[u], b = nodes[v];
        sh.push(L(a[0],a[1],b[0],b[1],{ stroke: done.has(u) ? C.blue : C.line, sw: done.has(u) ? 1.5 : 1 }));
        sh.push(T((a[0]+b[0])/2+10,(a[1]+b[1])/2-6,w.toFixed(2),{ size:9, fill:C.muted }));
      });
      Object.entries(nodes).forEach(([k,[x,y]]) => {
        const on = active===k;
        sh.push(Cc(x,y,25,{ fill:on?"#2c1f1a":done.has(k)?"#1d2a22":C.panel, stroke:on?C.accent:done.has(k)?C.green:C.line, sw:on?1.6:1 }));
        sh.push(T(x,y+5,k,{ size:13, fill:on?C.accent:done.has(k)?C.green:C.text }));
      });
      sh.push(T(760,70,"节点  best  parent",{ anchor:"start", size:9.5, fill:C.muted }));
      Object.keys(nodes).forEach((k,i) => {
        sh.push(T(760,95+i*24,k,{ anchor:"start", size:10, fill:done.has(k)?C.accent:C.muted }));
        sh.push(T(822,95+i*24,best[k].toFixed(2),{ anchor:"end", size:10, fill:C.text }));
        sh.push(T(878,95+i*24,par[k]||"—",{ anchor:"end", size:10, fill:C.yellow }));
      });
      return { shapes:sh, caption:note };
    }
    frames.push(scene(null,"初始化 best[A] = 1，其余为 0。"));
    ["A","B","C","D"].forEach((u) => {
      edges.forEach(([a,b,p]) => {
        if (a !== u) return;
        if (best[a]*p > best[b]) { best[b] = best[a]*p; par[b] = a; }
      });
      done.add(u);
      frames.push(scene(u, `确定 ${u} 后，用 best[u] × p 更新邻居。`));
    });
    return { frames, facts: [["时间", "O((n+m) log n)"], ["结构", "最大堆 + 概率松弛"], ["演示数据", "4 节点 · 5 条边"]] };
  }

  // ---------- 16 josephus ----------
  function josephus() {
    const n = 7, k = 2, people = Array.from({length:n},(_,i)=>i+1);
    const q0 = people.slice(), out = [];
    while (q0.length) { for (let i = 0; i < k; i++) q0.push(q0.shift()); out.push(q0.shift()); }
    const frames = [];
    const cx=450, cy=190, rad=115;
    for (let step = 0; step <= out.length; step++) {
      const sh = [...head("JOSEPHUS / 队列模拟", `out ${step}/${n}`)];
      people.forEach((p, i) => {
        const ang = -Math.PI/2 + i*2*Math.PI/n;
        const x=cx+Math.cos(ang)*rad, y=cy+Math.sin(ang)*rad;
        const eliminated = out.slice(0,step).includes(p);
        const current = step < out.length && p === out[step];
        sh.push(Cc(x,y,22,{ fill: eliminated?"#2c1f1a":current?"#1d2a22":C.panel, stroke: eliminated?C.accent:current?C.green:C.line, sw: current||eliminated?1.5:1 }));
        sh.push(T(x,y+5,p,{ size:13, fill: eliminated?C.muted:current?C.green:C.text }));
      });
      sh.push(T(cx,340,step===0?`n=${n}  k=${k}`:`出列：${out.slice(0,step).join(" → ")}`,{ size:10, fill:C.muted }));
      frames.push({ shapes:sh, caption: step===0?`${n} 个人围成一圈，每轮把队首移动 ${k} 次再弹出。`:`第 ${step} 个出列：${out[step-1]}。` });
    }
    return { frames, facts: [["时间", "O(n)"], ["结构", "队列模拟"], ["演示数据", `n=${n}, k=${k}`]] };
  }

  // ---------- 17 knapsack ----------
  function knapsack() {
    const items = [[2,3],[3,4],[4,5],[5,6]], cap = 8;
    const dp = Array.from({length:items.length+1},()=>Array(cap+1).fill(0));
    for (let i=1;i<=items.length;i++){ const [c,v]=items[i-1]; for(let j=0;j<=cap;j++){ dp[i][j]=dp[i-1][j]; if(j>=c) dp[i][j]=Math.max(dp[i][j],dp[i-1][j-c]+v); } }
    const frames = [];
    for (let i = 0; i <= items.length; i++) {
      const sh = [...head("0/1 KNAPSACK / 容量递减", i===0?"初始化":`item ${i}`)];
      const cw = 64, ch = 34, x0 = 230, y0 = 80;
      for (let j = 0; j <= cap; j++) sh.push(T(x0+j*cw+cw/2, y0-10, j, { size:9, fill:C.muted }));
      for (let r = 0; r <= items.length; r++) {
        sh.push(T(x0-28, y0+r*ch+22, r===0?"0":`${items[r-1][0]}/${items[r-1][1]}`, { size:8, fill:C.muted }));
        for (let j = 0; j <= cap; j++) {
          const filled = r <= i, on = r === i;
          sh.push(R(x0+j*cw+1, y0+r*ch+1, cw-2, ch-2, { fill: on ? "#2c1f1a" : filled ? "#1d2a22" : C.panel, stroke: on ? C.accent : C.line }));
          if (filled) sh.push(T(x0+j*cw+cw/2, y0+r*ch+22, dp[r][j], { size:10, fill: on ? C.accent : C.text }));
        }
      }
      if (i>0) sh.push(T(x0, 340, `dp[${i}][j] = max(dp[${i-1}][j], dp[${i-1}][j−${items[i-1][0]}] + ${items[i-1][1]})`, { anchor:"start", size:10.5, fill:C.muted }));
      frames.push({ shapes:sh, caption: i===0?"dp[0][*] = 0：没有物品。" : `处理第 ${i} 件（容量 ${items[i-1][0]}，价值 ${items[i-1][1]}），j 从大到小更新。` });
    }
    return { frames, facts: [["时间", "O(nm)"], ["状态", "dp[j] 容量 j 的最大价值"], ["演示数据", "4 件 · 容量 8"]] };
  }

  const builders = { cipher, intervalEnergy, graph, palindromeCut, threeSum, grid, water, surrounded, gasStation, skyline, multiSource, maxSubarray, keyNode, tree, probabilityGraph, josephus, knapsack };

  function build(type, input) {
    const fn = builders[type];
    if (!fn) return { frames: [{ shapes: [...head("DEMO / 暂无", type)], caption: "这个演示还没有适配。" }], facts: [] };
    return fn(input);
  }

  window.arenaDemoPreview = function (problem) {
    try { const d = build((problem.animation || {}).type, (problem.animation || {}).input); return svg(d.frames[0].shapes); } catch (e) { return ""; }
  };

  window.renderArenaDemo = function (el, problem, opts = {}) {
    if (!el) return;
    const type = (problem.animation || {}).type || "none";
    const data = build(type, (problem.animation || {}).input);
    const frames = data.frames;
    let i = 0, timer = 0, playing = false;

    el.innerHTML = `<div class="lab-layout">
      <div class="player">
        <div class="player-head"><span>DEMO</span><span class="qid">${problem.id}</span><span>·</span><span>${esc(type)}</span><span class="sp"></span><span id="pIdx">01 / ${String(frames.length).padStart(2,"0")}</span></div>
        <div class="player-stage" id="pStage">${svg(frames[0].shapes)}</div>
        <div class="player-caption" id="pCap">${esc(frames[0].caption)}</div>
        <div class="player-ctrl">
          <button class="pbtn" data-act="prev" type="button">← 上一步</button>
          <button class="pbtn" data-act="play" type="button" id="pPlay">▶ 播放</button>
          <button class="pbtn" data-act="next" type="button">下一步 →</button>
          <button class="pbtn" data-act="reset" type="button">↺</button>
          <span class="sp"></span>
          <span class="idx" id="pStep">STEP 01 / ${String(frames.length).padStart(2,"0")}</span>
          <input id="pRange" type="range" min="0" max="${frames.length-1}" value="0" style="width:120px;accent-color:#e65324">
        </div>
      </div>
      ${opts.compact ? "" : `<aside class="player-side">
        <div class="card">
          <div class="card-head"><span class="k">DEMO NOTES</span></div>
          <p class="caption">这是题目内置的演示数据，用来观察变量如何一步步变化；它不替代你自己的推导。</p>
          <div class="facts">${(data.facts||[]).map(([k,v])=>`<div><b>${esc(k)}</b>${esc(v)}</div>`).join("")}</div>
        </div>
        <div class="card">
          <div class="card-head"><span class="k">PROBLEM</span></div>
          <a href="q.html?id=${problem.id}" style="font-family:var(--serif);font-size:18px;font-weight:700;line-height:1.4;display:block">${esc(problem.title)}</a>
          <p class="side-note">${esc(problem.track)} · ${esc(problem.difficulty)} · ${problem.minutes} MIN</p>
        </div>
      </aside>`}
    </div>`;

    const stage = el.querySelector("#pStage"), cap = el.querySelector("#pCap");
    const idxEl = el.querySelector("#pIdx"), stepEl = el.querySelector("#pStep"), range = el.querySelector("#pRange");
    const playBtn = el.querySelector("#pPlay");

    function draw() {
      stage.innerHTML = svg(frames[i].shapes);
      cap.textContent = frames[i].caption;
      idxEl.textContent = String(i + 1).padStart(2, "0") + " / " + String(frames.length).padStart(2, "0");
      stepEl.textContent = "STEP " + String(i + 1).padStart(2, "0") + " / " + String(frames.length).padStart(2, "0");
      range.value = i;
    }
    function stop() { playing = false; clearInterval(timer); playBtn.textContent = "▶ 播放"; playBtn.classList.remove("on"); }
    function go(n) { i = Math.max(0, Math.min(frames.length - 1, n)); draw(); }
    el.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => {
      const act = b.dataset.act;
      if (act === "prev") { stop(); go(i - 1); }
      if (act === "next") { stop(); go(i + 1); }
      if (act === "reset") { stop(); go(0); }
      if (act === "play") {
        if (playing) { stop(); return; }
        if (i >= frames.length - 1) i = 0;
        playing = true; playBtn.textContent = "❚❚ 暂停"; playBtn.classList.add("on");
        timer = setInterval(() => { if (i >= frames.length - 1) { stop(); return; } go(i + 1); }, 1300);
      }
    }));
    range.addEventListener("input", () => { stop(); go(+range.value); });
    draw();
    return { go, stop };
  };
})();
