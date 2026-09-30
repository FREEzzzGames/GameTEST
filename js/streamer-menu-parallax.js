/* FREEzzzGames STREAMER MENU PARALLAX — robust local LIVE overlay */
(() => {
  "use strict";

  const state = {
    drawer: null,
    list: null,
    layers: [],
    raf: 0,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    resetTimer: 0,
    reduced: window.matchMedia?.("(prefers-reduced-motion: reduce)") || null,
    bound: false
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function schedule() {
    if (state.reduced?.matches || state.raf) return;
    state.raf = requestAnimationFrame(render);
  }

  function render() {
    state.x = lerp(state.x, state.targetX, .14);
    state.y = lerp(state.y, state.targetY, .14);

    if (state.drawer) {
      state.drawer.style.setProperty("--menu-parallax-x", state.x.toFixed(2) + "px");
      state.drawer.style.setProperty("--menu-parallax-y", state.y.toFixed(2) + "px");
    }

    const depth = [
      [.18, .10],
      [.40, .24],
      [.72, .42]
    ];

    state.layers.forEach((layer, i) => {
      const d = depth[i] || [.5, .3];
      layer.style.transform =
        "translate3d(" +
        (state.x * d[0]).toFixed(2) + "px," +
        (state.y * d[1]).toFixed(2) + "px,0)";
    });

    if (
      Math.abs(state.x - state.targetX) < .06 &&
      Math.abs(state.y - state.targetY) < .06
    ) {
      state.x = state.targetX;
      state.y = state.targetY;
      state.raf = 0;
      return;
    }

    state.raf = requestAnimationFrame(render);
  }

  function makeLayers(drawer) {
    let host = drawer.querySelector(".streamer-parallax-layers");
    if (!host) {
      host = document.createElement("div");
      host.className = "streamer-parallax-layers";
      host.setAttribute("aria-hidden", "true");
      host.innerHTML =
        '<div class="streamer-parallax-layer streamer-parallax-layer-far"></div>' +
        '<div class="streamer-parallax-layer streamer-parallax-layer-mid"></div>' +
        '<div class="streamer-parallax-layer streamer-parallax-layer-near"></div>';
      drawer.prepend(host);
    }
    state.layers = [...host.querySelectorAll(".streamer-parallax-layer")];
  }

  function onScroll() {
    if (!state.list || state.reduced?.matches) return;

    const max = Math.max(1, state.list.scrollHeight - state.list.clientHeight);
    const progress = clamp(state.list.scrollTop / max, 0, 1);

    /* Strong enough to be visible, still subtle enough not to distort cards. */
    state.targetY = (0.5 - progress) * 34;
    schedule();
  }

  function onPointerMove(event) {
    if (!state.drawer || state.reduced?.matches) return;

    const rect = state.drawer.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const nx = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const ny = clamp((event.clientY - rect.top) / rect.height, 0, 1);

    /*
      Pointer position drives only the visual depth.
      We never preventDefault and never capture the pointer,
      so native Telegram/mobile scrolling and clicks stay intact.
    */
    state.targetX = (nx - .5) * 28;
    state.targetY = clamp(state.targetY * .72 + (ny - .5) * 10, -24, 24);
    schedule();
  }

  function onPointerLeave() {
    state.targetX = 0;
    state.targetY = 0;
    schedule();
  }

  function onTouchStart() {
    clearTimeout(state.resetTimer);
  }

  function onTouchEnd() {
    clearTimeout(state.resetTimer);
    state.resetTimer = setTimeout(() => {
      state.targetX = 0;
      onScroll();
      schedule();
    }, 160);
  }

  function unbind() {
    if (!state.bound) return;
    state.list?.removeEventListener("scroll", onScroll);
    state.drawer?.removeEventListener("pointermove", onPointerMove);
    state.drawer?.removeEventListener("pointerleave", onPointerLeave);
    state.drawer?.removeEventListener("touchstart", onTouchStart);
    state.drawer?.removeEventListener("touchend", onTouchEnd);
    state.bound = false;
  }

  function mount() {
    const panel = document.getElementById("liveListPanel");
    const drawer = panel?.querySelector(".live-list-drawer");
    const list = drawer?.querySelector(".live-streamer-list");

    if (!drawer || !list) return false;

    if (state.drawer !== drawer || state.list !== list) {
      unbind();
      state.drawer = drawer;
      state.list = list;
      makeLayers(drawer);

      list.addEventListener("scroll", onScroll, { passive: true });
      drawer.addEventListener("pointermove", onPointerMove, { passive: true });
      drawer.addEventListener("pointerleave", onPointerLeave, { passive: true });
      drawer.addEventListener("touchstart", onTouchStart, { passive: true });
      drawer.addEventListener("touchend", onTouchEnd, { passive: true });
      state.bound = true;
    } else {
      makeLayers(drawer);
    }

    onScroll();
    schedule();
    return true;
  }

  function reset() {
    clearTimeout(state.resetTimer);
    state.targetX = 0;
    state.targetY = 0;
    schedule();
  }

  window.FZG = window.FZG || {};
  window.FZG.streamerMenuParallax = { mount, reset, unmount: unbind };

  // The LIVE drawer is part of the static portal DOM; mount once at startup.
  mount();
})();