export const SWIPE_WIDTH = 100;
export const shouldStartSwipe = (dx: number, dy: number, opened: boolean) => Math.abs(dx) >= 8 && Math.abs(dx) > Math.abs(dy) * 1.5 && (dx < 0 || opened);
export const swipeOffset = (start: number, dx: number) => Math.max(-SWIPE_WIDTH, Math.min(0, start + dx));
export const swipeDestination = (offset: number) => offset <= -40 ? -SWIPE_WIDTH : 0;
