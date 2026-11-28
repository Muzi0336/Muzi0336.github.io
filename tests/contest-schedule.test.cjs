'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const modulePath = path.resolve(__dirname, '..', 'assets', 'js', 'contest-schedule.js');
const catalogPath = path.resolve(__dirname, '..', 'assets', 'data', 'contest-catalog.js');
const schedule = require(modulePath);

function contest(scheduleData, extra) {
  return Object.assign({ id: 'sample', schedule: scheduleData }, extra || {});
}

test('registration start and exact deadline boundaries', () => {
  const item = contest({
    registrationStart: '2026-10-08T10:00:00+08:00',
    registrationEnd: '2026-12-18T14:00:00+08:00',
    examDate: '2027-04-10'
  });

  assert.equal(
    schedule.getState(item, new Date('2026-10-08T09:59:59.999+08:00')).key,
    'upcoming'
  );
  assert.equal(
    schedule.getState(item, new Date('2026-10-08T10:00:00.000+08:00')).key,
    'registering'
  );
  assert.equal(
    schedule.getState(item, new Date('2026-12-18T13:59:59.999+08:00')).key,
    'registering'
  );
  assert.equal(
    schedule.getState(item, new Date('2026-12-18T14:00:00.000+08:00')).key,
    'closed'
  );
});

test('competition start and end boundaries', () => {
  const item = contest({
    registrationStart: '2026-01-01T00:00:00+08:00',
    registrationEnd: '2026-01-02T00:00:00+08:00',
    examStart: '2026-02-01T09:00:00+08:00',
    examEnd: '2026-02-01T11:00:00+08:00'
  });

  assert.equal(
    schedule.getState(item, new Date('2026-01-02T00:00:00.000+08:00')).key,
    'preparing'
  );
  assert.equal(
    schedule.getState(item, new Date('2026-02-01T08:59:59.999+08:00')).key,
    'preparing'
  );
  assert.equal(
    schedule.getState(item, new Date('2026-02-01T09:00:00.000+08:00')).key,
    'competing'
  );
  assert.equal(
    schedule.getState(item, new Date('2026-02-01T10:59:59.999+08:00')).key,
    'competing'
  );
  assert.equal(
    schedule.getState(item, new Date('2026-02-01T11:00:00.000+08:00')).key,
    'ended'
  );
});

test('examStart without examEnd only states known start facts', () => {
  const item = contest({ examStart: '2026-12-10T09:00:00+08:00' });
  const before = schedule.getState(item, new Date('2026-11-28T12:00:00+08:00'));
  const after = schedule.getState(item, new Date('2026-12-10T09:00:00.001+08:00'));

  assert.equal(before.key, 'preparing');
  assert.equal(before.detail, '比赛将于 2026.12.10 09:00 开始，结束时间待公布。');
  assert.doesNotMatch(before.detail, /报名已截止/);
  assert.equal(after.key, 'pending');
  assert.equal(after.label, '结束时间待公布');
  assert.equal(after.detail, '比赛已于 2026.12.10 09:00 开始，结束时间待公布。');
  assert.equal(after.nextAt, null);
  assert.equal(after.ended, false);
});

test('examEnd without examStart only states the known end', () => {
  const item = contest({ examEnd: '2026-12-10T11:00:00+08:00' });
  const before = schedule.getState(item, new Date('2026-11-28T12:00:00+08:00'));
  const after = schedule.getState(item, new Date('2026-12-10T11:00:00+08:00'));

  assert.equal(before.key, 'pending');
  assert.equal(before.label, '开始时间待公布');
  assert.equal(before.tone, 'neutral');
  assert.equal(
    before.detail,
    '仅记录比赛结束时间为 2026.12.10 11:00，开始时间待公布。'
  );
  assert.doesNotMatch(before.detail, /报名已截止/);
  assert.equal(after.key, 'ended');
  assert.equal(after.ended, true);
});

test('pure dates use Shanghai day boundaries across UTC midnight', () => {
  const item = contest({
    registrationStart: '2026-11-20',
    registrationEnd: '2026-11-25',
    examDate: '2026-11-29'
  });

  assert.equal(
    schedule.getState(item, new Date('2026-11-24T15:59:59.999Z')).key,
    'registering'
  );

  const deadlineDay = schedule.getState(item, new Date('2026-11-24T16:00:00.000Z'));
  assert.equal(deadlineDay.key, 'registering');
  assert.equal(deadlineDay.label, '今日截止');
  assert.equal(deadlineDay.detail, '今日截止，具体时刻见通知。');
  assert.equal(
    schedule.getState(item, new Date('2026-11-25T15:59:59.999Z')).key,
    'registering'
  );
  assert.equal(
    schedule.getState(item, new Date('2026-11-25T16:00:00.000Z')).key,
    'closed'
  );
  assert.equal(
    schedule.getState(item, new Date('2026-11-25T16:00:00.000Z')).detail,
    '报名已截止，比赛日为 2026.11.29，具体时间见通知。'
  );
  assert.equal(
    schedule.getState(item, new Date('2026-11-28T16:00:00.000Z')).key,
    'examday'
  );
  assert.equal(
    schedule.getState(item, new Date('2026-11-29T15:59:59.999Z')).key,
    'examday'
  );
  assert.equal(
    schedule.getState(item, new Date('2026-11-29T16:00:00.000Z')).key,
    'ended'
  );
  assert.equal(schedule.formatDate('2026-11-25'), '2026.11.25');
  assert.equal(schedule.formatDate('2026-11-25T16:00:00.000Z'), '2026.11.26 00:00');
});

test('registrationEnd without registrationStart only reports the deadline', () => {
  const item = contest({ registrationEnd: '2026-12-10T14:00:00+08:00' });
  const state = schedule.getState(item, new Date('2026-11-28T12:00:00+08:00'));

  assert.equal(state.key, 'registering');
  assert.equal(state.label, '报名中');
  assert.equal(state.detail, '报名将于 2026.12.10 14:00 截止。');
  assert.doesNotMatch(state.detail, /开始/);
  assert.equal(state.nextAt.toISOString(), '2026-12-10T06:00:00.000Z');
});

test('date-only deadline day uses the today deadline label', () => {
  const item = contest({ registrationEnd: '2026-11-25' });
  const deadlineDay = schedule.getState(item, new Date('2026-11-24T16:00:00.000Z'));
  const nextDay = schedule.getState(item, new Date('2026-11-25T16:00:00.000Z'));

  assert.equal(deadlineDay.key, 'registering');
  assert.equal(deadlineDay.label, '今日截止');
  assert.equal(deadlineDay.tone, 'urgent');
  assert.equal(deadlineDay.detail, '今日截止，具体时刻见通知。');
  assert.equal(nextDay.key, 'closed');
  assert.equal(nextDay.label, '报名已截止');
  assert.equal(nextDay.nextAt, null);
});

test('registration deadline does not imply a competition date', () => {
  const item = contest({ registrationEnd: '2026-11-25T23:59:59+08:00' });
  const state = schedule.getState(item, new Date('2026-11-26T00:00:00+08:00'));

  assert.equal(state.key, 'closed');
  assert.equal(state.detail, '报名已截止，比赛时间待公布。');
  assert.equal(state.nextAt, null);
  assert.equal(state.ended, false);
});

test('missing and invalid dates are unknown without a countdown', () => {
  const missing = schedule.getState(contest({}), new Date('2026-11-28T12:00:00+08:00'));
  const invalid = schedule.getState(
    contest({ registrationEnd: '2026-02-30', examDate: 'not-a-date' }),
    new Date('2026-11-28T12:00:00+08:00')
  );
  const placeholder = schedule.getState(
    contest({}, { placeholder: true }),
    new Date('2026-11-28T12:00:00+08:00')
  );

  assert.equal(missing.key, 'unknown');
  assert.equal(invalid.key, 'unknown');
  assert.match(invalid.detail, /无效/);
  assert.equal(placeholder.key, 'unknown');
  assert.equal(placeholder.nextAt, null);
  assert.equal(schedule.formatDate('not-a-date'), '');
});

test('override states win and disable countdowns', () => {
  const now = new Date('2026-11-28T12:00:00+08:00');
  for (const override of ['postponed', 'cancelled', 'pending']) {
    const state = schedule.getState(contest({
      registrationStart: '2026-11-01T00:00:00+08:00',
      registrationEnd: '2026-12-01T00:00:00+08:00',
      examDate: '2026-12-10',
      override
    }), now);

    assert.equal(state.key, override);
    assert.equal(state.tone, 'muted');
    assert.equal(state.nextAt, null);
    assert.equal(state.ended, false);
  }
});

test('sortContests returns a new array ordered by next node, then ended, then placeholder', () => {
  const input = [
    contest({ examDate: '2026-01-01' }, { id: 'ended' }),
    contest({}, { id: 'placeholder', placeholder: true }),
    contest({
      registrationStart: '2026-11-01T00:00:00+08:00',
      registrationEnd: '2026-12-10T00:00:00+08:00'
    }, { id: 'later' }),
    contest({
      registrationStart: '2026-11-01T00:00:00+08:00',
      registrationEnd: '2026-12-01T00:00:00+08:00'
    }, { id: 'sooner' }),
    contest({}, { id: 'unknown' })
  ];
  const originalIds = input.map((item) => item.id);
  const sorted = schedule.sortContests(input, new Date('2026-11-28T12:00:00+08:00'));

  assert.notEqual(sorted, input);
  assert.deepEqual(input.map((item) => item.id), originalIds);
  assert.deepEqual(sorted.map((item) => item.id), [
    'sooner',
    'later',
    'unknown',
    'ended',
    'placeholder'
  ]);
});

test('catalog retains existing fields and records known schedules', () => {
  const source = fs.readFileSync(catalogPath, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: catalogPath });
  const contests = sandbox.window.ZYYC_CONTESTS;
  const lanqiao = contests.find((item) => item.id === 'lanqiao');
  const computer = contests.find((item) => item.id === 'computer-challenge');
  const placeholder = contests.find((item) => item.placeholder === true);

  assert.ok(lanqiao.entry.href);
  assert.ok(lanqiao.modules.length > 0);
  assert.equal(lanqiao.schedule.registrationStart, '2026-10-08T10:00:00+08:00');
  assert.equal(lanqiao.schedule.registrationEnd, '2026-12-18T14:00:00+08:00');
  assert.equal(lanqiao.schedule.examStart, '2027-04-10T09:00:00+08:00');
  assert.equal(lanqiao.schedule.examEnd, '2027-04-10T13:00:00+08:00');
  assert.equal(lanqiao.schedule.verifiedAt, '2026-11-29');
  assert.equal(lanqiao.domain, '全国赛事');
  assert.equal(lanqiao.tracks.length, 6);
  assert.deepEqual(
    Array.from(lanqiao.tracks.map((track) => track.name)),
    ['软件赛', '电子赛', '人工智能赛', '专项赛', '视觉艺术设计赛', '数字科技创新赛']
  );
  assert.equal(lanqiao.tracks[0].schedule.events[1].start, '2027-04-10T09:00:00+08:00');
  assert.equal(lanqiao.tracks[2].schedule.events[1].start, '2027-04-24T09:00:00+08:00');
  assert.equal(lanqiao.tracks[4].schedule.events[0].text, '2026 年 10 月—2027 年 4 月');
  assert.equal(lanqiao.tracks[5].schedule.events[0].at, '2027-04-26T14:00:00+08:00');
  assert.equal(lanqiao.source.label, '蓝桥杯官网');

  assert.ok(computer.entry.href);
  assert.ok(computer.modules.length > 0);
  assert.equal(computer.schedule.registrationStart, '');
  assert.equal(computer.schedule.registrationEnd, '');
  assert.equal(computer.schedule.examDate, '');
  assert.equal(computer.legacySchedule.registrationStart, '2026-10-15T00:00:00+08:00');
  assert.equal(computer.legacySchedule.registrationEnd, '2026-11-25T23:59:59+08:00');
  assert.equal(computer.legacySchedule.examDate, '2026-11-29');
  assert.equal(computer.domain, '全国赛事');
  assert.equal(computer.tracks.length, 5);
  assert.equal(computer.tracks.filter((track) => track.placeholder !== true).length, 5);
  assert.deepEqual(
    Array.from(computer.tracks.filter((track) => track.placeholder !== true).map((track) => track.name)),
    [
      '大数据挑战赛',
      '人工智能挑战赛',
      '数字媒体创新设计赛',
      'Office 高级应用赛',
      '程序设计挑战赛'
    ]
  );
  assert.equal(computer.tracks.some((track) => track.placeholder === true), false);
  assert.equal(computer.tracks[0].schedule.events[2].start, '2026-11-13');
  assert.equal(computer.tracks[1].schedule.events[2].start, '2026-11-19T17:00:00+08:00');
  assert.equal(computer.tracks[3].schedule.events[2].at, '2026-12-14T16:00:00+08:00');
  assert.equal(computer.source.label, '赛事主办方（参考时间）');

  assert.equal(placeholder.placeholder, true);
  assert.equal(placeholder.entry, undefined);
  assert.equal(placeholder.modules.length, 0);
  assert.equal(placeholder.stats.length, 0);
});

test('tracks flatten into independent notification entities with stable identity fields', () => {
  const parent = {
    id: 'track-parent',
    name: '测试父赛事',
    domain: '测试领域',
    entry: { href: 'parent-entry.html' },
    source: { label: '父来源' },
    schedule: { examDate: '2031-01-01' },
    tracks: [
      {
        id: 'track-a',
        name: '赛道甲',
        task: '任务甲',
        modules: [{ label: '甲资料' }],
        schedule: { submissionStart: '2030-05-25', submissionEnd: '2030-06-03' }
      },
      {
        id: 'track-b',
        name: '赛道乙',
        task: '任务乙',
        modules: [{ label: '乙资料' }],
        source: { label: '赛道乙来源' },
        schedule: { submissionStart: '2030-05-25', submissionEnd: '2030-06-02' }
      }
    ]
  };
  const flat = schedule.flatten([parent]);
  const entries = schedule.notificationEntries(
    [parent],
    new Date('2030-06-01T12:00:00+08:00')
  );

  assert.equal(flat.length, 2);
  assert.equal(flat[0].contest, parent);
  assert.equal(flat[0].track, parent.tracks[0]);
  assert.equal(flat[0].parentId, parent.id);
  assert.equal(flat[0].parentName, parent.name);
  assert.equal(flat[0].trackId, 'track-a');
  assert.equal(flat[0].name, '赛道甲');
  assert.equal(flat[0].displayName, '测试父赛事 · 赛道甲');
  assert.deepEqual(flat[0].modules, parent.tracks[0].modules);
  assert.equal(flat[0].entry, parent.entry);
  assert.equal(flat[0].source, parent.source);
  assert.equal(flat[0].schedule.examDate, undefined);
  assert.equal(flat[1].source.label, '赛道乙来源');

  assert.deepEqual(entries.map((entry) => entry.contest.trackId), ['track-b', 'track-a']);
  assert.equal(entries[0].state.key, 'submitting');
  assert.equal(entries[0].nextLabel, '提交截止');
  assert.equal(entries[0].nextField, 'submissionEnd');
});

test('submission-only pure date uses Shanghai day boundaries and is not a competition', () => {
  const item = contest({ submissionEnd: '2030-01-02' });
  const beforeDay = schedule.getState(item, new Date('2030-01-01T15:59:59.999Z'));
  const startOfDay = schedule.getState(item, new Date('2030-01-01T16:00:00.000Z'));
  const endOfDay = schedule.getState(item, new Date('2030-01-02T15:59:59.999Z'));
  const closed = schedule.getState(item, new Date('2030-01-02T16:00:00.000Z'));

  assert.equal(beforeDay.key, 'submitting');
  assert.equal(startOfDay.label, '今日提交截止');
  assert.equal(startOfDay.nextField, 'submissionEnd');
  assert.equal(endOfDay.key, 'submitting');
  assert.equal(closed.key, 'submissionClosed');
  assert.equal(closed.ended, false);
  assert.equal(closed.nextAt, null);
  assert.notEqual(closed.key, 'examday');
  assert.notEqual(closed.key, 'competing');
});

test('track entities never inherit parent schedule dates', () => {
  const single = { id: 'single', name: '独立赛事', schedule: { examDate: '2030-09-01' } };
  const parent = {
    id: 'parent-with-empty-track',
    name: '父赛事',
    schedule: { registrationEnd: '2030-08-01', examDate: '2030-09-01' },
    tracks: [{ id: 'empty-track', name: '空赛道', schedule: {} }]
  };
  const flat = schedule.flatten([single, parent]);

  assert.equal(flat[0], single);
  assert.equal(flat[1].schedule.examDate, undefined);
  assert.equal(flat[1].schedule.registrationEnd, undefined);
  assert.equal(schedule.getState(flat[1], new Date('2030-07-01T00:00:00+08:00')).key, 'unknown');
  assert.equal(schedule.getState(parent, new Date('2030-07-01T00:00:00+08:00')).key, 'unknown');
});

test('event timelines expose exam, qualification, national exam and award milestones', () => {
  const item = contest({
    events: [
      { type: 'registration', label: '报名截止', at: '2026-11-25' },
      { type: 'exam', label: '区域赛 / 省赛考试', date: '2026-11-28' },
      { type: 'qualification', label: '国赛晋级公示', at: '2026-12-14T16:00:00+08:00' },
      { type: 'exam', label: '国赛考试', date: '2026-12-19' },
      { type: 'award', label: '国赛获奖公示', text: '2026 年 12 月底' }
    ]
  });

  const beforeRegional = schedule.getState(item, new Date('2026-11-27T12:00:00+08:00'));
  const regionalDay = schedule.getState(item, new Date('2026-11-28T12:00:00+08:00'));
  const qualification = schedule.getState(item, new Date('2026-11-29T12:00:00+08:00'));
  const award = schedule.getState(item, new Date('2026-12-20T12:00:00+08:00'));

  assert.equal(beforeRegional.key, 'exam');
  assert.equal(beforeRegional.label, '备赛中');
  assert.equal(beforeRegional.nextValue, '2026-11-28');
  assert.equal(regionalDay.key, 'examday');
  assert.equal(regionalDay.label, '比赛日');
  assert.equal(qualification.key, 'qualification');
  assert.equal(qualification.label, '等待晋级公示');
  assert.equal(qualification.nextAt.toISOString(), '2026-12-14T08:00:00.000Z');
  assert.equal(award.key, 'award');
  assert.equal(award.label, '获奖公示待公布');
  assert.equal(award.awaiting, true);
  assert.equal(award.nextAt, null);
  assert.match(award.detail, /2026 年 12 月底/);
});

test('text-only announcement keeps a completed track out of ended state', () => {
  const item = contest({
    events: [
      { type: 'exam', label: '国赛', start: '2026-11-13', end: '2026-11-18' },
      { type: 'announcement', label: '国赛公示', text: '2026 年 12 月中下旬' }
    ]
  });
  const state = schedule.getState(item, new Date('2026-11-28T12:00:00+08:00'));

  assert.equal(state.key, 'announcement');
  assert.equal(state.label, '公示待公布');
  assert.equal(state.awaiting, true);
  assert.equal(state.ended, false);
  assert.equal(state.nextAt, null);
  assert.equal(state.detail, '国赛公示：2026 年 12 月中下旬。');
});

test('parent cancellation and postponement override normal child schedules', () => {
  for (const override of ['cancelled', 'postponed']) {
    const parent = {
      id: 'parent-' + override,
      name: '父赛事',
      override,
      tracks: [{
        id: 'track-' + override,
        name: '赛道',
        schedule: { registrationEnd: '2030-07-01', examDate: '2030-08-01' }
      }]
    };
    const state = schedule.getState(
      schedule.flatten([parent])[0],
      new Date('2030-06-01T00:00:00+08:00')
    );

    assert.equal(state.key, override);
    assert.equal(state.nextAt, null);
    assert.equal(state.nextLabel, '');
  }

  for (const conflict of [
    ['cancelled', 'pending'],
    ['cancelled', 'postponed'],
    ['postponed', 'pending']
  ]) {
    const parent = {
      id: 'conflict-' + conflict.join('-'),
      name: '父赛事',
      override: conflict[0],
      tracks: [{
        id: 'child-conflict',
        name: '冲突赛道',
        override: conflict[1],
        schedule: { registrationEnd: '2030-07-01', examDate: '2030-08-01' }
      }]
    };
    const state = schedule.getState(
      schedule.flatten([parent])[0],
      new Date('2030-06-01T00:00:00+08:00')
    );
    assert.equal(state.key, conflict[0]);
  }

  const cancelledParent = {
    id: 'cancelled-parent-with-tracks',
    name: '父赛事',
    override: 'cancelled',
    tracks: [{ id: 'unused-track', name: '赛道', schedule: { examDate: '2030-08-01' } }]
  };
  assert.equal(
    schedule.getState(cancelledParent, new Date('2030-06-01T00:00:00+08:00')).key,
    'cancelled'
  );

  const pendingParent = {
    id: 'parent-pending',
    name: '父赛事',
    override: 'pending',
    tracks: [{
      id: 'normal-track',
      name: '正常赛道',
      schedule: { examStart: '2030-08-01T09:00:00+08:00' }
    }]
  };
  const normalState = schedule.getState(
    schedule.flatten([pendingParent])[0],
    new Date('2030-06-01T00:00:00+08:00')
  );
  assert.equal(normalState.key, 'preparing');
});

test('a seventh track remains an independent entity', () => {
  const tracks = Array.from({ length: 7 }, (_, index) => ({
    id: 'track-' + (index + 1),
    name: '赛道' + (index + 1),
    modules: [{ label: '资料' + (index + 1) }],
    schedule: {}
  }));
  const parent = {
    id: 'seven-track-parent',
    name: '七赛道父赛事',
    override: 'postponed',
    tracks
  };
  const flat = schedule.flatten([parent]);

  assert.equal(flat.length, 7);
  assert.equal(flat[6].trackId, 'track-7');
  assert.equal(flat[6].displayName, '七赛道父赛事 · 赛道7');
  assert.equal(flat[6].parentOverride, 'postponed');
  assert.equal(flat[6].track, tracks[6]);
  assert.deepEqual(flat[6].modules, tracks[6].modules);
});

test('fixed instants produce identical results under different process time zones', () => {
  const script = `
    const schedule = require(${JSON.stringify(modulePath)});
    const item = {
      schedule: {
        registrationStart: '2026-11-20',
        registrationEnd: '2026-11-25',
        examDate: '2026-11-29'
      }
    };
    const instants = [
      '2026-11-24T15:59:59.999Z',
      '2026-11-24T16:00:00.000Z',
      '2026-11-29T15:59:59.999Z',
      '2026-11-29T16:00:00.000Z'
    ];
    process.stdout.write(JSON.stringify({
      keys: instants.map((value) => schedule.getState(item, new Date(value)).key),
      detail: schedule.getState(item, new Date('2026-11-24T16:00:00.000Z')).detail,
      pure: schedule.formatDate('2026-11-25'),
      instant: schedule.formatDate('2026-11-25T16:00:00.000Z')
    }));
  `;
  const zones = ['Asia/Shanghai', 'UTC', 'America/Los_Angeles'];
  const results = zones.map((zone) => {
    const child = spawnSync(process.execPath, ['-e', script], {
      cwd: path.resolve(__dirname, '..'),
      env: Object.assign({}, process.env, { TZ: zone }),
      encoding: 'utf8'
    });
    assert.equal(child.status, 0, child.stderr);
    return JSON.parse(child.stdout);
  });

  assert.deepEqual(results[1], results[0]);
  assert.deepEqual(results[2], results[0]);
  assert.deepEqual(results[0], {
    keys: ['registering', 'registering', 'examday', 'ended'],
    detail: '今日截止，具体时刻见通知。',
    pure: '2026.11.25',
    instant: '2026.11.26 00:00'
  });
});
