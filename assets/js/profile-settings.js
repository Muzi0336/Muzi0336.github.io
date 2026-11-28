/* 学习偏好：与 AI 配置、错题记录分离，只维护本机专业字段。 */
(function () {
    'use strict';

    var PROFILE_KEY = 'zyyc.profile.v1';
    var MAX_MAJOR_LENGTH = 80;
    var majorInput = document.getElementById('profileMajor');
    var saveButton = document.getElementById('profileSave');
    var clearButton = document.getElementById('profileClear');
    var statusElement = document.getElementById('profileStatus');

    if (!majorInput || !saveButton || !clearButton || !statusElement) return;

    function setStatus(message, kind) {
        statusElement.textContent = message || '';
        statusElement.className = 'set-test-status ' + (kind || '');
    }

    function getStorage() {
        try {
            return window.localStorage;
        } catch (error) {
            return null;
        }
    }

    function storageUnavailable() {
        setStatus('专业信息不可用：浏览器禁止或无法写入 localStorage。', 'bad');
    }

    function readProfile(storage) {
        var raw;
        try {
            raw = storage.getItem(PROFILE_KEY);
        } catch (error) {
            return { ok: false, reason: 'storage' };
        }

        if (raw === null || raw === '') {
            return { ok: true, value: {} };
        }

        try {
            var parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('profile is not an object');
            }
            return { ok: true, value: parsed };
        } catch (error) {
            return { ok: false, reason: 'json' };
        }
    }

    function profileReadError(reason) {
        if (reason === 'storage') {
            storageUnavailable();
            return;
        }
        setStatus('专业信息读取失败：本机数据不是有效的对象 JSON。为保护其他资料，当前没有覆盖它。', 'bad');
    }

    function writeMajor(storage, profile, major) {
        var next = Object.assign({}, profile, { major: major });
        try {
            storage.setItem(PROFILE_KEY, JSON.stringify(next));
            return true;
        } catch (error) {
            storageUnavailable();
            return false;
        }
    }

    function normalizeMajor() {
        return majorInput.value.trim().slice(0, MAX_MAJOR_LENGTH);
    }

    function saveMajor() {
        var storage = getStorage();
        if (!storage) {
            storageUnavailable();
            return;
        }

        var result = readProfile(storage);
        if (!result.ok) {
            profileReadError(result.reason);
            return;
        }

        var major = normalizeMajor();
        if (!writeMajor(storage, result.value, major)) return;
        majorInput.value = major;
        setStatus(major ? '已保存专业到当前浏览器。' : '专业为空，已清除本机专业信息。', 'ok');
    }

    function clearMajor() {
        var storage = getStorage();
        if (!storage) {
            storageUnavailable();
            return;
        }

        var result = readProfile(storage);
        if (!result.ok) {
            profileReadError(result.reason);
            return;
        }

        if (!writeMajor(storage, result.value, '')) return;
        majorInput.value = '';
        setStatus('已清除专业，其他本机设置保持不变。', 'ok');
    }

    var storage = getStorage();
    if (!storage) {
        storageUnavailable();
        return;
    }

    var loaded = readProfile(storage);
    if (!loaded.ok) {
        profileReadError(loaded.reason);
    } else {
        var loadedMajor = typeof loaded.value.major === 'string'
            ? loaded.value.major.slice(0, MAX_MAJOR_LENGTH)
            : '';
        majorInput.value = loadedMajor;
        if (loadedMajor) setStatus('已载入本机保存的专业。', 'ok');
    }

    saveButton.addEventListener('click', saveMajor);
    clearButton.addEventListener('click', clearMajor);
})();
