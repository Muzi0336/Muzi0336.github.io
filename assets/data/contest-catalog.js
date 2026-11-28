/*
 * 竞赛目录的唯一登记处。
 * 新增比赛时追加一项，并在 modules 中只填写已经上线的内容。
 *
 * schedule 字段约定：
 * - registrationStart / registrationEnd：报名开始与截止。可为带时区的时间，也可为纯日期。
 * - examStart / examEnd：比赛开始与结束。可为带时区的时间，也可为纯日期。
 * - examDate：只在通知仅给出比赛日期、没有具体时刻时使用。
 * - verifiedAt：原仓库整理该条信息的日期，不代表实时向官网核验。
 * - season：赛事赛季或年度。
 * - note：仓库已有通知中的补充说明。
 * - override：空字符串，或 postponed / cancelled / pending。
 *
 * 纯日期始终按 Asia/Shanghai 的设备时钟解释。placeholder: true 表示目录预留项，
 * 没有赛程和可跳转内容，不补造日期、题数或链接。
 */
(function () {
  window.ZYYC_CONTESTS = [
    {
      id: 'lanqiao',
      name: '蓝桥杯',
      domain: '程序设计',
      status: '备赛内容已收录',
      summary: '省赛、国赛真题按年份归档，适合按年份做整套复盘，也适合按题面、样例和参考代码逐题弄懂。',
      stats: ['2012—2026', '757 道真题', '省赛 / 国赛'],
      entry: {
        href: 'problems/lanqiao/index.html',
        label: '进入蓝桥杯备考'
      },
      modules: [
        { href: 'problems/lanqiao/index.html', label: '历年真题', note: '按年份选择省赛与国赛' },
        { href: 'problems/lanqiao/bank.html', label: '全部题目', note: '按年份、组别和赛段筛题' },
        { href: 'problems/algorithm/index.html', label: '基础训练', note: '算法分类题与逐层演示' }
      ],
      source: {
        label: '蓝桥杯官网',
        href: 'https://dasai.lanqiao.cn/'
      },
      schedule: {
        registrationStart: '2026-10-08T10:00:00+08:00',
        registrationEnd: '2026-12-18T14:00:00+08:00',
        examStart: '2027-04-10T09:00:00+08:00',
        examEnd: '2027-04-10T13:00:00+08:00',
        examDate: '2027-04-10',
        verifiedAt: '2026-11-28',
        season: '2026–2027',
        note: '报名于 2026-10-08 10:00 开始，2026-12-18 14:00 截止；校内截止可能更早，以学校通知为准。',
        override: ''
      }
    },
    {
      id: 'computer-challenge',
      name: '计算机挑战赛',
      domain: '校内学科竞赛',
      status: '真题与复盘已收录',
      summary: '按语言进入 C、C++、Java、Python 题库，单选题可直接作答，编程题可查看样例推演、参考代码并进行 AI 追问。',
      stats: ['2019—2025', '4 套语言题库', '单选 / 编程'],
      entry: {
        href: 'problems/contest/index.html',
        label: '进入计算机挑战赛备考'
      },
      modules: [
        { href: 'problems/contest/index.html', label: 'C 语言', note: '指针、结构体与基础算法' },
        { href: 'problems/contest/cpp/index.html', label: 'C++', note: 'STL、类与竞赛写法' },
        { href: 'problems/contest/java/index.html', label: 'Java', note: '集合、字符串与面向对象' },
        { href: 'problems/contest/python/index.html', label: 'Python', note: '列表、字典与内置库' }
      ],
      source: {
        label: '校内通知',
        href: ''
      },
      schedule: {
        registrationStart: '2026-10-15T00:00:00+08:00',
        registrationEnd: '2026-11-25T23:59:59+08:00',
        examStart: '',
        examEnd: '',
        examDate: '2026-11-29',
        verifiedAt: '2026-11-28',
        season: '2026',
        note: '报名 2026-10-15 至 2026-11-25；考试在 2026-11-29，具体时间与考场以学校通知为准。',
        override: ''
      }
    },
    {
      id: 'future-programming-contest',
      name: '下一项程序设计赛事',
      domain: '待公布',
      status: '赛程待公布',
      summary: '目录预留位置。赛事名称、日期、题数与报名方式均以主办方后续通知为准。',
      stats: [],
      modules: [],
      source: {
        label: '待公布',
        href: ''
      },
      placeholder: true,
      schedule: {
        registrationStart: '',
        registrationEnd: '',
        examStart: '',
        examEnd: '',
        examDate: '',
        verifiedAt: '2026-11-28',
        season: '待公布',
        note: '尚无已录入的赛程信息，不显示倒计时。',
        override: ''
      }
    }
  ];
})();
