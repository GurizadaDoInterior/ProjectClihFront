const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(path,requireFn){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{module:mod,exports:mod.exports,require:requireFn,Date});return mod.exports;}
const logic=load('src/components/swipe-gesture.ts',()=>{});
const motion=load('src/theme/motion.ts',()=>{});
function render(disabled=false,failFullSwipe=false,reduced=false){
  const refs=[];let opened=false,deleted=0;
  const react={useRef:value=>{const ref={current:value};refs.push(ref);return ref;},useState:()=>[false,value=>{opened=value;}],useEffect:callback=>callback()};
  const jsx=(type,props)=>({type,props});
  const {SwipeToDelete}=load('src/components/swipe-to-delete.web.tsx',name=>name==='react'?react:name==='react/jsx-runtime'?{jsx,jsxs:jsx}:name==='react-native'?{Text:'text'}:name==='../theme/motion'?motion:name.includes('motion-pressable')?{MotionPressable:'button'}:name.includes('use-reduced-motion')?{useReducedMotion:()=>reduced}:name.includes('swipe-gesture')?logic:{useTheme:()=>({colors:{background:'#fff',danger:'#f00'}})});
  const tree=SwipeToDelete({disabled,children:'activity',onDelete:()=>deleted++,onFullSwipe:async animateRemoval=>{deleted++;if(failFullSwipe)throw new Error('API failed');await animateRemoval?.();}});
  const surface=tree.props.children[1];
  const node={style:{},clientWidth:400,captured:false,setPointerCapture(){this.captured=true;},hasPointerCapture(){return this.captured;},releasePointerCapture(){this.captured=false;}};
  refs[0].current=node;
  const event=(x,y)=>({pointerType:'mouse',button:0,pointerId:1,clientX:x,clientY:y,currentTarget:node,prevented:false,stopped:false,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}});
  return {handlers:surface.props,node,event,shell:refs[1],get opened(){return opened;},get deleted(){return deleted;}};
}
test('web mouse drag reveals deletion and suppresses the following activity click',()=>{
  const ui=render();ui.handlers.onPointerDownCapture(ui.event(140,20));
  ui.handlers.onPointerMove(ui.event(65,22));
  assert.equal(ui.node.style.transform,'translateX(-75px)');assert.equal(ui.node.captured,true);
  ui.handlers.onPointerUp(ui.event(65,22));assert.equal(ui.opened,true);assert.equal(ui.node.style.transform,'translateX(-100px)');
  const click=ui.event(65,22);ui.handlers.onClickCapture(click);assert.equal(click.prevented,true);assert.equal(click.stopped,true);assert.equal(ui.deleted,0);
});
test('web vertical scrolling leaves the activity in place and still allows ordinary clicks',()=>{
  const ui=render();ui.handlers.onPointerDownCapture(ui.event(140,20));ui.handlers.onPointerMove(ui.event(136,70));ui.handlers.onPointerUp(ui.event(136,70));
  assert.equal(ui.node.captured,false);assert.equal(ui.opened,false);
  const click=ui.event(136,70);ui.handlers.onClickCapture(click);assert.equal(click.prevented,false);
});
test('cancelled and disabled web gestures never reveal or delete activities',()=>{
  const ui=render();ui.handlers.onPointerDownCapture(ui.event(140,20));ui.handlers.onPointerMove(ui.event(60,22));ui.handlers.onPointerCancel();assert.equal(ui.opened,false);assert.equal(ui.node.style.transform,'translateX(0px)');assert.equal(ui.deleted,0);
  const locked=render(true);locked.handlers.onPointerDownCapture(locked.event(140,20));locked.handlers.onPointerMove(locked.event(60,22));locked.handlers.onPointerUp(locked.event(60,22));assert.equal(locked.opened,false);assert.equal(locked.node.captured,false);
});

test('full web swipe deletes once without requiring the revealed button',async()=>{
  const ui=render();ui.handlers.onPointerDownCapture(ui.event(380,20));ui.handlers.onPointerMove(ui.event(20,22));ui.handlers.onPointerUp(ui.event(20,22));
  await new Promise(setImmediate);
  assert.equal(ui.deleted,1);assert.equal(ui.node.style.transform,'translateX(-400px)');
  ui.handlers.onPointerUp(ui.event(20,22));await new Promise(setImmediate);assert.equal(ui.deleted,1);
});
test('failed full swipe restores the row so deletion can be retried',async()=>{
  const ui=render(false,true);ui.handlers.onPointerDownCapture(ui.event(380,20));ui.handlers.onPointerMove(ui.event(20,22));ui.handlers.onPointerUp(ui.event(20,22));
  await new Promise(setImmediate);
  assert.equal(ui.deleted,1);assert.equal(ui.node.style.transform,'translateX(0px)');assert.equal(ui.opened,false);
});
test('successful deletion gently collapses the complete row before removal finishes',async()=>{
  const ui=render();let frames,options,finish;
  ui.shell.current={getBoundingClientRect:()=>({height:128}),animate:(keyframes,config)=>{frames=keyframes;options=config;return {finished:new Promise(resolve=>{finish=resolve;})};}};
  ui.handlers.onPointerDownCapture(ui.event(380,20));ui.handlers.onPointerMove(ui.event(20,22));ui.handlers.onPointerUp(ui.event(20,22));
  await new Promise(setImmediate);
  assert.equal(ui.deleted,1);assert.equal(frames[0].height,'128px');assert.equal(frames[1].height,'0px');assert.ok(options.duration<=240);
  finish();await new Promise(setImmediate);
});
test('failed deletion never collapses the row and reduced motion skips its animation',async()=>{
  for(const [failure,reduced] of [[true,false],[false,true]]){
    const ui=render(false,failure,reduced);let animations=0;
    ui.shell.current={getBoundingClientRect:()=>({height:128}),animate:()=>{animations++;return {finished:Promise.resolve()};}};
    ui.handlers.onPointerDownCapture(ui.event(380,20));ui.handlers.onPointerMove(ui.event(20,22));ui.handlers.onPointerUp(ui.event(20,22));
    await new Promise(setImmediate);assert.equal(animations,0);
  }
});
