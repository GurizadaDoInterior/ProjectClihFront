export const SWIPE_WIDTH = 100;
export const shouldStartSwipe = (dx: number, dy: number, opened: boolean) => Math.abs(dx) >= 8 && Math.abs(dx) > Math.abs(dy) * 1.5 && (dx < 0 || opened);
export const swipeOffset = (start: number, dx: number, width = SWIPE_WIDTH) => Math.max(-width, Math.min(0, start + dx));
export const swipeDestination = (offset: number) => offset <= -40 ? -SWIPE_WIDTH : 0;

export const isFullSwipe = (offset: number, width: number) => width >= 140 && -offset >= width * 0.8;
