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
 *
 * computer-challenge.tracks 表示具体赛道，每个 track 独立使用 id/name/task/source/
 * schedule/override。未知赛道保留 name/task 为空的结构化席位，不用旧日期推导状态。
 * track.schedule 额外支持 submissionStart / submissionEnd 表示作品提交窗口；
 * registrationStart / registrationEnd 表示报名，examStart / examEnd / examDate 表示比赛。
 * events 表示按时间顺序展示的多阶段节点，可包含报名、提交、考试、晋级公示和获奖公示；
 * 只有月份的节点使用 text 保存主办方原表述，不虚构精确日期。
 * computer-challenge.modules 表示通用语言资源，同时驱动竞赛志语言模块和
 * problems/contest/languages.html：
 * - 已上线资源：{ href, label, note }。
 * - 待开放资源：{ label, note, placeholder: true, statusLabel: '待开放' }，不填写 href。
 */
(function () {
  window.ZYYC_CONTESTS = [
    {
      id: 'lanqiao',
      name: '蓝桥杯',
      domain: '全国赛事',
      status: '多赛项赛程已录入',
      summary: '软件赛、电子赛、人工智能赛、专项赛、视觉艺术设计赛和数字科技创新赛分别安排；同日组别合并展示。',
      stats: ['6 个赛项', '2026–2027 赛程', '2012—2026 真题'],
      entry: {
        href: 'problems/lanqiao/index.html',
        label: '进入蓝桥杯备考'
      },
      tracks: [
        {
          id: 'lanqiao-software',
          name: '软件赛',
          task: '个人赛 · C/C++、Java、Python、Web、软件测试、网络安全',
          entry: {
            href: 'https://dasai.lanqiao.cn/pages/v7/dasai/competition/individual_competition.html',
            label: '查看软件赛报名页'
          },
          source: {
            label: '蓝桥杯官网 · 软件赛',
            href: 'https://dasai.lanqiao.cn/pages/v7/dasai/competition/individual_competition.html'
          },
          schedule: {
            registrationStart: '2026-10-08T10:00:00+08:00',
            registrationEnd: '2026-12-18T14:00:00+08:00',
            submissionStart: '',
            submissionEnd: '',
            examStart: '2027-04-10T09:00:00+08:00',
            examEnd: '2027-04-10T13:00:00+08:00',
            examDate: '',
            events: [
              { type: 'registration', label: '报名截止', at: '2026-12-18T14:00:00+08:00' },
              { type: 'exam', label: '省赛：C/C++、Java、Python、Web', start: '2027-04-10T09:00:00+08:00', end: '2027-04-10T13:00:00+08:00' },
              { type: 'exam', label: '省赛：软件测试、网络安全', start: '2027-04-24T09:00:00+08:00', end: '2027-04-24T13:00:00+08:00' },
              { type: 'exam', label: '全国总决赛（多数软件科目）', date: '2027-06-12' },
              { type: 'announcement', label: '其他软件科目决赛', text: '软件测试、网络安全总决赛时间待官网后续通知' }
            ],
            verifiedAt: '2026-11-29',
            season: '2026–2027',
            note: 'C/C++、Java、Python 设研究生组与大学 A/B/C 组；Web 为大学组、职业院校组。同科目各组日期一致，按日期合并。',
            override: ''
          },
          modules: [],
          override: ''
        },
        {
          id: 'lanqiao-electronics',
          name: '电子赛',
          task: '个人赛 · 单片机、嵌入式、EDA、FPGA、物联网、5G',
          entry: {
            href: 'https://dasai.lanqiao.cn/pages/v7/dasai/competition/individual_competition.html',
            label: '查看电子赛报名页'
          },
          source: {
            label: '蓝桥杯官网 · 电子赛',
            href: 'https://dasai.lanqiao.cn/pages/v7/dasai/competition/individual_competition.html'
          },
          schedule: {
            registrationStart: '2026-10-08T10:00:00+08:00',
            registrationEnd: '2026-12-18T14:00:00+08:00',
            submissionStart: '',
            submissionEnd: '',
            examStart: '2027-04-11T09:00:00+08:00',
            examEnd: '2027-04-11T14:00:00+08:00',
            examDate: '',
            events: [
              { type: 'registration', label: '报名截止', at: '2026-12-18T14:00:00+08:00' },
              { type: 'exam', label: '省赛：单片机、嵌入式、EDA、FPGA', start: '2027-04-11T09:00:00+08:00', end: '2027-04-11T14:00:00+08:00' },
              { type: 'exam', label: '省赛：物联网 9:00—14:00；5G 9:00—13:00', start: '2027-04-24T09:00:00+08:00', end: '2027-04-24T14:00:00+08:00' },
              { type: 'exam', label: '全国总决赛（多数电子科目）', date: '2027-06-12' },
              { type: 'announcement', label: '5G 全国总决赛', text: '时间待官网后续通知' }
            ],
            verifiedAt: '2026-11-29',
            season: '2026–2027',
            note: '单片机设大学组和职业院校组；其余科目以大学组为主。同日期科目合并显示，具体结束时间看赛项说明。',
            override: ''
          },
          modules: [],
          override: ''
        },
        {
          id: 'lanqiao-ai',
          name: '人工智能赛',
          task: '个人赛 · 智能体开发、AI 模型应用开发、数据分析与可视化',
          entry: {
            href: 'https://dasai.lanqiao.cn/match/ai/sign-up',
            label: '查看人工智能赛'
          },
          source: {
            label: '蓝桥杯官网 · 人工智能赛',
            href: 'https://dasai.lanqiao.cn/match/ai/sign-up'
          },
          schedule: {
            registrationStart: '2026-10-08T10:00:00+08:00',
            registrationEnd: '2026-12-18T14:00:00+08:00',
            submissionStart: '',
            submissionEnd: '',
            examStart: '2027-04-24T09:00:00+08:00',
            examEnd: '2027-04-24T13:00:00+08:00',
            examDate: '',
            events: [
              { type: 'registration', label: '报名截止', at: '2026-12-18T14:00:00+08:00' },
              { type: 'exam', label: '省赛 / 全国选拔赛：三个 AI 科目', start: '2027-04-24T09:00:00+08:00', end: '2027-04-24T13:00:00+08:00' },
              { type: 'announcement', label: '全国总决赛', text: '时间待官网后续通知' }
            ],
            verifiedAt: '2026-11-29',
            season: '2026–2027',
            note: '三个科目均安排在 2027-04-24 09:00—13:00，按日期合并展示。',
            override: ''
          },
          modules: [],
          override: ''
        },
        {
          id: 'lanqiao-special',
          name: '专项赛',
          task: '鸿蒙应用开发 · 大学组',
          entry: {
            href: 'https://dasai.lanqiao.cn/match/special/sign-up',
            label: '查看专项赛'
          },
          source: {
            label: '蓝桥杯官网 · 专项赛',
            href: 'https://dasai.lanqiao.cn/match/special/sign-up'
          },
          schedule: {
            registrationStart: '2026-10-08T10:00:00+08:00',
            registrationEnd: '2026-12-18T14:00:00+08:00',
            submissionStart: '',
            submissionEnd: '',
            examStart: '2027-04-24T09:00:00+08:00',
            examEnd: '2027-04-24T13:00:00+08:00',
            examDate: '',
            events: [
              { type: 'registration', label: '报名截止', at: '2026-12-18T14:00:00+08:00' },
              { type: 'exam', label: '省赛 / 全国选拔赛：鸿蒙应用开发', start: '2027-04-24T09:00:00+08:00', end: '2027-04-24T13:00:00+08:00' },
              { type: 'announcement', label: '全国总决赛', text: '时间待官网后续通知' }
            ],
            verifiedAt: '2026-11-29',
            season: '2026–2027',
            note: '当前按官网省赛时间表收录鸿蒙应用开发专项；其他专项赛以各自通知为准。',
            override: ''
          },
          modules: [],
          override: ''
        },
        {
          id: 'lanqiao-visual-design',
          name: '视觉艺术设计赛',
          task: '团队赛 1–3 人 · 海报、文创、UI、插画、视频、动画、AIGC、环境艺术、工业产品、包装',
          entry: {
            href: 'https://design.lanqiao.cn',
            label: '查看视觉艺术设计赛'
          },
          source: {
            label: '蓝桥杯设计赛官网',
            href: 'https://design.lanqiao.cn'
          },
          schedule: {
            registrationStart: '',
            registrationEnd: '',
            submissionStart: '',
            submissionEnd: '',
            examStart: '',
            examEnd: '',
            examDate: '',
            events: [
              { type: 'registration', label: '报名时间', text: '2026 年 10 月—2027 年 4 月', pendingLabel: '报名中' },
              { type: 'qualification', label: '奖项评审', text: '2027 年 5 月' },
              { type: 'announcement', label: '选拔赛奖项发布', text: '2027 年 5 月—6 月' },
              { type: 'award', label: '决赛奖项发布', text: '2027 年 6 月' }
            ],
            verifiedAt: '2026-11-29',
            season: '2026–2027',
            note: '官网当前只公布阶段月份，未给出具体截止日或考试日，因此不显示精确倒计时。',
            override: ''
          },
          modules: [],
          override: ''
        },
        {
          id: 'lanqiao-digital-tech',
          name: '数字科技创新赛',
          task: '团队赛 · 数字科技应用创新、智能装备数字化建模',
          entry: {
            href: 'https://dasai.lanqiao.cn/match/innovation/sign-up/matchdetail',
            label: '查看数字科技创新赛'
          },
          source: {
            label: '蓝桥杯官网 · 数字科技创新赛',
            href: 'https://dasai.lanqiao.cn/match/innovation/sign-up/matchdetail'
          },
          schedule: {
            registrationStart: '2026-10-08T10:00:00+08:00',
            registrationEnd: '',
            submissionStart: '',
            submissionEnd: '2027-04-26T14:00:00+08:00',
            examStart: '',
            examEnd: '',
            examDate: '',
            events: [
              { type: 'submission', label: '报名及方案 / 作品提交截止', at: '2027-04-26T14:00:00+08:00' },
              { type: 'announcement', label: '智能装备数字化建模总决赛', text: '2027 年 5 月下旬或 6 月上旬，具体时间地点待官网通知' }
            ],
            verifiedAt: '2026-11-29',
            season: '2026–2027',
            note: '智能装备数字化建模分大学组和职业院校组，报名与作品提交截止时间相同；数字科技应用创新按同页公开时间记录。',
            override: ''
          },
          modules: [],
          override: ''
        }
      ],
      modules: [
        { href: 'problems/lanqiao/index.html', label: '历年真题', note: '按年份选择省赛与国赛' },
        { href: 'problems/lanqiao/bank.html', label: '全部题目', note: '按年份、组别和赛段筛题' }
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
        verifiedAt: '2026-11-29',
        season: '2026–2027',
        note: '多赛项时间按官网分别登记；组别日期一致时合并，具体考场与准考证安排以官网为准。',
        override: ''
      }
    },
    {
      id: 'computer-challenge',
      name: '计算机挑战赛',
      domain: '全国赛事',
      status: '参考赛程已录入',
      summary: '已登记 5 个赛道的参考时间；具体安排仍以赛事主办方通知为准。',
      stats: ['5 个赛道', '2026 参考赛程', '通用语言资料'],
      entry: {
        href: 'problems/contest/languages.html',
        label: '进入计算机挑战赛'
      },
      tracks: [
        {
          id: 'computer-challenge-big-data',
          name: '大数据挑战赛',
          task: '团队赛',
          source: { label: '赛事主办方（参考时间）', href: '' },
          schedule: {
            registrationStart: '',
            registrationEnd: '2026-11-06',
            submissionStart: '',
            submissionEnd: '2026-11-06',
            examStart: '2026-11-13',
            examEnd: '2026-11-18',
            examDate: '',
            events: [
              { type: 'registration', label: '报名截止', at: '2026-11-06' },
              { type: 'submission', label: '区域赛 / 省赛作品提交截止', at: '2026-11-06' },
              { type: 'exam', label: '国赛', start: '2026-11-13', end: '2026-11-18' },
              { type: 'announcement', label: '国赛公示', text: '2026 年 12 月中下旬' }
            ],
            verifiedAt: '2026-11-28',
            season: '2026',
            note: '赛事主办方提供的参考时间，实际安排以正式通知为准。',
            override: ''
          },
          modules: [],
          override: ''
        },
        {
          id: 'computer-challenge-ai',
          name: '人工智能挑战赛',
          task: '团队赛',
          source: { label: '赛事主办方（参考时间）', href: '' },
          schedule: {
            registrationStart: '',
            registrationEnd: '2026-11-13',
            submissionStart: '',
            submissionEnd: '2026-11-13T23:59:00+08:00',
            examStart: '2026-11-19T17:00:00+08:00',
            examEnd: '2026-11-24',
            examDate: '',
            events: [
              { type: 'registration', label: '报名截止', at: '2026-11-13' },
              { type: 'submission', label: '区域赛 / 省赛作品提交截止', at: '2026-11-13T23:59:00+08:00' },
              { type: 'exam', label: '国赛', start: '2026-11-19T17:00:00+08:00', end: '2026-11-24' },
              { type: 'announcement', label: '国赛公示', text: '2026 年 12 月中下旬' }
            ],
            verifiedAt: '2026-11-28',
            season: '2026',
            note: '赛事主办方提供的参考时间，实际安排以正式通知为准。',
            override: ''
          },
          modules: [],
          override: ''
        },
        {
          id: 'computer-challenge-digital-media',
          name: '数字媒体创新设计赛',
          task: '团队赛',
          source: { label: '赛事主办方（参考时间）', href: '' },
          schedule: {
            registrationStart: '',
            registrationEnd: '2026-11-19',
            submissionStart: '',
            submissionEnd: '',
            examStart: '',
            examEnd: '',
            examDate: '',
            events: [
              { type: 'registration', label: '报名截止', at: '2026-11-19' },
              { type: 'announcement', label: '国赛时间', text: '官方通知未明确列出独立国赛时间' },
              { type: 'announcement', label: '国赛公示', text: '通常于 2026 年 12 月进行' }
            ],
            verifiedAt: '2026-11-28',
            season: '2026',
            note: '国赛时间以赛事官网后续通知为准，当前只展示主办方提供的参考节点。',
            override: ''
          },
          modules: [],
          override: ''
        },
        {
          id: 'computer-challenge-office',
          name: 'Office 高级应用赛',
          task: '个人赛',
          source: { label: '赛事主办方（参考时间）', href: '' },
          schedule: {
            registrationStart: '',
            registrationEnd: '2026-11-25',
            submissionStart: '',
            submissionEnd: '',
            examStart: '',
            examEnd: '',
            examDate: '2026-11-28',
            events: [
              { type: 'registration', label: '报名截止', at: '2026-11-25' },
              { type: 'exam', label: '区域赛 / 省赛考试', date: '2026-11-28' },
              { type: 'qualification', label: '国赛晋级公示', at: '2026-12-14T16:00:00+08:00' },
              { type: 'exam', label: '国赛考试', date: '2026-12-19' },
              { type: 'award', label: '国赛获奖公示', text: '2026 年 12 月底' }
            ],
            verifiedAt: '2026-11-28',
            season: '2026',
            note: '赛事主办方提供的参考时间，实际安排以正式通知为准。',
            override: ''
          },
          modules: [],
          override: ''
        },
        {
          id: 'computer-challenge-programming',
          name: '程序设计挑战赛',
          task: '个人赛',
          source: { label: '赛事主办方（参考时间）', href: '' },
          schedule: {
            registrationStart: '',
            registrationEnd: '2026-11-25',
            submissionStart: '',
            submissionEnd: '',
            examStart: '',
            examEnd: '',
            examDate: '2026-11-29',
            events: [
              { type: 'registration', label: '报名截止', at: '2026-11-25' },
              { type: 'exam', label: '区域赛 / 省赛考试', date: '2026-11-29' },
              { type: 'qualification', label: '国赛晋级公示', at: '2026-12-15T16:00:00+08:00' },
              { type: 'exam', label: '国赛考试', date: '2026-12-20' },
              { type: 'award', label: '国赛获奖公示', text: '2026 年 12 月底' }
            ],
            verifiedAt: '2026-11-28',
            season: '2026',
            note: '赛事主办方提供的参考时间，实际安排以正式通知为准。',
            override: ''
          },
          modules: [],
          override: ''
        }
      ],
      modules: [
        { href: 'problems/contest/index.html', label: 'C 语言', note: '指针、结构体与基础算法' },
        { href: 'problems/contest/cpp/index.html', label: 'C++', note: 'STL、类与竞赛写法' },
        { href: 'problems/contest/java/index.html', label: 'Java', note: '集合、字符串与面向对象' },
        { href: 'problems/contest/python/index.html', label: 'Python', note: '列表、字典与内置库' }
      ],
      source: {
        label: '赛事主办方（参考时间）',
        href: ''
      },
      schedule: {
        registrationStart: '',
        registrationEnd: '',
        examStart: '',
        examEnd: '',
        examDate: '',
        verifiedAt: '',
        season: '2026',
        note: '五个赛道的时间由赛事主办方提供并注明为参考时间，赛事级状态按各赛道独立展示。',
        override: ''
      },
      legacySchedule: {
        registrationStart: '2026-10-15T00:00:00+08:00',
        registrationEnd: '2026-11-25T23:59:59+08:00',
        examStart: '',
        examEnd: '',
        examDate: '2026-11-29',
        verifiedAt: '2026-11-28',
        season: '2026',
        note: '原资料只记录一组报名与考试时间，适用赛道待核实；不用于推导六赛道或赛事整体状态。',
        override: '',
        applicability: '待核实'
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
