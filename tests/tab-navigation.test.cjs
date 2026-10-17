const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(path,requireFn){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{module:m,exports:m.exports,require:requireFn});return m.exports;}
function tabButton(onPress,href='/routine'){
  const jsx=(type,props)=>({type,props});
  const {default:Layout}=load('app/(tabs)/_layout.tsx',name=>{
    if(name==='react/jsx-runtime')return {jsx,jsxs:jsx};
    if(name==='react-native')return {Platform:{OS:'web'}};
    if(name==='expo-router')return {Tabs:{Screen:'screen'}};
    if(name==='expo-symbols')return {SymbolView:'icon'};
    if(name==='react-native-safe-area-context')return {useSafeAreaInsets:()=>({bottom:0})};
    if(name.includes('navigation-press'))return load('src/components/navigation-press.ts',()=>{});
    if(name.includes('motion-pressable'))return {MotionPressable:'button'};
    return {useTheme:()=>({colors:{}})};
  });
  return Layout().props.screenOptions.tabBarButton({onPress,href}).props;
}
function click(extra={}){return {button:0,currentTarget:{target:''},defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...extra};}
test('ordinary tab clicks navigate internally and cancel browser document loading',()=>{
  const calls=[];const button=tabButton(event=>calls.push(event.defaultPrevented));const event=click();button.onPress(event);
  assert.equal(event.defaultPrevented,true,'tab must prevent a full document reload');assert.deepEqual(calls,[true]);assert.equal(button.href,'/routine');
});
test('tab links preserve modifier clicks, middle click and new-window targets',()=>{
  for(const extra of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1},{currentTarget:{target:'_blank'}}]){
    let navigations=0;const button=tabButton(()=>navigations++);const event=click(extra);button.onPress(event);
    assert.equal(event.defaultPrevented,false);assert.equal(navigations,0);
  }
});
test('keyboard activation and explicit same-window targets still navigate internally',()=>{
  for(const extra of [{button:undefined},{currentTarget:{target:'_self'}}]){
    let navigations=0;const button=tabButton(()=>navigations++);const event=click(extra);button.onPress(event);
    assert.equal(event.defaultPrevented,true);assert.equal(navigations,1);
  }
});
