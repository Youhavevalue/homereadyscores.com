const {test}=require('node:test'),assert=require('node:assert/strict');
const now=new Date('2026-10-25T12:00:00Z'),base={name:'Fictional Example',number:'4111 1111 1111 1111',expiry:'12/29'};
async function check(value){return(await import('../shared/demo-card-validation.js')).checkDemoCard(value,now);}
test('review accepts only allowed fictional card formats without claiming verification or saving',async()=>{const r=await check(base);assert.equal(r.ok,true);assert.match(r.message,/No card was verified, saved, submitted or charged/);});
for(const [label,change] of [['wrong checksum',{number:'4111111111111112'}],['unknown Luhn-valid number',{number:'4242424242424242'}],['past expiry',{expiry:'09/26'}],['invalid month',{expiry:'13/29'}],['missing name',{name:''}],['letters',{number:'4111abcd11111111'}]])test('blocks '+label,async()=>assert.equal((await check({...base,...change})).ok,false));
test('current expiry month is not expired',async()=>assert.equal((await check({...base,expiry:'10/26'})).ok,true));

test('missing and malformed numbers use the exact requested customer error',async()=>{for(const number of ['', '123', '4111111111111112','abcd'])assert.equal((await check({...base,number})).error,'Enter a valid card number.');});
