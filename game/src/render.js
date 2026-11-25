// Simmer & Serve — every pixel is drawn in code: no images, no fonts to fetch.
// The canvas is a fixed 1280x720 logical field, scaled to the window.
import { FIELD, LAYOUT, PALETTE, FONT, INGREDIENTS } from './config.js';
import { matchesRecipe } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight = '700', align = 'center', font = FONT) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

/** Draw one ingredient as a little food illustration, centred at (x, y), size s. */
export function drawIngredient(ctx, id, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  const u = s / 100;
  switch (id) {
    case 'bun':
    case 'bunTop': {
      ctx.fillStyle = '#e8a94e';
      ctx.beginPath();
      ctx.ellipse(0, 6 * u, 46 * u, 26 * u, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#f7cf8a';
      ctx.beginPath();
      ctx.ellipse(0, 4 * u, 40 * u, 20 * u, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#fff';
      for (const [sx, sy] of [[-18, -14], [0, -20], [18, -14], [-8, -8], [10, -8]]) {
        ctx.beginPath();
        ctx.ellipse(sx * u, sy * u, 4 * u, 2.5 * u, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#d18a2e';
      ctx.fillRect(-46 * u, 6 * u, 92 * u, 8 * u);
      break;
    }
    case 'patty': {
      ctx.fillStyle = '#8a5a2b';
      rr(ctx, -44 * u, -14 * u, 88 * u, 30 * u, 14 * u);
      ctx.fill();
      ctx.fillStyle = '#a06a35';
      for (const [sx, sy] of [[-24, -2], [0, 6], [24, -4]]) {
        ctx.beginPath();
        ctx.arc(sx * u, sy * u, 6 * u, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'pattyCooked': {
      ctx.fillStyle = '#6e451f';
      rr(ctx, -44 * u, -14 * u, 88 * u, 30 * u, 14 * u);
      ctx.fill();
      ctx.strokeStyle = '#4a2c12';
      ctx.lineWidth = 4 * u;
      for (const gx of [-22, 0, 22]) {
        ctx.beginPath();
        ctx.moveTo(gx * u, -14 * u);
        ctx.lineTo(gx * u, 16 * u);
        ctx.stroke();
      }
      break;
    }
    case 'lettuce': {
      ctx.fillStyle = '#5da24a';
      ctx.beginPath();
      for (let i = 0; i < 7; i += 1) {
        const ax = (-48 + i * 16) * u;
        ctx.arc(ax, 0, 12 * u, Math.PI, 0);
      }
      ctx.lineTo(48 * u, 10 * u);
      ctx.lineTo(-48 * u, 10 * u);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#3f7a32';
      ctx.lineWidth = 3 * u;
      ctx.beginPath();
      ctx.moveTo(-40 * u, 2 * u);
      ctx.lineTo(40 * u, 2 * u);
      ctx.stroke();
      break;
    }
    case 'tomato': {
      ctx.fillStyle = '#d84a35';
      ctx.beginPath();
      ctx.arc(0, 2 * u, 34 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e86a52';
      ctx.beginPath();
      ctx.arc(-10 * u, -8 * u, 16 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4caf6d';
      ctx.beginPath();
      ctx.ellipse(0, -30 * u, 14 * u, 6 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'cheese': {
      ctx.fillStyle = '#f2c230';
      ctx.beginPath();
      ctx.moveTo(-44 * u, 14 * u);
      ctx.lineTo(44 * u, 14 * u);
      ctx.lineTo(0, -26 * u);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d89a12';
      for (const [sx, sy] of [[-14, 2], [12, 4], [0, -8]]) {
        ctx.beginPath();
        ctx.arc(sx * u, sy * u, 4 * u, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'cucumber': {
      ctx.fillStyle = '#5d8a3c';
      ctx.beginPath();
      ctx.ellipse(0, 0, 46 * u, 18 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a8d18d';
      for (const cx of [-24, 0, 24]) {
        ctx.beginPath();
        ctx.ellipse(cx * u, 0, 12 * u, 12 * u, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#eef7d8';
      for (const cx of [-24, 0, 24]) {
        ctx.beginPath();
        ctx.arc(cx * u, 0, 3 * u, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'shell': {
      ctx.fillStyle = '#e0b25e';
      ctx.beginPath();
      ctx.ellipse(0, 10 * u, 46 * u, 24 * u, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#c98f2e';
      for (const sx of [-28, -8, 12, 30]) {
        ctx.beginPath();
        ctx.arc(sx * u, -6 * u, 3 * u, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f7d794';
      ctx.beginPath();
      ctx.ellipse(0, 8 * u, 38 * u, 16 * u, 0, Math.PI, 0);
      ctx.fill();
      break;
    }
    case 'egg': {
      ctx.fillStyle = '#f6ead2';
      ctx.beginPath();
      ctx.ellipse(0, 0, 40 * u, 28 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d8c49a';
      ctx.lineWidth = 3 * u;
      ctx.beginPath();
      ctx.ellipse(0, 0, 40 * u, 28 * u, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'eggCooked': {
      ctx.fillStyle = '#fffdf4';
      ctx.beginPath();
      ctx.ellipse(0, 0, 44 * u, 26 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f2a007';
      ctx.beginPath();
      ctx.arc(0, 0, 16 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffc93c';
      ctx.beginPath();
      ctx.arc(-4 * u, -4 * u, 9 * u, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

function drawHeart(ctx, x, y, s, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 20, s / 20);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-12, -4, -8, -14, 0, -6);
  ctx.bezierCurveTo(8, -14, 12, -4, 0, 6);
  ctx.closePath();
  ctx.fillStyle = filled ? '#d84a35' : '#cbb9a0';
  ctx.fill();
  ctx.restore();
}

function drawFlame(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y);
  const wob = Math.sin(t * 9 + x) * 0.12;
  ctx.fillStyle = '#f28c13';
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.7, -s * 0.3, s * 0.45, s * 0.5, 0, s * 0.5);
  ctx.bezierCurveTo(-s * 0.45, s * 0.5, -s * 0.7, -s * 0.3, 0, -s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd23e';
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.55);
  ctx.bezierCurveTo(s * (0.4 + wob), -s * 0.1, s * 0.25, s * 0.45, 0, s * 0.45);
  ctx.bezierCurveTo(-s * 0.25, s * 0.45, -s * (0.4 + wob), -s * 0.1, 0, -s * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let t = 0;

  function fit() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = FIELD.width * dpr;
    canvas.height = FIELD.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fit();
  window.addEventListener('resize', fit);

  function drawBackground() {
    // Cream wall with a teal tile backsplash and a sunny window.
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.tile;
    ctx.fillRect(0, 58, FIELD.width, 132);
    ctx.fillStyle = PALETTE.tileDark;
    for (let x = 0; x < FIELD.width; x += 64) {
      ctx.fillRect(x, 58, 2, 132);
    }
    for (let y = 58; y < 190; y += 44) ctx.fillRect(0, y, FIELD.width, 2);
    // Window with a view.
    ctx.fillStyle = '#bfe3ef';
    rr(ctx, 1064, 66, 180, 116, 10);
    ctx.fill();
    ctx.fillStyle = '#8ec8e8';
    ctx.fillRect(1064, 66, 180, 60);
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(1200, 92, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7fb069';
    ctx.beginPath();
    ctx.ellipse(1150, 182, 90, 16, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#8a6a45';
    ctx.lineWidth = 6;
    ctx.strokeRect(1064, 66, 180, 116);
    ctx.beginPath();
    ctx.moveTo(1154, 66);
    ctx.lineTo(1154, 182);
    ctx.stroke();
    // Hanging pans.
    ctx.strokeStyle = '#5b4632';
    ctx.lineWidth = 3;
    for (const px of [620, 700, 780]) {
      ctx.beginPath();
      ctx.moveTo(px, 58);
      ctx.lineTo(px, 84);
      ctx.stroke();
    }
    ctx.fillStyle = PALETTE.steel;
    for (const [px, r] of [[620, 22], [700, 18], [780, 24]]) {
      ctx.beginPath();
      ctx.arc(px, 106, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6d7278';
      ctx.beginPath();
      ctx.arc(px - 6, 100, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.steel;
    }
    // Wooden counter band behind the grill and bins.
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(0, 196, FIELD.width, 252);
    ctx.fillStyle = PALETTE.counterTop;
    ctx.fillRect(0, 196, FIELD.width, 12);
  }

  function drawHud(state, best, muted) {
    const { hud } = LAYOUT;
    ctx.fillStyle = '#2e2118';
    ctx.fillRect(hud.x, hud.y, hud.w, hud.h);
    text(ctx, 'SIMMER & SERVE', 24, 30, 26, '#f2c230', '800', 'left');
    text(ctx, 'tiny kitchen rush', 268, 32, 13, '#cbb9a0', '600', 'left');
    // Shift timer.
    const total = 150;
    const frac = Math.max(0, state.timeLeft / total);
    const bx = 470, by = 16, bw = 340, bh = 26;
    ctx.fillStyle = '#4a3a28';
    rr(ctx, bx, by, bw, bh, 13);
    ctx.fill();
    ctx.fillStyle = state.timeLeft <= 20 ? '#d84a35' : '#4caf6d';
    if (frac > 0) {
      rr(ctx, bx + 2, by + 2, Math.max(8, (bw - 4) * frac), bh - 4, 11);
      ctx.fill();
    }
    const mm = Math.floor(state.timeLeft / 60);
    const ss = String(Math.floor(state.timeLeft % 60)).padStart(2, '0');
    text(ctx, `${mm}:${ss}`, bx + bw / 2, by + bh / 2 + 1, 17, '#fff', '800');
    // Coins, score, hearts.
    ctx.fillStyle = '#f2c230';
    ctx.beginPath();
    ctx.arc(856, 29, 13, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, '¢', 856, 30, 16, '#7d5a00', '800');
    text(ctx, String(state.coins), 876, 30, 20, '#fff', '800', 'left');
    text(ctx, `SCORE ${state.score}`, 960, 30, 18, '#fff', '800', 'left');
    for (let i = 0; i < 3; i += 1) drawHeart(ctx, 1096 + i * 30, 29, 20, i < state.hearts);
    text(ctx, muted ? 'MUTED (M)' : 'M sound', 1256, 30, 12, '#cbb9a0', '600', 'right');
    if (best > 0) text(ctx, `BEST ${best}`, 1256, 48, 11, '#8a7a63', '600', 'right');
  }

  function drawTicket(order, x, y, w, h, urgent) {
    ctx.fillStyle = PALETTE.ticket;
    rr(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = '#d9c9a8';
    ctx.lineWidth = 2;
    rr(ctx, x, y, w, h, 10);
    ctx.stroke();
    // Perforation edge.
    ctx.fillStyle = '#e8dcc0';
    for (let px = x + 10; px < x + w - 8; px += 14) {
      ctx.beginPath();
      ctx.arc(px, y + h - 1, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    text(ctx, order.dish.name.toUpperCase(), x + 14, y + 18, 16, PALETTE.ticketInk, '800', 'left');
    text(ctx, `#${order.id}`, x + w - 12, y + 18, 13, PALETTE.muted, '700', 'right');
    // Recipe icons.
    const icons = order.dish.recipe;
    const step = Math.min(56, (w - 28) / icons.length);
    icons.forEach((id, i) => {
      drawIngredient(ctx, id, x + 24 + i * step + step / 2 - 8, y + 56, 44);
    });
    // Patience bar.
    const frac = Math.max(0, order.patience / order.maxPatience);
    const bx = x + 14, by = y + h - 26, bw = w - 28, bh = 12;
    ctx.fillStyle = '#e8dcc0';
    rr(ctx, bx, by, bw, bh, 6);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#4caf6d' : frac > 0.25 ? '#f2a007' : '#d84a35';
    if (frac > 0) {
      rr(ctx, bx, by, Math.max(10, bw * frac), bh, 6);
      ctx.fill();
    }
    text(ctx, `${Math.ceil(order.patience)}s`, bx + bw / 2, by + bh / 2 + 1, 11, '#fff', '800');
    if (urgent) {
      ctx.strokeStyle = '#d84a35';
      ctx.lineWidth = 3;
      rr(ctx, x, y, w, h, 10);
      ctx.stroke();
    }
  }

  function drawBoard(state) {
    const { board, ticket } = LAYOUT;
    ctx.fillStyle = '#4a3626';
    rr(ctx, board.x - 8, board.y - 6, board.w + 16, board.h + 12, 12);
    ctx.fill();
    text(ctx, 'ORDER BOARD', board.x + 4, board.y + 10, 13, '#f3e2c7', '800', 'left');
    state.orders.forEach((order, i) => {
      drawTicket(order, board.x + i * (ticket.w + ticket.gap), board.y + 18, ticket.w, ticket.h, order.patience < 12);
    });
    if (state.orders.length === 0) {
      text(ctx, 'No orders — take a breath, chef!', board.x + 420, board.y + 52, 18, '#cbb9a0', '600');
    }
  }

  function drawGrill(state) {
    const { grill, grillSlot } = LAYOUT;
    ctx.fillStyle = PALETTE.wood;
    rr(ctx, grill.x, grill.y, grill.w, grill.h, 12);
    ctx.fill();
    text(ctx, 'GRILL', grill.x + grill.w / 2, grill.y + 22, 16, '#fff8e7', '800');
    text(ctx, 'click a cooked item to plate it', grill.x + grill.w / 2, grill.y + 42, 11, '#f3e2c7', '600');
    state.grill.forEach((slot, i) => {
      const sx = grill.x + 22 + i * (grillSlot.w + grillSlot.gap);
      const sy = grill.y + 62;
      ctx.fillStyle = PALETTE.grill;
      rr(ctx, sx, sy, grillSlot.w, grillSlot.h, 12);
      ctx.fill();
      // Grate lines.
      ctx.strokeStyle = '#454a52';
      ctx.lineWidth = 4;
      for (let gy = sy + 22; gy < sy + grillSlot.h - 10; gy += 20) {
        ctx.beginPath();
        ctx.moveTo(sx + 8, gy);
        ctx.lineTo(sx + grillSlot.w - 8, gy);
        ctx.stroke();
      }
      if (!slot) {
        text(ctx, 'empty', sx + grillSlot.w / 2, sy + grillSlot.h / 2, 14, '#6d7278', '600');
        return;
      }
      const cx = sx + grillSlot.w / 2;
      const cy = sy + grillSlot.h / 2 - 6;
      if (slot.state === 'cooking') {
        drawFlame(ctx, cx - 34, sy + grillSlot.h - 26, 12, t);
        drawFlame(ctx, cx + 34, sy + grillSlot.h - 26, 10, t + 1);
        drawIngredient(ctx, slot.item, cx, cy, 78);
        const frac = Math.min(1, slot.progress / 6);
        ctx.strokeStyle = '#f2c230';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(cx, cy, 52, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
        ctx.stroke();
        text(ctx, 'cooking…', cx, sy + grillSlot.h - 12, 13, '#f2c230', '700');
      } else if (slot.state === 'done') {
        const cooked = slot.item === 'patty' ? 'pattyCooked' : 'eggCooked';
        drawIngredient(ctx, cooked, cx, cy, 84);
        ctx.fillStyle = '#4caf6d';
        rr(ctx, cx - 52, sy + grillSlot.h - 30, 104, 22, 11);
        ctx.fill();
        text(ctx, 'READY!', cx, sy + grillSlot.h - 19, 13, '#fff', '800');
      } else {
        // Burnt: a charred lump with smoke.
        ctx.fillStyle = '#1c1a17';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 6, 40, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(200,200,200,0.7)';
        for (let k = 0; k < 3; k += 1) {
          ctx.beginPath();
          ctx.arc(cx - 16 + k * 16, cy - 26 - ((t * 22 + k * 14) % 34), 7 - k, 0, Math.PI * 2);
          ctx.fill();
        }
        text(ctx, 'BURNT — click to toss', cx, sy + grillSlot.h - 12, 12, '#ff8a70', '700');
      }
    });
  }

  function drawBins(state, hover) {
    const { bins } = LAYOUT;
    const bw = (bins.w - (bins.cols - 1) * bins.gap) / bins.cols;
    const bh = (bins.h - (bins.rows - 1) * bins.gap) / bins.rows;
    INGREDIENTS.forEach((ing, i) => {
      const col = i % bins.cols;
      const row = Math.floor(i / bins.cols);
      const x = bins.x + col * (bw + bins.gap);
      const y = bins.y + row * (bh + bins.gap);
      const isHover = hover && hover.kind === 'bin' && hover.index === i;
      ctx.fillStyle = isHover ? '#f7e8c8' : '#fff8e7';
      rr(ctx, x, y, bw, bh, 10);
      ctx.fill();
      ctx.strokeStyle = isHover ? '#d84a35' : '#d9c9a8';
      ctx.lineWidth = isHover ? 3 : 2;
      rr(ctx, x, y, bw, bh, 10);
      ctx.stroke();
      drawIngredient(ctx, ing.id, x + bw / 2, y + 44, 62);
      text(ctx, ing.name, x + bw / 2, y + 82, 14, PALETTE.ticketInk, '700');
      text(ctx, `[${ing.key}]`, x + bw / 2, y + 100, 11, PALETTE.muted, '600');
      if (ing.kind === 'grill') {
        ctx.fillStyle = '#f28c13';
        rr(ctx, x + bw - 46, y + 8, 38, 18, 9);
        ctx.fill();
        text(ctx, 'GRILL', x + bw - 27, y + 17, 10, '#fff', '800');
      }
    });
  }

  function drawPlate(state, hover) {
    const { plateArea, plate } = LAYOUT;
    ctx.fillStyle = '#4a3626';
    rr(ctx, plateArea.x - 8, plateArea.y - 6, plateArea.w + 16, plateArea.h + 12, 12);
    ctx.fill();
    text(ctx, 'ASSEMBLY PLATE', plateArea.x + 4, plateArea.y + 8, 13, '#f3e2c7', '800', 'left');
    const shakeX = state.shake > 0 ? Math.sin(t * 60) * 6 * state.shake : 0;
    // Plate.
    ctx.save();
    ctx.translate(shakeX, 0);
    ctx.fillStyle = PALETTE.plateRim;
    ctx.beginPath();
    ctx.ellipse(plate.cx, plate.cy, plate.rx, plate.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.plate;
    ctx.beginPath();
    ctx.ellipse(plate.cx, plate.cy, plate.rx - 12, plate.ry - 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // Stacked ingredients, bottom-up.
    const items = state.plate;
    items.forEach((id, i) => {
      const y = plate.cy - 18 - i * 22;
      drawIngredient(ctx, id, plate.cx, y, 92);
    });
    ctx.restore();
    if (items.length === 0) {
      text(ctx, 'click ingredients to build a dish', plate.cx, plate.cy - 4, 15, '#b8a88e', '600');
    }
    // Recipe reminder of the first order.
    const first = state.orders[0];
    if (first) {
      const rx = plateArea.x + 470;
      text(ctx, `Ticket #${first.id} needs:`, rx, plateArea.y + 30, 13, '#f3e2c7', '700', 'left');
      first.dish.recipe.forEach((id, i) => {
        drawIngredient(ctx, id, rx + 26 + i * 48, plateArea.y + 66, 40);
      });
      const have = first.dish.recipe.filter((id) => items.includes(id)).length;
      text(ctx, `${have}/${first.dish.recipe.length} on the plate`, rx, plateArea.y + 100, 13, have === first.dish.recipe.length ? '#8fd6a4' : '#f3e2c7', '700', 'left');
    }
  }

  function drawServe(state, hover) {
    const { serve, serveButton, trashButton } = LAYOUT;
    const match = state.plate.length > 0
      && state.orders.some((o) => matchesRecipe(state.plate, o.dish.recipe));
    ctx.fillStyle = '#4a3626';
    rr(ctx, serve.x - 8, serve.y - 6, serve.w + 16, serve.h + 12, 12);
    ctx.fill();
    text(ctx, 'SERVE WINDOW', serve.x + 4, serve.y + 8, 13, '#f3e2c7', '800', 'left');
    // The bell and the hatch.
    ctx.fillStyle = '#2e2118';
    rr(ctx, serve.x + 24, serve.y + 30, serve.w - 48, 52, 10);
    ctx.fill();
    ctx.fillStyle = '#f2c230';
    ctx.beginPath();
    ctx.arc(serve.x + 236, serve.y + 58, 20, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(serve.x + 212, serve.y + 58, 48, 7);
    ctx.fillStyle = '#d89a12';
    ctx.beginPath();
    ctx.arc(serve.x + 236, serve.y + 71, 5, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, match ? 'READY TO SERVE!' : 'match a ticket, then serve', serve.x + serve.w / 2, serve.y + 98, 16, match ? '#8fd6a4' : '#cbb9a0', '800');
    // Serve button.
    const isHover = hover && hover.kind === 'serve';
    const glow = match ? 0.5 + 0.5 * Math.sin(t * 5) : 0;
    if (match) {
      ctx.fillStyle = `rgba(76,175,109,${0.25 + glow * 0.25})`;
      rr(ctx, serveButton.x - 8, serveButton.y - 8, serveButton.w + 16, serveButton.h + 16, 16);
      ctx.fill();
    }
    ctx.fillStyle = match ? '#4caf6d' : isHover ? '#5a5148' : '#6d7278';
    rr(ctx, serveButton.x, serveButton.y, serveButton.w, serveButton.h, 14);
    ctx.fill();
    text(ctx, 'SERVE  [Space]', serveButton.x + serveButton.w / 2, serveButton.y + serveButton.h / 2, 26, '#fff', '800');
    // Trash button.
    const trashHover = hover && hover.kind === 'trash';
    ctx.fillStyle = trashHover ? '#a92f20' : '#7a3a30';
    rr(ctx, trashButton.x, trashButton.y, trashButton.w, trashButton.h, 10);
    ctx.fill();
    text(ctx, 'TRASH PLATE  [T]', trashButton.x + trashButton.w / 2, trashButton.y + trashButton.h / 2, 14, '#ffd9d0', '700');
    // Combo + served.
    text(ctx, `DISHES SERVED  ${state.served}`, serve.x + 24, serve.y + 200, 15, '#f3e2c7', '700', 'left');
    if (state.combo >= 2) {
      drawFlame(ctx, serve.x + serve.w - 122, serve.y + 194, 13, t);
      text(ctx, `COMBO x${state.combo}`, serve.x + serve.w - 24, serve.y + 200, 17, '#f2a007', '800', 'right');
    }
    return match;
  }

  function drawMessage(state) {
    if (state.messageIn <= 0 || !state.message) return;
    const alpha = Math.min(1, state.messageIn);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(46,33,24,0.92)';
    const w = ctx.measureText(state.message).width + 44;
    rr(ctx, FIELD.width / 2 - w / 2, 200, w, 40, 20);
    ctx.fill();
    text(ctx, state.message, FIELD.width / 2, 221, 17, '#fff8e7', '700');
    ctx.restore();
  }

  function drawTitle(state, best) {
    ctx.fillStyle = 'rgba(30,20,12,0.55)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.cream;
    rr(ctx, 290, 120, 700, 420, 18);
    ctx.fill();
    ctx.strokeStyle = '#d84a35';
    ctx.lineWidth = 4;
    rr(ctx, 290, 120, 700, 420, 18);
    ctx.stroke();
    text(ctx, 'SIMMER & SERVE', 640, 178, 52, '#d84a35', '800');
    text(ctx, 'a tiny kitchen rush', 640, 218, 20, PALETTE.muted, '600');
    drawIngredient(ctx, 'bun', 480, 268, 70);
    drawIngredient(ctx, 'pattyCooked', 560, 268, 70);
    drawIngredient(ctx, 'tomato', 640, 268, 70);
    drawIngredient(ctx, 'lettuce', 720, 268, 70);
    drawIngredient(ctx, 'cheese', 800, 268, 70);
    const lines = [
      'Orders roll in on the board — build each dish on your plate.',
      'Patties and eggs must be grilled first. Burned food gets tossed.',
      'Serve before the ticket timer runs out. Three strikes and the shift ends.',
    ];
    lines.forEach((line, i) => text(ctx, line, 640, 322 + i * 26, 16, PALETTE.text, '600'));
    text(ctx, 'Mouse: click bins, grill and SERVE   •   Keys: 1-8 ingredients, Space serve, T trash, P pause, M mute', 640, 420, 13, PALETTE.muted, '600');
    ctx.fillStyle = '#4caf6d';
    rr(ctx, 490, 448, 300, 56, 14);
    ctx.fill();
    text(ctx, 'START SHIFT  ▶', 640, 477, 24, '#fff', '800');
    if (best > 0) text(ctx, `Best score: ${best}`, 640, 522, 15, PALETTE.muted, '700');
  }

  function drawPaused() {
    ctx.fillStyle = 'rgba(30,20,12,0.6)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    text(ctx, 'PAUSED', 640, 330, 54, '#fff', '800');
    text(ctx, 'Press P or click to get back to the rush', 640, 380, 18, '#f3e2c7', '600');
  }

  function drawOver(state, best) {
    ctx.fillStyle = 'rgba(30,20,12,0.62)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.cream;
    rr(ctx, 330, 130, 620, 420, 18);
    ctx.fill();
    ctx.strokeStyle = '#d84a35';
    ctx.lineWidth = 4;
    rr(ctx, 330, 130, 620, 420, 18);
    ctx.stroke();
    text(ctx, 'SHIFT OVER!', 640, 190, 44, '#d84a35', '800');
    const isBest = state.score >= best && state.score > 0;
    if (isBest) text(ctx, '★ NEW BEST SCORE ★', 640, 228, 20, '#d89a12', '800');
    const rows = [
      ['Dishes served', String(state.served)],
      ['Coins earned', `¢ ${state.coins}`],
      ['Best combo', `x${state.bestCombo}`],
      ['Score', String(state.score)],
      ['Best score', String(Math.max(best, state.score))],
    ];
    rows.forEach(([label, value], i) => {
      const y = 280 + i * 40;
      text(ctx, label, 420, y, 19, PALETTE.muted, '700', 'left');
      text(ctx, value, 860, y, 21, PALETTE.text, '800', 'right');
    });
    ctx.fillStyle = '#4caf6d';
    rr(ctx, 490, 478, 300, 52, 14);
    ctx.fill();
    text(ctx, 'PLAY AGAIN  ▶', 640, 505, 22, '#fff', '800');
  }

  function draw(state, screen, best, muted, hover) {
    t += 1 / 60;
    drawBackground();
    drawHud(state, best, muted);
    drawBoard(state);
    drawGrill(state);
    drawBins(state, hover);
    drawPlate(state, hover);
    drawServe(state, hover);
    drawMessage(state);
    if (screen === SCREEN_TITLE) drawTitle(state, best);
    else if (screen === SCREEN_PAUSED) drawPaused();
    else if (screen === SCREEN_OVER) drawOver(state, best);
    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255,240,180,${state.flash * 0.25})`;
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    }
  }

  return { draw, drawIngredient };
}
