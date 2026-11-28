/*
 * 竞赛时间状态模块。
 *
 * schedule 字段：
 * - registrationStart / registrationEnd：报名开始与截止。
 * - submissionStart / submissionEnd：任务提交开始与截止；不等同于比赛时间。
 * - examStart / examEnd：比赛开始与结束。
 * - examDate：只有比赛日期、没有具体时刻时使用。
 * - events：多阶段时间线。日期节点支持 start/end/at/date，非精确月份节点使用 text。
 * - verifiedAt：原仓库整理日期，不是实时核验时间。
 * - season / note：赛季与通知补充。
 * - override：postponed / cancelled / pending，优先于所有日期状态。
 *
 * 纯日期按 Asia/Shanghai 解释：开始日为当天 00:00，结束日为次日 00:00（不含），
 * 所以截止日和比赛日当天仍有效。设备时间只用于提供 now，不用于改变日期边界。
 *
 * API：
 * - getState(contest, now = new Date()) =>
 *   { key, label, tone, detail, nextAt, nextLabel, nextField, ended }
 *   nextAt 为 Date 或 null；nextLabel/nextField 描述该倒计时对应的节点。
 * - flatten(contests) => 独立赛事/赛道实体数组；tracks 容器不会被父级 schedule 补时。
 * - notificationEntries(contests, now = new Date()) =>
 *   [{ contest, state, nextAt, nextLabel, nextField }]，按独立下一节点排序。
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

  function normalizeOverrideValue(value) {
    value = typeof value === 'string' ? value.trim().toLowerCase() : '';
    return value === 'postponed' || value === 'cancelled' || value === 'pending' ? value : '';
  }

  function normalizeOverride(contest, schedule) {
    return normalizeOverrideValue(schedule && schedule.override) ||
      normalizeOverrideValue(contest && contest.override);
  }

  function normalizeParentOverride(contest) {
    var value = normalizeOverrideValue(contest && contest.parentOverride);
    return value === 'postponed' || value === 'cancelled' ? value : '';
  }

  function effectiveOverride(contest, schedule) {
    return normalizeParentOverride(contest) || normalizeOverride(contest, schedule);
  }

  function withNext(state, label, field) {
    state.nextLabel = state.nextAt && label ? label : '';
    state.nextField = state.nextAt && field ? field : '';
    return state;
  }

  function unknownState(detail) {
    return {
      key: 'unknown',
      label: '时间待公布',
      tone: 'neutral',
      detail: detail || '赛程时间尚未公布，请以通知为准。',
      nextAt: null,
      nextLabel: '',
      nextField: '',
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
      nextLabel: '',
      nextField: '',
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

  function isSubmissionDeadlineToday(schedule, now) {
    return isPureDateString(schedule.submissionEnd) &&
      sameShanghaiDay(parseDateValue(schedule.submissionEnd, false), now);
  }

  function submissionDetail(schedule, submissionEnd, now) {
    if (!submissionEnd) return '提交开始时间已记录，截止时间待公布。';
    if (isPureDateString(schedule.submissionEnd)) {
      if (isSubmissionDeadlineToday(schedule, now)) return '今日提交截止，具体时刻见通知。';
      return '提交于 ' + formatDate(schedule.submissionEnd) + ' 截止；具体时刻见通知。';
    }
    return '提交将于 ' + formatDate(submissionEnd) + ' 截止。';
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

  function eventType(event) {
    return String(event && event.type || '').trim().toLowerCase();
  }

  function eventDateInfo(event) {
    event = event && typeof event === 'object' ? event : {};
    var type = eventType(event);
    var startRaw = event.start || event.at || event.date || '';
    var endRaw = event.end || '';
    var start = parseDateValue(startRaw, false);
    var end = endRaw ? parseDateValue(endRaw, isPureDateString(endRaw)) : null;
    var deadlineTypes = type === 'registration' || type === 'submission';

    if (!end && startRaw) {
      if (deadlineTypes) {
        end = parseDateValue(startRaw, true);
      } else if (isPureDateString(startRaw)) {
        end = parseDateValue(startRaw, true);
      }
    }

    return {
      start: start,
      end: end,
      startRaw: startRaw,
      endRaw: endRaw,
      deadlineTypes: deadlineTypes
    };
  }

  function eventNodeAt(info) {
    if (!info) return null;
    return info.deadlineTypes ? (info.end || info.start) : (info.start || info.end);
  }

  function eventRangeText(event, info) {
    var startRaw = info.startRaw;
    var endRaw = info.endRaw;
    var startText = startRaw ? formatDate(startRaw) : '';
    var endText = endRaw ? formatDate(endRaw) : '';
    if (startText && endText && startText !== endText) {
      return startText + ' 至 ' + endText;
    }
    return startText || endText;
  }

  function futureEventLabel(event, info, now) {
    var type = eventType(event);
    var deadlineIsToday = isPureDateString(info.startRaw) &&
      sameShanghaiDay(parseDateValue(info.startRaw, false), now);
    if (type === 'registration') {
      return deadlineIsToday ? '今日截止' : '报名中';
    }
    if (type === 'submission') {
      return deadlineIsToday ? '今日提交截止' : '提交中';
    }
    if (type === 'exam') return '备赛中';
    if (type === 'qualification') return '等待晋级公示';
    if (type === 'award') return '等待获奖公示';
    return '等待公示';
  }

  function futureEventState(event, info, now) {
    var nodeAt = eventNodeAt(info);
    var type = eventType(event);
    var label = futureEventLabel(event, info, now);
    var detailDate = eventRangeText(event, info);
    var tone = nodeAt && nodeAt.getTime() - now.getTime() <= URGENT_WINDOW_MS ? 'urgent' : 'accent';
    if (!info.deadlineTypes && type !== 'exam') tone = 'neutral';
    return withNext({
      key: type || 'milestone',
      label: label,
      tone: tone,
      detail: (event.label || '赛事节点') + (detailDate ? '：' + detailDate : '') + '。',
      nextAt: nodeAt,
      nextValue: info.deadlineTypes ? info.startRaw : info.startRaw,
      ended: false
    }, event.label || '赛事节点', '');
  }

  function activeEventState(event, info, now) {
    var type = eventType(event);
    if (type === 'exam') {
      if (info.start && info.startRaw && now < info.start) return null;
      if (info.end && now < info.end) {
        var isExactStart = !isPureDateString(info.startRaw);
        return withNext({
          key: isExactStart ? 'competing' : 'examday',
          label: isExactStart ? '比赛进行中' : '比赛日',
          tone: isExactStart ? 'accent' : 'urgent',
          detail: isExactStart ? '比赛正在进行。' : '今天是比赛日，具体时间见通知。',
          nextAt: info.end,
          nextValue: info.endRaw || info.startRaw,
          ended: false
        }, '比赛结束', '');
      }
    }
    return null;
  }

  function pendingEventState(event) {
    var type = eventType(event);
    var label = event.pendingLabel ||
      (type === 'qualification' ? '晋级公示待公布' :
        type === 'award' ? '获奖公示待公布' : '公示待公布');
    return {
      key: type || 'announcement',
      label: label,
      tone: 'neutral',
      detail: (event.label || '赛事安排') + '：' + (event.text || '时间待公布') + '。',
      nextAt: null,
      nextLabel: '',
      nextField: '',
      nextValue: '',
      ended: false,
      awaiting: true
    };
  }

  function eventState(schedule, now) {
    var events = Array.isArray(schedule.events) ? schedule.events : [];
    var candidates = [];
    var pending = [];
    var datedCount = 0;

    events.forEach(function (event, index) {
      if (!event || typeof event !== 'object') return;
      var info = eventDateInfo(event);
      var nodeAt = eventNodeAt(info);
      if (!info.start && !info.end) {
        if (event.text) pending.push({ event: event, index: index });
        return;
      }
      datedCount += 1;
      var active = activeEventState(event, info, now);
      if (active) {
        candidates.push({ event: event, info: info, index: index, active: active, at: now });
      } else if (nodeAt && nodeAt > now) {
        candidates.push({ event: event, info: info, index: index, future: true, at: nodeAt });
      }
    });

    candidates.sort(function (left, right) {
      var leftTime = left.active ? now.getTime() : left.at.getTime();
      var rightTime = right.active ? now.getTime() : right.at.getTime();
      return leftTime - rightTime || left.index - right.index;
    });

    if (candidates.length) {
      var next = candidates[0];
      return next.active || futureEventState(next.event, next.info, now);
    }
    if (pending.length) {
      pending.sort(function (left, right) {
        return left.index - right.index;
      });
      return pendingEventState(pending[0].event);
    }
    if (datedCount) {
      return {
        key: 'ended',
        label: '已结束',
        tone: 'muted',
        detail: '本赛季已结束。',
        nextAt: null,
        nextLabel: '',
        nextField: '',
        nextValue: '',
        ended: true
      };
    }
    return unknownState();
  }

  function getState(contest, nowValue) {
    var now = coerceNow(nowValue);
    var item = contest && typeof contest === 'object' ? contest : {};
    var schedule = item.schedule && typeof item.schedule === 'object' ? item.schedule : {};
    var ownOverride = normalizeOverride(item, schedule);
    if (Array.isArray(item.tracks)) {
      if (ownOverride) return overrideState(ownOverride, schedule);
      return unknownState('赛事包含独立赛道，请按赛道读取时间。');
    }
    var override = effectiveOverride(item, schedule);
    if (override) return overrideState(override, schedule);
    if (Array.isArray(schedule.events) && schedule.events.length) {
      return eventState(schedule, now);
    }

    var dateFields = [
      schedule.registrationStart,
      schedule.registrationEnd,
      schedule.submissionStart,
      schedule.submissionEnd,
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
    var submissionStart = parseDateValue(schedule.submissionStart, false);
    var submissionEnd = parseDateValue(schedule.submissionEnd, true);
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
    var hasUsableDate = registrationStart || registrationEnd || submissionStart ||
      submissionEnd || exactExamStart || exactExamEnd || examDayStart;

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
        nextLabel: '',
        nextField: '',
        ended: true
      };
    }

    if (exactExamStart && now >= exactExamStart) {
      if (effectiveExamEnd) {
        return withNext({
          key: 'competing',
          label: '比赛进行中',
          tone: 'accent',
          detail: '比赛正在进行。',
          nextAt: effectiveExamEnd,
          ended: false
        }, '比赛结束', schedule.examEnd ? 'examEnd' : (schedule.examDate ? 'examDate' : 'examStart'));
      }
      return {
        key: 'pending',
        label: '结束时间待公布',
        tone: 'neutral',
        detail: '比赛已于 ' + formatDate(exactExamStart) + ' 开始，结束时间待公布。',
        nextAt: null,
        nextLabel: '',
        nextField: '',
        ended: false
      };
    }

    if (examDayStart && now >= examDayStart && now < examDayEnd) {
      return withNext({
        key: 'examday',
        label: '比赛日',
        tone: 'urgent',
        detail: '今天是比赛日，具体时间见通知。',
        nextAt: examDayEnd,
        ended: false
      }, '比赛日结束', schedule.examDate ? 'examDate' : 'examStart');
    }

    if (registrationStart && now < registrationStart) {
      return withNext({
        key: 'upcoming',
        label: '未开放',
        tone: 'neutral',
        detail: '报名将于 ' + formatDate(registrationStart) + ' 开放。',
        nextAt: registrationStart,
        ended: false
      }, '报名开始', 'registrationStart');
    }

    if (registrationEnd && now < registrationEnd) {
      var remaining = registrationEnd.getTime() - now.getTime();
      var deadlineToday = isRegistrationDeadlineToday(schedule, now);
      return withNext({
        key: 'registering',
        label: deadlineToday ? '今日截止' : '报名中',
        tone: remaining <= URGENT_WINDOW_MS ? 'urgent' : 'accent',
        detail: registrationDetail(schedule, registrationEnd, now),
        nextAt: registrationEnd,
        ended: false
      }, '报名截止', 'registrationEnd');
    }

    if (registrationStart && !registrationEnd && now >= registrationStart) {
      return {
        key: 'registering',
        label: '报名中',
        tone: 'accent',
        detail: '报名已于 ' + formatDate(registrationStart) + ' 开始，截止时间待公布。',
        nextAt: null,
        nextLabel: '',
        nextField: '',
        ended: false
      };
    }

    if (submissionStart && now < submissionStart) {
      return withNext({
        key: 'submissionUpcoming',
        label: '提交未开放',
        tone: 'neutral',
        detail: '提交将于 ' + formatDate(submissionStart) + ' 开放。',
        nextAt: submissionStart,
        ended: false
      }, '提交开始', 'submissionStart');
    }

    if (submissionEnd && now < submissionEnd) {
      var submissionRemaining = submissionEnd.getTime() - now.getTime();
      var submissionToday = isSubmissionDeadlineToday(schedule, now);
      return withNext({
        key: 'submitting',
        label: submissionToday ? '今日提交截止' : '提交中',
        tone: submissionRemaining <= URGENT_WINDOW_MS ? 'urgent' : 'accent',
        detail: submissionDetail(schedule, submissionEnd, now),
        nextAt: submissionEnd,
        ended: false
      }, '提交截止', 'submissionEnd');
    }

    if (submissionStart && !submissionEnd && now >= submissionStart) {
      return {
        key: 'submitting',
        label: '提交中',
        tone: 'accent',
        detail: '提交已于 ' + formatDate(submissionStart) + ' 开始，截止时间待公布。',
        nextAt: null,
        nextLabel: '',
        nextField: '',
        ended: false
      };
    }

    if (exactExamStart && now < exactExamStart) {
      return withNext({
        key: 'preparing',
        label: '备赛中',
        tone: 'accent',
        detail: examWaitingDetail(exactExamStart, null, !!effectiveExamEnd, registrationEnd, now),
        nextAt: exactExamStart,
        ended: false
      }, '比赛开始', 'examStart');
    }

    if (exactExamEnd && now < exactExamEnd) {
      return withNext({
        key: 'pending',
        label: '开始时间待公布',
        tone: 'neutral',
        detail: registrationEndedPrefix(registrationEnd, now) +
          '仅记录比赛结束时间为 ' + formatDate(exactExamEnd) + '，开始时间待公布。',
        nextAt: exactExamEnd,
        ended: false
      }, '比赛结束', 'examEnd');
    }

    if (examDayStart && now < examDayStart) {
      return withNext({
        key: 'closed',
        label: '待比赛',
        tone: 'neutral',
        detail: examWaitingDetail(null, examDayStart, !!effectiveExamEnd, registrationEnd, now),
        nextAt: examDayStart,
        ended: false
      }, '比赛日', schedule.examDate ? 'examDate' : 'examStart');
    }

    if (submissionStart || submissionEnd) {
      return {
        key: 'submissionClosed',
        label: '提交已截止',
        tone: 'neutral',
        detail: '任务提交通道已关闭。',
        nextAt: null,
        nextLabel: '',
        nextField: '',
        ended: false
      };
    }

    return {
      key: 'closed',
      label: registrationEndedPrefix(registrationEnd, now) ? '报名已截止' : '待比赛',
      tone: 'neutral',
      detail: examWaitingDetail(null, null, false, registrationEnd, now),
      nextAt: null,
      nextLabel: '',
      nextField: '',
      ended: false
    };
  }

  function flatten(contests) {
    var list = Array.isArray(contests) ? contests : [];
    var entries = [];

    list.forEach(function (contest, contestIndex) {
      if (!contest || typeof contest !== 'object') return;
      if (!Array.isArray(contest.tracks)) {
        entries.push(contest);
        return;
      }

      var parentSchedule = contest.schedule && typeof contest.schedule === 'object'
        ? contest.schedule
        : {};
      var parentOverride = normalizeOverride(contest, parentSchedule);

      contest.tracks.forEach(function (track, trackIndex) {
        if (!track || typeof track !== 'object') return;
        var trackSchedule = track.schedule && typeof track.schedule === 'object'
          ? Object.assign({}, track.schedule)
          : {};
        var trackId = track.id ? String(track.id) : '';

        entries.push({
          id: (contest.id || ('contest-' + (contestIndex + 1))) + ':' +
            (trackId || ('track-' + (trackIndex + 1))),
          parentId: contest.id || '',
          parentName: contest.name || '',
          contest: contest,
          track: track,
          trackId: trackId,
          name: track.name || '',
          displayName: [contest.name || '', track.name || ''].filter(Boolean).join(' · '),
          task: track.task || '',
          domain: track.domain || contest.domain || '',
          entry: track.entry && typeof track.entry === 'object' ? track.entry : contest.entry,
          source: track.source && typeof track.source === 'object' ? track.source : contest.source,
          modules: Array.isArray(track.modules) ? track.modules : [],
          schedule: trackSchedule,
          override: normalizeOverrideValue(track.override),
          parentOverride: parentOverride,
          placeholder: track.placeholder === true
        });
      });
    });

    return entries;
  }

  function notificationEntries(contests, nowValue) {
    var now = coerceNow(nowValue);
    return flatten(contests).map(function (contest, index) {
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
      return {
        contest: entry.contest,
        state: entry.state,
        nextAt: entry.state.nextAt,
        nextLabel: entry.state.nextLabel || '',
        nextField: entry.state.nextField || ''
      };
    });
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
    formatDate: formatDate,
    flatten: flatten,
    notificationEntries: notificationEntries
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.ContestSchedule = api;
})();
