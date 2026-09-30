/* FREEzzzGames STREAMER MENU PARALLAX — local LIVE overlay only */
(() => {
  "use strict";

  const state = {
    panel: null,
    drawer: null,
    list: null,
    layers: [],
    raf: 0,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    pointerId: null,
    lastX: 0,
    lastT: 0,
    resetTimer: 0,
    reduced: window.matchMedia?.("(prefers-reduced-motion: reduce)") || null,
    resizeObserver: null
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;

  function ensureLayers() {
    if (!state.drawer) return false;

    let host = state.drawer.querySelector(".streamer-parallax-layers");
    if (!host) {
      host = document.createElement("div");
      host.className = "streamer-parallax-layers";
      host.setAttribute("aria-hidden", "true");
      host.innerHTML =
        '<div class="streamer-parallax-layer streamer-parallax-layer-far"></div>' +
        '<div class="streamer-parallax-layer streamer-parallax-layer-mid"></div>' +
        '<div class="streamer-parallax-layer streamer-parallax-layer-near"></div>';
      state.drawer.prepend(host);
    }

    state.layers = [...host.querySelectorAll(".streamer-parallax-layer")];
    return state.layers.length === 3;
  }

  function findNodes() {
    const panel = document.getElementById("liveListPanel");
    const drawer = panel?.querySelector(".live-list-drawer");
    const list = drawer?.querySelector(".live-streamer-list");

    if (state.list && state.list !== list) {
      state.list.removeEventListener("scroll", onScroll);
      state.list.removeEventListener("pointermove", onPointerMove);
      state.list.removeEventListener("pointerdown", onPointerDown);
      state.list.removeEventListener("pointerup", onPointerUp);
      state.list.removeEventListener("pointercancel", onPointerCancel);
    }

    if (state.list === list && state.drawer === drawer && state.list && state.drawer) {
      ensureLayers();
      return true;
    }

    state.panel = panel || null;
    state.drawer = drawer || null;
    state.list = list || null;

    if (!state.drawer || !state.list) return false;
    ensureLayers();

    state.list.addEventListener("scroll", onScroll, { passive: true });
    state.list.addEventListener("pointermove", onPointerMove, { passive: true });
    state.list.addEventListener("pointerdown", onPointerDown, { passive: true });
    state.list.addEventListener("pointerup", onPointerUp, { passive: true });
    state.list.addEventListener("pointercancel", onPointerCancel, { passive: true });
    return true;
  }

  function scheduleRender() {
    if (state.reduced?.matches || state.raf) return;
    state.raf = requestAnimationFrame(render);
  }

  function render() {
    state.x = lerp(state.x, state.targetX, .12);
    state.y = lerp(state.y, state.targetY, .12);

    const values = [
      [state.x * .16, state.y * .10],
      [state.x * .34, state.y * .22],
      [state.x * .62, state.y * .38]
    ];

    state.drawer?.style.setProperty("--menu-parallax-x", state.x.toFixed(2) + "px");
    state.drawer?.style.setProperty("--menu-parallax-y", state.y.toFixed(2) + "px");

    state.layers.forEach((layer, index) => {
      const [x, y] = values[index] || [0, 0];
      layer.style.setProperty("--menu-parallax-x", x.toFixed(2) + "px");
      layer.style.setProperty("--menu-parallax-y", y.toFixed(2) + "px");
    });

    if (Math.abs(state.x - state.targetX) < .08 && Math.abs(state.y - state.targetY) < .08) {
      state.x = state.targetX;
      state.y = state.targetY;
      state.raf = 0;
      return;
    }
    state.raf = requestAnimationFrame(render);
  }

  function onScroll() {
    if (!state.list || state.reduced?.matches) return;
    const max = Math.max(1, state.list.scrollHeight - state.list.clientHeight);
    const progress = clamp(state.list.scrollTop / max, 0, 1);
    const centered = progress - .5;
    state.targetY = clamp(-centered * 28, -18, 18);
    scheduleRender();
  }

  function interactive(target) {
    return target instanceof Element && !!target.closest("button,a,input,textarea,select,iframe,[contenteditable='true']");
  }

  function onPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (interactive(event.target)) return;
    state.pointerId = event.pointerId;
    state.lastX = event.clientX;
    state.lastT = performance.now();
    clearTimeout(state.resetTimer);
  }

  function onPointerMove(event) {
    if (state.pointerId !== event.pointerId || state.reduced?.matches) return;
    if (interactive(event.target)) return;

    const now = performance.now();
    const dx = event.clientX - state.lastX;
    const dt = Math.max(8, now - state.lastT);
    state.lastX = event.clientX;
    state.lastT = now;

    const velocity = clamp((dx / dt) * 16, -10, 10);
    state.targetX = clamp(state.targetX + velocity * .72, -14, 14);
    scheduleRender();
  }

  function onPointerUp(event) {
    if (state.pointerId !== event.pointerId) return;
    state.pointerId = null;
    state.resetTimer = window.setTimeout(reset, 180);
  }

  function onPointerCancel(event) {
    if (state.pointerId !== event.pointerId) return;
    state.pointerId = null;
    reset();
  }

  function reset() {
    clearTimeout(state.resetTimer);
    state.targetX = 0;
    state.targetY = 0;
    scheduleRender();
  }

  function mount() {
    if (!findNodes()) return false;
    onScroll();

    if (!state.resizeObserver && window.ResizeObserver) {
      state.resizeObserver = new ResizeObserver(() => {
        ensureLayers();
        onScroll();
      });
      state.resizeObserver.observe(state.drawer);
      state.resizeObserver.observe(state.list);
    }
    scheduleRender();
    return true;
  }

  function unmount() {
    reset();
  }

  window.FZG = window.FZG || {};
  window.FZG.streamerMenuParallax = { mount, reset, unmount };

  mount();

  const observer = new MutationObserver(() => {
    if (document.getElementById("liveListPanel")) mount();
  });
  observer.observe(document.getElementById("mainPortal") || document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class"]
  });
})();