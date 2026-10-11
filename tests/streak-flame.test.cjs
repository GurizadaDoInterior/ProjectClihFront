const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
const { getFlameStage, flameStages } = require('../src/features/streak/flame.ts');
test('flame changes exactly at every milestone and keeps the last stage above 300', () => {
  for (const stage of flameStages.slice(1)) {
    assert.equal(getFlameStage(stage.days).days, stage.days);
    assert.notEqual(getFlameStage(stage.days - 1).days, stage.days);
  }
  assert.equal(getFlameStage(0).days, 0);
  assert.equal(getFlameStage(999).days, 300);
  assert.equal(new Set(flameStages.map(stage => stage.color)).size, 8);
});
