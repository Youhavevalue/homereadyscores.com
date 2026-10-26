// Format checks only; they do not establish an issued card, available funds or a charge.
export function checkCardFormat({name='',number='',expiry=''},now=new Date()){
 if(typeof name!=='string'||!name.trim()||name.length>80)return{ok:false,error:'Enter the cardholder name.'};
 if(typeof number!=='string'||!/^\d[\d -]*$/.test(number))return{ok:false,error:'Enter a valid card number.'};
 const digits=number.replace(/[ -]/g,'');if(!/^\d{13,19}$/.test(digits)||/^(.)\1+$/.test(digits))return{ok:false,error:'Enter a valid card number.'};
 let sum=0,doubled=false;for(let i=digits.length-1;i>=0;i--){let digit=Number(digits[i]);if(doubled){digit*=2;if(digit>9)digit-=9;}sum+=digit;doubled=!doubled;}if(sum%10)return{ok:false,error:'Enter a valid card number.'};
 const match=typeof expiry==='string'&&/^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/.exec(expiry);if(!match)return{ok:false,error:'Enter expiry as MM/YY.'};
 const year=2000+Number(match[2]),month=Number(match[1]);if(year<now.getUTCFullYear()||year===now.getUTCFullYear()&&month<now.getUTCMonth()+1)return{ok:false,error:'Enter a future expiration date.'};return{ok:true};
}

export function checkSecurityCode(value,number='') {
 const amex=/^3[47]/.test(String(number).replace(/[ -]/g,''));
 if(typeof value!=='string'||!(amex?/^\d{4}$/:/^\d{3}$/).test(value))return{ok:false,error:amex?'Enter the four-digit security code on the front of your card.':'Enter the three-digit security code on the back of your card.'};
 return{ok:true};
}
