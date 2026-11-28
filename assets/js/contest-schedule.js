/*
 * 竞赛时间状态模块。
 *
 * schedule 字段：
 * - registrationStart / registrationEnd：报名开始与截止。
 * - examStart / examEnd：比赛开始与结束。
 * - examDate：只有比赛日期、没有具体时刻时使用。
 * - verifiedAt：原仓库整理日期，不是实时核验时间。
 * - season / note：赛季与通知补充。
 * - override：postponed / cancelled / pending，优先于所有日期状态。
 *
 * 纯日期按 Asia/Shanghai 解释：开始日为当天 00:00，结束日为次日 00:00（不含），
 * 所以截止日和比赛日当天仍有效。设备时间只用于提供 now，不用于改变日期边界。
 *
 * API：
 * - getState(contest, now = new Date()) => { key, label, tone, detail, nextAt, ended }
 *   其中 nextAt 为 Date 或 null；override 和占位项不会给出倒计时。
 * - sortContests(contests, now = new Date()) => 新数组，不修改输入。
 * - formatDate(value) => 北京时间 YYYY.MM.DD 或 YYYY.MM.DD HH:mm；
 *   纯日期字符串只显示年月日，无效值返回空字符串。
 *
 * 浏览器公开 window.ContestSchedule；Node 可通过 require 得到同一个对象。
 */
(function () {
  'use strict';

  var SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;
  var DAY_MS = 24 * 60 * 60 * 1000;
  var URGENT_WINDOW_MS = 72 * 60 * 60 * 1000;
  var PURE_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
  var LOCAL_DATE_TIME_RE = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
  var dateFormatter;

  function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
  }

  function getFormatter() {
    if (!dateFormatter) {
      dateFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      });
    }
    return dateFormatter;
  }

  function partsOf(date) {
    var result = {};
    getFormatter().formatToParts(date).forEach(function (part) {
      if (part.type !== 'literal') result[part.type] = part.value;
    });
    return result;
  }

  function shanghaiDayStart(year, month, day) {
    var utc = Date.UTC(year, month - 1, day);
    var check = new Date(utc);
    if (
      check.getUTCFullYear() !== year ||
      check.getUTCMonth() !== month - 1 ||
      check.getUTCDate() !== day
    ) {
      return null;
    }
    return new Date(utc - SHANGHAI_OFFSET_MS);
  }

  function shanghaiDayEndExclusive(year, month, day) {
    var start = shanghaiDayStart(year, month, day);
    return start ? new Date(start.getTime() + DAY_MS) : null;
  }

  function shanghaiLocalDateTime(year, month, day, hour, minute, second, millisecond) {
    var utc = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
    var check = new Date(utc);
    if (
      check.getUTCFullYear() !== year ||
      check.getUTCMonth() !== month - 1 ||
      check.getUTCDate() !== day ||
      check.getUTCHours() !== hour ||
      check.getUTCMinutes() !== minute ||
      check.getUTCSeconds() !== second ||
      check.getUTCMilliseconds() !== millisecond
    ) {
      return null;
    }
    return new Date(utc - SHANGHAI_OFFSET_MS);
  }

  function isPureDateString(value) {
    return typeof value === 'string' && PURE_DATE_RE.test(value.trim());
  }

  function parseDateValue(value, useEndOfDay) {
    if (value === null || value === undefined || value === '') return null;
    if (isValidDate(value)) return new Date(value.getTime());
    if (typeof value === 'number') {
      var fromNumber = new Date(value);
      return isValidDate(fromNumber) ? fromNumber : null;
    }
    if (typeof value !== 'string') return null;

    var text = value.trim();
    if (!text) return null;

    var pureMatch = PURE_DATE_RE.exec(text);
    if (pureMatch) {
      return useEndOfDay
        ? shanghaiDayEndExclusive(Number(pureMatch[1]), Number(pureMatch[2]), Number(pureMatch[3]))
        : shanghaiDayStart(Number(pureMatch[1]), Number(pureMatch[2]), Number(pureMatch[3]));
    }

    var localMatch = LOCAL_DATE_TIME_RE.exec(text);
    if (localMatch) {
      var fraction = localMatch[7] ? Number((localMatch[7] + '000').slice(0, 3)) : 0;
      return shanghaiLocalDateTime(
        Number(localMatch[1]),
        Number(localMatch[2]),
        Number(localMatch[3]),
        Number(localMatch[4]),
        Number(localMatch[5]),
        Number(localMatch[6] || 0),
        fraction
      );
    }

    var parsed = new Date(text);
    return isValidDate(parsed) ? parsed : null;
  }

  function coerceNow(value) {
    if (value === null || value === undefined || value === '') return new Date();
    var now = isValidDate(value) ? new Date(value.getTime()) : new Date(value);
    return isValidDate(now) ? now : new Date();
  }

  function sameShanghaiDay(left, right) {
    if (!isValidDate(left) || !isValidDate(right)) return false;
    var a = partsOf(left);
    var b = partsOf(right);
    return a.year === b.year && a.month === b.month && a.day === b.day;
  }

  function formatDate(value) {
    var date = parseDateValue(value, false);
    if (!date) return '';
    if (isPureDateString(value)) {
      var pure = PURE_DATE_RE.exec(value.trim());
      return pure[1] + '.' + pure[2] + '.' + pure[3];
    }

    var parts = partsOf(date);
    var hour = Number(parts.hour) === 24 ? '00' : parts.hour;
    return parts.year + '.' + parts.month + '.' + parts.day + ' ' + hour + ':' + parts.minute;
  }

  function formatShanghaiDay(value) {
    var date = parseDateValue(value, false);
    if (!date) return '';
    var parts = partsOf(date);
    return parts.year + '.' + parts.month + '.' + parts.day;
  }

  function normalizeOverride(contest, schedule) {
    var value = schedule && schedule.override;
    if (!value && contest) value = contest.override;
    value = typeof value === 'string' ? value.trim().toLowerCase() : '';
    return value === 'postponed' || value === 'cancelled' || value === 'pending' ? value : '';
  }

  function unknownState(detail) {
    return {
      key: 'unknown',
      label: '时间待公布',
      tone: 'neutral',
      detail: detail || '赛程时间尚未公布，请以通知为准。',
      nextAt: null,
      ended: false
    };
  }

  function overrideState(override, schedule) {
    var details = {
      postponed: '赛事已延期，后续安排见通知。',
      cancelled: '赛事已取消。',
      pending: '赛事安排尚未确定，不显示倒计时。'
    };
    var labels = {
      postponed: '已延期',
      cancelled: '已取消',
      pending: '时间待定'
    };
    return {
      key: override,
      label: labels[override],
      tone: 'muted',
      detail: schedule && schedule.note ? schedule.note : details[override],
      nextAt: null,
      ended: false
    };
  }

  function isRegistrationDeadlineToday(schedule, now) {
    return isPureDateString(schedule.registrationEnd) &&
      sameShanghaiDay(parseDateValue(schedule.registrationEnd, false), now);
  }

  function registrationDetail(schedule, registrationEnd, now) {
    if (!registrationEnd) return '报名开始时间已记录，截止时间待公布。';
    if (isPureDateString(schedule.registrationEnd)) {
      if (isRegistrationDeadlineToday(schedule, now)) return '今日截止，具体时刻见通知。';
      return '报名于 ' + formatDate(schedule.registrationEnd) + ' 截止；具体时刻见通知。';
    }
    return '报名将于 ' + formatDate(registrationEnd) + ' 截止。';
  }

  function registrationEndedPrefix(registrationEnd, now) {
    return registrationEnd && now >= registrationEnd ? '报名已截止，' : '';
  }

  function examWaitingDetail(exactExamStart, examDayStart, hasKnownEnd, registrationEnd, now) {
    var prefix = registrationEndedPrefix(registrationEnd, now);
    if (exactExamStart) {
      return prefix + '比赛将于 ' + formatDate(exactExamStart) + ' 开始' +
        (hasKnownEnd ? '。' : '，结束时间待公布。');
    }
    if (examDayStart) {
      return prefix + '比赛日为 ' + formatShanghaiDay(examDayStart) + '，具体时间见通知。';
    }
    return prefix + '比赛时间待公布。';
  }

  function getState(contest, nowValue) {
    var now = coerceNow(nowValue);
    var item = contest && typeof contest === 'object' ? contest : {};
    var schedule = item.schedule && typeof item.schedule === 'object' ? item.schedule : {};
    var override = normalizeOverride(item, schedule);
    if (override) return overrideState(override, schedule);

    var dateFields = [
      schedule.registrationStart,
      schedule.registrationEnd,
      schedule.examStart,
      schedule.examEnd,
      schedule.examDate
    ];
    var hasDateField = dateFields.some(function (value) {
      return value !== null && value !== undefined && String(value).trim() !== '';
    });
    if (item.placeholder === true || !hasDateField) {
      return unknownState(item.placeholder === true ? '赛程待公布，不显示倒计时。' : '');
    }

    var registrationStart = parseDateValue(schedule.registrationStart, false);
    var registrationEnd = parseDateValue(schedule.registrationEnd, true);
    var examStartRaw = schedule.examStart;
    var examEndRaw = schedule.examEnd;
    var examStartIsPure = isPureDateString(examStartRaw);
    var examEndIsPure = isPureDateString(examEndRaw);
    var exactExamStart = examStartIsPure ? null : parseDateValue(examStartRaw, false);
    var exactExamEnd = examEndIsPure
      ? parseDateValue(examEndRaw, true)
      : parseDateValue(examEndRaw, false);
    var examDayStart = parseDateValue(schedule.examDate, false) ||
      (examStartIsPure ? parseDateValue(examStartRaw, false) : null);
    var examDayEnd = parseDateValue(schedule.examDate, true) ||
      (examStartIsPure ? parseDateValue(examStartRaw, true) : null);
    var effectiveExamEnd = exactExamEnd || examDayEnd;
    var hasInvalidDate = dateFields.some(function (value) {
      return value !== null && value !== undefined && String(value).trim() !== '' &&
        !parseDateValue(value, false);
    });
    var hasUsableDate = registrationStart || registrationEnd || exactExamStart ||
      exactExamEnd || examDayStart;

    if (!hasUsableDate) {
      return unknownState(hasInvalidDate ? '日期信息无效，请以通知为准。' : '');
    }

    if (effectiveExamEnd && now >= effectiveExamEnd) {
      return {
        key: 'ended',
        label: '已结束',
        tone: 'muted',
        detail: '本赛季已结束。',
        nextAt: null,
        ended: true
      };
    }

    if (exactExamStart && now >= exactExamStart) {
      if (effectiveExamEnd) {
        return {
          key: 'competing',
          label: '比赛进行中',
          tone: 'accent',
          detail: '比赛正在进行。',
          nextAt: effectiveExamEnd,
          ended: false
        };
      }
      return {
        key: 'pending',
        label: '结束时间待公布',
        tone: 'neutral',
        detail: '比赛已于 ' + formatDate(exactExamStart) + ' 开始，结束时间待公布。',
        nextAt: null,
        ended: false
      };
    }

    if (examDayStart && now >= examDayStart && now < examDayEnd) {
      return {
        key: 'examday',
        label: '比赛日',
        tone: 'urgent',
        detail: '今天是比赛日，具体时间见通知。',
        nextAt: examDayEnd,
        ended: false
      };
    }

    if (registrationStart && now < registrationStart) {
      return {
        key: 'upcoming',
        label: '未开放',
        tone: 'neutral',
        detail: '报名将于 ' + formatDate(registrationStart) + ' 开放。',
        nextAt: registrationStart,
        ended: false
      };
    }

    if (registrationEnd && now < registrationEnd) {
      var remaining = registrationEnd.getTime() - now.getTime();
      var deadlineToday = isRegistrationDeadlineToday(schedule, now);
      return {
        key: 'registering',
        label: deadlineToday ? '今日截止' : '报名中',
        tone: remaining <= URGENT_WINDOW_MS ? 'urgent' : 'accent',
        detail: registrationDetail(schedule, registrationEnd, now),
        nextAt: registrationEnd,
        ended: false
      };
    }

    if (registrationStart && !registrationEnd && now >= registrationStart) {
      return {
        key: 'registering',
        label: '报名中',
        tone: 'accent',
        detail: '报名已于 ' + formatDate(registrationStart) + ' 开始，截止时间待公布。',
        nextAt: null,
        ended: false
      };
    }

    if (exactExamStart && now < exactExamStart) {
      return {
        key: 'preparing',
        label: '备赛中',
        tone: 'accent',
        detail: examWaitingDetail(exactExamStart, null, !!effectiveExamEnd, registrationEnd, now),
        nextAt: exactExamStart,
        ended: false
      };
    }

    if (exactExamEnd && now < exactExamEnd) {
      return {
        key: 'pending',
        label: '开始时间待公布',
        tone: 'neutral',
        detail: registrationEndedPrefix(registrationEnd, now) +
          '仅记录比赛结束时间为 ' + formatDate(exactExamEnd) + '，开始时间待公布。',
        nextAt: exactExamEnd,
        ended: false
      };
    }

    if (examDayStart && now < examDayStart) {
      return {
        key: 'closed',
        label: '待比赛',
        tone: 'neutral',
        detail: examWaitingDetail(null, examDayStart, !!effectiveExamEnd, registrationEnd, now),
        nextAt: examDayStart,
        ended: false
      };
    }

    return {
      key: 'closed',
      label: registrationEndedPrefix(registrationEnd, now) ? '报名已截止' : '待比赛',
      tone: 'neutral',
      detail: examWaitingDetail(null, null, false, registrationEnd, now),
      nextAt: null,
      ended: false
    };
  }

  function sortContests(contests, nowValue) {
    var now = coerceNow(nowValue);
    var list = Array.isArray(contests) ? contests.slice() : [];
    return list.map(function (contest, index) {
      var state = getState(contest, now);
      var rank = 0;
      if (contest && contest.placeholder === true) rank = 3;
      else if (state.ended) rank = 2;
      else if (!state.nextAt) rank = 1;
      return { contest: contest, state: state, index: index, rank: rank };
    }).sort(function (left, right) {
      if (left.rank !== right.rank) return left.rank - right.rank;
      if (left.state.nextAt && right.state.nextAt) {
        return left.state.nextAt.getTime() - right.state.nextAt.getTime() || left.index - right.index;
      }
      return left.index - right.index;
    }).map(function (entry) {
      return entry.contest;
    });
  }

  var api = {
    getState: getState,
    sortContests: sortContests,
    formatDate: formatDate
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.ContestSchedule = api;
})();
