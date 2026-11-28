/* 把题目已有的观察、提示、证明和解析拆成可逐步展开的学习路径。 */
(function () {
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function list(value) {
    return Array.isArray(value) ? value.filter(function (item) { return item != null && item !== ''; }) : [];
  }

  function cut(value, limit) {
    var text = String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    return text.length > limit ? text.slice(0, limit - 1) + '…' : text;
  }

  function direction(text) {
    return '<div class="hl-direction"><b>展开后先做这件事</b><span>' + text + '</span></div>';
  }

  function lead(text) {
    return '<p class="hl-lead">' + text + '</p>';
  }

  function bullets(items, fmt) {
    if (!items.length) return '';
    return '<ul>' + items.map(function (item) {
      return '<li>' + fmt(item) + '</li>';
    }).join('') + '</ul>';
  }

  function algorithm(p, fmt) {
    fmt = typeof fmt === 'function' ? fmt : esc;
    var analysis = p.analysis || {};
    var observations = list(analysis.observations);
    var hints = list(p.hints);
    var pitfalls = list(p.pitfalls);
    var objectives = list(p.objectives);
    var constraints = list(p.constraints);
    var steps = [];

    steps.push({
      title: '定位题型：先圈出输入、输出和目标',
      html:
        direction('先遮住后面的解析，用三句话写下：输入是什么、要输出什么、直接枚举会卡在哪里。') +
        '<p><b>题目：</b>' + fmt(p.title || '') + '　<b>分类：</b>' + fmt(p.track || '') + '</p>' +
        (objectives.length ? lead('本题学习目标') + bullets(objectives.slice(0, 3), fmt) : '') +
        (constraints.length ? '<p><b>约束提示：</b>' + constraints.slice(0, 4).map(function (x) { return fmt(x); }).join('；') + '</p>' : '') +
        (p.keyQuestion ? '<p class="hl-q"><b>先回答：</b>' + fmt(p.keyQuestion) + '</p>' : '')
    });

    steps.push({
      title: '第一次压缩：从样例和约束找题眼',
      html:
        direction('把下面的观察改写成一句可验证的判断：如果这个性质成立，它能帮我们省掉哪一类枚举？') +
        (observations.length
          ? bullets(observations.slice(0, 2), fmt)
          : '<p>先比较最小样例和最大数据范围，找出“必须避免的复杂度”以及“可以复用的中间结果”。</p>') +
        '<p class="hl-q">暂停一下：你能不看代码，只说清楚要维护哪几个量吗？</p>'
    });

    hints.forEach(function (hint, index) {
      var body = typeof hint === 'string' ? hint : (hint.body || '');
      var title = typeof hint === 'string' ? ('关键抓手 ' + (index + 1)) : (hint.title || ('关键抓手 ' + (index + 1)));
      var prompts = [
        '先指出这条提示落在哪个变量、下标、状态或数据结构上，不要立刻写完整代码。',
        '用它把朴素做法往前推一步，写出“更新前是什么、更新后变成什么”。',
        '检查它还缺哪个边界条件；把缺的那一步补出来，再进入下一步。',
        '把这条抓手换成一句伪代码，并说明它为什么能覆盖所有情况。'
      ];
      steps.push({
        title: '关键抓手 · ' + title,
        html:
          direction(prompts[Math.min(index, prompts.length - 1)]) +
          '<p>' + fmt(body) + '</p>'
      });
    });

    steps.push({
      title: '串成步骤：先写伪代码，再写语法',
      html:
        direction('先不写语言细节，按“初始化 → 枚举/递推/搜索 → 更新答案”写出 5 步以内的伪代码。') +
        lead('推荐路径') +
        '<p>' + fmt(analysis.approach || '先写出朴素做法，再找出重复计算或可压缩的区间。') + '</p>'
    });

    steps.push({
      title: '证明：为什么这不是碰巧',
      html:
        direction('给每一步找一个理由：为什么不会漏解、不会重复、不会破坏最优性？如果是二分、贪心、DP 或搜索，指出它依赖的前提。') +
        lead('正确性要点') +
        '<p>' + fmt(analysis.correctness || '把算法的每个状态或分支和题目要求逐项对应，说明覆盖完整且更新合法。') + '</p>'
    });

    var complexity = analysis.complexity || {};
    steps.push({
      title: '边界与复杂度：拿极端数据自检',
      html:
        direction('用最小输入、最大输入、重复值或空值逐一扫雷；然后确认时间复杂度和空间复杂度没有超过约束。') +
        '<p><b>时间：</b>' + fmt(complexity.time || '按最坏分支估算') + '　<b>空间：</b>' + fmt(complexity.space || '按额外数组/递归栈估算') + '</p>' +
        (pitfalls.length ? lead('容易错的地方') + bullets(pitfalls, fmt) : '') +
        '<p class="hl-q"><b>最后复盘：</b>如果下次再遇到同类题，你第一步会先找哪个不变量或状态？</p>'
    });

    return steps;
  }

  function inferConcept(q) {
    var raw = String(q.expl || '');
    var match = raw.match(/(?:考点|知识点)[:：]\s*([^。；\n]+)/);
    if (match && match[1]) return match[1].trim();
    var text = String(q.title || '') + ' ' + String(q.snippet || '');
    var guesses = [
      [/值传递|引用传递/, '参数传递'],
      [/虚函数|多态/, '虚函数与多态'],
      [/构造|析构/, '构造与析构'],
      [/重载|重写/, '重载与重写'],
      [/继承|派生/, '继承与派生'],
      [/模板/, '模板'],
      [/指针/, '指针'],
      [/引用/, '引用'],
      [/异常/, '异常处理'],
      [/文件|fopen|fseek|ftell/, '文件操作'],
      [/字符串|字符数组|string/i, '字符串'],
      [/排序/, '排序'],
      [/查找/, '查找'],
      [/递归/, '递归'],
      [/动态规划|DP/i, '动态规划'],
      [/贪心/, '贪心'],
      [/树|森林/, '树'],
      [/图|DFS|BFS/i, '图与搜索'],
      [/数组/, '数组'],
      [/标识符|保留字|关键字/, '语言基础']
    ];
    for (var i = 0; i < guesses.length; i++) {
      if (guesses[i][0].test(text)) return guesses[i][1];
    }
    return q.kind === 'single' ? '题干中的核心概念' : '题目模型';
  }

  function sectionText(q, pattern) {
    var sections = list(q.sections);
    for (var i = 0; i < sections.length; i++) {
      if (pattern.test(String(sections[i].h || ''))) return list(sections[i].p).join(' ');
    }
    return '';
  }

  function explanationBody(raw) {
    return String(raw || '').replace(/^正确答案[:：]\s*[A-D][。.\s]*/, '').trim();
  }

  function contest(q, escFn) {
    var safe = typeof escFn === 'function' ? escFn : esc;
    var concept = inferConcept(q);
    var raw = String(q.expl || '').trim();
    var body = explanationBody(raw) || raw;
    var options = q.options || {};
    var answerText = q.answer && options[q.answer] != null ? options[q.answer] : '';
    var steps = [];

    if (q.kind === 'single') {
      var hasConcept = /(?:考点|知识点)[:：]/.test(raw);
      var hasAnswer = /(?:正确答案|正确选项)[:：]/.test(raw);
      steps.push({
        title: '解析',
        html:
          (!hasConcept ? '<p><b>考点：</b>' + safe(concept) + '</p>' : '') +
          (q.answer && !hasAnswer ? '<p><b>正确项：</b>' + safe(q.answer) + (answerText ? '　' + safe(answerText) : '') + '</p>' : '') +
          '<p>' + safe(raw || '本题暂无文字解析。') + '</p>'
      });
      return steps;
    }

    var inputText = sectionText(q, /输入/i);
    var outputText = sectionText(q, /输出/i);
    var samples = list(q.samples);
    steps.push({
      title: '定位题型：先读输入、输出和边界',
      html:
        direction('先不要看参考代码，用三句话说清楚：读什么、算什么、答案按什么格式输出。再手算第一组样例。') +
        (inputText ? '<p><b>输入方向：</b>' + safe(cut(inputText, 280)) + '</p>' : '') +
        (outputText ? '<p><b>输出方向：</b>' + safe(cut(outputText, 200)) + '</p>' : '') +
        '<p><b>样例数：</b>' + samples.length + '　<b>参考代码：</b>' + (list(q.codeBlocks).length ? '有' : '无') + '</p>'
    });

    steps.push({
      title: '找模型：把故事翻译成算法对象',
      html:
        direction('把角色、物品和规则换成一两个熟悉的算法对象：数组、区间、图、状态、排序规则或模拟步骤。') +
        '<p><b>本题模型：</b>' + safe(concept) + '</p>' +
        '<p>如果暂时看不出模型，就先写暴力做法；再从暴力做法里找重复计算和可压缩的地方。</p>'
    });

    var sectionNames = list(q.sections).map(function (section) { return section.h; }).filter(Boolean);
    steps.push({
      title: '拆规则：把大段描述拆成小条件',
      html:
        direction('按“读入 → 预处理 → 核心判断/循环 → 输出”四块拆题，每块只写一件事。') +
        (sectionNames.length ? '<p><b>题目结构：</b>' + sectionNames.map(safe).join(' / ') + '</p>' : '') +
        (q.snippet ? '<p class="hl-q">' + safe(cut(q.snippet, 280)) + '</p>' : '')
    });

    steps.push({
      title: '写伪代码：先让步骤跑通样例',
      html:
        direction('用样例 1 手动走一遍伪代码，确认每个变量的含义、循环范围和更新时机。') +
        lead('推荐步骤') +
        '<p>' + safe(body || raw || '先读入数据，按题目规则逐项处理，最后按指定格式输出。') + '</p>'
    });

    if (samples.length) {
      steps.push({
        title: '样例推演：用一组数据验证更新顺序',
        html:
          direction('不要只对答案；逐行写出关键变量在每一步的值，确认答案是在正确的时刻更新的。') +
          '<ul>' + samples.slice(0, 2).map(function (sample, index) {
            return '<li><b>样例 ' + (index + 1) + '</b><br>输入：<code>' + safe(cut(sample.in || '', 160)) +
              '</code><br>输出：<code>' + safe(cut(sample.out || '', 100)) + '</code></li>';
          }).join('') + '</ul>'
      });
    }

    steps.push({
      title: '边界与复杂度：最后再对照代码',
      html:
        direction('检查空输入、最小值、最大值、重复元素、越界下标和输出格式；估算复杂度和数据范围是否匹配。') +
        '<p><b>本题提醒：</b>' + safe(raw || '先保证朴素做法正确，再考虑优化。') + '</p>' +
        '<p class="hl-q"><b>复盘：</b>如果数据范围扩大 10 倍，哪一步会先超时？</p>'
    });

    return steps;
  }

  window.ProgressiveAnalysis = {
    algorithm: algorithm,
    contest: contest,
    inferConcept: inferConcept
  };
})();
