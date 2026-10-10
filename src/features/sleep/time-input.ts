// Keep incomplete input editable; validate the complete time when saving.
export function formatTimeInput(value: string, previous = ''): string {
  let digits = value.replace(/\D/g, '').slice(0, 4);
  // Backspacing the separator also removes the preceding digit.
  if (previous.endsWith(':') && value === previous.slice(0, -1)) digits = digits.slice(0, -1);
  return digits.length > 2 ? digits.slice(0, 2) + ':' + digits.slice(2) : digits;
}
export function normalizeTimeInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 3) return '0' + digits[0] + ':' + digits.slice(1);
  if (digits.length === 4) return digits.slice(0, 2) + ':' + digits.slice(2);
  return value;
}
