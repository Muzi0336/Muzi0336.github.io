(function () {
  const C = window.DEMO_CAPTIONS || {};
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const cap = (t, i, fb) => ((C[t] && C[t].caps && C[t].caps[i]) || fb || "");

  const row = (cells, cls = "") => `<div class="dv-row ${cls}">${cells.join("")}</div>`;
  const box = (main, sub = "", cls = "") => `<div class="dv-box ${cls}"><b>${main}</b>${sub !== "" ? `<span>${sub}</span>` : ""}</div>`;
  const table = (head, rows, cls = "") => `<table class="dv-table ${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td${c && c.cls ? ` class="${c.cls}"` : ""}>${c && c.t !== undefined ? c.t : c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const legend = (items) => `<div class="dv-legend">${items.map(([c, t]) => `<span><i style="background:${c}"></i>${t}</span>`).join("")}</div>`;
  const stage = (body, foot = "") => `<div class="dv">${body}${foot ? legend(foot) : ""}</div>`;
  const code = (lines) => `<pre class="dv-code">${lines.map((l, i) => `<span${i === lines.length - 1 ? ' class="on"' : ""}>${String(i + 1).padStart(2, "0")}  ${esc(l)}</span>`).join("")}</pre>`;

  const B = {};
  const R = {};

  // 1. cipher
  B.cipher = (a) => {
    const s = a.input || "";
    const out = [];
    for (let k = 0; k <= s.length; k++) {
      const cells = [...s].map((ch, j) => box(esc(j < k ? String.fromCharCode(ch.charCodeAt(0) - j - 1) : ch), j + 1, j < k ? "done" : j === k ? "cur" : ""));
      const rows = [...s].slice(0, k).map((ch, j) => [j + 1, esc(ch), ch.charCodeAt(0), String.fromCharCode(ch.charCodeAt(0) - j - 1)]);
      out.push(stage(row(cells, "dv-cipher") + (rows.length ? table(["位", "密文", "ASCII", "原文"], rows) : `<div class="dv-hint">按「下一步」逐字符还原。</div>`), [["#e65324", "当前字符"], ["#5fbf9a", "已还原"]]));
    }
    return out;
  };

  // 2. interval energy
  B.intervalEnergy = (a) => {
    const pos = a.positions || [], en = a.energy || [], total = en.reduce((x, y) => x + y, 0);
    const seq = [a.start ?? 0, 4, 1, 0, 3];
    let closed = new Set([a.start ?? 0]), acc = 0, last = (a.start ?? 0);
    const out = [];
    out.push({ html: stage(row(pos.map((p, i) => box(i + 1, `${p} / ${en[i]}`, closed.has(i) ? "done" : ""))), [["#e65324", "当前"], ["#69757e", "已关闭"]]) , cap: cap("intervalEnergy", 0) });
    const moves = [
      { to: 3, add: 70 }, { to: 1, add: 120 }, { to: 0, add: 20 }, { to: 4, add: 60 },
    ];
    moves.forEach((m, k) => {
      acc += m.add; closed.add(m.to); last = m.to;
      out.push({ html: stage(row(pos.map((p, i) => box(i + 1, `${p} / ${en[i]}`, i === m.to ? "cur" : closed.has(i) ? "done" : ""))) + `<div class="dv-meta">累计能耗 <b>${acc}</b> / 剩余未关闭 ${total - [...closed].reduce((s, i) => s + en[i], 0)}</div>`, [["#e65324", "当前"], ["#69757e", "已关闭"]]) });
    });
    out.push({ html: stage(`<div class="dv-result">全部关闭，最优总能耗 <b>${acc}</b></div>`), cap: cap("intervalEnergy", 5) });
    out.forEach((f, i) => f.cap = f.cap || cap("intervalEnergy", i));
    return out.map(f => f.html);
  };

  // 3. graph
  B.graph = (a) => {
    const ns = a.nodes, es = a.edges, ids = ns.map(n => n.id);
    const ways = Object.fromEntries(ids.map(i => [i, 0]));
    const sum = Object.fromEntries(ids.map(i => [i, 0]));
    ways[ids[0]] = 1;
    const order = ["A", "B", "C", "D"];
    const out = [];
    const svg = (done, cur) => {
      const e = es.map(x => {
        const f = ns.find(n => n.id === x.from), t = ns.find(n => n.id === x.to);
        const on = done.has(x.from) && done.has(x.to);
        return `<line x1="${f.x}" y1="${f.y}" x2="${t.x}" y2="${t.y}" stroke="${on ? "#e65324" : "#3a444d"}" stroke-width="${on ? 2.4 : 1.4}" marker-end="url(#ar)"/>` + ((x.from === "A" || on) ? `<text x="${(f.x + t.x) / 2}" y="${(f.y + t.y) / 2 - 5}" fill="#9a9a90" font-size="11">${x.w}</text>` : "");
      }).join("");
      const n = ns.map(x => `<g><circle cx="${x.x}" cy="${x.y}" r="22" fill="${x.id === cur ? "#3a2a24" : done.has(x.id) ? "#222a31" : "#1c2228"}" stroke="${x.id === cur ? "#e65324" : done.has(x.id) ? "#69757e" : "#3a444d"}" stroke-width="1.6"/><text x="${x.x}" y="${x.y + 4}" text-anchor="middle" fill="#e9e6dc" font-size="13">${x.id}</text><text x="${x.x}" y="${x.y + 38}" text-anchor="middle" fill="#8a8a80" font-size="9">${esc(x.label)}</text></g>`).join("");
      return `<svg class="dv-svg" viewBox="0 0 440 300"><defs><marker id="ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#69757e"/></marker></defs>${e}${n}</svg>`;
    };
    const rows = () => ids.map(i => [i, ways[i], sum[i]]);
    let done = new Set();
    out.push({ html: stage(svg(done, "A") + table(["节点", "路径数", "总时长"], rows()), [["#e65324", "当前"], ["#69757e", "已处理"]]) });
    for (const v of order) {
      done.add(v);
      if (v !== "A") {
        for (const x of es.filter(e => e.to === v)) {
          ways[v] += ways[x.from];
          sum[v] += sum[x.from] + ways[x.from] * x.w;
        }
      }
      out.push({ html: stage(svg(done, v) + table(["节点", "路径数", "总时长"], rows(), v === "D" ? "hl-last" : ""), [["#e65324", "当前"], ["#69757e", "已处理"]]) });
    }
    return out;
  };

  // 4. palindrome cut
  B.palindromeCut = (a) => {
    const s = a.s || "", n = s.length, out = [];
    const pal = (i, j) => { while (i < j) { if (s[i] !== s[j]) return false; i++; j--; } return true; };
    const dp = Array(n + 1).fill(99); dp[0] = -1;
    const view = (start, end, kind, cand) => {
      const chars = [...s].map((c, i) => box(c, i, i >= start && i < end ? "cur" : ""));
      const cols = dp.map((v, i) => box(i === 0 ? "dp[0]" : `dp[${i}]`, v === 99 ? "∞" : v, i === end ? "cur" : v < 99 ? "done" : ""));
      return stage(row(chars, "dv-chars") + row(cols, "dv-dp") + `<div class="dv-meta">当前子串 <b>"${esc(s.slice(start, end))}"</b> · ${kind}${cand !== undefined ? ` · 候选 ${cand}` : ""}</div>`, [["#e65324", "当前"], ["#5fbf9a", "已更新"]]);
    };
    out.push({ html: view(0, 0, "空前缀", undefined) });
    for (let end = 1; end <= n; end++) {
      for (let start = 0; start < end; start++) {
        if (!pal(start, end)) {
          out.push({ html: view(start, end, "不是回文，跳过") });
          continue;
        }
        const cand = dp[start] + 1;
        if (cand < dp[end]) dp[end] = cand;
        out.push({ html: view(start, end, "是回文", cand) });
      }
    }
    out.push({ html: stage(`<div class="dv-result">dp[${n}] = <b>${dp[n]}</b>：最少切 ${dp[n]} 刀</div>`) });
    return out;
  };

  // 5. three sum
  B.threeSum = (a) => {
    const arr = [...(a.values || [])].sort((x, y) => x - y), out = [], res = [];
    const view = (i, l, r, sum, triples, msg) => stage(row(arr.map((v, k) => box(v, k, k === i ? "cur" : k === l ? "left" : k === r ? "right" : "")), "dv-chars") + `<div class="dv-meta">i=${i} · l=${l} · r=${r} · 三数和 <b>${sum}</b></div>` + (triples.length ? `<div class="dv-result">三元组：${triples.map(x => `(${x.join(", ")})`).join("  ")}` : "") + (msg ? `<div class="dv-hint">${esc(msg)}</div>` : ""), [["#e65324", "i"], ["#5fbf9a", "l"], ["#5a8fbf", "r"]]) ;
    out.push({ html: view(0, 1, arr.length - 1, arr[0] + arr[1] + arr[arr.length - 1], res) });
    for (let i = 0; i < arr.length - 2; i++) {
      if (i > 0 && arr[i] === arr[i - 1]) { out.push({ html: view(i, i + 1, arr.length - 1, 0, res, "跳过重复的 i") }); continue; }
      let l = i + 1, r = arr.length - 1;
      while (l < r) {
        const sum = arr[i] + arr[l] + arr[r];
        out.push({ html: view(i, l, r, sum, res, sum === 0 ? "和为零" : sum < 0 ? "和偏小，l 右移" : "和偏大，r 左移") });
        if (sum === 0) {
          res.push([arr[i], arr[l], arr[r]]);
          out.push({ html: view(i, l, r, sum, res, "记录三元组，双指针内移并跳过重复值") });
          while (l < r && arr[l] === arr[l + 1]) l++;
          while (l < r && arr[r] === arr[r - 1]) r--;
          l++; r--;
        } else if (sum < 0) l++; else r--;
      }
    }
    out.push({ html: stage(`<div class="dv-result">扫描完成，共找到 <b>${res.length}</b> 个不同三元组：${res.map(x => `(${x.join(", ")})`).join("  ")}</div>`) });
    return out;
  };

  // 6. grid path
  B.grid = (a) => {
    const g = a.grid || [], out = [], dp = g.map(r => r.map(() => 0));
    const view = (i, j, val) => stage(row(g.map((r, x) => r.map((v, y) => box(v, `dp ${dp[x][y]}`, x === i && y === j ? "cur" : dp[x][y] ? "done" : "")).join("")), "dv-grid") + `<div class="dv-meta">最小代价 <b>${dp[g.length - 1][g[0].length - 1]}</b></div>`);
    out.push({ html: view(0, 0, 0) });
    for (let i = 0; i < g.length; i++) for (let j = 0; j < g[0].length; j++) {
      if (i === 0 && j === 0) dp[i][j] = g[i][j];
      else {
        const up = i ? dp[i - 1][j] : 99, left = j ? dp[i][j - 1] : 99;
        dp[i][j] = Math.min(up, left) + g[i][j];
      }
      out.push({ html: view(i, j, dp[i][j]) });
    }
    out.push({ html: stage(`<div class="dv-result">最小路径代价 <b>${dp[g.length - 1][g[0].length - 1]}</b></div>`) });
    return out;
  };

  // 7. water
  B.water = (a) => {
    const h = a.heights || [], n = h.length, out = [], water = Array(n).fill(0);
    let l = 0, r = n - 1, lm = 0, rm = 0, sum = 0;
    const view = (i, msg) => {
      const bars = h.map((v, k) => `<div class="dv-bar"><i style="height:${v * 18}px"></i><em>${v}</em>${water[k] ? `<u style="height:${water[k] * 18}px"></u>` : ""}<span class="${k === i ? "on" : ""}">${k + 1}</span></div>`).join("");
      return stage(`<div class="dv-bars">${bars}</div><div class="dv-meta">左墙 ${lm} · 右墙 ${rm} · 蓄水 <b>${sum}</b> / 9</div>`, [["#5a8fbf", "水"], ["#69757e", "柱高"]]);
    };
    out.push({ html: view(0, "初始") });
    let i = 0;
    while (l <= r) {
      if (h[l] <= h[r]) {
        lm = Math.max(lm, h[l]); water[l] = lm - h[l]; sum += water[l]; i = l; l++;
      } else {
        rm = Math.max(rm, h[r]); water[r] = rm - h[r]; sum += water[r]; i = r; r--;
      }
      out.push({ html: view(i) });
    }
    return out;
  };

  // 8. surrounded
  B.surrounded = (a) => {
    const g = (a.grid || []).map(r => [...r]), rows = g.length, cols = g[0].length;
    const out = [];
    const view = (title) => stage(`<div class="dv-grid-text">${g.map(r => r.map(c => `<span class="c-${c}">${c}</span>`).join("")).join("")}</div><div class="dv-meta">${esc(title)}</div>`, [["#e65324", "O"], ["#5fbf9a", "S"], ["#69757e", "X"]]) ;
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      if ((i === 0 || j === 0 || i === rows - 1 || j === cols - 1) && g[i][j] === "O") g[i][j] = "S";
    }
    out.push({ html: view("边界 O 全部标记为安全 S，加入队列") });
    out.push({ html: view("从所有安全格向内扩散；内部 O 无法到达边界") });
    for (let i = 1; i < rows - 1; i++) for (let j = 1; j < cols - 1; j++) if (g[i][j] === "O") g[i][j] = "X";
    out.push({ html: view("无法到达边界的 O 全部翻转为 X，安全 O 保持原样") });
    return out;
  };

  // 9. gas station
  B.gasStation = (a) => {
    const gas = a.gas || [], cost = a.cost || [], n = gas.length, out = [];
    const rows = (start, tank, k) => gas.map((g, i) => [i, g, cost[i], i === k ? `<b>${tank}</b>` : "", i === start ? "候选" : ""]);
    out.push({ html: stage(table(["站", "油", "消耗", "油箱", "备注"], rows(0, 0, -1)) + `<div class="dv-meta">总差额 <b>${gas.reduce((x, y) => x + y, 0) - cost.reduce((x, y) => x + y, 0)}</b></div>`) });
    let start = 0, tank = 0, fails = [];
    for (let i = 0; i < n; i++) {
      tank += gas[i] - cost[i];
      out.push({ html: stage(table(["站", "油", "消耗", "油箱", "备注"], rows(start, tank, i)) + `<div class="dv-meta">${tank < 0 ? `油箱 ${tank}，候选起点跳到 ${i + 1}` : `当前油箱 ${tank}`}</div>`) });
      if (tank < 0) { start = i + 1; tank = 0; }
    }
    out.push({ html: stage(table(["站", "油", "消耗", "油箱", "备注"], rows(start, tank, -1)) + `<div class="dv-result">可以完成一圈，起点是 <b>${start}</b></div>`) });
    return out;
  };

  // 10. skyline
  B.skyline = (a) => {
    const bs = a.buildings || [], out = [];
    const xs = [...new Set(bs.flatMap(b => [b.l, b.r]))].sort((x, y) => x - y);
    const maxH = (x) => Math.max(0, ...bs.filter(b => b.l <= x && x < b.r).map(b => b.h));
    const view = (x, height, msg) => {
      const W = 760, H = 210, sx = v => 40 + (v - 2) * 25, sy = v => 190 - v * 7;
      const bars = bs.map(b => `<rect x="${sx(b.l)}" y="${sy(b.h)}" width="${(b.r - b.l) * 25}" height="${b.h * 7}" fill="#29323a" stroke="#4a555e"/>`).join("");
      return stage(`<svg class="dv-svg" viewBox="0 0 700 220">${bars}<line x1="${sx(x)}" y1="20" x2="${sx(x)}" y2="195" stroke="#e65324" stroke-width="2"/>${x >= 2 ? `<text x="${sx(x) + 4}" y="30" fill="#e65324" font-size="11">x=${x}</text>` : ""}</svg><div class="dv-meta">${esc(msg)}</div>`, [["#e65324", "扫描线"], ["#69757e", "建筑"]]) ;
    };
    out.push({ html: view(0, 0, "初始化") });
    xs.forEach(x => {
      const h = maxH(x);
      out.push({ html: view(x, h, `x=${x}，当前最高 ${h}`) });
    });
    return out;
  };

  // 11. multi source BFS
  B.multiSource = (a) => {
    const g = a.grid || [], R = g.length, Cc = g[0].length, dist = g.map(r => r.map(() => -1));
    const q = []; g.forEach((r, i) => r.forEach((v, j) => { if (v === 0) { dist[i][j] = 0; q.push([i, j]); } }));
    const out = [];
    const view = (cur, msg) => stage(`<div class="dv-grid-text">${dist.map((r, i) => r.map((v, j) => `<span class="${cur && cur[0] === i && cur[1] === j ? "on" : v >= 0 ? "done" : ""}">${v < 0 ? "·" : v}</span>`).join("")).join("")}</div><div class="dv-meta">${esc(msg)}</div>`, [["#e65324", "当前"], ["#5fbf9a", "已确定"]]) ;
    out.push({ html: view(null, `找到 ${q.length} 个 0，全部以距离 0 入队`) });
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < R && ny >= 0 && ny < Cc && dist[nx][ny] < 0) { dist[nx][ny] = dist[x][y] + 1; q.push([nx, ny]); }
      }
      out.push({ html: view([x, y], `从 (${x + 1},${y + 1}) 的已确定距离 ${dist[x][y]} 向外扩展；队列还剩 ${q.length} 格`) });
    }
    return out;
  };

  // 12. max subarray
  B.maxSubarray = (a) => {
    const v = a.values || [], out = [];
    let cur = v[0], best = v[0];
    const view = (i, cur, best) => stage(row(v.map((x, k) => box(x, k + 1, k === i ? "cur" : k < i ? "done" : "")), "dv-chars") + `<div class="dv-meta">以当前位置结尾 <b>${cur}</b> · 全局最优 <b>${best}</b></div>`) ;
    out.push({ html: view(0, cur, best) });
    for (let i = 1; i < v.length; i++) {
      cur = Math.max(v[i], cur + v[i]);
      best = Math.max(best, cur);
      out.push({ html: view(i, cur, best) });
    }
    out.push({ html: stage(`<div class="dv-result">最大连续子段和 <b>${best}</b></div>`) });
    return out;
  };

  // 13. key node
  B.keyNode = (a) => {
    const lv = a.levelOrder || [], nodes = [];
    lv.forEach((v, i) => { if (v !== -1 && v != null) nodes.push({ id: v, i }); });
    const kids = (i) => [2 * i + 1, 2 * i + 2].map(k => lv[k] !== -1 && k < lv.length ? lv[k] : null);
    const out = [];
    const path = [];
    const pos = (i) => {
      const d = Math.floor(Math.log2(i + 1));
      const k = i - (Math.pow(2, d) - 1);
      const count = Math.pow(2, d);
      return { x: 320 + (k - (count - 1) / 2) * 90, y: 40 + d * 70 };
    };
    const view = (cur, mx) => {
      const edges = [];
      lv.forEach((v, i) => { if (v !== -1) { const [l, r] = kids(i); [l, r].forEach((c, k) => { if (c != null) { const a1 = pos(i), b1 = pos(2 * i + 1 + k); edges.push(`<line x1="${a1.x}" y1="${a1.y}" x2="${b1.x}" y2="${b1.y}" stroke="#3a444d"/>`); } }); } });
      const ns = lv.map((v, i) => { if (v === -1) return ""; const p = pos(i); return `<g><circle cx="${p.x}" cy="${p.y}" r="20" fill="${v === cur ? "#3a2a24" : path.includes(v) ? "#22342d" : "#1c2228"}" stroke="${v === cur ? "#e65324" : path.includes(v) ? "#5fbf9a" : "#3a444d"}"/><text x="${p.x}" y="${p.y + 4}" text-anchor="middle" fill="#e9e6dc" font-size="12">${v}</text></g>`; }).join("");
      return stage(`<svg class="dv-svg" viewBox="0 0 640 220">${edges.join("")}${ns}</svg><div class="dv-meta">祖先最大值 <b>${mx}</b> · 关键节点 ${path.length}</div>`, [["#e65324", "当前"], ["#5fbf9a", "关键"]]) ;
    };
    out.push({ html: view(null, 0) });
    let mx = 0;
    const walk = (i) => {
      const v = lv[i]; if (v === -1 || v == null) return;
      if (v > mx) { mx = v; path.push(v); out.push({ html: view(v, mx) }); }
      walk(2 * i + 1); walk(2 * i + 2);
    };
    walk(0);
    out.push({ html: stage(`<div class="dv-result">共找到 <b>${path.length}</b> 个关键节点：${path.join(" → ")}</div>`) });
    return out;
  };

  // 14. tree postorder
  B.tree = (a) => {
    const lv = (a.levelOrder || "").split(""), out = [];
    const pos = (i) => {
      const d = Math.floor(Math.log2(i + 1));
      const k = i - (Math.pow(2, d) - 1);
      const count = Math.pow(2, d);
      return { x: 320 + (k - (count - 1) / 2) * 100, y: 40 + d * 70 };
    };
    const edges = [];
    for (let i = 1; i < lv.length; i++) { const p = Math.floor((i - 1) / 2); const a1 = pos(p), b1 = pos(i); edges.push(`<line x1="${a1.x}" y1="${a1.y}" x2="${b1.x}" y2="${b1.y}" stroke="#3a444d"/>`); }
    const visited = [], outArr = [];
    const view = (cur) => stage(`<svg class="dv-svg" viewBox="0 0 620 260">${edges.join("")}${lv.map((v, i) => { const p = pos(i); return `<g><circle cx="${p.x}" cy="${p.y}" r="19" fill="${i === cur ? "#3a2a24" : visited.includes(i) ? "#22342d" : "#1c2228"}" stroke="${i === cur ? "#e65324" : visited.includes(i) ? "#5fbf9a" : "#3a444d"}"/><text x="${p.x}" y="${p.y + 4}" text-anchor="middle" fill="#e9e6dc" font-size="12">${v}</text></g>`; }).join("")}</svg><div class="dv-meta">后序输出 <b>${outArr.join("") || "—"}</b></div>`, [["#e65324", "当前"], ["#5fbf9a", "已访问"]]) ;
    out.push({ html: view(null) });
    const walk = (i) => {
      if (i >= lv.length) return;
      out.push({ html: view(i) });
      walk(2 * i + 1); walk(2 * i + 2);
      visited.push(i); outArr.push(lv[i]);
      out.push({ html: view(i) });
    };
    walk(0);
    return out;
  };

  // 15. probability graph
  B.probabilityGraph = (a) => {
    const ns = a.nodes || [], es = a.edges || [], start = a.start ?? 0, end = a.end ?? 2, out = [];
    const best = Object.fromEntries(ns.map(n => [n, n === start ? 1 : 0]));
    const done = new Set();
    const P = [[130, 200], [330, 60], [330, 200]];
    const view = (cur, msg) => {
      const lines = es.map(e => `<line x1="${P[e.u][0]}" y1="${P[e.u][1]}" x2="${P[e.v][0]}" y2="${P[e.v][1]}" stroke="#3a444d"/><text x="${(P[e.u][0] + P[e.v][0]) / 2}" y="${(P[e.u][1] + P[e.v][1]) / 2 - 4}" fill="#9a9a90" font-size="10">${e.p}</text>`).join("");
      const nodes = ns.map(n => `<g><circle cx="${P[n][0]}" cy="${P[n][1]}" r="22" fill="${n === cur ? "#3a2a24" : done.has(n) ? "#22342d" : "#1c2228"}" stroke="${n === cur ? "#e65324" : done.has(n) ? "#5fbf9a" : "#3a444d"}"/><text x="${P[n][0]}" y="${P[n][1] + 4}" text-anchor="middle" fill="#e9e6dc" font-size="13">${n}</text><text x="${P[n][0]}" y="${P[n][1] + 38}" text-anchor="middle" fill="#8a8a80" font-size="10">${best[n].toFixed(5)}</text></g>`).join("");
      return stage(`<svg class="dv-svg" viewBox="0 0 460 300">${lines}${nodes}</svg><div class="dv-meta">${esc(msg)}</div>`, [["#e65324", "当前"], ["#5fbf9a", "已确定"]]) ;
    };
    out.push({ html: view(null, "初始化 best[start]=1") });
    while (done.size < ns.length) {
      let u = -1; ns.forEach(n => { if (!done.has(n) && (u < 0 || best[n] > best[u])) u = n; });
      done.add(u);
      out.push({ html: view(u, `取出概率最高的路口 ${u}（${best[u].toFixed(5)}）`) });
      for (const e of es.filter(x => x.u === u)) {
        const np = best[u] * e.p;
        if (np > best[e.v]) { best[e.v] = np; out.push({ html: view(e.v, `松弛 ${u} → ${e.v}：新概率 ${np.toFixed(5)}`) }); }
      }
    }
    out.push({ html: stage(`<div class="dv-result">最大通行概率 <b>${best[end].toFixed(5)}</b></div>`) });
    return out;
  };

  // 16. josephus
  B.josephus = (a) => {
    const n = a.n || 8, m = a.m || 4, step = a.step || 3, out = [];
    let alive = Array.from({ length: n }, (_, i) => i + 1);
    let idx = 0, count = 0, elim = [];
    const view = (report, cur) => {
      const dots = Array.from({ length: n }, (_, i) => {
        const ang = (-90 + i * 360 / n) * Math.PI / 180;
        const x = 230 + Math.cos(ang) * 110, y = 130 + Math.sin(ang) * 90;
        const p = i + 1, on = p === cur, dead = elim.includes(p);
        return `<g><circle cx="${x}" cy="${y}" r="18" fill="${on ? "#3a2a24" : dead ? "#1a1d22" : "#1c2228"}" stroke="${on ? "#e65324" : dead ? "#333" : "#3a444d"}"/><text x="${x}" y="${y + 4}" text-anchor="middle" fill="${dead ? "#555" : "#e9e6dc"}" font-size="12">${p}</text>${on ? `<text x="${x}" y="${y - 26}" text-anchor="middle" fill="#e65324" font-size="9">报 ${report}</text>` : ""}</g>`;
      }).join("");
      return stage(`<svg class="dv-svg" viewBox="0 0 460 260">${dots}</svg><div class="dv-meta">已出列 ${elim.join(", ") || "—"}</div>`, [["#e65324", "当前"], ["#69757e", "已出列"]]) ;
    };
    out.push({ html: view(0, 1) });
    while (alive.length) {
      const p = alive[idx];
      count++;
      if (count === step) {
        out.push({ html: view(count, p) });
        elim.push(p); alive.splice(idx, 1); count = 0;
        out.push({ html: view(0, alive.length ? alive[idx % alive.length] : 0) });
      } else {
        out.push({ html: view(count, p) });
        idx = (idx + 1) % alive.length;
      }
    }
    return out;
  };

  // 17. knapsack
  B.knapsack = (a) => {
    const capv = a.capacity ?? 0, items = a.items || [], m = items.length, out = [];
    const dp = Array.from({ length: m + 1 }, () => Array(capv + 1).fill(0));
    const view = (i, j, src) => {
      const rows = dp.map((r, x) => [`${x === 0 ? "空" : x + " " + items[x - 1].name}`, ...r.map((v, y) => ({ t: v, cls: x === i && y === j ? "cur" : x === src && y === j - items[i - 1].v ? "src" : x < i ? "done" : "" }))]);
      return stage(table(["i \\ c", ...Array.from({ length: capv + 1 }, (_, k) => k)], rows) + `<div class="dv-meta">当前 dp[${i}][${j}] = <b>${dp[i][j]}</b></div>`, [["#e65324", "当前"], ["#5fbf9a", "来源"]]) ;
    };
    out.push({ html: view(0, 0, -1) });
    for (let i = 1; i <= m; i++) {
      const it = items[i - 1], cost = it.v, val = it.w;
      for (let j = 0; j <= capv; j++) {
        if (cost > j) dp[i][j] = dp[i - 1][j];
        else dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - cost] + val);
        out.push({ html: view(i, j, cost <= j ? i - 1 : i - 1) });
      }
    }
    return out;
  };

  const build = (type, a) => B[type] ? B[type](a) : [];
  const caps = (type) => (C[type] && C[type].caps) || [];
  const withCaps = (type, arr) => {
    const src = caps(type);
    return arr.map((f, i) => {
      const o = typeof f === "string" ? { html: f } : f;
      return { html: o.html, cap: src.length === arr.length ? (src[i] || o.cap || "") : (o.cap || "") };
    });
  };

  function preview(problem) {
    const type = (problem.animation || {}).type;
    const fs = build(type, problem.animation || {});
    if (!fs.length) return "";
    const html = typeof fs[0] === "string" ? fs[0] : fs[0].html;
    return `<div class="dv-thumb"><div class="dv-thumb-in">${html}</div></div>`;
  }

  window.arenaDemoPreview = preview;

  window.renderArenaDemo = function (el, problem, opts = {}) {
    if (!el) return;
    const type = (problem.animation || {}).type || "none";
    const frames = withCaps(type, build(type, problem.animation || {}));
    if (!frames.length) { el.innerHTML = `<div class="player"><div class="player-empty">这个演示暂时没有可用画面。</div></div>`; return; }
    let i = 0, timer = 0;
    el.innerHTML = `<div class="lab-layout">
      <div class="player">
        <div class="player-head"><span>DEMO</span><span class="qid">${problem.id}</span><span>·</span><span>${esc(type)}</span><span class="sp"></span><span id="pIdx">01 / ${pad(frames.length)}</span></div>
        <div class="player-stage" id="pStage"></div>
        <div class="player-caption" id="pCap"></div>
        <div class="player-ctrl">
          <button class="pbtn" data-act="prev" type="button">← 上一步</button>
          <button class="pbtn" data-act="play" type="button" id="pPlay">▶ 播放</button>
          <button class="pbtn" data-act="next" type="button">下一步 →</button>
          <button class="pbtn" data-act="reset" type="button">↺</button>
          <span class="sp"></span><span class="idx" id="pStep"></span>
          <input id="pRange" type="range" min="0" max="${frames.length - 1}" value="0" aria-label="演示进度">
        </div>
      </div>
      ${opts.compact ? "" : `<aside class="player-side"><div class="card"><div class="card-head"><span class="k">DEMO NOTES</span></div><p class="caption">动画由代码实时绘制，按同一组数据逐步推进；拖动进度条可以回到任意一帧。</p><div class="facts"><div><b>帧数</b>${frames.length}</div><div><b>题目</b>${problem.id}</div><div><b>分类</b>${esc(problem.track)}</div></div></div><div class="card"><div class="card-head"><span class="k">PROBLEM</span></div><a href="q.html?id=${problem.id}" style="font-family:var(--serif);font-size:18px;font-weight:700;line-height:1.4;display:block">${esc(problem.title)}</a><p class="side-note">${esc(problem.track)} · ${esc(problem.difficulty)} · ${problem.minutes} MIN</p></div></aside>`}
    </div>`;
    const stageEl = el.querySelector("#pStage"), capt = el.querySelector("#pCap"), idx = el.querySelector("#pIdx"), stepEl = el.querySelector("#pStep"), range = el.querySelector("#pRange"), play = el.querySelector("#pPlay");
    function draw() {
      stageEl.innerHTML = frames[i].html;
      capt.textContent = frames[i].cap;
      idx.textContent = pad(i + 1) + " / " + pad(frames.length);
      stepEl.textContent = "STEP " + pad(i + 1) + " / " + pad(frames.length);
      range.value = i;
    }
    function stop() { if (timer) clearInterval(timer); timer = 0; if (play) play.textContent = "▶ 播放"; }
    function next() { if (i < frames.length - 1) { i++; draw(); } else stop(); }
    function toggle() { if (timer) { stop(); return; } if (i >= frames.length - 1) { i = 0; draw(); } play.textContent = "❙❙ 暂停"; timer = setInterval(next, 1000); }
    el.querySelectorAll(".pbtn").forEach(b => b.addEventListener("click", () => {
      const act = b.dataset.act;
      if (act === "prev") { stop(); if (i > 0) { i--; draw(); } }
      else if (act === "next") { stop(); next(); }
      else if (act === "reset") { stop(); i = 0; draw(); }
      else if (act === "play") toggle();
    }));
    range.addEventListener("input", () => { stop(); i = Number(range.value); draw(); });
    draw();
  };
})();
