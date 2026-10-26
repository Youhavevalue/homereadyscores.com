// Review-only format checks. Never an issuer check or secure-storage substitute.
const TEST_NUMBERS = new Set(['4111111111111111','5555555555554444','371449635398431']);
export function checkDemoCard({number='',expiry='',name=''},now=new Date()){
 if(!name.trim())return {ok:false,error:'Enter the fictional cardholder name.'};
 if(!/^[0-9 -]+$/.test(number))return {ok:false,error:'Enter a valid card number.'};
 const digits=number.replace(/[ -]/g,'');
 if(!/^\d{13,19}$/.test(digits))return {ok:false,error:'Enter a valid card number.'};
 let total=0,double=false;for(let i=digits.length-1;i>=0;i--){let n=Number(digits[i]);if(double){n*=2;if(n>9)n-=9;}total+=n;double=!double;}
 if(total%10!==0)return {ok:false,error:'Enter a valid card number.'};
 if(!TEST_NUMBERS.has(digits))return {ok:false,error:'Use only a displayed fictional test card in this review. Real card details are not accepted.'};
 const match=/^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/.exec(expiry);
 if(!match)return {ok:false,error:'Enter expiry as MM/YY.'};
 const year=2000+Number(match[2]),month=Number(match[1]);
 if(year<now.getUTCFullYear()||(year===now.getUTCFullYear()&&month<now.getUTCMonth()+1))return {ok:false,error:'The test expiry date must not be in the past.'};
 return {ok:true,message:'Test details pass format checks. No card was verified, saved, submitted or charged.'};
}
