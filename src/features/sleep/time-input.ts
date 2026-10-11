// Insert the separator and reject impossible hours/minutes while typing.
export function formatTimeInput(value: string, previous = ''): string {
  let digits = value.replace(/\D/g, '').slice(0, 4);
  if (previous.endsWith(':') && value === previous.slice(0, -1)) digits = digits.slice(0, -1);
  // A single-digit hour (e.g. 7) becomes 07; 730 can still be pasted.
  if (digits.length === 3 && Number(digits.slice(0, 2)) > 23) digits = '0' + digits;
  else if (digits.length === 1 && Number(digits) > 2) digits = '0' + digits;
  if (digits.length >= 2 && Number(digits.slice(0, 2)) > 23) return previous;
  if (digits.length >= 3 && Number(digits[2]) > 5) return previous;
  return digits.length > 2 ? digits.slice(0, 2) + ':' + digits.slice(2) : digits;
}
export function normalizeTimeInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 3) return '0' + digits[0] + ':' + digits.slice(1);
  if (digits.length === 4) return digits.slice(0, 2) + ':' + digits.slice(2);
  return value;
}
