(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const nav = document.getElementById("nav");
  const progress = document.getElementById("progress");
  const counter = document.getElementById("slide-counter");
  let i = 0;
  let liveResultsTimer = null;
  let slideHeartbeat = null;

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
    syncCurrentSlide(i);
  }

  // Keep the Malay companion page aligned with the presenter. This is
  // intentionally fire-and-forget: a weak venue connection must never delay
  // slide navigation. The heartbeat also refreshes `updated_at` while the
  // presenter is speaking on a longer slide.
  function syncCurrentSlide(idx) {
    if (!window.SlideSync) return;
    void SlideSync.update(idx).catch(() => {});
  }

  // The UV-shield slide swallows the FIRST "next": that press turns the lamp
  // on. The second press actually advances. That way the "啪" happens exactly
  // when the speaker says it, instead of on a timer he cannot catch up with.
  function next() {
    const cur = slides[i];
    // The ratio slide also uses presenter-controlled timing. First "next"
    // starts the 1:35 → seven groups animation and stays on the slide.
    // Ignore an accidental second press while the clones are still moving;
    // once they have landed, the next press advances normally.
    if (cur.classList.contains("ratio-split")) {
      if (!cur.classList.contains("split")) {
        splitRatio(cur);
        return;
      }
      if (!cur.classList.contains("landed")) return;
    }
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

  // ---- 师生比那一页：1:35 → 7 组 1:5 的分身动作 -----------------------
  // 由讲者第一次按「下一页」触发。两排从头到尾都占着版面：
  //   初始只显示 1:35、一位老师与 35 个学生；
  //   触发后七个框与七位家长先出现，然后学生才开始分流；
  //   上排 35 个原身**留在原地**，只是慢慢褪成灰（人还在，这里剩影子）；
  //   同时替每一个原身克隆一个分身，从原身的位置平滑 morph 到下面
  //   七个虚框里的落点（每框五个）。分身到位 → 框里本来透明的那五个
  //   icon 显形、克隆体撤走，最终留下的是正常文档流，不是一堆绝对定位。
  // ⚠️ 之前做过「把原节点搬下去」的版本，被否决了：上排一空掉，
  //    读起来就变成「学生变少了」。原身绝对不可以离开。
  const RATIO_SETUP = 480;    // 先让七个框与七位家长完整出现，再开始分流
  const RATIO_MOVE = 1150;    // 分身飞行：慢，要的是 morph，不是弹射
  const RATIO_EASE = "cubic-bezier(.45,.02,.2,1)";  // 缓起缓收，无 overshoot

  // 回翻时收干净：原身本来就没动过，所以只要去掉 class、倒掉分身图层
  function resetRatioSplit(slide) {
    slide.classList.remove("split", "landed");
    const layer = slide.querySelector(".clone-layer");
    if (layer) layer.textContent = "";
  }

  function splitRatio(slide) {
    const layer = slide.querySelector(".clone-layer");
    const origins = Array.from(slide.querySelectorAll(".row-origin .people-icons--kid .p-fig"));
    const boxes = Array.from(slide.querySelectorAll(".group-box"));
    if (!layer || boxes.length !== 7 || origins.length !== 35) return;

    // 落点＝框里那五个本来透明的 icon。用真的落点量测，分身才会正好停在
    // 它们身上，之后显形/撤走才看不出接缝。
    const targets = [];
    boxes.forEach((b) => {
      b.querySelectorAll(".people-icons--slot .p-fig").forEach((t) => targets.push(t));
    });
    if (targets.length !== 35) return;

    slide.classList.add("split");   // 标题、七个框与七位家长先出现
    layer.textContent = "";
    const lr = layer.getBoundingClientRect();

    // 克隆：新节点，原身一根寒毛都不动
    const clones = origins.map((el, n) => {
      const a = el.getBoundingClientRect();
      const b = targets[n].getBoundingClientRect();
      const c = el.cloneNode(true);
      c.setAttribute("class", "p-fig p-clone");
      c.style.cssText =
        `left:${a.left - lr.left}px; top:${a.top - lr.top}px;` +
        `width:${a.width}px; height:${a.height}px; opacity:0;`;
      layer.appendChild(c);
      return { c, dx: b.left - a.left, dy: b.top - a.top };
    });
    void layer.offsetWidth;   // 先让「停在原身身上」这一帧成立

    // 放行：同组五个几乎一起走，组与组之间错开一点点，读起来是
    // 「一组一组走过去」；错开幅度刻意小，整体还是一片缓缓流动。
    clones.forEach(({ c, dx, dy }, n) => {
      const d = RATIO_SETUP + Math.floor(n / 5) * 90 + (n % 5) * 18;
      c.style.transition =
        `transform ${RATIO_MOVE}ms ${RATIO_EASE} ${d}ms, ` +
        `opacity 120ms linear ${d}ms`;
      c.style.opacity = "1";
      c.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    // 全部落地：框里的五个显形（此刻和分身完全重叠，看不出交接），
    // 下一帧再撤掉分身图层，版面回到正常文档流。
    const total = RATIO_SETUP + RATIO_MOVE + 6 * 90 + 4 * 18 + 40;
    setTimeout(() => {
      if (!slide.classList.contains("split")) return;   // 已经翻走了就算了
      slide.classList.add("landed");
      requestAnimationFrame(() => {
        if (slide.classList.contains("landed")) layer.textContent = "";
      });
    }, total);
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
    if (e.key.toLowerCase() === "m") {
      toggleMalayQr();
      e.preventDefault();
      return;
    }
    if (e.key === "Escape" && isMalayQrOpen()) {
      toggleMalayQr(false);
      e.preventDefault();
      return;
    }
    if (isMalayQrOpen()) return;
    if (["ArrowRight", " ", "PageDown"].includes(e.key)) { next(); e.preventDefault(); }
    if (["ArrowLeft", "PageUp"].includes(e.key)) { prev(); e.preventDefault(); }
  });
  let touchX = null;
  window.addEventListener("touchstart", (e) => touchX = e.touches[0].clientX);
  window.addEventListener("touchend", (e) => {
    if (isMalayQrOpen()) return;
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60) dx < 0 ? next() : prev();
    touchX = null;
  });

  // Press M on the opening slide to show the optional Malay companion QR.
  const malayQrOverlay = document.getElementById("malay-qr-overlay");
  function isMalayQrOpen() {
    return malayQrOverlay && malayQrOverlay.classList.contains("open");
  }
  function toggleMalayQr(force) {
    if (!malayQrOverlay) return;
    const open = typeof force === "boolean" ? force : !isMalayQrOpen();
    malayQrOverlay.classList.toggle("open", open);
    malayQrOverlay.setAttribute("aria-hidden", String(!open));
  }
  document.getElementById("malay-qr-close")?.addEventListener("click", () => toggleMalayQr(false));
  malayQrOverlay?.addEventListener("click", (e) => {
    if (e.target === malayQrOverlay) toggleMalayQr(false);
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
  syncCurrentSlide(i);
  slideHeartbeat = setInterval(() => syncCurrentSlide(i), 10000);
})();
