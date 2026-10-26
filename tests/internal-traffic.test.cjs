const test=require('node:test'),assert=require('node:assert/strict');
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
function environment(local=storage()) {let n=0;const calls=[];return {localStorage:local,sessionStorage:storage(),location:{href:'https://homereadyscores.com/?hrs_traffic=internal'},navigator:{},crypto:{randomUUID:()=>`12345678-1234-4234-8234-${String(++n).padStart(12,'0')}`},calls,fetch:async(u,o)=>{calls.push(JSON.parse(o.body));return {ok:true};}};}
test('staff marking persists across navigation and new tabs, and labels both events and saved requests',async()=>{
 const {createWebsiteTracker}=await import('../src/lib/website-tracker.js');const e=environment(),t=createWebsiteTracker(e);
 await t.emit('visit','/');assert.equal(e.calls[0].attribution.traffic_type,'internal');
 e.location.href='https://homereadyscores.com/get-started';assert.equal(t.submission().attribution.traffic_type,'internal');
 const other=environment(e.localStorage);other.location.href='https://homereadyscores.com/faq';assert.equal(createWebsiteTracker(other).context().attribution.traffic_type,'internal');
});
test('test marking survives privacy opt out while optional progress events remain suppressed',async()=>{
 const {createWebsiteTracker}=await import('../src/lib/website-tracker.js');const e=environment();e.location.href='https://homereadyscores.com/get-started?hrs_traffic=qa';e.navigator.globalPrivacyControl=true;
 const t=createWebsiteTracker(e);assert.equal(await t.emit('visit','/get-started'),false);assert.equal(e.calls.length,0);assert.deepEqual(t.submission().attribution,{traffic_type:'qa'});
});
test('explicit resume clears the persistent staff marker and private query values are ignored',async()=>{
 const {createWebsiteTracker}=await import('../src/lib/website-tracker.js');const e=environment(),t=createWebsiteTracker(e);t.context();
 e.location.href='https://homereadyscores.com/?hrs_traffic=external';assert.equal(t.context().attribution.traffic_type,undefined);
 e.location.href='https://homereadyscores.com/?hrs_traffic=person@example.invalid';assert.equal(t.context().attribution.traffic_type,undefined);
});
test('internal marking works when persistent storage is blocked, without losing signup retry keys',async()=>{
 const {createWebsiteTracker}=await import('../src/lib/website-tracker.js');const e=environment({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}}),t=createWebsiteTracker(e);
 const before=t.submission();e.location.href='https://homereadyscores.com/get-started';const after=t.submission();assert.equal(after.attribution.traffic_type,'internal');assert.equal(after.submissionKey,before.submissionKey);
});
test('attribution permits only fixed internal/test labels',async()=>{const {validateAttribution}=await import('../shared/website-tracking.js');assert.ok(validateAttribution({traffic_type:'internal'}));assert.ok(validateAttribution({traffic_type:'qa'}));assert.equal(validateAttribution({traffic_type:'private@example.invalid'}),null);});
test('resuming visitor measurement starts a fresh unexcluded session in each open tab, keeping retry identity',async()=>{
 const {createWebsiteTracker}=await import('../src/lib/website-tracker.js');const e=environment(),t=createWebsiteTracker(e),before=t.submission();
 const e2=environment(e.localStorage);e2.location.href='https://homereadyscores.com/faq';const t2=createWebsiteTracker(e2),old=t2.context();
 e.location.href='https://homereadyscores.com/?hrs_traffic=external';const after=t.submission();assert.notEqual(after.sessionId,before.sessionId);assert.equal(after.submissionKey,before.submissionKey);
 const other=t2.context();assert.equal(other.attribution.traffic_type,undefined);assert.notEqual(other.sessionId,old.sessionId);
});
