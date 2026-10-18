const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');
function moduleAt(path,requireFn){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{module:m,exports:m.exports,require:requireFn,Date});return m.exports;}
const xp=moduleAt('src/features/today/optimistic-xp.ts',()=>({}));
test('activity feedback does not await query cancellation and failures restore XP and completion',async()=>{
 let options;let data={xp:90,level:1,xpInLevel:90,xpToNextLevel:100,activities:[{id:'a',completed:false}]};const previous=data;
 const client={cancelQueries:()=>new Promise(()=>{}),getQueryData:()=>data,setQueryData:(_key,value)=>{data=typeof value==='function'?value(data):value;},invalidateQueries:()=>Promise.resolve()};
 const {useTodaySummary}=moduleAt('src/features/today/use-today-summary.ts',name=>name==='react'?{useState:()=>[null,()=>{}],useRef:v=>({current:v})}:name==='@tanstack/react-query'?{useIsMutating:()=>0,useQueryClient:()=>client,useQuery:()=>({data}),useMutation:o=>{options=o;return {};}}:name==='./optimistic-xp'?xp:{});
 useTodaySummary();const contextPromise=options.onMutate(data.activities[0]);
 assert.equal(data.xp,100);assert.equal(data.level,2);assert.equal(data.activities[0].completed,true);
 const context=await contextPromise;
 options.onError(new Error('offline'),null,context);
 assert.equal(data,previous);assert.equal(data.xp,90);assert.equal(data.activities[0].completed,false);
});
test('choosing a photo opens crop preview; cancel never uploads and confirm uploads once',async()=>{
 let state=[],refs=[],cursor=0,refCursor=0,uploads=0;let cropProps;let chosen;
 const jsx=(type,props)=>({type,props});const Crop='crop';
 const cache=[];
 const {ProfilePhotoEditor}=moduleAt('src/components/profile-photo-editor.tsx',name=>{
  if(name==='react')return {useState:initial=>{const i=cursor++;if(!(i in state))state[i]=initial;return [state[i],v=>state[i]=v];},useRef:initial=>{const i=refCursor++;return refs[i]??(refs[i]={current:initial});}};
  if(name==='react/jsx-runtime')return {jsx,jsxs:jsx};
  if(name==='react-native')return {View:'view',Image:'image',Text:'text'};
  if(name.includes('motion-pressable'))return {MotionPressable:'button'};
  if(name==='expo-image-picker')return {launchImageLibraryAsync:async()=>({canceled:false,assets:[{uri:'original',width:1200,height:800}]})};
  if(name==='expo-image-manipulator')return {SaveFormat:{JPEG:'jpeg'},manipulateAsync:async(_uri,actions)=>{chosen=actions;return {uri:'prepared',width:1200,height:800,base64:'encoded'};}};
  if(name==='@tanstack/react-query')return {useQueryClient:()=>({setQueryData:(...args)=>cache.push(args)})};
  if(name.includes('today-api'))return {uploadProfilePhoto:async()=>{uploads++;return {avatarUrl:'saved'};}};
  if(name.includes('theme-provider'))return {useTheme:()=>({colors:{}})};
  if(name==='./photo-crop-modal')return {PhotoCropModal:Crop};
  return {};
 });
 function render(){cursor=0;refCursor=0;return ProfilePhotoEditor({user:{displayName:'Teste'}});}
 function nodes(root){return [root,...(Array.isArray(root?.props?.children)?root.props.children:[root?.props?.children]).filter(Boolean).flatMap(x=>typeof x==='object'?nodes(x):[])];}
 await nodes(render()).find(x=>x.type==='button').props.onPress();
 cropProps=nodes(render()).find(x=>x.type===Crop).props;
 assert.equal(uploads,0);cropProps.onCancel();assert.equal(uploads,0);
 assert.ok(!nodes(render()).some(x=>x.type===Crop));
 await nodes(render()).find(x=>x.type==='button').props.onPress();
 cropProps=nodes(render()).find(x=>x.type===Crop).props;
 const crop={originX:300,originY:100,width:400,height:400};
 await cropProps.onConfirm(crop);
 assert.equal(uploads,1);assert.deepEqual(chosen[0].crop,crop);assert.equal(cache.length,1);
});
