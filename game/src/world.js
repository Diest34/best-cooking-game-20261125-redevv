// Simmer & Serve — the kitchen state and its rules. Pure logic: no DOM, no canvas.
// The world advances in fixed STEP slices; the renderer paints whatever is here.
import {
  STEP,
  SHIFT_SECONDS,
  HEARTS,
  GRILL_COOK_SECONDS,
  GRILL_DONE_WINDOW,
  PLATE_MAX,
  SPAWN,
  PATIENCE,
  SERVE_BASE_COINS,
  SERVE_BASE_SCORE,
  COMBO_SCORE,
  INGREDIENTS,
  DISHES,
} from './config.js';

export const EVENT_SERVE = 1;
export const EVENT_EXPIRE = 2;
export const EVENT_OVER = 4;
export const EVENT_GRILL_READY = 8;
export const EVENT_BURNT = 16;

let nextOrderId = 1;

function newOrder(dish, patience) {
  return { id: nextOrderId, dish, patience, maxPatience: patience };
}

/** True when two multisets of ingredient ids hold exactly the same items. */
export function matchesRecipe(plate, recipe) {
  if (plate.length !== recipe.length) return false;
  const counts = new Map();
  for (const id of plate) counts.set(id, (counts.get(id) ?? 0) + 1);
  for (const id of recipe) {
    const left = counts.get(id) ?? 0;
    if (left === 0) return false;
    counts.set(id, left - 1);
  }
  return true;
}

/** The first open order the plate satisfies, or null. */
export function matchingOrder(state) {
  for (const order of state.orders) {
    if (matchesRecipe(state.plate, order.dish.recipe)) return order;
  }
  return null;
}

export function createWorld(random) {
  const state = {
    screen: 'title',
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    coins: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    hearts: HEARTS,
    served: 0,
    orders: [],
    plate: [],
    grill: [null, null],
    spawnIn: SPAWN.first,
    shake: 0,
    flash: 0,
    message: '',
    messageIn: 0,
    servedTotal: 0,
  };

  function reset() {
    state.screen = 'title';
    state.timeLeft = SHIFT_SECONDS;
    state.elapsed = 0;
    state.coins = 0;
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.hearts = HEARTS;
    state.served = 0;
    state.orders = [];
    state.plate = [];
    state.grill = [null, null];
    state.spawnIn = SPAWN.first;
    state.shake = 0;
    state.flash = 0;
    state.message = '';
    state.messageIn = 0;
    state.servedTotal = 0;
  }

  function startGame() {
    reset();
    state.screen = 'play';
    state.message = 'Lunch rush! Fill the tickets!';
    state.messageIn = 2.5;
  }

  function spawnOrder() {
    const dish = random.pick(DISHES);
    const progress = Math.min(1, state.elapsed / SHIFT_SECONDS);
    const patience = PATIENCE.start + (PATIENCE.end - PATIENCE.start) * progress;
    state.orders.push(newOrder(dish, patience));
  }

  function spawnInterval() {
    const progress = Math.min(1, state.elapsed / SHIFT_SECONDS);
    return SPAWN.start + (SPAWN.end - SPAWN.start) * progress;
  }

  function endShift() {
    state.screen = 'over';
    state.servedTotal = state.served;
  }

  /** Advance the world one fixed step. `events` collects EVENT_* flags. Returns flags. */
  function step(dt, events) {
    if (state.screen !== 'play') return 0;
    let flags = 0;
    state.elapsed += dt;
    state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
    if (state.flash > 0) state.flash = Math.max(0, state.flash - dt * 2);
    if (state.messageIn > 0) state.messageIn = Math.max(0, state.messageIn - dt);

    // New orders, up to three on the board.
    state.spawnIn -= dt;
    if (state.spawnIn <= 0 && state.orders.length < 3) {
      spawnOrder();
      state.spawnIn = spawnInterval() * (0.85 + random.next() * 0.3);
    }

    // Order patience runs out.
    for (let i = state.orders.length - 1; i >= 0; i -= 1) {
      const order = state.orders[i];
      order.patience -= dt;
      if (order.patience <= 0) {
        state.orders.splice(i, 1);
        state.hearts -= 1;
        state.combo = 0;
        state.message = `Ticket expired! -1 heart`;
        state.messageIn = 2;
        flags |= EVENT_EXPIRE;
        if (state.hearts <= 0) {
          endShift();
          return flags | EVENT_OVER;
        }
      }
    }

    // Grill timers.
    for (let i = 0; i < state.grill.length; i += 1) {
      const slot = state.grill[i];
      if (!slot) continue;
      slot.progress += dt;
      if (slot.state === 'cooking' && slot.progress >= GRILL_COOK_SECONDS) {
        slot.state = 'done';
        slot.progress = 0;
        flags |= EVENT_GRILL_READY;
      } else if (slot.state === 'done' && slot.progress >= GRILL_DONE_WINDOW) {
        slot.state = 'burnt';
        flags |= EVENT_BURNT;
        state.message = 'Something burned on the grill!';
        state.messageIn = 2;
      }
    }

    if (state.timeLeft <= 0) {
      endShift();
      return flags | EVENT_OVER;
    }
    return flags;
  }

  /** Click an ingredient bin. Returns true when something happened. */
  function addIngredient(id) {
    if (state.screen !== 'play') return false;
    const ing = INGREDIENTS.find((x) => x.id === id);
    if (!ing) return false;
    if (ing.kind === 'grill') {
      const free = state.grill.findIndex((s) => s === null);
      if (free === -1) {
        state.message = 'Grill is full!';
        state.messageIn = 1.5;
        return false;
      }
      state.grill[free] = { item: ing.id, state: 'cooking', progress: 0 };
      return true;
    }
    if (state.plate.length >= PLATE_MAX) {
      state.message = 'Plate is full — serve or trash it!';
      state.messageIn = 1.5;
      return false;
    }
    state.plate.push(ing.id);
    return true;
  }

  /** Click a grill slot: take a cooked item to the plate, or clear a burnt one. */
  function takeFromGrill(slotIndex) {
    if (state.screen !== 'play') return false;
    const slot = state.grill[slotIndex];
    if (!slot) return false;
    if (slot.state === 'burnt') {
      state.grill[slotIndex] = null;
      return true;
    }
    if (slot.state !== 'done') return false;
    if (state.plate.length >= PLATE_MAX) {
      state.message = 'Plate is full — serve or trash it!';
      state.messageIn = 1.5;
      return false;
    }
    const ing = INGREDIENTS.find((x) => x.id === slot.item);
    state.plate.push(ing.cookedId);
    state.grill[slotIndex] = null;
    return true;
  }

  function trashPlate() {
    if (state.screen !== 'play') return false;
    if (state.plate.length === 0) return false;
    state.plate = [];
    return true;
  }

  /** Serve the plate to the matching order. Returns the earned coins, or -1. */
  function serve() {
    if (state.screen !== 'play') return -1;
    const order = matchingOrder(state);
    if (!order) {
      state.shake = 0.35;
      return -1;
    }
    const coins = SERVE_BASE_COINS + Math.ceil(order.patience);
    state.coins += coins;
    state.score += SERVE_BASE_SCORE + state.combo * COMBO_SCORE;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.served += 1;
    state.orders = state.orders.filter((o) => o.id !== order.id);
    state.plate = [];
    state.flash = 1;
    state.message = `Served ${order.dish.name}! +${coins} coins`;
    state.messageIn = 2;
    return coins;
  }

  function anyCooking() {
    return state.grill.some((s) => s && s.state === 'cooking');
  }

  return {
    state,
    reset,
    startGame,
    step,
    addIngredient,
    takeFromGrill,
    trashPlate,
    serve,
    matchingOrder: () => matchingOrder(state),
    anyCooking,
  };
}
