(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const nav = document.getElementById("nav");
  const progress = document.getElementById("progress");
  const counter = document.getElementById("slide-counter");
  let i = 0;
  let liveResultsTimer = null;
  let splitTimer = null;

  slides.forEach((_, idx) => {
    const dot = document.createElement("div");
    dot.className = "dot";
    dot.addEventListener("click", () => go(idx));
    nav.appendChild(dot);
  });
  const dots = Array.from(nav.children);

  function go(idx) {
    if (idx < 0 || idx >= slides.length || idx === i) return;
    slides[i].classList.remove("active");
    onLeave(slides[i]);
    i = idx;
    slides[i].classList.add("active");
    onEnter(slides[i]);
    dots.forEach((d, n) => d.classList.toggle("on", n === i));
    progress.style.width = `${((i + 1) / slides.length) * 100}%`;
    counter.textContent = `${i + 1} / ${slides.length}`;
    history.replaceState(null, "", `#${i + 1}`);
  }

  // The UV-shield slide swallows the FIRST "next": that press turns the lamp
  // on. The second press actually advances. That way the "啪" happens exactly
  // when the speaker says it, instead of on a timer he cannot catch up with.
  function next() {
    const cur = slides[i];
    if (cur.classList.contains("uv-reveal") && !cur.classList.contains("lit")) {
      cur.classList.add("lit");
      return;
    }
    go(i + 1);
  }
  function prev() { go(i - 1); }

  // ---- per-slide enter/leave behaviour --------------------------------
  function onEnter(slide) {
    if (slide.querySelector("[data-count-to]")) animateCounts(slide);
    if (slide.querySelector("[data-count]")) buildPeople(slide);
    if (slide.classList.contains("ratio-split")) armRatioSplit(slide);
    if (slide.dataset.role === "live-results") startLiveResults(slide);
  }
  function onLeave(slide) {
    // leaving the shield slide re-arms it, so stepping back shows the dark room
    if (slide.classList.contains("uv-reveal")) slide.classList.remove("lit");
    // same idea on the ratio slide: rewind it to the 1:35 row so it can replay
    if (slide.classList.contains("ratio-split")) resetRatioSplit(slide);
    if (slide.dataset.role === "live-results" && liveResultsTimer) {
      clearInterval(liveResultsTimer);
      liveResultsTimer = null;
    }
  }

  function animateCounts(slide) {
    slide.querySelectorAll("[data-count-to]").forEach((el) => {
      const to = parseInt(el.dataset.countTo, 10);
      // keep any trailing unit mark (位 / 场 / 人次) and only re-write the digits
      const unit = el.querySelector(".unit, .t-unit");
      const dur = 900;
      const start = performance.now();
      function frame(t) {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const n = String(Math.round(eased * to));
        if (unit) el.firstChild.nodeValue = n;
        else el.textContent = n;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  // ---- the deck's one people-icon component ---------------------------
  // <div class="people-icons" data-count="12"> → 12 identical little figures
  // that pop in one after another. Written once here so 起点5位 / 团队5→12 /
  // 三年278人次 are literally the same glyph at three different scales.
  //   data-step  : seconds between two figures (defaults: dense fields faster)
  //   data-delay : when the first figure appears
  const FIG =
    '<circle cx="12" cy="6.6" r="5.4"/>' +
    '<path d="M3.2 34V23.4C3.2 18 7.1 14.2 12 14.2s8.8 3.8 8.8 9.2V34Z"/>';

  function buildPeople(slide) {
    slide.querySelectorAll("[data-count]").forEach((box) => {
      if (box.dataset.built) return;
      box.dataset.built = "1";
      const n = parseInt(box.dataset.count, 10) || 0;
      const step = parseFloat(box.dataset.step || (n > 40 ? 0.008 : 0.075));
      const base = parseFloat(box.dataset.delay || 0.18);
      let html = "";
      for (let k = 0; k < n; k++) {
        html +=
          `<svg class="p-fig" viewBox="0 0 24 34" fill="currentColor" ` +
          `style="--d:${(base + k * step).toFixed(3)}s" aria-hidden="true">${FIG}</svg>`;
      }
      box.innerHTML = html;
    });
  }

  // ---- 师生比那一页：1:35 → 7 组 1:5 的拆分动作 -----------------------
  // 演出分两拍，但不用讲者按键：进场只有上面那一整排 35 人（暗色），
  // 停顿 DWELL 之后自己拆开。拆的时候不换页、也不重建 icon——
  // 是同一批 <svg> 节点被搬进七个组里，再用 FLIP 让它们「跑」过去。
  const RATIO_DWELL = 2400;   // 讲完「我一个人对着一整班」大概就是这么久
  const RATIO_MOVE = 480;     // 位移本身：够慢才有分量，再慢就拖

  function armRatioSplit(slide) {
    const row = slide.querySelector(".band-row");
    if (!row) return;
    if (!row.dataset.pristine) row.dataset.pristine = row.innerHTML; // 供回翻时还原
    if (splitTimer) clearTimeout(splitTimer);
    splitTimer = setTimeout(() => { splitTimer = null; splitRatio(slide); }, RATIO_DWELL);
  }

  function resetRatioSplit(slide) {
    if (splitTimer) { clearTimeout(splitTimer); splitTimer = null; }
    slide.classList.remove("split");
    const row = slide.querySelector(".band-row");
    if (row && row.dataset.pristine) row.innerHTML = row.dataset.pristine;
  }

  function splitRatio(slide) {
    const row = slide.querySelector(".band-row");
    const whole = row.querySelector(".ug-whole");
    const parts = Array.from(row.querySelectorAll(".ug-part"));
    if (!whole || parts.length !== 7) return;
    const kids = Array.from(whole.querySelectorAll(".people-icons--kid .p-fig"));
    const lead = whole.querySelector(".people-icons--adult .p-fig");
    if (kids.length !== 35) return;

    // FIRST：搬家前的位置
    const movers = lead ? kids.concat([lead]) : kids;
    const first = movers.map((el) => el.getBoundingClientRect());

    // 搬家：同一批节点换爸爸，不销毁重建，位移才连贯。
    // 那一位大人也一起飞——他成为第一组的大人，另外六位才是新 pop 出来的。
    parts.forEach((g, gi) => {
      const box = g.querySelector(".people-icons--kid");
      for (let k = 0; k < 5; k++) box.appendChild(kids[gi * 5 + k]);
    });
    if (lead) {
      const slot = parts[0].querySelector(".people-icons--adult");
      slot.innerHTML = "";              // 换掉第一组那位预生成的大人，免得站两个
      slot.appendChild(lead);
    }
    slide.classList.add("split");   // 七组现身 + 标题换行 + 整排收起

    // LAST：搬家后的位置 → 先反向 translate 钉回原处，看起来还没动
    const last = movers.map((el) => el.getBoundingClientRect());
    movers.forEach((el, n) => {
      el.classList.add("flying");
      el.style.transition = "none";
      el.style.transform =
        `translate(${first[n].left - last[n].left}px, ${first[n].top - last[n].top}px)`;
      // 颜色/透明度也要从「暗色的旧样子」起跑，不然一搬家就瞬间亮了
      el.style.opacity = el === lead ? "1" : "0.6";
      if (el !== lead) el.style.color = "#7E7361";
    });
    void row.offsetWidth;   // 强制 reflow，让上面那一帧真的成立

    // PLAY：放行。同一组的五个孩子几乎一起走，组与组之间错开一点，
    // 读起来是「一组一组跑进去」，不是三十五个各走各的。
    movers.forEach((el, n) => {
      const d = el === lead ? 0 : 30 + Math.floor(n / 5) * 55 + (n % 5) * 16;
      el.style.transition =
        `transform ${RATIO_MOVE}ms cubic-bezier(.22,1.28,.32,1) ${d}ms,` +
        `opacity ${RATIO_MOVE}ms ease ${d}ms, color ${RATIO_MOVE}ms ease ${d}ms`;
      el.style.transform = "none";
      el.style.opacity = "1";
      el.style.color = "";
    });
  }

  async function startLiveResults(slide) {
    const avgEl = slide.querySelector(".live-avg");
    const starsEl = slide.querySelector(".live-stars");
    const countEl = slide.querySelector(".live-count");
    async function tick() {
      try {
        const { count, avg } = await Ratings.summary();
        avgEl.textContent = count ? avg.toFixed(1) : "—";
        starsEl.textContent = "★".repeat(Math.round(avg)) + "☆".repeat(5 - Math.round(avg));
        countEl.textContent = count ? `${count} 位老师已投票` : "等待第一票…";
      } catch (e) {
        countEl.textContent = "连线中…（请确认网络）";
      }
    }
    tick();
    liveResultsTimer = setInterval(tick, 2500);
  }

  // ---- controls ---------------------------------------------------------
  document.getElementById("tap-prev").addEventListener("click", prev);
  document.getElementById("tap-next").addEventListener("click", next);
  window.addEventListener("keydown", (e) => {
    if (["ArrowRight", " ", "PageDown"].includes(e.key)) { next(); e.preventDefault(); }
    if (["ArrowLeft", "PageUp"].includes(e.key)) { prev(); e.preventDefault(); }
  });
  let touchX = null;
  window.addEventListener("touchstart", (e) => touchX = e.touches[0].clientX);
  window.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60) dx < 0 ? next() : prev();
    touchX = null;
  });

  // deep-link support (#3 opens slide 3)
  const hashIdx = parseInt(location.hash.replace("#", ""), 10);
  const startAt = Number.isInteger(hashIdx) ? Math.min(Math.max(hashIdx - 1, 0), slides.length - 1) : 0;

  slides[startAt].classList.add("active");
  dots[startAt].classList.add("on");
  progress.style.width = `${((startAt + 1) / slides.length) * 100}%`;
  counter.textContent = `${startAt + 1} / ${slides.length}`;
  i = startAt;
  onEnter(slides[startAt]);
})();
