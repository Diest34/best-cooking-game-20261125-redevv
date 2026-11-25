// The screenshot scenes behind ?shot=start|play|serve|end. Each one builds a real
// game state with the world's own rules (orders, plate, grill), so the frame is
// what a short game really looks like — and the same seed always gives it.
import { DISHES } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

function order(state, dishId, patience, maxPatience, id) {
  const dish = DISHES.find((d) => d.id === dishId);
  state.orders.push({ id, dish, patience, maxPatience });
}

/**
 * Set `world`'s state to the named scene and return the screen to draw over it
 * and the best score to show.
 */
export function stageShot(name, world) {
  const s = world.state;
  world.reset();
  if (name === 'play') {
    s.screen = SCREEN_PLAY;
    s.timeLeft = 118;
    s.elapsed = 32;
    s.coins = 35;
    s.score = 240;
    s.combo = 2;
    s.bestCombo = 3;
    s.hearts = 3;
    s.served = 2;
    order(s, 'burger', 26, 42, 1);
    order(s, 'taco', 14, 38, 2);
    // A burger mid-assembly: bun and grilled patty on, lettuce and tomato to go.
    s.plate = ['bun', 'pattyCooked'];
    // A patty sizzling on the grill, halfway cooked.
    s.grill[0] = { item: 'patty', state: 'cooking', progress: 3.1 };
    s.message = '';
    return { screen: SCREEN_PLAY, best: 240 };
  }
  if (name === 'serve') {
    s.screen = SCREEN_PLAY;
    s.timeLeft = 96;
    s.elapsed = 54;
    s.coins = 60;
    s.score = 410;
    s.combo = 3;
    s.bestCombo = 3;
    s.hearts = 3;
    s.served = 4;
    order(s, 'burger', 30, 42, 3);
    order(s, 'salad', 18, 36, 4);
    // The full burger, matching ticket #3 — the serve window glows.
    s.plate = ['bun', 'pattyCooked', 'lettuce', 'tomato'];
    s.message = '';
    return { screen: SCREEN_PLAY, best: 410 };
  }
  if (name === 'end') {
    s.screen = SCREEN_OVER;
    s.timeLeft = 0;
    s.elapsed = 150;
    s.coins = 132;
    s.score = 890;
    s.combo = 0;
    s.bestCombo = 4;
    s.hearts = 1;
    s.served = 7;
    s.message = '';
    return { screen: SCREEN_OVER, best: 890 };
  }
  // Default: the title screen over a kitchen with two tickets waiting.
  s.screen = SCREEN_TITLE;
  s.timeLeft = 150;
  s.coins = 0;
  s.score = 0;
  order(s, 'burger', 34, 42, 1);
  order(s, 'salad', 22, 36, 2);
  s.message = '';
  return { screen: SCREEN_TITLE, best: 240 };
}
