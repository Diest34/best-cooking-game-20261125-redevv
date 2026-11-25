// Simmer & Serve — every tuning number, recipe and layout rect in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the
// window, so no rule below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second. */
export const STEP = 1 / 60;

/** Length of one lunch-rush shift, in seconds. */
export const SHIFT_SECONDS = 150;

export const HEARTS = 3;

/** Seconds a raw item needs on the grill before it is cooked. */
export const GRILL_COOK_SECONDS = 6;
/** Seconds a cooked item waits on the grill before it burns. */
export const GRILL_DONE_WINDOW = 6;

/** How many ingredients can sit on the plate at once. */
export const PLATE_MAX = 6;

/** Seconds between order spawns at the start of the shift, shrinking as it goes on. */
export const SPAWN = { first: 2, start: 15, end: 8, shrinkPerSecond: 0.045 };
/** Order patience in seconds: start value shrinking toward the end value. */
export const PATIENCE = { start: 42, end: 28 };

/** Coins for a serve: base plus one per whole patience second left. */
export const SERVE_BASE_COINS = 10;
/** Score for a serve: base plus a combo bonus. */
export const SERVE_BASE_SCORE = 100;
export const COMBO_SCORE = 25;

/**
 * Ingredients. kind 'cold' goes straight from its bin to the plate;
 * kind 'grill' must be cooked on the grill first (raw -> cooked id).
 */
export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', key: '1', kind: 'cold', color: '#e8a94e' },
  { id: 'patty', name: 'Patty', key: '2', kind: 'grill', color: '#8a5a2b', cookedId: 'pattyCooked', cookedName: 'Grilled Patty' },
  { id: 'lettuce', name: 'Lettuce', key: '3', kind: 'cold', color: '#5da24a' },
  { id: 'tomato', name: 'Tomato', key: '4', kind: 'cold', color: '#d84a35' },
  { id: 'cheese', name: 'Cheese', key: '5', kind: 'cold', color: '#f2c230' },
  { id: 'cucumber', name: 'Cucumber', key: '6', kind: 'cold', color: '#7fb069' },
  { id: 'shell', name: 'Shell', key: '7', kind: 'cold', color: '#e0b25e' },
  { id: 'egg', name: 'Egg', key: '8', kind: 'grill', color: '#f6ead2', cookedId: 'eggCooked', cookedName: 'Fried Egg' },
];

export const COOKED = {
  pattyCooked: { id: 'pattyCooked', name: 'Grilled Patty', color: '#6e451f' },
  eggCooked: { id: 'eggCooked', name: 'Fried Egg', color: '#fff3c4' },
};

/** Dishes: the recipe is the exact multiset of ingredient ids the plate must hold. */
export const DISHES = [
  { id: 'burger', name: 'Classic Burger', recipe: ['bun', 'pattyCooked', 'lettuce', 'tomato'], color: '#e8a94e' },
  { id: 'salad', name: 'Garden Salad', recipe: ['lettuce', 'tomato', 'cucumber'], color: '#5da24a' },
  { id: 'taco', name: 'Crispy Taco', recipe: ['shell', 'pattyCooked', 'lettuce', 'cheese'], color: '#e0b25e' },
  { id: 'breakfast', name: 'Sunny Breakfast', recipe: ['eggCooked', 'cheese', 'tomato'], color: '#f2c230' },
];

export function dishById(id) {
  return DISHES.find((d) => d.id === id);
}

export function ingredientById(id) {
  return INGREDIENTS.find((i) => i.id === id) ?? COOKED[id] ?? null;
}

/** Fixed layout rects (logical 1280x720 coordinates), shared by render and input. */
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 58 },
  board: { x: 24, y: 70, w: 1232, h: 118 },
  ticket: { w: 292, h: 104, gap: 16 },
  grill: { x: 24, y: 204, w: 372, h: 236 },
  grillSlot: { w: 150, h: 150, gap: 24 },
  bins: { x: 420, y: 204, w: 836, h: 236, cols: 4, rows: 2, gap: 12 },
  plateArea: { x: 24, y: 456, w: 736, h: 248 },
  plate: { cx: 340, cy: 622, rx: 250, ry: 58 },
  serve: { x: 784, y: 456, w: 472, h: 248 },
  serveButton: { x: 824, y: 566, w: 392, h: 76 },
  trashButton: { x: 824, y: 668, w: 392, h: 28 },
};

export const PALETTE = {
  wall: '#f3e2c7',
  wallShadow: '#e8d3ae',
  tile: '#3f8f7b',
  tileDark: '#2f6f60',
  tileLine: '#d8e6df',
  wood: '#a9713d',
  woodDark: '#7d4f27',
  counter: '#c98d54',
  counterTop: '#e0aa6e',
  steel: '#3a3f47',
  steelLight: '#565d68',
  grill: '#23262b',
  plate: '#fdfdf6',
  plateRim: '#d9d4c5',
  ticket: '#fff8e7',
  ticketInk: '#3d2c1a',
  text: '#2e2118',
  muted: '#8a7a63',
  accent: '#d84a35',
  accentDark: '#a92f20',
  gold: '#f2c230',
  green: '#4caf6d',
  greenDark: '#2e7d46',
  red: '#d84a35',
  cream: '#fff8e7',
};

export const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'simmer-and-serve.best';
