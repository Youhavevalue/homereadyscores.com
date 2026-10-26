import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PUBLIC_PAGES } from '../../shared/public-pages';
import { captureWebsiteContext, recordWebsiteEvent } from '../lib/website-tracker';
import { readReceipt } from '../lib/inquiry-receipt';
export default function WebsiteTracking() {
 const {pathname}=useLocation();
 useEffect(()=>{
  if(Object.hasOwn(PUBLIC_PAGES,pathname)) {
   captureWebsiteContext();
   void recordWebsiteEvent('visit',pathname);
   if(pathname==='/get-started')void recordWebsiteEvent('inquiry_opened',pathname);
  } else if(pathname==='/thank-you'&&readReceipt())void recordWebsiteEvent('confirmation_viewed',pathname);
 },[pathname]);
 return null;
}
