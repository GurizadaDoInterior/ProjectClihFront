const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,p);
const {photoCrop,constrainPhoto}=require('../src/components/photo-crop.ts');
const {previewXp}=require('../src/features/today/optimistic-xp.ts');
test('crop matches the centered preview for landscape and portrait photos',()=>{
 assert.deepEqual(photoCrop({width:1600,height:800},300,1,0,0),{originX:400,originY:0,width:800,height:800});
 assert.deepEqual(photoCrop({width:800,height:1600},300,1,0,0),{originX:0,originY:400,width:800,height:800});
});
test('zoom and dragging never expose blank pixels or crop outside the image',()=>{
 for(const [width,height] of [[1600,800],[800,1600],[512,512]])for(const zoom of [1,1.25,2,3])for(const x of [-10000,-75,0,75,10000])for(const y of [-10000,0,10000]){
  const image={width,height};const frame=constrainPhoto(image,300,zoom,x,y);const crop=photoCrop(image,300,zoom,x,y);
  assert.ok(Math.abs(frame.x)<=(frame.width-300)/2+.0001);
  assert.ok(Math.abs(frame.y)<=(frame.height-300)/2+.0001);
  assert.ok(crop.originX>=0 && crop.originY>=0 && crop.width>0);
  assert.ok(crop.originX+crop.width<=width && crop.originY+crop.height<=height);
  assert.equal(crop.width,crop.height);
 }
 assert.deepEqual(photoCrop({width:1200,height:800},300,2,0,0),{originX:400,originY:200,width:400,height:400});
});
test('XP and level bar respond immediately across level boundaries and undo',()=>{
 const summary={xp:90,level:1,xpInLevel:90,xpToNextLevel:100};
 const up=previewXp(summary,10);assert.equal(up.xp,100);assert.equal(up.level,2);assert.equal(up.xpInLevel,0);
 const down=previewXp(up,-10);assert.equal(down.xp,90);assert.equal(down.level,1);assert.equal(down.xpInLevel,90);
 const zero=previewXp({...summary,xp:0,xpInLevel:0},-10);assert.equal(zero.xp,0);assert.equal(zero.level,1);assert.equal(zero.xpInLevel,0);
});
