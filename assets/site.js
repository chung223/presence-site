// Presence 網站的互動：開場的「走開就鎖」示範、講台的簡報遙控示範、捲到講台時關燈。
// 數字跟 App 一樣：訊號取最近 4 秒的中位數，解鎖門檻 −62、鎖定門檻 −76 dBm，離開後 4 秒鎖定。
(() => {
  "use strict";

  const lang = document.documentElement.lang;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // 狀態、提示的說法跟 App 一樣（取自 App 的字串表）
  const STRINGS = {
    "zh-Hant": {
      near: "Apple Watch 在附近", leaving: (s) => `Apple Watch：離開中，${s} 秒後鎖定`, countdown: (s) => `${s} 秒後鎖定`,
      locked: "Apple Watch：不在附近", unlocking: "Apple Watch 回來了，正在解鎖", meters: (m) => `${m} 公尺`,
      hintLaser: "按住並移動手指，紅點會出現在投影畫面上的同一個位置",
      hintSpot: "按住並移動手指，聚光燈會照亮投影畫面上的同一個位置",
      hintInk: "用手指畫線，投影畫面上會出現同樣的螢光筆線，幾秒後自動消失",
      goto: (n) => `跳到第 ${n} 頁`,
    },
    en: {
      near: "Apple Watch nearby", leaving: (s) => `Apple Watch: Leaving — locking in ${s} s`, countdown: (s) => `Locking in ${s} s`,
      locked: "Apple Watch: Away", unlocking: "Apple Watch is back, unlocking", meters: (m) => `${m} m`,
      hintLaser: "Touch and drag. The red dot appears at the same spot on the projected screen.",
      hintSpot: "Touch and drag. The spotlight lights up the same spot on the projected screen.",
      hintInk: "Draw with your finger. The same highlighter line appears on the projected screen and fades after a few seconds.",
      goto: (n) => `Go to slide ${n}`,
    },
    ja: {
      near: "Apple Watchが近くにあります", leaving: (s) => `Apple Watch：離れています。${s}秒後にロック`, countdown: (s) => `${s}秒後にロック`,
      locked: "Apple Watch：離れています", unlocking: "Apple Watchが戻りました。ロックを解除しています", meters: (m) => `${m} m`,
      hintLaser: "押したまま指を動かすと、投影画面の同じ位置に赤い点が表示されます",
      hintSpot: "押したまま指を動かすと、投影画面の同じ位置をスポットライトで照らします",
      hintInk: "指でなぞると、投影画面にも同じ蛍光ペンの線が表示され、数秒後に自動で消えます",
      goto: (n) => `スライド${n}へ`,
    },
    ko: {
      near: "Apple Watch 근처에 있음", leaving: (s) => `Apple Watch: 멀어지는 중, ${s}초 후 잠금`, countdown: (s) => `${s}초 후 잠금`,
      locked: "Apple Watch: 근처에 없음", unlocking: "Apple Watch가 돌아왔습니다. 잠금 해제 중", meters: (m) => `${m}m`,
      hintLaser: "누른 채로 손가락을 움직이면 프로젝터 화면의 같은 위치에 빨간 점이 나타납니다",
      hintSpot: "누른 채로 손가락을 움직이면 프로젝터 화면의 같은 위치를 스포트라이트로 비춥니다",
      hintInk: "손가락으로 그리면 프로젝터 화면에도 같은 형광펜 선이 나타나고 몇 초 후 자동으로 사라집니다",
      goto: (n) => `${n}번 슬라이드로`,
    },
    "zh-Hans": {
      near: "Apple Watch 在附近", leaving: (s) => `Apple Watch：正在离开，${s} 秒后锁定`, countdown: (s) => `${s} 秒后锁定`,
      locked: "Apple Watch：不在附近", unlocking: "Apple Watch 回来了，正在解锁", meters: (m) => `${m} 米`,
      hintLaser: "按住并移动手指，红点会出现在投影画面上的同一位置",
      hintSpot: "按住并移动手指，聚光灯会照亮投影画面上的同一位置",
      hintInk: "用手指画线，投影画面上会出现同样的荧光笔线，几秒后自动消失",
      goto: (n) => `跳到第 ${n} 页`,
    },
    de: {
      near: "Apple Watch in der Nähe", leaving: (s) => `Apple Watch: Abwesend – Sperre in ${s} s`, countdown: (s) => `Sperre in ${s} s`,
      locked: "Apple Watch: Nicht in der Nähe", unlocking: "Apple Watch ist zurück – wird entsperrt", meters: (m) => `${m} m`,
      hintLaser: "Halte den Finger gedrückt und bewege ihn – der rote Punkt erscheint an derselben Stelle im Projektionsbild.",
      hintSpot: "Halte den Finger gedrückt und bewege ihn – das Spotlight beleuchtet dieselbe Stelle im Projektionsbild.",
      hintInk: "Zeichne mit dem Finger – dieselbe Markierung erscheint im Projektionsbild und verschwindet nach ein paar Sekunden.",
      goto: (n) => `Gehe zu Folie ${n}`,
    },
    fr: {
      near: "Apple Watch à proximité", leaving: (s) => `Apple Watch : départ détecté — verrouillage dans ${s} s`, countdown: (s) => `Verrouillage dans ${s} s`,
      locked: "Apple Watch : éloignée", unlocking: "Apple Watch de retour — déverrouillage", meters: (m) => `${m} m`,
      hintLaser: "Maintenez votre doigt et déplacez-le : le point rouge apparaît au même endroit sur l’écran projeté.",
      hintSpot: "Maintenez votre doigt et déplacez-le : le projecteur éclaire le même endroit sur l’écran projeté.",
      hintInk: "Dessinez avec le doigt : le même trait de surligneur apparaît sur l’écran projeté et s’efface après quelques secondes.",
      goto: (n) => `Aller à la diapo ${n}`,
    },
    es: {
      near: "Apple Watch cerca", leaving: (s) => `Apple Watch: alejándote, bloqueo en ${s} s`, countdown: (s) => `Bloqueo en ${s} s`,
      locked: "Apple Watch: lejos", unlocking: "El Apple Watch ha vuelto: desbloqueando", meters: (m) => `${m} m`,
      hintLaser: "Mantén pulsado y mueve el dedo: el punto rojo aparece en el mismo lugar de la pantalla proyectada.",
      hintSpot: "Mantén pulsado y mueve el dedo: el foco ilumina el mismo lugar de la pantalla proyectada.",
      hintInk: "Dibuja con el dedo: la misma línea de subrayador aparece en la pantalla proyectada y desaparece a los pocos segundos.",
      goto: (n) => `Ir a la diapo ${n}`,
    },
  };
  const T = STRINGS[lang] || STRINGS.en;

  // ── 時鐘 ─────────────────────────────────────────
  const clocks = document.querySelectorAll("[data-clock]");
  const tick = () => {
    const d = new Date();
    const text = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
    clocks.forEach((el) => { el.textContent = text; });
  };
  tick();
  setInterval(tick, 15000);

  // ── 開場：走開就鎖 ───────────────────────────────
  const room = document.getElementById("room");
  if (room) setUpRoom();

  function setUpRoom() {
    const MAX = 10;                 // 走道長 10 公尺
    const UNLOCK = -62, LOCK = -76; // dBm
    const LOCK_DELAY = 4;           // 秒
    const WINDOW = 4;               // 中位數取最近幾秒
    const track = document.getElementById("track");
    const you = document.getElementById("you");
    const screen = document.getElementById("screen");
    const state = room.querySelector(".state");
    const statusText = room.querySelector("[data-status]");
    const dbText = room.querySelector("[data-db]");
    const menubar = room.querySelector("[data-menubar]");
    const countdownEl = room.querySelector("[data-countdown]");
    const pwDots = [...room.querySelectorAll(".pw i")];
    const canvas = document.getElementById("chart");
    const ctx = canvas.getContext("2d");

    // 距離 → 訊號：1 公尺約 −50 dBm，越遠越弱（大約對得上辦公室裡實測的 iPhone、手錶）
    const rssiAt = (d) => -50 - 30 * Math.log10(Math.max(d, 0.3));
    const distanceFor = (rssi) => Math.pow(10, (-50 - rssi) / 30);
    track.style.setProperty("--unlock-at", `${(distanceFor(UNLOCK) / MAX) * 100}%`);
    track.style.setProperty("--lock-at", `${(distanceFor(LOCK) / MAX) * 100}%`);

    let distance = 1;
    let mode = "near";              // near、leaving、locked、unlocking
    let leavingSince = 0;
    let unlockStarted = 0;
    let samples = [];               // { t, rssi }
    let filtered = rssiAt(distance);
    let lastSample = 0;
    let userTookOver = reduceMotion;
    let script = null;

    const place = () => {
      you.style.left = `${(distance / MAX) * 100}%`;
      const m = Math.round(distance * 10) / 10;
      you.setAttribute("aria-valuenow", String(m));
      you.setAttribute("aria-valuetext", T.meters(m));
    };
    place();

    // 拖動「你」
    const toDistance = (clientX) => {
      const r = track.getBoundingClientRect();
      return Math.min(MAX, Math.max(0.2, ((clientX - r.left) / r.width) * MAX));
    };
    let dragging = false;
    track.addEventListener("pointerdown", (e) => {
      takeOver();
      dragging = true;
      try { track.setPointerCapture(e.pointerId); } catch { /* 模擬的事件沒有真的指標 */ }
      distance = toDistance(e.clientX);
      place();
    });
    track.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      distance = toDistance(e.clientX);
      place();
    });
    const stop = () => { dragging = false; };
    track.addEventListener("pointerup", stop);
    track.addEventListener("pointercancel", stop);
    you.addEventListener("keydown", (e) => {
      const step = { ArrowRight: 0.5, ArrowUp: 0.5, ArrowLeft: -0.5, ArrowDown: -0.5, Home: -MAX, End: MAX }[e.key];
      if (step === undefined) return;
      e.preventDefault();
      takeOver();
      distance = Math.min(MAX, Math.max(0.2, distance + step));
      place();
    });
    function takeOver() {
      userTookOver = true;
      script = null;
    }

    // 沒人碰的時候自己走一趟：走遠、等鎖上、走回來
    const plan = [
      { to: 1, hold: 1.4 },
      { to: 9, walk: 3.6 },
      { waitFor: "locked", hold: 1.6 },
      { to: 1.2, walk: 3.2 },
      { waitFor: "near", hold: 2.6 },
    ];
    function runScript(now) {
      if (userTookOver) return;
      if (!script) script = { i: 0, started: now };
      const s = plan[script.i];
      const elapsed = (now - script.started) / 1000;
      if (s.walk) {
        if (!script.from) script.from = distance;
        const k = Math.min(1, elapsed / s.walk);
        const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        distance = script.from + (s.to - script.from) * ease;
        place();
        if (k >= 1) next(now);
      } else if (s.waitFor) {
        if (mode === s.waitFor) {
          if (!script.reached) script.reached = now;
          if ((now - script.reached) / 1000 >= s.hold) next(now);
        }
      } else if (elapsed >= s.hold) {
        next(now);
      }
    }
    function next(now) {
      script = { i: (script.i + 1) % plan.length, started: now };
    }

    // 訊號圖
    function sizeCanvas() {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeCanvas();
    addEventListener("resize", sizeCanvas);
    const SPAN = 20;  // 圖上顯示最近 20 秒
    // 一打開就有一段「一直坐在座位上」的訊號，圖才不會是空的
    let history = [];  // { t, raw, filtered }
    {
      const start = performance.now();
      for (let t = start - SPAN * 1000; t < start; t += 260) {
        const raw = rssiAt(distance) + (Math.random() - 0.5) * 7;
        history.push({ t, raw, filtered: rssiAt(distance) + (Math.random() - 0.5) * 1.5 });
      }
    }
    function drawChart(now) {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const top = -36, bottom = -88;
      const y = (v) => ((top - v) / (top - bottom)) * h;
      const x = (t) => w - ((now - t) / 1000 / SPAN) * w;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "#17a673";
      ctx.beginPath(); ctx.moveTo(0, y(UNLOCK)); ctx.lineTo(w, y(UNLOCK)); ctx.stroke();
      ctx.strokeStyle = "#c2453c";
      ctx.beginPath(); ctx.moveTo(0, y(LOCK)); ctx.lineTo(w, y(LOCK)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#9aa7b6";
      for (const p of history) {
        ctx.beginPath(); ctx.arc(x(p.t), y(p.raw), 2.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = "#2563d6";
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.beginPath();
      history.forEach((p, i) => (i ? ctx.lineTo(x(p.t), y(p.filtered)) : ctx.moveTo(x(p.t), y(p.filtered))));
      ctx.stroke();
    }

    function setMode(next, now) {
      if (mode === next) return;
      mode = next;
      if (next === "leaving") leavingSince = now;
      if (next === "unlocking") unlockStarted = now;
      screen.dataset.state = next;
      state.dataset.state = next;
    }

    function render(now) {
      const showing = mode === "leaving" ? T.leaving(Math.max(1, Math.ceil(LOCK_DELAY - (now - leavingSince) / 1000)))
        : mode === "locked" ? T.locked : mode === "unlocking" ? T.unlocking : T.near;
      if (statusText.textContent !== showing) statusText.textContent = showing;
      const db = `−${Math.abs(Math.round(filtered))} dBm`;
      if (dbText.textContent !== db) dbText.textContent = db;
      const bar = mode === "near" ? T.near : showing;
      if (menubar.textContent !== bar) menubar.textContent = bar;
      if (mode === "leaving") countdownEl.textContent = T.countdown(Math.max(1, Math.ceil(LOCK_DELAY - (now - leavingSince) / 1000)));
      // 訊號強度決定手錶發出的波紋有多明顯
      const strength = Math.min(1, Math.max(0.08, (filtered + 85) / 35));
      you.style.setProperty("--strength", strength.toFixed(2));
    }

    function loop(now) {
      runScript(now);
      // 藍牙廣播大約一秒幾筆，有一點跳動
      if (now - lastSample > 260) {
        lastSample = now;
        const raw = rssiAt(distance) + (Math.random() - 0.5) * 7;
        samples.push({ t: now, rssi: raw });
        samples = samples.filter((s) => now - s.t <= WINDOW * 1000);
        if (samples.length >= 3) {
          const sorted = samples.map((s) => s.rssi).sort((a, b) => a - b);
          filtered = sorted[Math.floor((sorted.length - 1) / 2)];
        }
        history.push({ t: now, raw, filtered });
        history = history.filter((p) => now - p.t <= SPAN * 1000 + 500);
      }
      // 跟 App 一樣的狀態變化
      if (mode === "near" && filtered < LOCK) setMode("leaving", now);
      else if (mode === "leaving") {
        if (filtered >= LOCK) setMode("near", now);
        else if (now - leavingSince >= LOCK_DELAY * 1000) setMode("locked", now);
      } else if (mode === "locked" && filtered >= UNLOCK) setMode("unlocking", now);
      else if (mode === "unlocking") {
        const typed = Math.floor((now - unlockStarted) / 110);
        pwDots.forEach((dot, i) => dot.classList.toggle("on", i < typed));
        if (typed > pwDots.length + 3) {
          pwDots.forEach((dot) => dot.classList.remove("on"));
          setMode("near", now);
        }
      }
      render(now);
      drawChart(now);
      frameId = running ? requestAnimationFrame(loop) : 0;
    }

    // 畫面外就不用一直算
    let running = false, frameId = 0;
    new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running && !frameId) frameId = requestAnimationFrame(loop);
    }).observe(room);
  }

  // ── 講台：捲到這裡時關燈 ─────────────────────────
  const stage = document.querySelector("[data-night]");
  if (stage) {
    new IntersectionObserver(([entry]) => {
      document.body.classList.toggle("night", entry.isIntersecting);
    }, { rootMargin: "-45% 0px -45% 0px" }).observe(stage);
  }

  // ── 講台：簡報遙控示範 ───────────────────────────
  const projection = document.getElementById("projection");
  if (projection) setUpStage();

  function setUpStage() {
    const slides = [...projection.querySelectorAll(".slide")];
    const ink = document.getElementById("ink");
    const ictx = ink.getContext("2d");
    const pad = document.getElementById("pad");
    const padInk = pad.querySelector("[data-pad-ink]");
    const pctx = padInk.getContext("2d");
    const finger = pad.querySelector("[data-finger]");
    const padNext = pad.querySelector("[data-pad-next]");
    const padHint = pad.querySelector("[data-pad-hint]");
    const toolButtons = [...document.querySelectorAll(".tools button")];
    const slideNo = projection.querySelector("[data-slide-no]");
    const volume = document.querySelector("[data-volume]");
    const volumeOut = document.querySelector("[data-volume-out]");
    const videoVol = projection.querySelector("[data-video-vol]");
    const blank = document.querySelector("[data-blank]");
    const gotoButton = document.querySelector("[data-goto]");
    const talkClock = document.querySelector("[data-talk-clock]");

    let current = 0;
    let tool = "slides";
    let pointer = null;        // 手指在投影幕上的位置（0～1）
    let strokes = [];          // 螢光筆：[[{x,y}]]
    let inkOpacity = 1;
    let lastStrokeEnd = 0;
    let animating = false;

    // 演講計時：捲到講台才開始算
    let talkStart = 0;
    new IntersectionObserver(([e]) => { if (e.isIntersecting && !talkStart) talkStart = Date.now(); }).observe(projection);
    setInterval(() => {
      if (!talkStart) return;
      const s = Math.floor((Date.now() - talkStart) / 1000);
      talkClock.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    }, 1000);

    function showSlide(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("on", k === current));
      slideNo.textContent = `${current + 1} / ${slides.length}`;
      gotoButton.textContent = T.goto(current === 0 ? slides.length : 1);
      clearInk();
    }
    showSlide(0);
    document.querySelectorAll("[data-turn]").forEach((b) => b.addEventListener("click", () => showSlide(current + Number(b.dataset.turn))));
    gotoButton.addEventListener("click", () => showSlide(current === 0 ? slides.length - 1 : 0));
    blank.addEventListener("click", () => {
      const on = !projection.classList.contains("blank");
      projection.classList.toggle("blank", on);
      blank.setAttribute("aria-pressed", String(on));
    });
    // 百分比照各語言的寫法：法文、德文是「50 %」
    const percent = new Intl.NumberFormat(lang, { style: "percent" });
    const setVolume = () => {
      volumeOut.textContent = percent.format(volume.value / 100);
      videoVol.style.width = `${volume.value}%`;
    };
    volume.addEventListener("input", setVolume);
    setVolume();

    toolButtons.forEach((b) => b.addEventListener("click", () => {
      tool = b.dataset.tool;
      toolButtons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      pad.dataset.tool = tool;
      padNext.hidden = tool !== "slides";
      padHint.hidden = tool === "slides";
      padHint.textContent = tool === "laser" ? T.hintLaser : tool === "spotlight" ? T.hintSpot : tool === "highlighter" ? T.hintInk : "";
      pointer = null;
      if (tool !== "highlighter") clearInk();
      requestFrame();
    }));

    function sizeCanvases() {
      const dpr = Math.min(2, devicePixelRatio || 1);
      for (const c of [ink, padInk]) {
        const r = c.getBoundingClientRect();
        c.width = Math.max(1, Math.round(r.width * dpr));
        c.height = Math.max(1, Math.round(r.height * dpr));
        c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      requestFrame();
    }
    new ResizeObserver(sizeCanvases).observe(projection);
    new ResizeObserver(sizeCanvases).observe(pad);

    // 觸控區：翻頁模式點一下、或左右滑；其他模式按住移動
    let down = null;
    const at = (e) => {
      const r = pad.getBoundingClientRect();
      return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) };
    };
    pad.addEventListener("pointerdown", (e) => {
      try { pad.setPointerCapture(e.pointerId); } catch { /* 模擬的事件沒有真的指標 */ }
      down = { x: e.clientX, y: e.clientY };
      if (tool === "slides") return;
      const p = at(e);
      pointer = p;
      if (tool === "highlighter") { strokes.push([p]); inkOpacity = 1; }
      moveFinger(p);
      requestFrame();
    });
    pad.addEventListener("pointermove", (e) => {
      if (!down || tool === "slides") return;
      const p = at(e);
      pointer = p;
      if (tool === "highlighter") strokes[strokes.length - 1]?.push(p);
      moveFinger(p);
      requestFrame();
    });
    const end = (e) => {
      if (!down) return;
      if (tool === "slides") {
        const dx = e.clientX - down.x, dy = e.clientY - down.y;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) showSlide(current + (dx < 0 ? 1 : -1));
        else if (Math.hypot(dx, dy) < 20) showSlide(current + 1);
      } else {
        pointer = null;
        finger.classList.remove("on");
        if (tool === "highlighter") lastStrokeEnd = performance.now();
        requestFrame();
      }
      down = null;
    };
    pad.addEventListener("pointerup", end);
    pad.addEventListener("pointercancel", end);

    function moveFinger(p) {
      finger.style.left = `${p.x * 100}%`;
      finger.style.top = `${p.y * 100}%`;
      finger.classList.add("on");
    }

    function clearInk() {
      strokes = [];
      inkOpacity = 1;
      requestFrame();
    }

    function requestFrame() {
      if (animating) return;
      animating = true;
      requestAnimationFrame(frame);
    }

    // 經過每一點的平滑曲線，跟 App 一樣：相鄰兩點的中點相連、原本的點當控制點
    function drawStrokes(c, w, h, width, alpha) {
      c.save();
      c.globalAlpha = alpha;
      c.strokeStyle = "#ffcc00";
      c.lineWidth = width;
      c.lineCap = "round";
      c.lineJoin = "round";
      for (const s of strokes) {
        if (!s.length) continue;
        c.beginPath();
        c.moveTo(s[0].x * w, s[0].y * h);
        for (let i = 1; i < s.length - 1; i++) {
          const mx = (s[i].x + s[i + 1].x) / 2, my = (s[i].y + s[i + 1].y) / 2;
          c.quadraticCurveTo(s[i].x * w, s[i].y * h, mx * w, my * h);
        }
        const last = s[s.length - 1];
        c.lineTo(last.x * w + 0.01, last.y * h);
        c.stroke();
      }
      c.restore();
    }

    function frame(now) {
      animating = false;
      const w = ink.clientWidth, h = ink.clientHeight;
      ictx.clearRect(0, 0, w, h);
      const pw = padInk.clientWidth, ph = padInk.clientHeight;
      pctx.clearRect(0, 0, pw, ph);

      if (tool === "spotlight" && pointer) {
        // 一整片暗色，中間一個邊緣柔和的洞（跟 Mac 上的聚光燈一樣：四周 80% 暗，邊緣在半徑 0.9～1.1 倍）
        const r = h * 0.17;
        const g = ictx.createRadialGradient(pointer.x * w, pointer.y * h, r * 0.9, pointer.x * w, pointer.y * h, r * 1.1);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(0.5, "rgba(0,0,0,0.4)");
        g.addColorStop(1, "rgba(0,0,0,0.8)");
        ictx.fillStyle = g;
        ictx.fillRect(0, 0, w, h);
      }

      // 螢光筆：最後一筆畫完 4 秒後淡掉
      let keepGoing = false;
      if (strokes.length) {
        if (!pointer && lastStrokeEnd) {
          const since = (now - lastStrokeEnd) / 1000;
          inkOpacity = since < 4 ? 1 : Math.max(0, 1 - (since - 4) / 0.8);
          if (inkOpacity === 0) { strokes = []; lastStrokeEnd = 0; }
          else keepGoing = true;
        }
        drawStrokes(ictx, w, h, Math.max(4, h * 0.02), 0.68 * inkOpacity);
        drawStrokes(pctx, pw, ph, Math.max(3, ph * 0.02), 0.68 * inkOpacity);
      }

      if (tool === "laser" && pointer) {
        const r = Math.max(7, h * 0.021);
        const x = pointer.x * w, y = pointer.y * h;
        const glow = ictx.createRadialGradient(x, y, 0, x, y, r * 2.6);
        glow.addColorStop(0, "rgba(255,46,31,0.9)");
        glow.addColorStop(0.4, "rgba(255,46,31,0.35)");
        glow.addColorStop(1, "rgba(255,46,31,0)");
        ictx.fillStyle = glow;
        ictx.beginPath(); ictx.arc(x, y, r * 2.6, 0, Math.PI * 2); ictx.fill();
        ictx.fillStyle = "#ff2e1f";
        ictx.beginPath(); ictx.arc(x, y, r, 0, Math.PI * 2); ictx.fill();
        ictx.fillStyle = "#ffd9cc";
        ictx.beginPath(); ictx.arc(x, y, r * 0.36, 0, Math.PI * 2); ictx.fill();
      }

      if (keepGoing) requestFrame();
    }
  }
  // ── 觸控板與鍵盤 ─────────────────────────────────
  // 在手機的觸控區拖曳，Mac 上的游標跟著動；點一下是左鍵、兩指點（或滑鼠右鍵）是右鍵、兩指滑動捲動。
  // 文字框跟 App 一樣：組字中（注音、拼音）不送，組好的字才出現在 Mac 上；Return 換行並清空。
  const tpScreen = document.getElementById("tp-screen");
  if (tpScreen) setUpTrackpad();

  function setUpTrackpad() {
    const pad = document.getElementById("tp-pad");
    const input = document.getElementById("tp-input");
    const arrow = tpScreen.querySelector("[data-tp-arrow]");
    const menu = tpScreen.querySelector("[data-tp-menu]");
    const page = tpScreen.querySelector("[data-tp-page]");
    const typed = tpScreen.querySelector("[data-tp-typed]");
    const typedLine = typed.parentElement;
    const fingers = [...pad.querySelectorAll("[data-tp-finger]")];
    // 手勢圖跟 App 一樣：碰一下觸控區就收起來，打字時也不顯示
    const guide = pad.querySelector("[data-tp-guide]");
    let guideDismissed = false;
    const showGuide = (on) => guide?.classList.toggle("off", !on || guideDismissed);
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const cursor = { x: 0.58, y: 0.46 };
    let scrolled = 0, menuTimer = 0, composing = false;

    // 跟 macOS 一樣：打字時游標藏起來，一動就出現
    const place = () => { arrow.style.left = `${cursor.x * 100}%`; arrow.style.top = `${cursor.y * 100}%`; arrow.style.opacity = 1; };
    const hideArrow = () => { arrow.style.opacity = 0; };
    place();

    // 手指越快，游標走得越遠
    function moveBy(dx, dy, dt) {
      const r = tpScreen.getBoundingClientRect();
      const gain = 1.1 + Math.min(2.2, (Math.hypot(dx, dy) / Math.max(dt, 8)) * 1.6);
      cursor.x = clamp(cursor.x + (dx * gain) / r.width, 0.005, 0.975);
      cursor.y = clamp(cursor.y + (dy * gain) / r.height, 0.01, 0.96);
      place();
    }
    function click() {
      hideMenu();
      const dot = document.createElement("span");
      dot.className = "ripple";
      dot.style.left = arrow.style.left;
      dot.style.top = arrow.style.top;
      tpScreen.append(dot);
      setTimeout(() => dot.remove(), 600);
    }
    function rightClick() {
      menu.style.left = `${Math.min(cursor.x, 0.77) * 100}%`;
      menu.style.top = `${Math.min(cursor.y, 0.8) * 100}%`;
      menu.hidden = false;
      clearTimeout(menuTimer);
      menuTimer = setTimeout(hideMenu, 1800);
    }
    function hideMenu() { menu.hidden = true; }
    function scrollBy(dy) {
      const room = Math.max(0, page.scrollHeight - page.clientHeight) + page.clientHeight * 0.25;
      scrolled = clamp(scrolled + dy, -room, 0);
      page.style.transform = `translateY(${scrolled}px)`;
    }

    // 觸控區：記住每隻手指，放開時沒怎麼動就算點一下
    const touches = new Map();
    let gesture = null;
    function showFingers() {
      const r = pad.getBoundingClientRect();
      const points = [...touches.values()];
      fingers.forEach((f, i) => {
        const p = points[i];
        f.classList.toggle("on", Boolean(p));
        if (p) { f.style.left = `${p.x - r.left}px`; f.style.top = `${p.y - r.top}px`; }
      });
    }
    pad.addEventListener("pointerdown", (e) => {
      stopDemo();
      guideDismissed = true;
      showGuide(false);
      if (e.button === 2) return;
      try { pad.setPointerCapture(e.pointerId); } catch { /* 模擬的事件沒有真的指標 */ }
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY, t: e.timeStamp });
      if (!gesture) gesture = { count: 0, moved: 0, start: e.timeStamp };
      gesture.count = Math.max(gesture.count, touches.size);
      showFingers();
    });
    pad.addEventListener("pointermove", (e) => {
      const p = touches.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y, dt = e.timeStamp - p.t;
      Object.assign(p, { x: e.clientX, y: e.clientY, t: e.timeStamp });
      gesture.moved += Math.hypot(dx, dy);
      if (touches.size === 1) moveBy(dx, dy, dt);
      else if (e.pointerId === touches.keys().next().value) scrollBy(dy);
      showFingers();
    });
    const lift = (e) => {
      if (!touches.delete(e.pointerId)) return;
      if (!touches.size && gesture) {
        if (gesture.moved < 10 && e.timeStamp - gesture.start < 400) {
          if (gesture.count >= 2) rightClick(); else click();
        }
        gesture = null;
      }
      showFingers();
    };
    pad.addEventListener("pointerup", lift);
    pad.addEventListener("pointercancel", lift);
    pad.addEventListener("contextmenu", (e) => { e.preventDefault(); stopDemo(); rightClick(); });

    // 文字框
    const mirror = () => { if (!composing) { typed.textContent = input.value; hideArrow(); } };
    input.addEventListener("focus", () => { stopDemo(); showGuide(false); });
    input.addEventListener("blur", () => showGuide(true));
    input.addEventListener("compositionstart", () => { composing = true; });
    input.addEventListener("compositionend", () => { composing = false; mirror(); });
    input.addEventListener("input", mirror);
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || e.isComposing || composing) return;
      e.preventDefault();
      newLine();
    });
    function newLine() {
      const line = document.createElement("p");
      line.textContent = input.value;
      typedLine.before(line);
      input.value = "";
      typed.textContent = "";
      const lines = page.querySelectorAll("p:not(.typed)");
      if (lines.length > 3) lines[0].remove();
    }

    // 沒人碰的時候自己示範一輪：游標移到文字後面、點一下、打一句話、換行
    let demo = !reduceMotion, visible = false, wake = null, timer = 0, frame = 0;
    function stopDemo() {
      if (!demo) return;
      demo = false;
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      wake?.();
      fingers.forEach((f) => f.classList.remove("on"));
      input.value = "";
      typed.textContent = "";
    }
    const sleep = (ms) => new Promise((done) => { timer = setTimeout(done, ms); });
    const tween = (ms, step) => new Promise((done) => {
      const start = performance.now();
      const tick = (now) => {
        if (!demo) return done();
        const k = Math.min(1, (now - start) / ms);
        step(k * k * (3 - 2 * k));
        if (k < 1) frame = requestAnimationFrame(tick); else done();
      };
      frame = requestAnimationFrame(tick);
    });
    async function runDemo() {
      const finger = fingers[0];
      while (demo) {
        if (!visible) { await new Promise((done) => { wake = done; }); wake = null; continue; }
        page.querySelectorAll("p:not(.typed)").forEach((line) => line.remove());
        const s = tpScreen.getBoundingClientRect(), t = typedLine.getBoundingClientRect();
        const from = { ...cursor };
        const to = { x: (t.left - s.left) / s.width + 0.015, y: (t.top + t.height * 0.75 - s.top) / s.height };
        showGuide(false);
        finger.classList.add("on");
        await tween(1300, (k) => {
          cursor.x = from.x + (to.x - from.x) * k;
          cursor.y = from.y + (to.y - from.y) * k;
          place();
          finger.style.left = `${(0.62 - 0.3 * k) * 100}%`;
          finger.style.top = `${(0.3 + 0.36 * k) * 100}%`;
        });
        if (!demo) break;
        await sleep(220); if (!demo) break;
        click();
        await sleep(380);
        finger.classList.remove("on");
        for (const ch of Array.from(input.dataset.demo || "")) {
          await sleep(150); if (!demo) break;
          input.value += ch;
          typed.textContent = input.value;
          hideArrow();
        }
        if (!demo) break;
        await sleep(900); if (!demo) break;
        newLine();
        await sleep(2800);
        if (!demo) break;
        showGuide(true);
        await tween(900, (k) => { cursor.x = to.x + (0.58 - to.x) * k; cursor.y = to.y + (0.46 - to.y) * k; place(); });
        await sleep(1200);
      }
    }
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake?.();
    }, { threshold: 0.4 }).observe(tpScreen);
    if (demo) runDemo();
  }

  // ── 觸控區裡的手勢圖：照 App 的 GestureGlyph 畫，一次動一格（1.8 秒輪一次）──
  const glyphs = [...document.querySelectorAll("canvas[data-gesture]")];
  if (glyphs.length) setUpGestures();

  function setUpGestures() {
    const SLOT = 1800;
    const ctxs = glyphs.map((c) => { c.setAttribute("aria-hidden", "true"); return c.getContext("2d"); });
    let running = false, raf = 0;

    function glyph(ctx, w, kind, progress) {
      ctx.clearRect(0, 0, w, w);
      const t = progress ?? 0.68;
      const color = progress == null ? "rgba(255,255,255,0.55)" : "#ff9a3c";
      const radius = w * 0.095;
      const at = (x, y) => [x * w, y * w];
      const paint = (alpha, fn) => { ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = ctx.strokeStyle = color; ctx.beginPath(); fn(); ctx.restore(); };
      const finger = ([x, y]) => paint(1, () => { ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); });
      const trail = ([x1, y1], [x2, y2]) => paint(0.35, () => { ctx.lineWidth = radius * 0.9; ctx.lineCap = "round"; ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); });
      const ripple = ([x, y], amount) => {
        if (!(amount > 0 && amount < 1)) return;
        paint(1 - amount, () => { ctx.lineWidth = 1.5; ctx.arc(x, y, radius * (1.2 + amount * 1.5), 0, Math.PI * 2); ctx.stroke(); });
      };
      const eased = (a, b) => { const x = Math.min(Math.max((t - a) / (b - a), 0), 1); return x * x * (3 - 2 * x); };
      const lerp = (a, b, k) => a + (b - a) * k;
      const tapAt = progress == null ? 0.35 : (t - 0.2) / 0.55;

      if (kind === "move") {
        const m = eased(0.12, 0.82), end = at(lerp(0.28, 0.72, m), lerp(0.72, 0.28, m));
        trail(at(0.28, 0.72), end); finger(end);
      } else if (kind === "click") {
        ripple(at(0.5, 0.5), tapAt); finger(at(0.5, 0.5));
      } else if (kind === "rightClick") {
        for (const p of [at(0.3, 0.5), at(0.7, 0.5)]) { ripple(p, tapAt); finger(p); }
      } else if (kind === "scroll") {
        const m = eased(0.12, 0.82);
        for (const x of [0.39, 0.61]) { const end = at(x, lerp(0.72, 0.28, m)); trail(at(x, 0.72), end); finger(end); }
      } else if (kind === "drag") {
        // 先點一下，再按住滑動：手指帶著一個方塊走
        const m = eased(0.35, 0.88), x = lerp(0.3, 0.7, m), side = w * 0.3;
        paint(0.6, () => { ctx.lineWidth = 1.5; ctx.roundRect(x * w - side / 2, w / 2 - side / 2, side, side, side * 0.22); ctx.stroke(); });
        ripple(at(0.3, 0.5), progress == null ? -1 : t / 0.32);
        finger(at(x, 0.5));
      } else if (kind === "swipe") {
        const m = eased(0.12, 0.82);
        [[0.3, 0], [0.5, 0.05], [0.7, 0]].forEach(([y, dx]) => { const end = at(lerp(0.26, 0.7, m) + dx, y); trail(at(0.26 + dx, y), end); finger(end); });
      }
    }

    function draw(now) {
      const active = reduceMotion ? -1 : Math.floor(now / SLOT) % glyphs.length;
      const progress = (now / SLOT) % 1;
      glyphs.forEach((c, i) => {
        glyph(ctxs[i], c.clientWidth, c.dataset.gesture, i === active ? progress : null);
        c.parentElement.classList.toggle("on", i === active);
      });
      if (running && !reduceMotion) raf = requestAnimationFrame(draw);
    }
    function size() {
      const dpr = Math.min(2, devicePixelRatio || 1);
      glyphs.forEach((c, i) => {
        const w = c.clientWidth;
        c.width = c.height = Math.max(1, Math.round(w * dpr));
        ctxs[i].setTransform(dpr, 0, 0, dpr, 0, 0);
      });
      draw(performance.now());
    }
    new ResizeObserver(size).observe(glyphs[0]);
    new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (running) raf = requestAnimationFrame(draw);
    }).observe(glyphs[0].closest("ul"));
  }
})();
