/* Portal-side rendering for the homepage and aggregate pages. */
(function () {
    'use strict';

    var API = window.ContestSchedule || null;
    var MINUTE = 60000;
    var HOME_AI_STREAM_MS = 28;
    var HOME_AI_HOLD_MS = 3000;
    var HOME_AI_SCENES = [
        {
            icon: 'code',
            label: '失败代码',
            sample: 'Igopt]vzun → HelloWorld',
            code: 'for i, ch in enumerate(s):\n    out.append(chr(ord(ch) - i))',
            question: '“为什么第一位出来是 I，不是 H？”',
            answer: '密文 I 的 ASCII 是 73，明文 H 是 72。enumerate 从 0 开始，第一轮 i=0，所以只减了 0；题面第 1 位应减 1。改成 i + 1，或 enumerate(s, start=1)。'
        },
        {
            icon: 'chat',
            label: '问 AI · 位置基准',
            sample: 'BDF → ABC',
            code: 'for i, ch in enumerate(s, start=1):\n    out.append(chr(ord(ch) - i))',
            question: '“第二组样例 BDF，这样写能还原成 ABC 吗？”',
            answer: '能。B=66 减 1 得 A=65，D 减 2 得 B，F 减 3 得 C。start=1 与题面位置一致，每一位都减去自己的 1-based 位置。'
        }
    ];
    var HOME_ARCHIVE_ROTATE_MS = 6000;
    var HOME_ARCHIVE_LIMIT = 5;
    var HOME_ARCHIVE_DATA = window.ZYYC_HOME_ARCHIVES || { courses: [], contests: [] };
    var homeArchiveController = null;
    var lastNextAction = null;
    var stateTones = {
        open: 'open',
        active: 'active',
        accent: 'open',
        urgent: 'urgent',
        neutral: 'upcoming',
        muted: 'ended',
        registering: 'open',
        submissionUpcoming: 'upcoming',
        submissionClosed: 'done',
        submitting: 'open',
        submission: 'open',
        competing: 'active',
        examday: 'urgent',
        pending: 'upcoming',
        preparation: 'upcoming',
        preparing: 'upcoming',
        registration: 'open',
        exam: 'upcoming',
        qualification: 'upcoming',
        announcement: 'upcoming',
        award: 'upcoming',
        milestone: 'upcoming',
        upcoming: 'upcoming',
        closed: 'done',
        ended: 'ended',
        done: 'done',
        placeholder: 'done',
        unknown: 'done'
    };

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function setHtmlIfChanged(target, markup) {
        if (target && target.innerHTML !== markup) target.innerHTML = markup;
    }

    function setTextIfChanged(target, text) {
        if (target && target.textContent !== text) target.textContent = text;
    }

    function safeHref(value) {
        var href = String(value || '').trim();
        if (!href || /^(?:javascript|data):/i.test(href)) return '';
        return href;
    }

    function dateValue(value) {
        if (value == null || value === '') return null;
        var date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function formatDate(value) {
        if (API && typeof API.formatDate === 'function') {
            try {
                return API.formatDate(value);
            } catch (error) {
                /* Fall back to the local formatter below. */
            }
        }
        var date = dateValue(value);
        if (!date) return '时间待补充';
        var hasTime = typeof value === 'string' && /T|\d{2}:\d{2}/.test(value);
        try {
            return new Intl.DateTimeFormat('zh-CN', {
                timeZone: 'Asia/Shanghai',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: hasTime ? '2-digit' : undefined,
                minute: hasTime ? '2-digit' : undefined,
                hour12: false
            }).format(date).replace(/\//g, '.');
        } catch (error) {
            return hasTime ? date.toLocaleString('zh-CN') : date.toLocaleDateString('zh-CN');
        }
    }

    function fallbackState(contest) {
        return {
            key: contest && contest.placeholder ? 'placeholder' : 'unknown',
            label: contest && contest.placeholder ? '赛程待公布' : '时间待补充',
            tone: 'done',
            detail: contest && contest.placeholder
                ? '该赛事尚未开放入口，赛程以主办方后续通知为准。'
                : '尚未录入已核实的赛道时间，请以来源通知为准。',
            nextAt: null,
            ended: !!(contest && contest.placeholder)
        };
    }

    function getState(contest, now) {
        var current = now instanceof Date ? now : new Date();
        if (API && typeof API.getState === 'function') {
            try {
                var state = API.getState(contest, current);
                if (state && typeof state === 'object') {
                    return {
                        key: state.key || 'unknown',
                        label: state.label || '时间待补充',
                        tone: stateTones[state.tone] || stateTones[state.key] || state.tone || 'done',
                        detail: state.detail || '',
                        nextAt: state.nextAt || null,
                        nextLabel: state.nextLabel || '',
                        nextField: state.nextField || '',
                        nextValue: state.nextValue || '',
                        nextText: state.nextText || '',
                        awaiting: !!state.awaiting,
                        ended: !!state.ended
                    };
                }
            } catch (error) {
                /* Use the deterministic local fallback. */
            }
        }
        return fallbackState(contest);
    }

    function sortContests(contests, now) {
        var source = Array.isArray(contests) ? contests.slice() : [];
        if (API && typeof API.sortContests === 'function') {
            try {
                var sorted = API.sortContests(source, now);
                if (Array.isArray(sorted)) return sorted;
            } catch (error) {
                /* Use the deterministic local ordering below. */
            }
        }
        return source.sort(function (left, right) {
            return Number(!!(left && left.placeholder)) - Number(!!(right && right.placeholder));
        });
    }

    function sourceHtml(source) {
        if (!source || !source.label) return '来源待补充';
        var href = safeHref(source.href);
        if (!href) return escapeHtml(source.label);
        return '<a href="' + escapeHtml(href) + '" target="_blank" rel="noopener noreferrer">' +
            escapeHtml(source.label) + '</a>';
    }

    function trackName(track) {
        if (!track) return '';
        return String(track.name || track.label || track.title || '').trim();
    }

    function trackDisplayName(track, index) {
        return trackName(track) || ('赛道 ' + (Number(index) + 1));
    }

    function taskLabel(task) {
        if (!task) return '';
        if (typeof task === 'string') return task;
        if (typeof task !== 'object') return '';
        return String(task.label || task.title || task.name || task.note || '').trim();
    }

    function entryHref(entry) {
        return safeHref(
            entry && entry.entry && entry.entry.href ||
            entry && entry.track && entry.track.entry && entry.track.entry.href ||
            entry && entry.contest && entry.contest.entry && entry.contest.entry.href
        );
    }

    function displayName(entry) {
        if (!entry) return '未命名赛事';
        if (entry.displayName) return entry.displayName;
        var contest = entry.contest || {};
        var track = entry.track;
        var name = contest.name || entry.name || '未命名赛事';
        var sub = trackName(track);
        return sub ? name + ' · ' + sub : name;
    }

    function normalizeEntry(raw, fallbackContest, fallbackTrack) {
        var item = raw && typeof raw === 'object' ? raw : {};
        var plainContest = !fallbackContest && !fallbackTrack && !item.contest && !item.track;
        var contest = item.contest || item.parent || fallbackContest || (plainContest ? item : {});
        var track = item.track || fallbackTrack || null;
        var schedule = item.schedule || (track && track.schedule) ||
            (!track ? contest.schedule : {}) || {};
        var source = item.source || (track && track.source) || contest.source || null;
        var modules = item.modules || (track && track.modules) || [];
        var entry = item.entry || (track && track.entry) || contest.entry || null;
        return {
            id: item.id || ((contest.id || 'contest') + (track ? ':' + (track.id || trackName(track)) : '')),
            contest: contest,
            track: track,
            schedule: schedule && typeof schedule === 'object' ? schedule : {},
            source: source,
            modules: Array.isArray(modules) ? modules : [],
            entry: entry,
            task: item.task || (track && track.task) || null,
            override: item.override != null ? item.override : ((track && track.override) || contest.override || ''),
            parentOverride: item.parentOverride != null
                ? item.parentOverride
                : (contest.parentOverride || ''),
            placeholder: item.placeholder === true || contest.placeholder === true ||
                !!(track && track.placeholder),
            displayName: displayName({ contest: contest, track: track, displayName: item.displayName })
        };
    }

    function localFlatten(contests) {
        var list = Array.isArray(contests) ? contests : [];
        var flattened = [];
        list.forEach(function (contest) {
            if (!contest || typeof contest !== 'object') return;
            if (Array.isArray(contest.tracks) && contest.tracks.length) {
                contest.tracks.forEach(function (track) {
                    flattened.push(normalizeEntry({}, contest, track));
                });
                return;
            }
            flattened.push(normalizeEntry({}, contest, null));
        });
        return flattened;
    }

    function flattenContests(contests, now) {
        var apiFlatten = API && API.flatten;
        if (typeof apiFlatten === 'function') {
            try {
                var result = apiFlatten(contests, now);
                if (Array.isArray(result)) {
                    return result.map(function (item) {
                        return normalizeEntry(item, item && item.contest, item && item.track);
                    });
                }
            } catch (error) {
                /* Fall back to the track shape documented in contest-catalog.js. */
            }
        }
        return localFlatten(contests);
    }

    function isPureDate(value) {
        return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
    }

    function nextScheduleNode(entry, state) {
        if (!state || !state.nextAt) return null;
        var schedule = entry && entry.schedule ? entry.schedule : {};
        if (state.nextValue) {
            return {
                value: state.nextValue,
                label: state.nextLabel || '下一节点'
            };
        }
        if (state.nextText) {
            return {
                text: state.nextText,
                label: state.nextLabel || '下一节点'
            };
        }
        if (state.nextField && schedule[state.nextField]) {
            return {
                value: schedule[state.nextField],
                label: state.nextLabel || '下一节点'
            };
        }

        var key = String(state.key || '');
        var value;
        if (/submission|submit/.test(key)) {
            value = schedule.submissionEnd || schedule.submissionStart;
            if (value) return { value: value, label: '任务截止' };
        }
        if (/register/.test(key)) {
            value = schedule.registrationEnd || schedule.registrationStart;
            if (value) return { value: value, label: /start/.test(key) ? '报名开始' : '报名截止' };
        }
        if (/exam|compet|prepar/.test(key)) {
            value = schedule.examStart || schedule.examDate || schedule.examEnd;
            if (value) return { value: value, label: isPureDate(schedule.examStart) ? '比赛日' : '比赛开始' };
        }
        return null;
    }

    function formatNodeRange(start, end) {
        var startText = formatDate(start);
        var endText = formatDate(end);
        if (!startText) return endText;
        if (!endText) return startText;
        if (String(start).slice(0, 10) === String(end).slice(0, 10)) {
            var endTime = String(end).match(/T(\d{2}:\d{2})/);
            return startText + (endTime ? '—' + endTime[1] : '');
        }
        return startText + ' 至 ' + endText;
    }

    function scheduleSummary(entry) {
        var schedule = entry && entry.schedule ? entry.schedule : {};
        var events = Array.isArray(schedule.events) ? schedule.events : [];
        if (!events.length) return '';
        return events.map(function (event) {
            if (!event || typeof event !== 'object') return '';
            var label = String(event.label || '赛事节点').trim();
            var start = event.start || event.at || event.date || '';
            var end = event.end || '';
            if (start && end) {
                return label + '：' + formatNodeRange(start, end);
            }
            if (start) return label + '：' + formatDate(start);
            if (event.text) return label + '：' + event.text;
            return '';
        }).filter(Boolean).join('；');
    }

    function groupEntries(entries) {
        var groups = [];
        var index = {};
        entries.forEach(function (entry) {
            var contest = entry.contest || {};
            var key = contest.id || contest.name || entry.id;
            if (!index[key]) {
                index[key] = { contest: contest, entries: [] };
                groups.push(index[key]);
            }
            index[key].entries.push(entry);
        });
        return groups;
    }

    function recentItems(contests, now) {
        var entries = flattenContests(contests, now);
        var groups = groupEntries(entries);
        var items = [];

        groups.forEach(function (group) {
            var contest = group.contest;
            if (!contest || contest.placeholder) return;
            var scheduled = [];
            var unscheduled = [];
            var overrides = [];
            var hasUnknownTrack = false;
            group.entries.forEach(function (entry) {
                var state = getState(entry, now);
                if (entry.placeholder) {
                    hasUnknownTrack = true;
                    return;
                }
                if (state.ended) return;
                if (!state.nextAt) {
                    if (/^(postponed|cancelled|pending)$/.test(state.key)) {
                        overrides.push({
                            contest: contest,
                            entry: entry,
                            track: entry.track,
                            state: state,
                            node: null,
                            override: true
                        });
                    } else if (state.awaiting || /^(qualification|announcement|award)$/.test(state.key)) {
                        unscheduled.push({
                            contest: contest,
                            entry: entry,
                            track: entry.track,
                            state: state,
                            node: null,
                            unscheduled: true
                        });
                    } else if (state.key === 'unknown' || state.key === 'placeholder') {
                        hasUnknownTrack = true;
                    }
                    return;
                }
                var node = nextScheduleNode(entry, state);
                if (!node) return;
                scheduled.push({
                    contest: contest,
                    entry: entry,
                    track: entry.track,
                    state: state,
                    node: node
                });
            });
            if (scheduled.length) {
                var seenScheduled = {};
                scheduled = scheduled.filter(function (item) {
                    var key = String(contest.id || contest.name || '') + '|' +
                        String(item.node && item.node.label || '') + '|' +
                        String(item.node && item.node.value || '');
                    if (seenScheduled[key]) return false;
                    seenScheduled[key] = true;
                    return true;
                });
            }
            if (scheduled.length) {
                items = items.concat(scheduled, unscheduled);
                return;
            }
            if (overrides.length) {
                items = items.concat(overrides, unscheduled);
                return;
            }
            if (unscheduled.length) {
                items = items.concat(unscheduled);
                return;
            }
            if (!hasUnknownTrack) return;
            items.push({
                contest: contest,
                entry: normalizeEntry({}, contest, null),
                track: null,
                aggregate: true,
                state: {
                    key: 'unknown',
                    label: '各赛道时间待补充',
                    tone: 'upcoming',
                    detail: '尚未录入可核实的赛道安排；通用备战资料仍可进入。',
                    nextAt: null,
                    ended: false
                },
                node: null
            });
        });

        items.sort(function (left, right) {
            var leftTime = left.state.nextAt ? left.state.nextAt.getTime() : Infinity;
            var rightTime = right.state.nextAt ? right.state.nextAt.getTime() : Infinity;
            if (leftTime !== rightTime) return leftTime - rightTime;
            return String(displayName(left.entry)).localeCompare(String(displayName(right.entry)), 'zh-CN');
        });
        return items;
    }

    function verifiedText(entry) {
        var verifiedAt = entry && entry.schedule && entry.schedule.verifiedAt;
        return verifiedAt
            ? '原资料整理于 ' + formatDate(verifiedAt) + '，非实时核验。'
            : '原资料整理日期待补充，非实时核验。';
    }

    function detailWithoutRepeatedDate(detail, node, item) {
        var text = String(detail || '').trim();
        if (!text || !node || !item || item.aggregate || item.override || item.unscheduled) return text;
        var dateText = formatDate(node.value);
        var index = dateText ? text.indexOf(dateText) : -1;
        if (index < 0) return text;
        var tail = text.slice(index + dateText.length)
            .replace(/^[。；;，,\s]*(?:截止|开始|结束)?[。；;，,\s]*/, '')
            .trim();
        if (!tail) return text;
        return '具体安排以来源通知为准。' + tail;
    }

    function renderRecentEvents(now) {
        var targets = document.querySelectorAll('[data-recent-events]');
        if (!targets.length) return;
        var contests = window.ZYYC_CONTESTS || [];
        var items = recentItems(contests, now);

        targets.forEach(function (target) {
            var limit = Number(target.getAttribute('data-limit')) || 3;
            var list = items.slice(0, limit);
            var emptyText = target.getAttribute('data-empty') ||
                '暂时没有可显示的近期赛程。赛事目录、真题和本地复习仍可继续使用。';
            if (!list.length) {
                setHtmlIfChanged(target,
                    '<div class="portal-empty"><b>近期节点暂未录入</b><span>' +
                    escapeHtml(emptyText) + '</span></div>');
                return;
            }

            var markup = list.map(function (item) {
                var contest = item.contest || {};
                var entry = item.entry || {};
                var state = item.state;
                var node = item.node;
                var href = entryHref(entry);
                var title = href
                    ? '<a class="notice-title-link" href="' + escapeHtml(href) + '">' +
                        escapeHtml(displayName(entry)) + '</a>'
                    : escapeHtml(displayName(entry));
                var dateMarkup = item.aggregate
                    ? ''
                    : item.override || item.unscheduled
                        ? '<span class="notice-unknown-date">无倒计时</span>'
                        : '<time datetime="' + escapeHtml(String(node.value)) + '">' +
                            escapeHtml(formatDate(node.value)) + '</time><small>' +
                            escapeHtml(node.label) + '</small>';
                var detail = item.aggregate
                    ? '各赛道报名、提交与比赛日期尚未核实；先进入通用备战资料。'
                    : (state.detail || contest.summary || '赛程详情待更新。');
                detail = detailWithoutRepeatedDate(detail, node, item);
                var actionHref = href || (contest.entry && safeHref(contest.entry.href));
                var actionLabel = item.track
                    ? '查看赛道安排'
                    : (contest.id === 'computer-challenge' ? '进入赛事真题' : '进入赛事备考');
                var action = actionHref
                    ? '<a class="portal-button" href="' + escapeHtml(actionHref) + '">' +
                        actionLabel + '</a>'
                    : '';
                var source = entry.source || contest.source;
                return '<article class="notice-item" data-tone="' + escapeHtml(state.tone || 'done') + '">' +
                    '<div class="notice-marker"><span class="portal-state ' + escapeHtml(state.tone || 'done') +
                    '">' + escapeHtml(state.label || '时间待补充') + '</span>' + dateMarkup + '</div>' +
                    '<div class="notice-copy"><div class="notice-title"><h3>' + title + '</h3><span>' +
                    escapeHtml(contest.domain || (item.track ? '赛道安排' : '赛事通知')) +
                    '</span></div><p>' + escapeHtml(detail) + '</p><div class="notice-actions">' + action +
                    '<span class="source-label">来源：' + sourceHtml(source) + '</span></div>' +
                    '<details class="verify-note"><summary>核验说明</summary><p>' +
                    escapeHtml(verifiedText(entry)) + '具体安排以来源通知为准。</p></details></div></article>';
            }).join('');
            setHtmlIfChanged(target, markup);
        });
    }

    function relativeTime(date, now) {
        if (!date) return '待补充';
        var delta = date.getTime() - now.getTime();
        if (delta <= 0) return '节点已到';
        var minutes = Math.ceil(delta / MINUTE);
        if (minutes < 60) return '约 ' + minutes + ' 分钟';
        var hours = Math.ceil(delta / (60 * MINUTE));
        if (hours < 24) return '约 ' + hours + ' 小时';
        var days = Math.ceil(delta / (24 * 60 * MINUTE));
        return '约 ' + days + ' 天';
    }

    function firstActionItem(now) {
        var items = recentItems(window.ZYYC_CONTESTS || [], now);
        return items.filter(function (item) {
            return !item.aggregate && item.state && item.state.nextAt;
        })[0] || items[0] || null;
    }

    function updateNextActionTime(now) {
        if (!lastNextAction || !lastNextAction.state || !lastNextAction.state.nextAt) return;
        document.querySelectorAll('[data-next-relative]').forEach(function (node) {
            setTextIfChanged(node, relativeTime(lastNextAction.state.nextAt, now));
        });
    }

    function renderNextActions(now) {
        var targets = document.querySelectorAll('[data-next-actions]');
        if (!targets.length) return;
        var item = firstActionItem(now);
        lastNextAction = item;
        if (!item) {
            targets.forEach(function (target) {
                setHtmlIfChanged(target,
                    '<p class="next-action-kicker">下一步</p><strong>待补充</strong>' +
                    '<h2>赛事目录</h2><p>近期节点尚未录入，先查看已有真题与复习记录。</p>' +
                    '<div class="next-action-links"><a href="contests.html#practice">查看赛事目录</a>' +
                    '<a href="tools/mistakes.html">复习本地错题</a></div>');
            });
            return;
        }

        var contest = item.contest || {};
        var entry = item.entry || {};
        var state = item.state;
        var href = entryHref(entry) || safeHref(contest.entry && contest.entry.href) || 'contests.html#practice';
        var source = entry.source || contest.source;
        var sourceHref = source && safeHref(source.href);
        var sourceLink = sourceHref
            ? '<a href="' + escapeHtml(sourceHref) + '" target="_blank" rel="noopener noreferrer">核对报名来源</a>'
            : '';
        var dateLine = item.aggregate
            ? '各赛道时间待补充'
            : item.override || item.unscheduled
                ? state.label
                : formatDate(item.node.value) + ' · ' + item.node.label;
        var timeText = item.aggregate
            ? '待补充'
            : item.override || item.unscheduled
                ? '无倒计时'
                : relativeTime(state.nextAt, now);
        var detail = item.aggregate
            ? '先进入通用语言目录与真题资料，等赛道安排核实后再按日期排复习。'
            : (state.detail || contest.summary || '按当前节点安排练习。');
        detail = detailWithoutRepeatedDate(detail, item.node, item);
        var compact = document.body.classList.contains('contests-page');
        if (compact) {
            var compactMarkup = '<p class="next-action-kicker">最紧要节点</p><strong data-next-relative>' +
                escapeHtml(timeText) + '</strong><h2>' + escapeHtml(displayName(entry)) + '</h2>' +
                '<div class="next-action-links"><a href="' + escapeHtml(href) +
                '">进入赛事真题</a>' + sourceLink + '<a href="tools/mistakes.html">复习本地错题</a>' +
                '<a href="contests.html#practice">查看全部赛事</a></div>';
            targets.forEach(function (target) {
                setHtmlIfChanged(target, compactMarkup);
            });
            return;
        }
        var markup = '<p class="next-action-kicker">最紧要节点</p><strong data-next-relative>' +
            escapeHtml(timeText) + '</strong><h2>' + escapeHtml(displayName(entry)) + '</h2>' +
            '<time datetime="' + escapeHtml(item.aggregate || item.override || item.unscheduled ? '' : String(item.node.value)) + '">' +
            escapeHtml(dateLine) + '</time><p>' + escapeHtml(detail) + '</p>' +
            '<div class="next-action-links"><a href="' + escapeHtml(href) + '">进入赛事真题</a>' +
            sourceLink + '<a href="tools/mistakes.html">复习本地错题</a>' +
            '<a href="contests.html#practice">查看全部赛事</a></div>';
        targets.forEach(function (target) {
            setHtmlIfChanged(target, markup);
        });
    }

    function moduleMarkup(module) {
        if (!module) return '';
        var href = safeHref(module.href);
        var label = escapeHtml(module.label || module.name || '资料入口');
        var note = escapeHtml(module.note || module.description || '');
        var status = escapeHtml(module.statusLabel || (module.placeholder ? '待开放' : ''));
        if (!href) {
            return '<div class="contest-link is-disabled"><b>' + label + '</b><span>' +
                (note || '资料待补充') + '</span><em>' + (status || '待补充') + '</em></div>';
        }
        return '<a class="contest-link" href="' + escapeHtml(href) + '"><b>' + label +
            '</b><span>' + note + '</span><em>打开</em></a>';
    }

    function statusForGroup(group, now) {
        var hasTracks = group.entries.some(function (entry) { return !!entry.track; });
        var active = group.entries.map(function (entry) {
            return { entry: entry, state: getState(entry, now) };
        }).filter(function (item) {
            return !item.state.ended;
        });
        var scheduled = active.filter(function (item) {
            return !!item.state.nextAt;
        }).sort(function (left, right) {
            var a = left.state.nextAt ? left.state.nextAt.getTime() : Infinity;
            var b = right.state.nextAt ? right.state.nextAt.getTime() : Infinity;
            return a - b;
        });
        if (scheduled.length) return scheduled[0];
        var overrides = active.filter(function (item) {
            return /^(postponed|cancelled|pending)$/.test(item.state.key);
        });
        if (overrides.length) return overrides[0];
        var unknown = active.filter(function (item) {
            return item.entry.placeholder || item.state.key === 'unknown' || item.state.key === 'placeholder';
        });
        if (unknown.length) {
            return {
                state: {
                    key: 'unknown',
                    label: hasTracks ? '各赛道时间待补充' : '时间待补充',
                    tone: 'upcoming',
                    detail: hasTracks
                        ? '尚未录入可核实的赛道安排。'
                        : '尚未录入可核实的时间。',
                    nextAt: null,
                    ended: false
                }
            };
        }
        return { state: getState(group.entries[0], now) };
    }

    function renderContestModules(now) {
        var target = document.querySelector('[data-contest-modules]');
        var contests = window.ZYYC_CONTESTS;
        if (!target || !Array.isArray(contests) || !contests.length) return;
        var entries = flattenContests(contests, now);
        var groups = groupEntries(entries).filter(function (group) {
            return group.contest && !group.contest.placeholder;
        });
        groups.sort(function (left, right) {
            var leftState = statusForGroup(left, now).state;
            var rightState = statusForGroup(right, now).state;
            var a = leftState.nextAt ? leftState.nextAt.getTime() : Infinity;
            var b = rightState.nextAt ? rightState.nextAt.getTime() : Infinity;
            return a - b;
        });

        var markup = groups.map(function (group) {
            var contest = group.contest;
            var generic = safeHref(contest.entry && contest.entry.href);
            var headTitle = generic
                ? '<a href="' + escapeHtml(generic) + '">' + escapeHtml(contest.name || '未命名赛事') + '</a>'
                : escapeHtml(contest.name || '未命名赛事');
            var groupState = statusForGroup(group, now).state;
            var hasTracks = group.entries.some(function (entry) { return !!entry.track; });
            var regularEntries = group.entries.filter(function (entry) {
                return entry.track && !entry.placeholder;
            });
            var placeholderEntries = group.entries.filter(function (entry) {
                return entry.track && entry.placeholder;
            });
            function trackRow(entry, compact) {
                var track = entry.track || {};
                var trackIndex = group.entries.indexOf(entry);
                var state = getState(entry, now);
                var displayStateLabel = entry.placeholder ? '待补充' : (state.label || '时间待补充');
                var node = nextScheduleNode(entry, state);
                var scheduleText = node
                    ? formatDate(node.value) + ' · ' + node.label
                    : '该赛道时间待补充';
                var trackHref = entry.placeholder ? '' : entryHref(entry);
                var task = taskLabel(entry.task);
                var summary = scheduleSummary(entry);
                if (entry.placeholder) {
                    return '<div class="track-row track-placeholder-row"><div class="track-main"><b>' +
                        escapeHtml(trackDisplayName(track, trackIndex)) +
                        '</b><span>赛道名称、任务与时间待补充</span></div>' +
                        '<span class="portal-state done">待补充</span></div>';
                }
                var links = entry.modules.map(function (module) {
                    var href = safeHref(module && module.href);
                    return href
                        ? '<a href="' + escapeHtml(href) + '">' + escapeHtml(module.label || '赛道资料') + '</a>'
                        : '<span>' + escapeHtml(module && (module.label || module.note) || '资料待补充') + '</span>';
                }).join('');
                return '<div class="track-row' + (compact ? ' is-compact' : '') + '"><div class="track-main">' +
                    (trackHref ? '<a href="' + escapeHtml(trackHref) + '"><b>' +
                        escapeHtml(trackDisplayName(track, trackIndex)) + '</b></a>' : '<b>' +
                        escapeHtml(trackDisplayName(track, trackIndex)) + '</b>') +
                    '<span>' + escapeHtml(task || scheduleText) + '</span>' +
                    (summary ? '<small>' + escapeHtml(summary) + '</small>' : '') +
                    '</div><span class="portal-state ' + escapeHtml(state.tone || 'done') + '">' +
                    escapeHtml(displayStateLabel) + '</span>' +
                    (links ? '<div class="track-links">' + links + '</div>' : '') + '</div>';
            }
            var regularRows = regularEntries.map(function (entry) {
                return trackRow(entry, false);
            }).join('');
            var placeholderRows = placeholderEntries.map(function (entry) {
                return trackRow(entry, true);
            }).join('');
            var placeholderDetails = placeholderRows
                ? '<details class="track-placeholder-details"><summary>' +
                    placeholderEntries.length + ' 个赛道安排待补充</summary>' +
                    '<div class="track-list placeholder-track-list">' + placeholderRows + '</div></details>'
                : '';
            var commonModules = Array.isArray(contest.modules) ? contest.modules : [];
            var commonMarkup = commonModules.length
                ? '<div class="common-resources"><h4>通用备战资料</h4><div class="contest-link-list">' +
                    commonModules.map(moduleMarkup).join('') + '</div></div>'
                : '';
            return '<article class="contest-entry"><div class="contest-entry-head"><div><h3>' +
                headTitle + '</h3><p>' + escapeHtml(contest.domain || '赛事') + ' · ' +
                escapeHtml(contest.summary || '') + '</p></div><span class="portal-state ' +
                escapeHtml(groupState.tone || 'done') + '">' +
                escapeHtml(groupState.label || '时间待补充') + '</span></div>' +
                (regularRows ? '<div class="track-list">' + regularRows + '</div>' : '') +
                placeholderDetails +
                commonMarkup + '<p class="contest-source">来源：' + sourceHtml(contest.source) +
                (groupState.detail ? ' · ' + escapeHtml(groupState.detail) : '') + '</p></article>';
        }).join('');
        setHtmlIfChanged(target, markup);
    }

    function renderContestBadges(now) {
        var nodes = document.querySelectorAll('[data-contest-badge]');
        if (!nodes.length) return;
        var entries = flattenContests(window.ZYYC_CONTESTS || [], now);
        nodes.forEach(function (node) {
            var id = node.getAttribute('data-contest-badge');
            var entry = entries.filter(function (item) {
                return item.contest && item.contest.id === id;
            })[0];
            if (!entry) return;
            var state = getState(entry, now);
            var className = 'portal-state ' + (state.tone || 'done');
            if (node.className !== className) node.className = className;
            setTextIfChanged(node, state.label || '时间待补充');
            if (node.getAttribute('title') !== (state.detail || '')) {
                node.setAttribute('title', state.detail || '');
            }
        });
    }

    function renderSeason() {
        var contests = flattenContests(window.ZYYC_CONTESTS || [], new Date());
        var seasons = contests.map(function (entry) {
            return entry.schedule && entry.schedule.season;
        }).filter(Boolean);
        if (!seasons.length) return;
        var value = String(seasons[0]).replace('-', '–');
        document.querySelectorAll('[data-current-season]').forEach(function (node) {
            setTextIfChanged(node, value);
        });
    }

    function readStorageObject(storage, key, fallback) {
        try {
            var raw = storage.getItem(key);
            if (raw == null || raw === '') return { ok: true, value: fallback };
            var parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                return { ok: false, value: fallback };
            }
            return { ok: true, value: parsed };
        } catch (error) {
            return { ok: false, value: fallback };
        }
    }

    function reviewKey(category, bank, id) {
        return category + ':' + (bank || '') + ':' + id;
    }

    function reviewStatus(review, key, now) {
        var record = review[key] || {};
        var due = Number(record.due || 0);
        var mastered = !!record.mastered;
        if (mastered) return 'mastered';
        if (due && due > now.getTime()) return 'later';
        return 'due';
    }

    function localReviewSummary(now) {
        var storage;
        try {
            storage = window.localStorage;
            storage.length;
        } catch (error) {
            return { available: false, complete: false };
        }

        var complete = true;
        var reviewRead = readStorageObject(storage, 'mistakes.review.v1', {});
        complete = complete && reviewRead.ok;
        var review = reviewRead.value;
        var keys = [];
        var answerKeys = [
            ['c', 'cquiz.ans.v1'],
            ['cpp', 'contest.ans.cpp.v1'],
            ['java', 'contest.ans.java.v1'],
            ['python', 'contest.ans.python.v1']
        ];

        answerKeys.forEach(function (pair) {
            var result = readStorageObject(storage, pair[1], {});
            complete = complete && result.ok;
            Object.keys(result.value).forEach(function (id) {
                var answer = result.value[id];
                if (answer && answer.ok === false) {
                    keys.push(reviewKey('contest', pair[0], id));
                }
            });
        });

        var lanqiaoRead = readStorageObject(storage, 'lq.wrong', {});
        complete = complete && lanqiaoRead.ok;
        Object.keys(lanqiaoRead.value).forEach(function (id) {
            keys.push(reviewKey('lq', '', id));
        });

        var arenaRead = readStorageObject(storage, 'arena.v1', {});
        complete = complete && arenaRead.ok;
        var arenaWrong = arenaRead.value.wrong && typeof arenaRead.value.wrong === 'object'
            ? arenaRead.value.wrong
            : {};
        Object.keys(arenaWrong).forEach(function (id) {
            if (arenaWrong[id]) keys.push(reviewKey('a', '', id));
        });

        if (!complete) {
            return { available: true, complete: false };
        }

        var counts = { due: 0, later: 0, mastered: 0 };
        keys.forEach(function (key) {
            counts[reviewStatus(review, key, now)] += 1;
        });
        return {
            available: true,
            complete: true,
            total: keys.length,
            due: counts.due,
            later: counts.later,
            mastered: counts.mastered
        };
    }

    function renderReviewSummary(now) {
        var target = document.querySelector('[data-review-summary]');
        if (!target) return;
        var message = target.querySelector('[data-review-message]');
        var metrics = target.querySelector('[data-review-metrics]');
        var summary = localReviewSummary(now);

        if (!summary.available) {
            setTextIfChanged(message, '当前浏览器禁止读取本地存储，无法统计复习记录。');
            setHtmlIfChanged(metrics, '<div class="review-metric"><b>—</b><span>本地存储不可用</span></div>');
            return;
        }
        if (!summary.complete) {
            setTextIfChanged(message, '本地记录暂未完整读取，请进入温故集核对。');
            setHtmlIfChanged(metrics, '<div class="review-metric"><b>—</b><span>请进入错题本核对</span></div>');
            return;
        }
        if (!summary.total) {
            setHtmlIfChanged(message, '当前浏览器还没有错题记录。<a href="tools/mistakes.html">进入温故集</a>开始记录。');
            setHtmlIfChanged(metrics, '<div class="review-metric"><b>0</b><span>本地错题</span></div>' +
                '<div class="review-metric"><b>0</b><span>今天复习</span></div>' +
                '<div class="review-metric"><b>0</b><span>已掌握</span></div>');
            return;
        }
        setTextIfChanged(message, '当前浏览器记录了 ' + summary.total + ' 道错题。');
        setHtmlIfChanged(metrics,
            '<div class="review-metric"><b>' + summary.total + '</b><span>本地错题</span></div>' +
            '<div class="review-metric"><b>' + summary.due + '</b><span>今天复习</span></div>' +
            '<div class="review-metric"><b>' + summary.mastered + '</b><span>已掌握</span></div>');
    }

    function normalizeHomeArchiveData(source) {
        var data = source && typeof source === 'object' ? source : {};
        function validItems(items) {
            return Array.isArray(items) ? items.filter(function (item) {
                return item && typeof item === 'object' && (item.id || item.title);
            }) : [];
        }
        return {
            courses: validItems(data.courses),
            contests: validItems(data.contests)
        };
    }

    function courseArchiveCategory(item) {
        var raw = String(item && item.semester || '').trim();
        if (!raw) return '__unknown';
        var lower = raw.toLowerCase();
        if (lower === 'upper' || /上学期/.test(raw) || /(^|[-_ ])upper($|[-_ ])/.test(lower)) return 'upper';
        if (lower === 'lower' || /下学期/.test(raw) || /(^|[-_ ])lower($|[-_ ])/.test(lower)) return 'lower';
        return raw;
    }

    function contestArchiveMonth(item) {
        var raw = String(item && (item.month || item.date || item.eventDate) || '').trim();
        var match = /^(\d{4})[-/.年](\d{1,2})/.exec(raw);
        if (!match) return '__unknown';
        var month = Number(match[2]);
        if (month < 1 || month > 12) return '__unknown';
        return match[1] + '-' + String(month).padStart(2, '0');
    }

    function setupHomeArchives() {
        var root = document.querySelector('[data-home-archives]');
        if (!root) return null;
        var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
        var reduceMotion = !!(motionQuery && motionQuery.matches);

        function categoryLabel(kind, key) {
            if (key === '__unknown') return kind === 'courses' ? '学期待补' : '月份待补';
            if (kind === 'courses' && key === 'upper') return '上学期';
            if (kind === 'courses' && key === 'lower') return '下学期';
            if (kind === 'contests' && /^\d{4}-\d{2}$/.test(key)) {
                return key.slice(0, 4) + ' 年 ' + Number(key.slice(5)) + ' 月';
            }
            return key;
        }

        function profileStatus() {
            var target = root.querySelector('[data-course-major]');
            if (!target) return;
            var major = '';
            try {
                var profile = JSON.parse(localStorage.getItem('zyyc.profile.v1') || '{}');
                major = profile && typeof profile.major === 'string' ? profile.major.trim() : '';
            } catch (error) {
                major = '';
            }
            if (major) {
                target.textContent = '专业已设置 · ' + major;
            } else {
                target.innerHTML = '专业待设置 · <a href="settings.html#profile">前往设置</a>';
            }
        }

        function emptyMarkup(kind) {
            if (kind === 'courses') {
                return '<div class="home-archive-empty"><p>当前没有已核实的课程资料。</p><dl>' +
                    '<div><dt>课程名称</dt><dd>待补充</dd></div>' +
                    '<div><dt>学期</dt><dd>上学期 / 下学期</dd></div>' +
                    '<div><dt>复习提纲</dt><dd>待补充</dd></div>' +
                    '<div><dt>章节与练习</dt><dd>资料待补充</dd></div></dl></div>';
            }
            return '<div class="home-archive-empty"><p>当前没有已核实的未来赛事档案。</p><dl>' +
                '<div><dt>赛事名称</dt><dd>待补充</dd></div>' +
                '<div><dt>比赛月份</dt><dd>按明确月份整理</dd></div>' +
                '<div><dt>通知来源</dt><dd>待补充</dd></div>' +
                '<div><dt>赛程与真题</dt><dd>待核实</dd></div></dl></div>';
        }

        function createPanel(kind, categoryOf) {
            var panel = root.querySelector('[data-archive-panel="' + kind + '"]');
            if (!panel) return null;
            var filters = panel.querySelector('[data-archive-filters]');
            var preview = panel.querySelector('[data-archive-preview]');
            var controls = panel.querySelector('[data-archive-controls]');
            var previous = panel.querySelector('[data-archive-prev]');
            var next = panel.querySelector('[data-archive-next]');
            var count = panel.querySelector('[data-archive-count]');
            var status = panel.querySelector('[data-archive-status]');
            var announcer = panel.querySelector('[data-archive-announcer]');
            if (!filters || !preview || !controls || !previous || !next || !count || !status || !announcer) return null;
            var state = { category: 'all', index: 0, items: [] };
            var allItems = [];
            var timer = null;

            function categories() {
                var seen = {};
                allItems.forEach(function (item) {
                    seen[categoryOf(item)] = (seen[categoryOf(item)] || 0) + 1;
                });
                return Object.keys(seen).sort(function (left, right) {
                    if (left === '__unknown') return 1;
                    if (right === '__unknown') return -1;
                    if (kind === 'courses' && left === 'upper' && right === 'lower') return -1;
                    if (kind === 'courses' && left === 'lower' && right === 'upper') return 1;
                    return left.localeCompare(right, 'zh-CN');
                }).map(function (key) {
                    return { key: key, label: categoryLabel(kind, key), count: seen[key] };
                });
            }

            function clearRotation() {
                if (timer != null) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            function scheduleRotation() {
                clearRotation();
                if (reduceMotion || state.items.length < 2) return;
                timer = window.setInterval(function () {
                    if (document.hidden) return;
                    state.index = (state.index + 1) % state.items.length;
                    paintPreview();
                }, HOME_ARCHIVE_ROTATE_MS);
            }

            function paintPreview() {
                if (!state.items.length) {
                    preview.innerHTML = emptyMarkup(kind);
                    controls.hidden = true;
                    count.textContent = '';
                    return;
                }
                state.index = state.index % state.items.length;
                var item = state.items[state.index];
                var category = categoryLabel(kind, categoryOf(item));
                var href = item.placeholder ? '' : safeHref(item.href);
                var action = href
                    ? '<a class="home-archive-link" href="' + escapeHtml(href) + '">' +
                        (kind === 'courses' ? '查看资料' : '查看赛事') + '</a>'
                    : '<span class="home-archive-pending">' +
                        (kind === 'courses' ? '资料待补充' : '来源与赛程待核实') + '</span>';
                preview.innerHTML = '<article class="home-archive-item" data-archive-item-id="' +
                    escapeHtml(item.id || '') + '"><p class="home-archive-meta">' + escapeHtml(category) +
                    '</p><h4>' + escapeHtml(item.title || '未命名资料') + '</h4><p>' +
                    escapeHtml(item.summary || '说明待补充。') + '</p>' + action + '</article>';
                count.textContent = (state.index + 1) + ' / ' + state.items.length;
                controls.hidden = state.items.length <= 1;
            }

            function announceManual() {
                var current = state.items[state.index];
                announcer.textContent = current && current.title
                    ? '当前预览：' + current.title
                    : '当前分类暂无资料';
            }

            function paintFilters(items) {
                if (items.length <= 1) {
                    filters.hidden = true;
                    filters.innerHTML = '';
                    return;
                }
                filters.hidden = false;
                filters.innerHTML = '<button type="button" data-archive-category="all" aria-pressed="' +
                    (state.category === 'all' ? 'true' : 'false') + '">全部</button>' +
                    items.map(function (item) {
                        return '<button type="button" data-archive-category="' + escapeHtml(item.key) +
                            '" aria-pressed="' + (state.category === item.key ? 'true' : 'false') + '">' +
                            escapeHtml(item.label) + '</button>';
                    }).join('');
            }

            function paint() {
                var items = categories();
                var keys = items.map(function (item) { return item.key; });
                if (state.category !== 'all' && keys.indexOf(state.category) < 0) state.category = 'all';
                paintFilters(items);
                var filtered = allItems.filter(function (item) {
                    return state.category === 'all' || categoryOf(item) === state.category;
                });
                state.items = filtered.slice(0, HOME_ARCHIVE_LIMIT);
                state.index = 0;
                status.textContent = filtered.length ? filtered.length + ' 条' : '待补充';
                paintPreview();
                scheduleRotation();
            }

            filters.addEventListener('click', function (event) {
                var button = event.target.closest('[data-archive-category]');
                if (!button) return;
                state.category = button.getAttribute('data-archive-category') || 'all';
                paint();
                announceManual();
            });
            previous.addEventListener('click', function () {
                if (state.items.length < 2) return;
                state.index = (state.index - 1 + state.items.length) % state.items.length;
                paintPreview();
                announceManual();
                scheduleRotation();
            });
            next.addEventListener('click', function () {
                if (state.items.length < 2) return;
                state.index = (state.index + 1) % state.items.length;
                paintPreview();
                announceManual();
                scheduleRotation();
            });

            return {
                setItems: function (items) {
                    allItems = items.slice();
                    state.category = 'all';
                    paint();
                },
                stop: clearRotation
            };
        }

        var coursePanel = createPanel('courses', courseArchiveCategory);
        var contestPanel = createPanel('contests', contestArchiveMonth);
        function refresh(source) {
            var data = normalizeHomeArchiveData(source);
            profileStatus();
            if (coursePanel) coursePanel.setItems(data.courses);
            if (contestPanel) contestPanel.setItems(data.contests);
        }

        refresh(HOME_ARCHIVE_DATA);
        window.addEventListener('storage', function (event) {
            if (event.key === 'zyyc.profile.v1') profileStatus();
        });
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                if (coursePanel) coursePanel.stop();
                if (contestPanel) contestPanel.stop();
            } else {
                refresh(HOME_ARCHIVE_DATA);
            }
        });
        return { refresh: refresh };
    }

    function setupHomeAiLoop() {
        var root = document.querySelector('[data-home-ai-stage]');
        if (!root) return;
        var question = root.querySelector('[data-home-ai-question]');
        var answer = root.querySelector('[data-home-ai-answer]');
        var answerFull = root.querySelector('[data-home-ai-answer-full]');
        var action = root.querySelector('[data-home-ai-action]');
        var pointer = root.querySelector('[data-home-ai-pointer]');
        var count = root.querySelector('[data-home-ai-count]');
        var label = root.querySelector('[data-home-ai-code-label]');
        var sample = root.querySelector('[data-home-ai-sample]');
        var code = root.querySelector('[data-home-ai-code]');
        if (!question || !answer || !action || !pointer || !count || !label || !sample || !code) return;

        var sceneIndex = 0;
        var timers = [];
        var streamTimer = null;
        var runId = 0;
        var paused = false;
        var inView = true;
        var pageVisible = !document.hidden;
        var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function setPhase(phase) {
            root.setAttribute('data-phase', phase);
        }

        function clearTimers() {
            timers.forEach(function (timer) { window.clearTimeout(timer); });
            timers = [];
            if (streamTimer != null) {
                window.clearInterval(streamTimer);
                streamTimer = null;
            }
        }

        function later(callback, delay) {
            var timer = window.setTimeout(function () {
                timers = timers.filter(function (item) { return item !== timer; });
                callback();
            }, delay);
            timers.push(timer);
        }

        function applyScene(index) {
            var scene = HOME_AI_SCENES[index];
            root.setAttribute('data-scene', String(index));
            count.textContent = (index + 1) + ' / ' + HOME_AI_SCENES.length;
            label.textContent = scene.label;
            sample.textContent = scene.sample;
            code.textContent = scene.code;
            question.textContent = scene.question;
            answer.textContent = '';
            if (answerFull) answerFull.textContent = scene.answer;
            action.setAttribute('data-icon', scene.icon);
        }

        function renderStatic() {
            clearTimers();
            applyScene(0);
            root.classList.remove('is-enhanced');
            root.removeAttribute('data-phase');
            root.setAttribute('data-phase', 'static');
            question.classList.remove('is-visible');
            answer.classList.remove('is-visible', 'is-streaming');
            action.classList.remove('is-gone', 'is-pressed');
            pointer.classList.remove('is-approaching', 'is-gone');
            answer.textContent = HOME_AI_SCENES[0].answer;
        }

        function streamAnswer(scene) {
            var offset = 0;
            var text = scene.answer;
            answer.classList.add('is-visible', 'is-streaming');
            setPhase('streaming');
            streamTimer = window.setInterval(function () {
                offset += 1;
                answer.textContent = text.slice(0, offset);
                if (offset < text.length) return;
                window.clearInterval(streamTimer);
                streamTimer = null;
                answer.textContent = text;
                answer.classList.remove('is-streaming');
                setPhase('hold');
                later(function () {
                    startScene((sceneIndex + 1) % HOME_AI_SCENES.length);
                }, HOME_AI_HOLD_MS);
            }, HOME_AI_STREAM_MS);
        }

        function startScene(index) {
            if (paused || reduceMotion) return;
            clearTimers();
            var startId = ++runId;
            sceneIndex = index;
            applyScene(sceneIndex);
            root.classList.add('is-enhanced');
            question.classList.remove('is-visible');
            answer.classList.remove('is-visible', 'is-streaming');
            action.classList.remove('is-gone', 'is-pressed');
            pointer.classList.remove('is-approaching', 'is-gone');
            setPhase('approach');

            window.requestAnimationFrame(function () {
                if (paused || startId !== runId) return;
                pointer.classList.add('is-approaching');
                later(function () {
                    if (paused || startId !== runId) return;
                    action.classList.add('is-pressed');
                    later(function () {
                        if (paused || startId !== runId) return;
                        action.classList.add('is-gone');
                        pointer.classList.add('is-gone');
                        question.classList.add('is-visible');
                        setPhase('question');
                        later(function () {
                            if (paused || startId !== runId) return;
                            streamAnswer(HOME_AI_SCENES[sceneIndex]);
                        }, 300);
                    }, 150);
                }, 680);
            });
        }

        function syncPauseState() {
            var nextPaused = !pageVisible || !inView;
            if (nextPaused === paused) return;
            paused = nextPaused;
            if (paused) {
                runId += 1;
                clearTimers();
                setPhase('paused');
            } else {
                startScene(sceneIndex);
            }
        }

        if (reduceMotion) {
            renderStatic();
            return;
        }

        startScene(0);
        document.addEventListener('visibilitychange', function () {
            pageVisible = !document.hidden;
            syncPauseState();
        });
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                inView = !!(entries[0] && entries[0].isIntersecting);
                syncPauseState();
            }, { threshold: .15 });
            observer.observe(root);
        }
    }

    function setupAiDemo() {
        var root = document.querySelector('[data-ai-demo]');
        if (!root) return;
        var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"][data-demo-key]'));
        var panels = Array.prototype.slice.call(root.querySelectorAll('[data-demo-panel]'));
        if (!tabs.length || !panels.length) return;

        function clearTargets() {
            root.querySelectorAll('.is-demo-focus').forEach(function (node) {
                node.classList.remove('is-demo-focus');
            });
        }

        function markTargets(key) {
            clearTargets();
            var map = {
                hint: ['demo-index', 'demo-sample'],
                why: ['demo-index'],
                check: ['demo-sample']
            };
            (map[key] || []).forEach(function (name) {
                root.querySelectorAll('[data-demo-target="' + name + '"]').forEach(function (node) {
                    node.classList.add('is-demo-focus');
                });
            });
        }

        function selectTab(key, focusTab) {
            tabs.forEach(function (tab) {
                var selected = tab.getAttribute('data-demo-key') === key;
                tab.setAttribute('aria-selected', selected ? 'true' : 'false');
                tab.setAttribute('tabindex', selected ? '0' : '-1');
                if (selected && focusTab) tab.focus();
            });
            panels.forEach(function (panel) {
                var active = panel.getAttribute('data-demo-panel') === key;
                if (active) {
                    panel.hidden = false;
                    panel.classList.add('is-entering');
                    window.requestAnimationFrame(function () {
                        window.requestAnimationFrame(function () {
                            panel.classList.remove('is-entering');
                        });
                    });
                    var more = panel.querySelector('[data-demo-more]');
                    var morePanel = panel.querySelector('[data-demo-more-panel]');
                    if (more) {
                        more.setAttribute('aria-expanded', 'false');
                        more.textContent = '再提示一步';
                    }
                    if (morePanel) morePanel.hidden = true;
                } else {
                    panel.hidden = true;
                }
            });
            markTargets(key);
        }

        tabs.forEach(function (tab, index) {
            tab.addEventListener('click', function () {
                selectTab(tab.getAttribute('data-demo-key'), false);
            });
            tab.addEventListener('keydown', function (event) {
                var next = null;
                if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
                if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
                if (event.key === 'Home') next = 0;
                if (event.key === 'End') next = tabs.length - 1;
                if (next == null) return;
                event.preventDefault();
                selectTab(tabs[next].getAttribute('data-demo-key'), true);
            });
        });

        root.querySelectorAll('[data-demo-more]').forEach(function (button) {
            button.addEventListener('click', function () {
                var panel = button.closest('[data-demo-panel]');
                var morePanel = panel && panel.querySelector('[data-demo-more-panel]');
                if (!morePanel) return;
                var open = morePanel.hidden;
                morePanel.hidden = !open;
                button.setAttribute('aria-expanded', open ? 'true' : 'false');
                button.textContent = open ? '收起这一步' : '再提示一步';
            });
        });

        selectTab('hint', false);
    }

    function render(now) {
        var current = now instanceof Date ? now : new Date();
        renderSeason();
        renderRecentEvents(current);
        renderNextActions(current);
        renderContestModules(current);
        renderContestBadges(current);
        renderReviewSummary(current);
        updateNextActionTime(current);
    }

    var lastScheduleRefresh = 0;
    function refreshSchedule() {
        var now = new Date();
        if (now.getTime() - lastScheduleRefresh < 1000) return;
        lastScheduleRefresh = now.getTime();
        render(now);
    }

    function boot() {
        homeArchiveController = setupHomeArchives();
        setupHomeAiLoop();
        setupAiDemo();
        render(new Date());
        window.setInterval(function () {
            render(new Date());
        }, MINUTE);
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) refreshSchedule();
        });
    }

    window.ZYYCPortal = {
        getState: getState,
        sortContests: sortContests,
        flattenContests: flattenContests,
        formatDate: formatDate,
        reviewStatus: reviewStatus,
        localReviewSummary: localReviewSummary,
        refreshHomeArchives: function (data) {
            if (data) HOME_ARCHIVE_DATA = data;
            if (homeArchiveController) homeArchiveController.refresh(HOME_ARCHIVE_DATA);
        },
        refresh: refreshSchedule
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
