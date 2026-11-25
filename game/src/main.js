// Simmer & Serve — boot and the one loop: input is read every frame, the world
// advances in fixed 1/60 s steps, and the renderer paints what is there.
// ?seed=N fixes the order pattern. ?shot=start|play|serve|end (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createAudio } from './audio.js';
import { createWorld, EVENT_EXPIRE, EVENT_GRILL_READY, EVENT_OVER } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, ACTION_MUTE, ACTION_SERVE, ACTION_TRASH, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off: the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, false, null);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.startGame();
    screen = SCREEN_PLAY;
    announce('Playing. Fill the tickets before their timers run out.');
  }

  function handleEvents(flags) {
    if (flags & EVENT_GRILL_READY) audio.ready();
    if (flags & EVENT_EXPIRE) audio.expire();
    if (flags & EVENT_OVER) {
      audio.over();
      audio.setSizzle(false);
      if (world.state.score > best) {
        best = world.state.score;
        saveBest(best);
      }
      screen = SCREEN_OVER;
      announce(`Shift over. Score ${world.state.score}, ${world.state.served} dishes served.`);
    }
  }

  const input = createInput(canvas, {
    screen: () => screen,
    click(hit) {
      audio.unlock();
      if (hit.kind === 'start' || hit.kind === 'again') {
        audio.pop();
        startGame();
        return;
      }
      if (screen !== SCREEN_PLAY) {
        if (screen === SCREEN_PAUSED) {
          screen = SCREEN_PLAY;
          last = performance.now();
        }
        return;
      }
      if (hit.kind === 'bin') {
        const ing = ['bun', 'patty', 'lettuce', 'tomato', 'cheese', 'cucumber', 'shell', 'egg'][hit.index];
        if (world.addIngredient(ing)) {
          if (ing === 'patty' || ing === 'egg') audio.place();
          else audio.pop();
        } else {
          audio.error();
        }
        return;
      }
      if (hit.kind === 'grill') {
        if (world.takeFromGrill(hit.index)) audio.pop();
        return;
      }
      if (hit.kind === 'serve') {
        const coins = world.serve();
        if (coins >= 0) {
          audio.serve();
          announce(`Served! +${coins} coins.`);
        } else {
          audio.error();
          announce('That plate matches no open ticket.');
        }
        return;
      }
      if (hit.kind === 'trash') {
        if (world.trashPlate()) audio.click();
      }
    },
    ingredient(id) {
      audio.unlock();
      if (screen !== SCREEN_PLAY) return;
      if (world.addIngredient(id)) {
        if (id === 'patty' || id === 'egg') audio.place();
        else audio.pop();
      } else {
        audio.error();
      }
    },
    action(kind) {
      audio.unlock();
      if (kind === ACTION_MUTE) {
        const muted = audio.toggleMute();
        announce(muted ? 'Sound off.' : 'Sound on.');
        return;
      }
      if (kind === ACTION_PAUSE) {
        if (screen === SCREEN_PLAY) {
          screen = SCREEN_PAUSED;
          audio.setSizzle(false);
          announce('Paused.');
        } else if (screen === SCREEN_PAUSED) {
          screen = SCREEN_PLAY;
          last = performance.now();
          announce('Playing.');
        }
        return;
      }
      if (kind === ACTION_CONFIRM) {
        if (screen === SCREEN_TITLE || screen === SCREEN_OVER) startGame();
        else if (screen === SCREEN_PAUSED) {
          screen = SCREEN_PLAY;
          last = performance.now();
        }
        return;
      }
      if (screen !== SCREEN_PLAY) return;
      if (kind === ACTION_SERVE) {
        const coins = world.serve();
        if (coins >= 0) {
          audio.serve();
          announce(`Served! +${coins} coins.`);
        } else {
          audio.error();
          announce('That plate matches no open ticket.');
        }
      } else if (kind === ACTION_TRASH) {
        if (world.trashPlate()) audio.click();
      }
    },
  });

  function frame(now) {
    const elapsed = Math.min(MAX_FRAME, (now - last) / 1000);
    last = now;
    if (screen === SCREEN_PLAY) {
      accumulator += elapsed;
      let guard = 0;
      while (accumulator >= STEP && guard < 8) {
        accumulator -= STEP;
        guard += 1;
        handleEvents(world.step(STEP));
        if (screen !== SCREEN_PLAY) break;
      }
      if (guard >= 8) accumulator = 0;
      audio.setSizzle(world.anyCooking());
    }
    renderer.draw(world.state, screen, best, audio.isMuted(), input.getHover());
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
