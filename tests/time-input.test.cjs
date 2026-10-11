const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
const { formatTimeInput, normalizeTimeInput } = require('../src/features/sleep/time-input.ts');
test('numeric typing automatically inserts the separator', () => {
  assert.equal(formatTimeInput('2'), '2');
  assert.equal(formatTimeInput('22'), '22');
  assert.equal(formatTimeInput('223'), '22:3');
  assert.equal(formatTimeInput('22:30'), '22:30');
  assert.equal(formatTimeInput('0700'), '07:00');
  assert.equal(formatTimeInput('abc223045'), '22:30');
});
test('backspacing and clearing remain editable', () => {
  assert.equal(formatTimeInput('22:3', '22:30'), '22:3');
  assert.equal(formatTimeInput('22:', '22:3'), '22');
  assert.equal(formatTimeInput('2', '22'), '2');
  assert.equal(formatTimeInput('', '22:30'), '');
});
test('three or four digits normalize to a complete time', () => {
  assert.equal(normalizeTimeInput('730'), '07:30');
  assert.equal(normalizeTimeInput('2230'), '22:30');
  assert.equal(normalizeTimeInput('00:00'), '00:00');
  assert.equal(normalizeTimeInput('25:70'), '25:70'); // schema rejects invalid ranges
});

test('rejects impossible hours and minutes without replacing the previous input', () => {
  assert.equal(formatTimeInput('28', '2'), '2');
  assert.equal(formatTimeInput('2899', '23:00'), '23:00');
  assert.equal(formatTimeInput('23:6', '23'), '23');
  assert.equal(formatTimeInput('2399', ''), '');
  assert.equal(formatTimeInput('2359'), '23:59');
  assert.equal(formatTimeInput('0000'), '00:00');
  assert.equal(formatTimeInput('7'), '07');
  assert.equal(formatTimeInput('730'), '07:30');
});
