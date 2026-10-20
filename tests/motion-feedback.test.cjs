const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(path, requireFn) {
 const mod = {exports:{}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},
 }).outputText,{module:mod,exports:mod.exports,require:requireFn});
 return mod.exports;
}
const tokens = load('src/theme/motion.ts',()=>{});
function buttonHarness(reduced=false, platform='web') {
 let state=[], refs=[], cursor=0, refCursor=0;
 const timings=[];
 const flatten=value=>Object.assign({},...(Array.isArray(value)?value.flat(Infinity):[value]).filter(Boolean));
 const {MotionPressable}=load('src/components/motion-pressable.tsx',name=>{
  if(name==='react') return {forwardRef:fn=>fn,useEffect:fn=>fn(),
   useRef:value=>refs[refCursor]??(refs[refCursor++]={current:value}),
   useState:value=>{const i=cursor++;if(!(i in state))state[i]=value;return [state[i],v=>state[i]=v];}};
  if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props})};
  if(name==='./use-reduced-motion')return {useReducedMotion:()=>reduced};
  if(name==='../theme/motion')return tokens;
  if(name==='react-native')return {Platform:{OS:platform},StyleSheet:{flatten},Pressable:'button',Easing:{bezier:()=>{}},
   Animated:{createAnimatedComponent:component=>component,Value:class {stopAnimation(){}setValue(){}},
    timing:(_value,options)=>({start:()=>timings.push(options)})}};
  throw Error(name);
 });
 return {render(props){cursor=0;refCursor=0;return MotionPressable(props,null);},flatten,timings};
}

test('press feedback preserves positioning and works with custom press handlers without delaying onPress',()=>{
 const ui=buttonHarness();let down=0,up=0,clicks=0;
 const props={style:{transform:[{translateX:-8},{translateY:-12}]},onPressIn:()=>down++,onPressOut:()=>up++,onPress:()=>clicks++};
 let node=ui.render(props);node.props.onPressIn({});node=ui.render(props);
 let style=ui.flatten(node.props.style);
 assert.equal(style.transform[0].translateX,-8);assert.equal(style.transform[1].translateY,-12);
 assert.equal(style.transform[2].scale,0.975);assert.match(style.transition,/70ms/);
 node.props.onPress({});assert.equal(clicks,1);assert.equal(down,1);
 node.props.onPressOut({});node=ui.render(props);style=ui.flatten(node.props.style);
 assert.equal(style.transform[2].scale,1);assert.equal(up,1);
});

test('reduced motion removes movement while keeping actions available, and disabled feedback is visible',()=>{
 const ui=buttonHarness(true);let clicks=0;
 const props={style:{opacity:0.8},onPress:()=>clicks++};
 let node=ui.render(props);node.props.onPressIn({});node=ui.render(props);
 const style=ui.flatten(node.props.style);
 assert.equal(style.transition,'none');assert.equal(style.transform[0].scale,1);
 node.props.onPress({});assert.equal(clicks,1);
 node=ui.render({...props,disabled:true});assert.equal(node.props.disabled,true);
 assert.ok(ui.flatten(node.props.style).opacity<0.8);
});

test('native press animations stay off the interaction queue and retain custom callbacks',()=>{
 const ui=buttonHarness(false,'android');let callbacks=0;
 const node=ui.render({onPressIn:()=>callbacks++});node.props.onPressIn({});
 assert.equal(callbacks,1);assert.equal(ui.timings[0].useNativeDriver,true);
 assert.equal(ui.timings[0].isInteraction,false);assert.equal(ui.timings[0].duration,70);
});

test('selection feedback exposes the checked and selected states on the web',()=>{
 const ui=buttonHarness();let node=ui.render({accessibilityState:{checked:true,selected:true}});
 assert.equal(node.props['aria-checked'],true);assert.equal(node.props['aria-selected'],true);
 node=ui.render({'aria-checked':false,accessibilityState:{checked:true}});
 assert.equal(node.props['aria-checked'],false);
 assert.equal(ui.render({}).props.accessibilityRole,'button');
 assert.equal(ui.render({accessibilityRole:'checkbox'}).props.accessibilityRole,'checkbox');
 assert.equal(ui.render({role:'tab'}).props.accessibilityRole,undefined);
});

test('Space activates toggles once, skips disabled controls and leaves Enter to RN Web',()=>{
 const ui=buttonHarness();let clicks=0;
 const props={accessibilityRole:'checkbox',onPress:()=>clicks++};
 let node=ui.render(props);const target={};
 const event=key=>({key,target,currentTarget:target,repeat:false,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;}});
 node.props.onKeyDown(event(' '));assert.equal(clicks,1);
 node.props.onKeyDown({...event(' '),repeat:true});assert.equal(clicks,1);
 node.props.onKeyUp(event(' '));assert.equal(clicks,1);
 node.props.onKeyDown(event('Enter'));assert.equal(clicks,1);
 node=ui.render({...props,disabled:true});node.props.onKeyDown(event(' '));assert.equal(clicks,1);
});
