# -*- coding: utf-8 -*-
"""Expand the wrong-book page from one C bank to C/C++/Java/Python + arena."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PAGE = ROOT / '学习工具' / '错题本.html'

JS = r'''
(function(){
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || '{}') || fallback; } catch(e){ return fallback; } };
  const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){} };
  const ARENA_KEY = 'arena.v1';
  const arena = read(ARENA_KEY, { status:{}, book:{}, quiz:{}, lessons:{}, code:{}, wrong:{} });
  arena.status = arena.status || {}; arena.quiz = arena.quiz || {}; arena.code = arena.code || {}; arena.wrong = arena.wrong || {};
  const aProblems = (window.ARENA && ARENA.problems) ? ARENA.problems : [];
  const aById = new Map(aProblems.map(p => [p.id, p]));

  const banks = [
    { id:'c', name:'C 语言', kicker:'WRONG BOOK / C', total:236, questions: (window.CDATA && CDATA.questions) || [], ansKey:'cquiz.ans.v1', codePrefix:'cquiz.code.', href:'../计挑赛/q.html' },
    { id:'cpp', name:'C++', kicker:'WRONG BOOK / C++', total:235, questions: (window.CDATA_CPP && CDATA_CPP.questions) || [], ansKey:'contest.ans.cpp.v1', codePrefix:'contest.code.cpp.', href:'../计挑赛/cpp/q.html' },
    { id:'java', name:'Java', kicker:'WRONG BOOK / JAVA', total:238, questions: (window.CDATA_JAVA && CDATA_JAVA.questions) || [], ansKey:'contest.ans.java.v1', codePrefix:'contest.code.java.', href:'../计挑赛/java/q.html' },
    { id:'python', name:'Python', kicker:'WRONG BOOK / PYTHON', total:235, questions: (window.CDATA_PY && CDATA_PY.questions) || [], ansKey:'contest.ans.python.v1', codePrefix:'contest.code.python.', href:'../计挑赛/python/q.html' }
  ].map(b => ({ ...b, byId: new Map(b.questions.map(q => [q.id, q])), total: b.questions.length || b.total, ans: read(b.ansKey, {}) }));
  const bankMap = new Map(banks.map(b => [b.id, b]));
  const algo = { id:'a', name:'算法题库', kicker:'WRONG BOOK / ARENA', total:aProblems.length || 145, questions:aProblems, byId:aById, href:'../算法/q.html' };

  function writtenSet(bank){
    const set = new Set();
    Object.keys(bank.ans).forEach(id => { if (bank.byId.has(id)) set.add(id); });
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(bank.codePrefix)) continue;
      const id = k.slice(bank.codePrefix.length);
      if (bank.byId.has(id) && (localStorage.getItem(k) || '').trim()) set.add(id);
    }
    return set;
  }
  function arenaWrittenSet(){
    const set = new Set();
    ['status','quiz','code'].forEach(k => {
      Object.keys(arena[k] || {}).forEach(id => {
        if (!aById.has(id)) return;
        if (k === 'status' && (!arena[k][id] || arena[k][id] === 'todo')) return;
        set.add(id);
      });
    });
    return set;
  }
  function wrongList(bank){
    return bank.questions.filter(q => q.kind === 'single' && bank.ans[q.id] && bank.ans[q.id].ok === false)
      .sort((a,b) => Number(b.year) - Number(a.year) || Number(a.no) - Number(b.no));
  }
  function arenaWrong(){ return aProblems.filter(p => arena.wrong[p.id]); }

  let activeCat = '';
  let cache = {};

  function refresh(){
    cache = {};
    let totalAll = 0, writtenAll = 0, wrongAll = 0;
    banks.forEach(b => {
      b.ans = read(b.ansKey, {});
      const w = writtenSet(b), wrong = wrongList(b);
      cache[b.id] = { written:w, wrong };
      totalAll += b.total; writtenAll += w.size; wrongAll += wrong.length;
    });
    const aw = arenaWrittenSet(), aW = arenaWrong();
    cache.a = { written:aw, wrong:aW };
    totalAll += algo.total; writtenAll += aw.size; wrongAll += aW.length;

    $('#totalQ').textContent = totalAll;
    $('#totalWritten').textContent = writtenAll;
    $('#totalWrong').textContent = wrongAll;
    $('#summaryLine').textContent = `一共 ${totalAll} 题，已写 ${writtenAll} 题，错题 ${wrongAll} 道；下面按题库分类，点开就能看到具体题目。`;
    renderCards();
    if (activeCat) renderDetail(activeCat);
  }

  function card(bank){
    const c = cache[bank.id] || { written:new Set(), wrong:[] };
    const pct = bank.total ? Math.min(100, c.written.size / bank.total * 100) : 0;
    return `<button class="cat-card${activeCat === bank.id ? ' active' : ''}" type="button" data-cat="${bank.id}" aria-controls="detail" aria-expanded="${activeCat === bank.id}">
      <div class="cat-top"><div><div class="cat-kicker">${esc(bank.kicker)}</div><div class="cat-name">${esc(bank.name)}</div></div>
        <span class="cat-total"><span>${bank.total}</span> 题</span></div>
      <div class="cat-progress"><b>${c.written.size}</b><span>/ ${bank.total} 已写</span><span class="cat-wrong"><b>${c.wrong.length}</b> 道错题</span></div>
      <div class="cat-bar"><i style="width:${pct}%"></i></div>
      <div class="cat-open">查看 ${esc(bank.name)} 错题 <span>点开 →</span></div>
    </button>`;
  }
  function renderCards(){
    $('#catGrid').innerHTML = banks.map(card).join('') + card(algo);
    document.querySelectorAll('.cat-card').forEach(el => el.addEventListener('click', () => openCat(el.dataset.cat)));
  }

  function rowC(q, bank){
    return `<div class="wrow">
      <div class="wrow-main">
        <div class="wrow-meta"><span>${esc(q.year)} 年</span><span class="dot"></span><span>${esc(bank.name)} · 第 ${esc(q.no)} 题</span></div>
        <a href="${bank.href}?id=${encodeURIComponent(q.id)}">${esc(q.title || q.id)}</a>
        <p>${esc(q.snippet || '')}</p>
      </div>
      <div class="wrow-actions"><button class="wbtn" type="button" data-remove-c="${bank.id}" data-id="${esc(q.id)}">清除记录</button></div>
    </div>`;
  }
  function rowA(p){
    return `<div class="wrow">
      <div class="wrow-main">
        <div class="wrow-meta"><span>${esc(p.track || '算法')}</span><span class="dot"></span><span>${esc(p.difficulty || '')}</span></div>
        <a href="../算法/q.html?id=${encodeURIComponent(p.id)}">${esc(p.title || p.id)}</a>
        <p>${esc(p.excerpt || '')}</p>
      </div>
      <div class="wrow-actions"><button class="wbtn" type="button" data-remove-a="${esc(p.id)}">移出</button></div>
    </div>`;
  }

  function renderDetail(cat){
    const bank = bankMap.get(cat);
    const items = cache[cat] ? cache[cat].wrong : [];
    const name = bank ? bank.name : '算法';
    $('#detailKicker').textContent = bank ? bank.kicker : algo.kicker;
    $('#detailTitle').textContent = `${name}错题 · ${items.length} 道`;
    $('#clearAll').disabled = items.length === 0;
    if (!items.length){
      $('#wlist').innerHTML = `<div class="empty">这一类还没有错题。${bank ? '答错单选题后会自动出现在这里。' : '在算法题目页点「加入错题本」后会出现在这里。'}</div>`;
      return;
    }
    if (bank){
      let html = '', lastYear = null;
      items.forEach(q => {
        if (q.year !== lastYear){ lastYear = q.year; html += `<div class="wgroup-label">${esc(q.year)} 年 · ${esc(bank.name)}</div>`; }
        html += rowC(q, bank);
      });
      $('#wlist').innerHTML = html;
    } else {
      const order = new Map((ARENA.tracks || []).map((t,i) => [t.name, i]));
      const groups = new Map();
      items.forEach(p => { const k = p.track || '其他'; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(p); });
      let html = '';
      [...groups.keys()].sort((a,b) => (order.has(a) ? order.get(a) : 99) - (order.has(b) ? order.get(b) : 99)).forEach(k => {
        html += `<div class="wgroup-label">${esc(k)} · ${groups.get(k).length} 道</div>`;
        html += groups.get(k).map(rowA).join('');
      });
      $('#wlist').innerHTML = html;
    }
  }

  function openCat(cat){
    activeCat = cat;
    renderCards();
    $('#detail').hidden = false;
    renderDetail(cat);
    $('#detail').scrollIntoView({behavior:'smooth', block:'start'});
  }

  $('#wlist').addEventListener('click', (e) => {
    const cBtn = e.target.closest('[data-remove-c]');
    const aBtn = e.target.closest('[data-remove-a]');
    if (cBtn){
      const bank = bankMap.get(cBtn.dataset.removeC);
      if (!bank) return;
      const id = cBtn.dataset.id;
      delete bank.ans[id];
      save(bank.ansKey, bank.ans);
      try { localStorage.removeItem(bank.codePrefix + id); } catch(err){}
      refresh(); openCat(bank.id);
      return;
    }
    if (aBtn){
      delete arena.wrong[aBtn.dataset.removeA];
      save(ARENA_KEY, arena);
      refresh(); openCat('a');
    }
  });

  $('#clearAll').addEventListener('click', () => {
    if (!activeCat) return;
    const bank = bankMap.get(activeCat);
    const name = bank ? bank.name : '算法';
    if (!confirm(`确定清空${name}错题吗？`)) return;
    if (bank){
      wrongList(bank).forEach(q => {
        delete bank.ans[q.id];
        try { localStorage.removeItem(bank.codePrefix + q.id); } catch(err){}
      });
      save(bank.ansKey, bank.ans);
    } else {
      arena.wrong = {};
      save(ARENA_KEY, arena);
    }
    refresh(); openCat(activeCat);
  });

  refresh();
  const hash = location.hash.replace('#','');
  if (bankMap.has(hash) || hash === 'a') openCat(hash);
})();
'''

def main():
    text = PAGE.read_text(encoding='utf-8')
    text = re.sub(r'<section class="cat-grid"[^>]*>.*?</section>',
                  '<section class="cat-grid" id="catGrid" aria-label="错题分类"></section>',
                  text, count=1, flags=re.S)
    text = text.replace('<script src="../计挑赛/data.js"></script>',
                        '<script src="../计挑赛/data.js"></script>\n'
                        '<script src="../计挑赛/cpp/data.js"></script>\n'
                        '<script src="../计挑赛/java/data.js"></script>\n'
                        '<script src="../计挑赛/python/data.js"></script>')
    text = re.sub(r'<script>\s*\(function\(\)\{.*?\}\)\(\);?\s*</script>',
                  '<script>' + JS + '</script>', text, count=1, flags=re.S)
    PAGE.write_text(text, encoding='utf-8')
    print('rewrote', PAGE)


if __name__ == '__main__':
    main()
