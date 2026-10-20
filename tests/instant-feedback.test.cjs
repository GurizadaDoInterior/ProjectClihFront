const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');
function moduleAt(path,requireFn){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{module:m,exports:m.exports,require:requireFn,Date});return m.exports;}
const xp=moduleAt('src/features/today/optimistic-xp.ts',()=>({}));
test('activity feedback does not await query cancellation and failures restore XP and completion',async()=>{
 let options;let data={xp:90,level:1,xpInLevel:90,xpToNextLevel:100,activities:[{id:'a',completed:false}]};const previous=data;
 const client={cancelQueries:()=>new Promise(()=>{}),getQueryData:()=>data,setQueryData:(_key,value)=>{data=typeof value==='function'?value(data):value;},invalidateQueries:()=>Promise.resolve()};
 const {useTodaySummary}=moduleAt('src/features/today/use-today-summary.ts',name=>name==='react'?{useState:()=>[null,()=>{}],useRef:v=>({current:v})}:name==='@tanstack/react-query'?{useIsMutating:()=>0,useMutationState:()=>[],useQueryClient:()=>client,useQuery:()=>({data}),useMutation:o=>{options=o;return {};}}:name==='./optimistic-xp'?xp:{});
 useTodaySummary();const contextPromise=options.onMutate(data.activities[0]);
 assert.equal(data.xp,100);assert.equal(data.level,2);assert.equal(data.activities[0].completed,true);
 const context=await contextPromise;
 options.onError(new Error('offline'),null,context);
 assert.equal(data.activities[0],previous.activities[0]);assert.equal(data.xp,90);assert.equal(data.activities[0].completed,false);
});

function activityHarness() {
 let options;let pending=0;const calls=[];const invalidations=[];
 let data={xp:90,level:1,xpInLevel:90,xpToNextLevel:100,activities:[{id:'a',completed:false},{id:'b',completed:false}]};
 const client={cancelQueries:()=>Promise.resolve(),getQueryData:()=>data,
  setQueryData:(_key,value)=>{data=typeof value==='function'?value(data):value;},
  invalidateQueries:value=>{invalidations.push(value);return Promise.resolve();},isMutating:()=>pending};
 const {useTodaySummary}=moduleAt('src/features/today/use-today-summary.ts',name=>name==='react'?{useState:()=>[null,()=>{}]}:
  name==='@tanstack/react-query'?{useIsMutating:()=>pending,useMutationState:()=>[],useQueryClient:()=>client,useQuery:()=>({data}),useMutation:o=>{options=o;return {mutate:a=>calls.push(a)};}}:
  name==='./optimistic-xp'?xp:{});
 const hook=useTodaySummary();
 return {hook,calls,invalidations,get options(){return options;},get data(){return data;},set pending(value){pending=value;}};
}

test('rapid clicks accept different activities and reject duplicates before rerender',()=>{
 const ui=activityHarness();ui.hook.toggleActivity('a');ui.hook.toggleActivity('a');ui.hook.toggleActivity('b');
 assert.equal(ui.calls.length,2);assert.equal(ui.calls[0].id,'a');assert.equal(ui.calls[1].id,'b');
 assert.equal(ui.hook.isActivityPending('a'),true);assert.equal(ui.hook.isActivityPending('b'),true);
 assert.equal(ui.options.scope.id,'habit-toggle');
});

test('one failed save preserves the other optimistic activity and its XP',async()=>{
 const ui=activityHarness();const [a,b]=ui.data.activities;
 const failed=await ui.options.onMutate(a);await ui.options.onMutate(b);
 assert.equal(ui.data.xp,110);
 ui.options.onError(new Error('offline'),a,failed);
 assert.equal(ui.data.activities[0].completed,false);assert.equal(ui.data.activities[1].completed,true);
 assert.equal(ui.data.xp,100);assert.equal(ui.data.level,2);
});

test('an earlier server response keeps queued XP and refresh waits for the last save',async()=>{
 const ui=activityHarness();const [a,b]=ui.data.activities;
 ui.hook.toggleActivity('a');ui.hook.toggleActivity('b');
 await ui.options.onMutate(a);await ui.options.onMutate(b);
 ui.options.onSuccess({id:'completion-a',xpAwarded:15,idempotentReplay:false,progress:{totalXp:105,level:2}},a);
 assert.equal(ui.data.xp,115);assert.equal(ui.data.activities[0].completionId,'completion-a');
 assert.equal(ui.data.activities[1].completed,true);
 ui.pending=2;ui.options.onSettled(null,null,a);assert.equal(ui.invalidations.length,0);
 assert.equal(ui.hook.isActivityPending('a'),false);assert.equal(ui.hook.isActivityPending('b'),true);
 ui.pending=1;ui.options.onSettled(null,null,b);assert.equal(ui.invalidations.length,3);
});

test('the real mutation scheduler renders both clicks immediately while saving in order',async()=>{
 const {QueryClient,MutationObserver}=require('@tanstack/react-query');
 const client=new QueryClient({defaultOptions:{mutations:{retry:false,gcTime:Infinity},queries:{gcTime:Infinity}}});
 const requests=[],executions=[];
 client.setQueryData(['today'],{xp:90,level:1,xpInLevel:90,xpToNextLevel:100,
  activities:[{id:'a',completed:false},{id:'b',completed:false}]});
 const {useTodaySummary}=moduleAt('src/features/today/use-today-summary.ts',name=>name==='react'?{useState:()=>[null,()=>{}]}:
  name==='@tanstack/react-query'?{
   useQueryClient:()=>client,useIsMutating:()=>client.isMutating(),useMutationState:()=>[],
   useQuery:()=>({data:client.getQueryData(['today'])}),
   useMutation:options=>{const observer=new MutationObserver(client,options);return {mutate:activity=>{
    executions.push(observer.mutate(activity).catch(error=>error));
   }};},
  }:name==='./optimistic-xp'?xp:name.includes('today-api')?{
   completeHabit:id=>new Promise(resolve=>requests.push({id,resolve})),
  }:{});
 try {
  const hook=useTodaySummary();hook.toggleActivity('a');hook.toggleActivity('b');hook.toggleActivity('a');
  await new Promise(setImmediate);
  assert.equal(executions.length,2);assert.equal(requests.length,1);assert.equal(requests[0].id,'a');
  assert.equal(client.getQueryData(['today']).activities.every(activity=>activity.completed),true);
  assert.equal(client.getQueryData(['today']).xp,110);
  requests[0].resolve({id:'saved-a',xpAwarded:10});await new Promise(setImmediate);
  assert.equal(requests.length,2);assert.equal(requests[1].id,'b');
  assert.equal(client.getQueryData(['today']).xp,110);
  requests[1].resolve({id:'saved-b',xpAwarded:10});await Promise.all(executions);
  assert.equal(client.getQueryData(['today']).activities[1].completionId,'saved-b');
  assert.equal(hook.isActivityPending('a'),false);assert.equal(hook.isActivityPending('b'),false);
 } finally {
  // Release pending fake network calls even when an assertion fails.
  for(let i=0;i<4;i++) {
   for(const request of requests)request.resolve({id:'cleanup-'+request.id,xpAwarded:10});
   await new Promise(setImmediate);
  }
  await Promise.all(executions);client.clear();
 }
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
