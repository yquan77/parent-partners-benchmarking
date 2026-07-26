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

  function next() { go(i + 1); }
  function prev() { go(i - 1); }

  // ---- per-slide enter/leave behaviour --------------------------------
  function onEnter(slide) {
    if (slide.querySelector(".stat-num[data-count-to]")) animateCounts(slide);
    if (slide.classList.contains("uv-reveal")) triggerReveal(slide);
    if (slide.dataset.role === "live-results") startLiveResults(slide);
  }
  function onLeave(slide) {
    if (slide.dataset.role === "live-results" && liveResultsTimer) {
      clearInterval(liveResultsTimer);
      liveResultsTimer = null;
    }
  }

  function animateCounts(slide) {
    slide.querySelectorAll(".stat-num[data-count-to]").forEach((el) => {
      const to = parseInt(el.dataset.countTo, 10);
      const dur = 900;
      const start = performance.now();
      function frame(t) {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * to);
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  // lights-out → UV flash → afterglow, layered over the full-bleed photo
  function triggerReveal(slide) {
    if (slide.dataset.lit === "1") return;
    slide.dataset.lit = "1";
    setTimeout(() => slide.classList.add("lit"), 1400);
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
