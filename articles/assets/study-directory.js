(() => {
    const root = document.querySelector("[data-study-directory]");
    if (!root) return;

    const tools = root.querySelector("#studyDirectoryTools");
    const search = root.querySelector("#studyDirectorySearch");
    const status = root.querySelector("#studyDirectoryStatus");
    const empty = root.querySelector("#studyDirectoryEmpty");
    const clear = root.querySelector("#studyDirectoryClear");
    const filterButtons = [...root.querySelectorAll("[data-study-topic]")];
    const entries = [...root.querySelectorAll("[data-study-item]")].map((item) => ({
        item,
        topic: item.dataset.topic || "",
        text: normalize(`${item.dataset.search || ""} ${item.textContent || ""}`),
    }));

    let activeTopic = "all";

    function normalize(value) {
        return value
            .normalize("NFKC")
            .toLocaleLowerCase("zh-CN")
            .replace(/\s+/g, " ")
            .trim();
    }

    function render() {
        const query = normalize(search.value);
        let visibleCount = 0;

        entries.forEach(({ item, topic, text }) => {
            const visible = (activeTopic === "all" || topic === activeTopic)
                && (!query || text.includes(query));
            item.hidden = !visible;
            if (visible) visibleCount += 1;
        });

        filterButtons.forEach((button) => {
            button.setAttribute("aria-pressed", String(button.dataset.studyTopic === activeTopic));
        });

        empty.hidden = visibleCount !== 0;
        const topicName = filterButtons.find((button) => button.dataset.studyTopic === activeTopic)?.textContent || "全部";
        status.textContent = query
            ? `${visibleCount} 条结果 · 关键词“${search.value.trim()}”`
            : `${visibleCount} 条教程 · ${topicName}`;
    }

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            activeTopic = button.dataset.studyTopic || "all";
            render();
        });
    });

    search.addEventListener("input", render);
    search.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !search.value) return;
        search.value = "";
        render();
    });

    clear.addEventListener("click", () => {
        search.value = "";
        activeTopic = "all";
        render();
        search.focus();
    });

    tools.hidden = false;
    render();
})();
