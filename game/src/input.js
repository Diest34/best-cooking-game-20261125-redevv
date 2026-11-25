// Mouse and keyboard input for Simmer & Serve. Hit-testing shares the layout
// rects in config.js with the renderer, so a click lands where the art is.
import { LAYOUT, INGREDIENTS } from './config.js';

export const ACTION_CONFIRM = 'confirm';
export const ACTION_PAUSE = 'pause';
export const ACTION_MUTE = 'mute';
export const ACTION_TRASH = 'trash';
export const ACTION_SERVE = 'serve';

function binRect(i) {
  const { bins } = LAYOUT;
  const bw = (bins.w - (bins.cols - 1) * bins.gap) / bins.cols;
  const bh = (bins.h - (bins.rows - 1) * bins.gap) / bins.rows;
  const col = i % bins.cols;
  const row = Math.floor(i / bins.cols);
  return {
    x: bins.x + col * (bw + bins.gap),
    y: bins.y + row * (bh + bins.gap),
    w: bw,
    h: bh,
  };
}

function grillRect(i) {
  const { grill, grillSlot } = LAYOUT;
  return {
    x: grill.x + 22 + i * (grillSlot.w + grillSlot.gap),
    y: grill.y + 62,
    w: grillSlot.w,
    h: grillSlot.h,
  };
}

function inside(r, x, y) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

/**
 * Describe what sits under logical point (x, y):
 * {kind:'bin',index} | {kind:'grill',index} | {kind:'serve'} | {kind:'trash'}
 * | {kind:'start'} | {kind:'again'} | null. Used for hover and clicks.
 */
export function hitTest(x, y, screen) {
  if (screen === 'title') {
    if (inside({ x: 490, y: 448, w: 300, h: 56 }, x, y)) return { kind: 'start' };
    return null;
  }
  if (screen === 'over') {
    if (inside({ x: 490, y: 478, w: 300, h: 52 }, x, y)) return { kind: 'again' };
    return null;
  }
  if (screen !== 'play') return null;
  for (let i = 0; i < INGREDIENTS.length; i += 1) {
    if (inside(binRect(i), x, y)) return { kind: 'bin', index: i };
  }
  for (let i = 0; i < 2; i += 1) {
    if (inside(grillRect(i), x, y)) return { kind: 'grill', index: i };
  }
  if (inside(LAYOUT.serveButton, x, y)) return { kind: 'serve' };
  if (inside(LAYOUT.trashButton, x, y)) return { kind: 'trash' };
  return null;
}

export function createInput(canvas, handlers) {
  let hover = null;

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 720,
    };
  }

  canvas.addEventListener('mousemove', (event) => {
    const p = toLogical(event);
    hover = hitTest(p.x, p.y, handlers.screen());
  });

  canvas.addEventListener('mouseleave', () => {
    hover = null;
  });

  canvas.addEventListener('click', (event) => {
    const p = toLogical(event);
    const hit = hitTest(p.x, p.y, handlers.screen());
    if (hit) handlers.click(hit);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'p' || key === 'escape') {
      handlers.action(ACTION_PAUSE);
      return;
    }
    if (key === 'm') {
      handlers.action(ACTION_MUTE);
      return;
    }
    if (handlers.screen() !== 'play') {
      if (key === 'enter' || key === ' ') handlers.action(ACTION_CONFIRM);
      return;
    }
    if (key === ' ') {
      event.preventDefault();
      handlers.action(ACTION_SERVE);
      return;
    }
    if (key === 't') {
      handlers.action(ACTION_TRASH);
      return;
    }
    const ing = INGREDIENTS.find((x) => x.key === key);
    if (ing) handlers.ingredient(ing.id);
  });

  return {
    getHover() {
      return hover;
    },
  };
}
