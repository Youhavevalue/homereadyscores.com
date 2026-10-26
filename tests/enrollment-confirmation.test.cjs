const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
test('receipt is truthful about pending payment without describing staff processing',()=>{
 const s=fs.readFileSync(path.join(__dirname,'../src/pages/ThankYou.jsx'),'utf8');
 assert.match(s,/Enrollment received/);assert.match(s,/Payment is pending/);
 assert.doesNotMatch(s,/saved for manual review|Ashley handles intake|payment (?:was|has been) processed successfully/i);
 assert.match(s,/readReceipt/);assert.match(s,/No recent submission receipt/);
});
