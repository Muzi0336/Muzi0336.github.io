/* Portal-side rendering for the homepage and aggregate pages. */
(function () {
    'use strict';

    var API = window.ContestSchedule || null;
    var MINUTE = 60000;
    var stateTones = {
        open: 'open',
        active: 'active',
        accent: 'open',
        urgent: 'urgent',
        neutral: 'upcoming',
        muted: 'ended',
        registering: 'open',
        competing: 'active',
        examday: 'urgent',
        pending: 'upcoming',
        preparation: 'upcoming',
        preparing: 'upcoming',
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
            label: contest && contest.placeholder ? '赛程待公布' : '时间信息暂不可用',
            tone: 'done',
            detail: contest && contest.placeholder
                ? '该赛事尚未开放入口，赛程以主办方后续通知为准。'
                : '赛程同步暂未加载，请以官网或校内通知为准。',
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
                        label: state.label || '时间信息暂不可用',
                        tone: stateTones[state.tone] || stateTones[state.key] || state.tone || 'done',
                        detail: state.detail || '',
                        nextAt: state.nextAt || null,
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

    function isPureDate(value) {
        return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
    }

    function nextScheduleNode(contest, state) {
        var schedule = contest && contest.schedule ? contest.schedule : {};
        var key = state && state.key;
        var value;

        function node(field, label) {
            value = schedule[field];
            return value ? { value: value, label: label } : null;
        }

        if (key === 'upcoming') {
            return node('registrationStart', '报名开始');
        }
        if (key === 'registering') {
            return node('registrationEnd', '报名截止');
        }
        if (key === 'examday') {
            return node('examDate', '比赛日') ||
                (isPureDate(schedule.examStart) ? node('examStart', '比赛日') : null) ||
                node('examStart', '比赛开始');
        }
        if (key === 'preparing') {
            return node('examStart', isPureDate(schedule.examStart) ? '比赛日' : '比赛开始') ||
                node('examDate', '比赛日') ||
                node('examEnd', isPureDate(schedule.examEnd) ? '比赛日' : '比赛结束');
        }
        if (key === 'competing' || key === 'pending') {
            return node('examEnd', isPureDate(schedule.examEnd) ? '比赛日' : '比赛结束') ||
                node('examDate', '比赛日');
        }
        if (key === 'closed') {
            return node('examDate', '比赛日') ||
                (isPureDate(schedule.examStart) ? node('examStart', '比赛日') : null) ||
                node('examStart', '比赛开始');
        }
        return null;
    }

    function renderRecentEvents(now) {
        var targets = document.querySelectorAll('[data-recent-events]');
        if (!targets.length) return;
        var contests = sortContests(window.ZYYC_CONTESTS || [], now);
        var items = [];

        contests.forEach(function (contest) {
            if (!contest || contest.placeholder) return;
            var state = getState(contest, now);
            if (state.ended || state.key === 'placeholder') return;
            var node = nextScheduleNode(contest, state);
            if (!node) return;
            items.push({ contest: contest, state: state, node: node });
        });

        targets.forEach(function (target) {
            var limit = Number(target.getAttribute('data-limit')) || 3;
            var list = items.slice(0, limit);
            var emptyText = target.getAttribute('data-empty') ||
                '暂时没有可显示的近期赛程。先进入真题、算法专项或错题复习，等待赛事信息更新。';
            if (!list.length) {
                target.innerHTML = '<div class="portal-empty">' + escapeHtml(emptyText) + '</div>';
                return;
            }
            target.innerHTML = '<div class="feed-list">' + list.map(function (item) {
                var contest = item.contest;
                var state = item.state;
                var node = item.node;
                var dateLabel = formatDate(node.value);
                var verifiedAt = contest.schedule && contest.schedule.verifiedAt;
                var verifiedText = verifiedAt
                    ? '原资料整理于 ' + formatDate(verifiedAt) + '，非实时核验。'
                    : '原资料整理日期待补充，非实时核验。';
                var entryHref = safeHref(contest.entry && contest.entry.href);
                var title = entryHref
                    ? '<a class="portal-link" href="' + escapeHtml(entryHref) + '">' + escapeHtml(contest.name || '未命名赛事') + '</a>'
                    : escapeHtml(contest.name || '未命名赛事');
                return '<article class="feed-row">' +
                    '<div class="feed-date"><b>' + escapeHtml(dateLabel) + '</b><span>' +
                    escapeHtml(node.label) + '</span><small class="feed-verified">' +
                    escapeHtml(verifiedText) + '</small></div>' +
                    '<div class="feed-main"><h3>' + title + '</h3>' +
                    '<p>' + escapeHtml(state.detail || contest.summary || '赛程详情待更新。') + '</p></div>' +
                    '<div class="feed-side"><span class="portal-state ' + escapeHtml(state.tone || 'done') + '">' +
                    escapeHtml(state.label || '时间信息暂不可用') + '</span><span class="feed-source">来源：' +
                    sourceHtml(contest.source) + '</span></div>' +
                    '</article>';
            }).join('') + '</div>';
        });
    }

    function moduleLinks(contest) {
        if (contest.placeholder) {
            return '<div class="module-source">该赛事入口与赛程尚在整理，暂不可进入。</div>';
        }
        var modules = Array.isArray(contest.modules) ? contest.modules : [];
        var entry = contest.entry || {};
        var links = modules.map(function (module) {
            var href = safeHref(module && module.href);
            if (!href) return '';
            return '<a class="module-link" href="' + escapeHtml(href) + '">' +
                '<b>' + escapeHtml(module.label || '内容入口') + '</b>' +
                '<span>' + escapeHtml(module.note || '进入该模块') + '</span></a>';
        }).filter(Boolean);
        var entryHref = safeHref(entry.href);
        if (entryHref && !links.length) {
            links.push('<a class="module-link" href="' + escapeHtml(entryHref) + '">' +
                '<b>' + escapeHtml(entry.label || '进入备考') + '</b><span>查看已收录内容</span></a>');
        }
        return '<div class="module-links">' + links.join('') +
            '<div class="module-source">来源：' + sourceHtml(contest.source) +
            ' · 日期按已有资料整理，不是实时查询。</div></div>';
    }

    function renderContestModules(now) {
        var target = document.querySelector('[data-contest-modules]');
        var contests = window.ZYYC_CONTESTS;
        if (!target || !Array.isArray(contests) || !contests.length) return;
        var sorted = sortContests(contests, now);
        target.innerHTML = sorted.map(function (contest) {
            var state = getState(contest, now);
            var entryHref = safeHref(contest.entry && contest.entry.href);
            var title = entryHref
                ? '<a class="portal-link" href="' + escapeHtml(entryHref) + '">' + escapeHtml(contest.name || '未命名赛事') + '</a>'
                : escapeHtml(contest.name || '未命名赛事');
            return '<article class="contest-module">' +
                '<div class="contest-module-head"><h3>' + title + '</h3>' +
                '<p>' + escapeHtml(contest.domain || '赛事内容') + ' · ' +
                escapeHtml(contest.summary || '内容摘要待补充。') + '</p>' +
                '<div class="contest-module-state"><span class="portal-state ' +
                escapeHtml(state.tone || 'done') + '">' + escapeHtml(state.label || '时间信息暂不可用') +
                '</span><small>' + escapeHtml(state.detail || contest.status || '') + '</small></div></div>' +
                moduleLinks(contest) + '</article>';
        }).join('');
    }

    function renderContestBadges(now) {
        var nodes = document.querySelectorAll('[data-contest-badge]');
        if (!nodes.length) return;
        var contests = Array.isArray(window.ZYYC_CONTESTS) ? window.ZYYC_CONTESTS : [];
        nodes.forEach(function (node) {
            var id = node.getAttribute('data-contest-badge');
            var contest = contests.filter(function (item) { return item.id === id; })[0];
            if (!contest) return;
            var state = getState(contest, now);
            node.className = 'portal-state ' + (state.tone || 'done');
            node.textContent = state.label || '时间信息暂不可用';
            node.setAttribute('title', state.detail || '');
        });
    }

    function formatClock(date) {
        try {
            return new Intl.DateTimeFormat('zh-CN', {
                timeZone: 'Asia/Shanghai',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).format(date).replace(/\//g, '.');
        } catch (error) {
            return date.toLocaleString('zh-CN');
        }
    }

    function renderClocks() {
        var now = new Date();
        document.querySelectorAll('[data-device-clock]').forEach(function (node) {
            node.textContent = now.toLocaleString('zh-CN', { hour12: false });
        });
        document.querySelectorAll('[data-beijing-clock]').forEach(function (node) {
            node.textContent = formatClock(now);
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
            if (message) message.textContent = '当前浏览器禁止读取本地存储，无法统计复习记录。';
            if (metrics) metrics.innerHTML = '<div class="review-metric"><b>—</b><span>本地存储不可用</span></div>';
            return;
        }
        if (!summary.complete) {
            if (message) message.textContent = '本地记录存在，但部分键无法完整解析。为避免误报，这里不显示到期数量。';
            if (metrics) metrics.innerHTML = '<div class="review-metric"><b>—</b><span>请进入错题本核对</span></div>';
            return;
        }
        if (!summary.total) {
            if (message) message.textContent = '当前浏览器还没有本地错题记录。';
            if (metrics) {
                metrics.innerHTML = '<div class="review-metric"><b>0</b><span>本地错题</span></div>' +
                    '<div class="review-metric"><b>0</b><span>今天复习</span></div>' +
                    '<div class="review-metric"><b>0</b><span>已掌握</span></div>';
            }
            return;
        }
        if (message) {
            message.textContent = '按本地错题记录读到 ' + summary.total + ' 道；这是当前浏览器的记录摘要，不代表完整题库统计。';
        }
        if (metrics) {
            metrics.innerHTML =
                '<div class="review-metric"><b>' + summary.total + '</b><span>本地错题</span></div>' +
                '<div class="review-metric"><b>' + summary.due + '</b><span>今天复习</span></div>' +
                '<div class="review-metric"><b>' + summary.mastered + '</b><span>已掌握</span></div>';
        }
    }

    function render(now) {
        var current = now instanceof Date ? now : new Date();
        renderRecentEvents(current);
        renderContestModules(current);
        renderContestBadges(current);
        renderReviewSummary(current);
        renderClocks();
    }

    var lastScheduleRefresh = 0;
    function refreshSchedule() {
        var now = new Date();
        if (now.getTime() - lastScheduleRefresh < 1000) return;
        lastScheduleRefresh = now.getTime();
        render(now);
    }

    function boot() {
        render(new Date());
        window.setInterval(function () {
            render(new Date());
        }, MINUTE);
        window.setInterval(renderClocks, 1000);
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) refreshSchedule();
        });
    }

    window.ZYYCPortal = {
        getState: getState,
        sortContests: sortContests,
        formatDate: formatDate,
        reviewStatus: reviewStatus,
        localReviewSummary: localReviewSummary,
        refresh: refreshSchedule
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
