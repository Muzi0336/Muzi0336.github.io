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
  assert.equal(lanqiao.schedule.verifiedAt, '2026-11-28');
  assert.equal(lanqiao.source.label, '蓝桥杯官网');

  assert.ok(computer.entry.href);
  assert.ok(computer.modules.length > 0);
  assert.equal(computer.schedule.registrationStart, '2026-10-15T00:00:00+08:00');
  assert.equal(computer.schedule.registrationEnd, '2026-11-25T23:59:59+08:00');
  assert.equal(computer.schedule.examDate, '2026-11-29');
  assert.equal(computer.source.label, '校内通知');

  assert.equal(placeholder.placeholder, true);
  assert.equal(placeholder.entry, undefined);
  assert.equal(placeholder.modules.length, 0);
  assert.equal(placeholder.stats.length, 0);
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
