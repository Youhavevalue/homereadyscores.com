const SECURITY_CODE=/^(cvv\d*|cvc\d*|cav\d*|cid|cvn|cvd|securitycode|cardsecuritycode|cardverificationcode|cardverificationvalue)$/i;
export function rejectSecurityCode(value){if(value&&typeof value==='object')for(const[key,child]of Object.entries(value)){if(SECURITY_CODE.test(key.replace(/[^a-z0-9]/gi,'')))throw Object.assign(new Error('Do not submit a card security code.'),{status:400});rejectSecurityCode(child);}}

// Only this exact field is eligible for the separately encrypted, temporary workflow.
export function withoutCardSecurityCode(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return value;
 if(!value.card||typeof value.card!=='object'||Array.isArray(value.card))return value;
 const card={...value.card};delete card.cvv;return{...value,card};
}
