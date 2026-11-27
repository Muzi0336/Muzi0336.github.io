/* 数据结构教程阅读页：三件事 —— 复制代码、右侧小标题跟随滚动、图片灯箱。
   不加载任何外部库，正文已是静态 HTML，脚本禁用也能正常阅读。 */
(function () {
  "use strict";

  // ---------------------------------------------------------- 1. 复制代码
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy]");
    if (!btn) return;
    var card = btn.closest(".codecard");
    var code = card && card.querySelector("pre");
    if (!code) return;
    var text = code.innerText;
    var done = function () {
      btn.textContent = "已复制";
      setTimeout(function () { btn.textContent = "复制"; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {});
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (err) {}
      document.body.removeChild(ta);
    }
  });

  // ---------------------------------------------------------- 2. 小标题高亮
  (function () {
    var links = Array.prototype.slice.call(document.querySelectorAll(".docside ol a"));
    var secs = Array.prototype.slice.call(document.querySelectorAll(".dsec[id]"));
    if (!links.length || !secs.length) return;

    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

    var current = null;
    function highlight(id) {
      if (id === current) return;
      current = id;
      links.forEach(function (a) { a.classList.remove("on"); });
      if (byId[id]) byId[id].classList.add("on");
    }

    if ("IntersectionObserver" in window) {
      var seen = {};
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          seen[en.target.id] = en.isIntersecting ? en.boundingClientRect.top : null;
        });
        var visible = secs.filter(function (s) { return seen[s.id] !== null && seen[s.id] !== undefined; });
        if (visible.length) {
          visible.sort(function (a, b) { return Math.abs(seen[a.id]) - Math.abs(seen[b.id]); });
          highlight(visible[0].id);
        }
      }, { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.01, 0.2] });
      secs.forEach(function (s) { obs.observe(s); });
    }

    if (location.hash) {
      var id = location.hash.slice(1);
      if (byId[id]) highlight(id);
    }
  })();

  // ---------------------------------------------------------- 3. 图片灯箱
  (function () {
    var lb = null, img = null, label = null, stage = null;
    var zoom = 1, tx = 0, ty = 0;
    var MAX = 8, STEP = 1.18;
    var dragging = false, sx = 0, sy = 0, bx = 0, by = 0, moved = 0;

    function build() {
      lb = document.createElement("div");
      lb.className = "lb";
      lb.innerHTML =
        '<div class="lb-hint">滚轮缩放 · 拖动平移 · 双击切换 · Esc 关闭</div>' +
        '<button class="lb-close" aria-label="关闭">×</button>' +
        '<div class="lb-stage"><img class="lb-img" alt=""></div>' +
        '<div class="lb-bar">' +
        '<button data-lb-out aria-label="缩小">−</button>' +
        '<span class="lb-zoom">100%</span>' +
        '<button data-lb-in aria-label="放大">+</button>' +
        '<button data-lb-fit>适应</button>' +
        '</div>';
      document.body.appendChild(lb);

      img = lb.querySelector(".lb-img");
      label = lb.querySelector(".lb-zoom");
      stage = lb.querySelector(".lb-stage");

      img.addEventListener("load", fit);
      window.addEventListener("resize", function () {
        if (lb.classList.contains("open")) { fit(); setZoom(1); }
      });

      lb.querySelector(".lb-close").addEventListener("click", close);
      lb.querySelector("[data-lb-close]") && lb.querySelector("[data-lb-close]").addEventListener("click", close);
      lb.querySelector("[data-lb-in]").addEventListener("click", function () { setZoom(zoom * STEP); });
      lb.querySelector("[data-lb-out]").addEventListener("click", function () { setZoom(zoom / STEP); });
      lb.querySelector("[data-lb-fit]").addEventListener("click", function () { setZoom(1); });

      // 点空白处关闭（刚拖过就别关，免得平移完一松手就没了）
      lb.addEventListener("click", function (e) {
        if (moved > 4) { moved = 0; return; }
        if (e.target === lb || e.target === stage) close();
      });

      // 滚轮缩放
      lb.addEventListener("wheel", function (e) {
        e.preventDefault();
        setZoom(zoom * (e.deltaY < 0 ? STEP : 1 / STEP));
      }, { passive: false });

      // 拖动平移
      stage.addEventListener("pointerdown", function (e) {
        moved = 0;
        if (zoom <= 1) return;
        dragging = true;
        stage.classList.add("dragging");
        sx = e.clientX; sy = e.clientY; bx = tx; by = ty;
        stage.setPointerCapture(e.pointerId);
      });
      stage.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        tx = bx + (e.clientX - sx);
        ty = by + (e.clientY - sy);
        moved += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
        apply();
      });
      stage.addEventListener("pointerup", function (e) {
        dragging = false;
        stage.classList.remove("dragging");
        try { stage.releasePointerCapture(e.pointerId); } catch (err) {}
      });

      // 双击在 适应 / 2 倍 之间切换
      stage.addEventListener("dblclick", function () { setZoom(zoom > 1.4 ? 1 : 2); });

      document.addEventListener("keydown", function (e) {
        if (!lb.classList.contains("open")) return;
        if (e.key === "Escape") close();
        else if (e.key === "+" || e.key === "=") setZoom(zoom * STEP);
        else if (e.key === "-" || e.key === "_") setZoom(zoom / STEP);
        else if (e.key === "0") setZoom(1);
      });
    }

    // 适应窗口：小图放大到看得清，大图缩到放得下（小图最多放 4 倍，再多只会更糊）
    function fit() {
      if (!img.naturalWidth) return;
      var maxW = Math.min(window.innerWidth * 0.94, 1680);
      var maxH = window.innerHeight * 0.86;
      var s = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
      s = Math.min(s, 4);
      img.style.width = Math.round(img.naturalWidth * s) + "px";
      img.style.height = "auto";
      img.style.maxWidth = "none";
      img.style.maxHeight = "none";
    }

    function apply() {
      img.style.transform = "translate3d(" + tx + "px," + ty + "px,0) scale(" + zoom + ")";
      label.textContent = Math.round(zoom * 100) + "%";
    }

    function setZoom(z) {
      zoom = Math.min(MAX, Math.max(1, z));
      if (zoom === 1) { tx = 0; ty = 0; }
      apply();
    }

    function open(src, alt) {
      if (!lb) build();
      img.style.width = "";
      img.style.height = "";
      img.src = src;
      img.alt = alt || "";
      zoom = 1; tx = 0; ty = 0;
      if (img.complete && img.naturalWidth) fit();
      apply();
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      if (!lb) return;
      lb.classList.remove("open");
      document.body.style.overflow = "";
      img.removeAttribute("src");
    }

    document.addEventListener("click", function (e) {
      var pic = e.target.closest(".figure img, .figrow img");
      if (!pic) return;
      open(pic.getAttribute("data-full") || pic.getAttribute("src"), pic.getAttribute("alt"));
    });
  })();
})();
