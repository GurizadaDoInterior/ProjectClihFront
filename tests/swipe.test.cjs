const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const moduleOutput = {exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/swipe-gesture.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:moduleOutput.exports,module:moduleOutput});
const {shouldStartSwipe,swipeOffset,swipeDestination}=moduleOutput.exports;
test('swipe separates horizontal deletion gestures from vertical scrolling and taps',()=>{
  assert.equal(shouldStartSwipe(-20,2,false),true);
  assert.equal(shouldStartSwipe(-4,1,false),false);
  assert.equal(shouldStartSwipe(-9,25,false),false);
  assert.equal(shouldStartSwipe(-20,18,false),false);
  assert.equal(shouldStartSwipe(30,2,false),false);
  assert.equal(shouldStartSwipe(30,2,true),true);
});
test('swipe bounds both opening and closing to the visible delete action',()=>{
  assert.equal(swipeOffset(0,-180),-100);
  assert.equal(swipeOffset(-100,180),0);
  assert.equal(swipeOffset(-100,30),-70);
});
test('swipe snaps open after intent threshold and otherwise closes',()=>{
  assert.equal(swipeDestination(-39),0);
  assert.equal(swipeDestination(-40),-100);
  assert.equal(swipeDestination(-90),-100);
  assert.equal(swipeDestination(swipeOffset(-100,80)),0);
});

test('full swipe requires most of the row and never triggers on a short reveal',()=>{
  const {isFullSwipe}=moduleOutput.exports;
  assert.equal(isFullSwipe(-100,400),false);
  assert.equal(isFullSwipe(-319,400),false);
  assert.equal(isFullSwipe(-320,400),true);
  assert.equal(swipeOffset(0,-500,400),-400);
  assert.equal(isFullSwipe(-80,100),false);
});
