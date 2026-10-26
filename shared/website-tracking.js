import { PUBLIC_PAGES } from './public-pages.js';
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const PUBLIC_EVENTS = ['visit','inquiry_opened','information_completed','goal_selected','submission_attempt','submission_error','confirmation_viewed'];
export const CAMPAIGN_VALUES = {
  utm_source: ['google','bing','facebook','instagram','linkedin','youtube','tiktok','email','direct','website-qa','other'],
  utm_medium: ['organic','social','referral','email','paid-social','cpc','manual','none','other'],
  // Explicit fictional test label only; unregistered campaign values are never stored.
  utm_campaign: ['readiness-qa','unregistered'],
};
const REFERRERS = ['google.com','bing.com','facebook.com','instagram.com','linkedin.com','t.co','youtube.com','yahoo.com','duckduckgo.com'];
export function validateAttribution(input) {
  if (!input || typeof input!=='object' || Array.isArray(input) || JSON.stringify(input).length>1024) return null;
  for (const [key,value] of Object.entries(input)) {
    if (Object.hasOwn(CAMPAIGN_VALUES,key)) { if (!CAMPAIGN_VALUES[key].includes(value)) return null; }
    else if (key==='traffic_type') { if (!['internal','qa'].includes(value)) return null; }
    else if (key==='landing_path') { if (!Object.hasOwn(PUBLIC_PAGES,value)) return null; }
    else if (key==='referrer_host') { if (![...REFERRERS,'other'].includes(value)) return null; }
    else return null;
  }
  return input;
}
export function captureAttribution(href, referrer='') {
  try {
    const url=new URL(href),result={};
    for(const [key,allowed] of Object.entries(CAMPAIGN_VALUES)) { const value=url.searchParams.get(key); if(value) result[key]=allowed.includes(value) ? value : key==='utm_campaign' ? 'unregistered' : 'other'; }
    if(Object.hasOwn(PUBLIC_PAGES,url.pathname)) result.landing_path=url.pathname;
    if(referrer) { const source=new URL(referrer); if(source.origin!==url.origin) result.referrer_host=REFERRERS.find(domain=>source.hostname===domain || source.hostname.endsWith('.'+domain)) || 'other'; }
    return result;
  } catch { return {}; }
}
export function validPublicEvent(body) {
  return !!body && typeof body==='object' && !Array.isArray(body) && Object.keys(body).every(k=>['sessionId','action','path','attribution'].includes(k)) && UUID.test(body.sessionId || '') && PUBLIC_EVENTS.includes(body.action) && (Object.hasOwn(PUBLIC_PAGES,body.path)||body.path==='/thank-you') && validateAttribution(body.attribution)!==null;
}
