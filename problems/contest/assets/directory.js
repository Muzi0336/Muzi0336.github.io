/* 计算机挑战赛目录：从竞赛数据读取赛道与通用语言资源渐进增强。 */
(function () {
  'use strict';

  var selfScript = document.currentScript || document.querySelector('script[src*="assets/directory.js"]');
  var root = new URL('../../../', selfScript ? selfScript.src : location.href);
  var trackTarget = document.querySelector('[data-contest-track-directory]');
  var languageTarget = document.querySelector('[data-contest-language-directory]');
  if (!trackTarget && !languageTarget) return;

  var sourceTarget = trackTarget || languageTarget;
  var contestId = sourceTarget.getAttribute('data-contest-id') || 'computer-challenge';
  var contests = Array.isArray(window.ZYYC_CONTESTS) ? window.ZYYC_CONTESTS : [];
  var contest = contests.filter(function (item) {
    return item && item.id === contestId;
  })[0];
  if (!contest) return;

  function text(value, fallback) {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  function moduleHref(module) {
    if (!module || (typeof module === 'object' && (module.placeholder === true || module.available === false))) return '';
    var value = typeof module === 'string'
      ? module.trim()
      : typeof module.href === 'string' ? module.href.trim() : '';
    if (!value || /^(?:javascript|data):/i.test(value)) return '';
    try {
      return new URL(value, root).href;
    } catch (error) {
      return '';
    }
  }

  function pendingLabel(module) {
    return text(module && module.statusLabel, '内容整理中');
  }

  function trackState(track) {
    var flattened = flattenTrack(track);
    if (!flattened) return '时间待核实';
    var override = flattened.parentOverride || flattened.override || '';
    if (override === 'postponed') return '已延期';
    if (override === 'cancelled') return '已取消';
    if (override === 'pending') return '待确认';
    if (flattened.placeholder === true) return '暂不可进入';
    if (window.ContestSchedule && typeof window.ContestSchedule.getState === 'function') {
      try {
        var state = window.ContestSchedule.getState(Object.assign({}, flattened, {
          override: override
        }), new Date());
        if (state && state.label) return state.label;
      } catch (error) {
        return '时间待核实';
      }
    }
    return '时间待核实';
  }

  function flattenTrack(track) {
    if (!window.ContestSchedule || typeof window.ContestSchedule.flatten !== 'function') return null;
    try {
      return window.ContestSchedule.flatten([contest]).filter(function (entry) {
        return entry && entry.track === track;
      })[0] || null;
    } catch (error) {
      return null;
    }
  }

  function formatDate(value) {
    if (!value) return '';
    if (window.ContestSchedule && typeof window.ContestSchedule.formatDate === 'function') {
      try {
        return window.ContestSchedule.formatDate(value);
      } catch (error) {
        return '';
      }
    }
    return String(value);
  }

  function dateRange(label, start, end, endOnlyLabel) {
    var from = formatDate(start);
    var to = formatDate(end);
    if (!from && !to) return '';
    if (from && to) return label + '：' + from + ' 至 ' + to;
    if (from) return label + '：' + from;
    return endOnlyLabel + '：' + to;
  }

  function scheduleText(track) {
    var flattened = flattenTrack(track);
    var schedule = flattened && flattened.schedule ? flattened.schedule : {};
    var events = Array.isArray(schedule.events) ? schedule.events : [];
    if (events.length) {
      return events.map(function (event) {
        if (!event || typeof event !== 'object') return '';
        var label = text(event.label, '赛事节点');
        var start = event.start || event.at || event.date || '';
        var end = event.end || '';
        if (start && end) {
          var startText = formatDate(start);
          var endText = formatDate(end);
          if (String(start).slice(0, 10) === String(end).slice(0, 10)) {
            var endTime = String(end).match(/T(\d{2}:\d{2})/);
            return label + '：' + startText + (endTime ? '—' + endTime[1] : '');
          }
          return label + '：' + startText + ' 至 ' + endText;
        }
        if (start) return label + '：' + formatDate(start);
        if (event.text) return label + '：' + event.text;
        return '';
      }).filter(Boolean).join('；');
    }
    var parts = [
      dateRange('报名', schedule.registrationStart, schedule.registrationEnd, '报名截止'),
      dateRange('作品提交', schedule.submissionStart, schedule.submissionEnd, '提交截止'),
      dateRange('比赛', schedule.examStart || schedule.examDate, schedule.examEnd, '比赛结束')
    ].filter(Boolean);
    return parts.join('；');
  }

  function appendSource(container, track) {
    var source = track && track.source;
    if (!source || !source.label) return;
    var separator = document.createTextNode(' 来源：');
    container.appendChild(separator);
    var href = moduleHref(source);
    if (href) {
      var link = document.createElement('a');
      link.className = 'portal-link';
      link.href = href;
      link.textContent = source.label;
      container.appendChild(link);
    } else {
      container.appendChild(document.createTextNode(source.label));
    }
  }

  function appendTrackModules(container, track) {
    var modules = track && Array.isArray(track.modules) ? track.modules : [];
    if (!modules.length) return;
    var links = document.createElement('div');
    links.className = 'mini-links';
    modules.forEach(function (module) {
      var href = moduleHref(module);
      if (!href) return;
      var link = document.createElement('a');
      link.href = href;
      link.textContent = text(module.label, '查看赛道资料');
      links.appendChild(link);
    });
    if (links.childNodes.length) container.appendChild(links);
  }

  function appendCell(row, className, tagName) {
    var cell = document.createElement(tagName || 'div');
    cell.className = className;
    row.appendChild(cell);
    return cell;
  }

  function renderTrack(track, index) {
    var row = document.createElement('article');
    row.className = 'contest-directory-row';

    var indexCell = appendCell(row, 'contest-directory-index');
    indexCell.textContent = String(index + 1).padStart(2, '0');

    var main = appendCell(row, 'contest-directory-name');
    var heading = document.createElement('h3');
    heading.textContent = text(track && track.name, '名称待补充');
    main.appendChild(heading);

    var detail = appendCell(row, 'contest-directory-detail');
    if (track && track.placeholder !== true) {
      var description = document.createElement('p');
      description.textContent = text(track.task, '任务待补充');
      appendSource(description, track);
      detail.appendChild(description);
      var schedule = document.createElement('p');
      schedule.setAttribute('data-track-schedule', '');
      schedule.textContent = scheduleText(track);
      if (schedule.textContent) detail.appendChild(schedule);
      appendTrackModules(detail, track);
    }

    var status = document.createElement('span');
    status.className = 'contest-directory-status';
    status.setAttribute('data-track-status', '');
    status.textContent = trackState(track);
    row.appendChild(status);
    row.setAttribute('data-track-id', text(track && track.id, 'track-' + (index + 1)));
    return row;
  }

  function renderModule(module, index) {
    var href = moduleHref(module);
    var label = text(module && module.label, '语言入口');
    var note = text(module && module.note, href ? '进入该语言题库。' : '内容与入口尚在整理。');
    var row = document.createElement('article');
    row.className = 'contest-directory-row is-language';

    var indexCell = appendCell(row, 'contest-directory-index');
    indexCell.textContent = String(index + 1).padStart(2, '0');

    var main = appendCell(row, 'contest-directory-name');
    var heading = document.createElement('h3');
    if (href) {
      var titleLink = document.createElement('a');
      titleLink.className = 'portal-link';
      titleLink.href = href;
      titleLink.textContent = label;
      heading.appendChild(titleLink);
    } else {
      heading.textContent = label;
    }
    main.appendChild(heading);

    var detail = appendCell(row, 'contest-directory-detail');
    var description = document.createElement('p');
    description.textContent = note;
    detail.appendChild(description);

    if (href) {
      var action = document.createElement('a');
      action.className = 'contest-directory-action';
      action.href = href;
      action.textContent = '进入题库 →';
      row.appendChild(action);
    } else {
      var status = document.createElement('span');
      status.className = 'contest-directory-status';
      status.textContent = pendingLabel(module);
      row.appendChild(status);
    }

    return row;
  }

  function renderTracks() {
    if (!trackTarget) return;
    var tracks = Array.isArray(contest.tracks) ? contest.tracks : [];
    var fragment = document.createDocumentFragment();
    tracks.forEach(function (track, index) {
      if (track && typeof track === 'object') fragment.appendChild(renderTrack(track, index));
    });
    trackTarget.replaceChildren(fragment);
    var details = trackTarget.closest('details');
    if (details) {
      var hasRegisteredTrack = tracks.some(function (track) {
        return track && track.placeholder !== true;
      });
      var hasPlaceholderTrack = tracks.some(function (track) {
        return track && track.placeholder === true;
      });
      var registeredCount = tracks.filter(function (track) {
        return track && track.placeholder !== true;
      }).length;
      var placeholderCount = tracks.length - registeredCount;
      var summary = details.querySelector('summary');
      if (summary) {
        summary.textContent = tracks.length + ' 个赛道 · ' +
          (hasRegisteredTrack
            ? '已登记 ' + registeredCount + (hasPlaceholderTrack ? ' · 待补充 ' + placeholderCount : '')
            : '名称、任务与时间待补充');
      }
      details.open = hasRegisteredTrack;
    }
  }

  function renderLanguages() {
    if (!languageTarget) return;
    var modules = Array.isArray(contest.modules) ? contest.modules : [];
    var fragment = document.createDocumentFragment();
    modules.forEach(function (module, index) {
      if (module && typeof module === 'object') fragment.appendChild(renderModule(module, index));
    });
    languageTarget.replaceChildren(fragment);
  }

  function refreshTracks() {
    if (!trackTarget) return;
    var tracks = Array.isArray(contest.tracks) ? contest.tracks : [];
    tracks.forEach(function (track) {
      if (!track || typeof track !== 'object') return;
      var row = trackTarget.querySelector('[data-track-id="' + String(track.id || '').replace(/"/g, '\\"') + '"]');
      if (!row) return;
      var status = row.querySelector('[data-track-status]');
      var schedule = row.querySelector('[data-track-schedule]');
      if (status) status.textContent = trackState(track);
      if (schedule) schedule.textContent = scheduleText(track);
    });
  }

  function render() {
    renderTracks();
    renderLanguages();
    refreshTracks();
  }

  window.ContestDirectory = {
    render: render,
    refresh: refreshTracks,
    resolveHref: moduleHref
  };
  render();
  window.setInterval(refreshTracks, 60000);
  window.addEventListener('pageshow', refreshTracks);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') refreshTracks();
  });
})();
