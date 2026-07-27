(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const nav = document.getElementById("nav");
  const progress = document.getElementById("progress");
  const counter = document.getElementById("slide-counter");
  let i = 0;
  let liveResultsTimer = null;

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
    if (slide.dataset.role === "live-results") startLiveResults(slide);
  }
  function onLeave(slide) {
    // leaving the shield slide re-arms it, so stepping back shows the dark room
    if (slide.classList.contains("uv-reveal")) slide.classList.remove("lit");
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
