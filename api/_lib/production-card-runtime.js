import{serverDb}from'./server-db.js';
import{loadProductionCardKeys}from'./production-card-keys.js';
import{createEnvelopeCrypto,createPreparedCardService}from'./production-card-adapter.js';
import{createStaffCardPassword}from'./staff-card-password.js';
import{createControlledCardCapture,createPublicEnrollmentController}from'./public-card-enrollment.js';
import{createPreparedEnrollmentCardHandler}from'./prepared-enrollment-card.js';
const disabledAccess=(req,res)=>{res.setHeader('Cache-Control','no-store');return res.status(410).json({enabled:false,error:'Authenticator setup is not available. Re-enter your staff password in the saved-card form.'});};
export function createProductionCardRuntime({env=process.env,db:providedDb,adminReader}={}){
 let keys;try{keys=loadProductionCardKeys(env);}catch{/* Never expose key/config payloads. */}
 let readyPromise;
 async function dependencies(){
  if(!readyPromise)readyPromise=(async()=>{
   if(!keys)return{ready:false,reason:'configuration'};
   try{const db=providedDb||serverDb();const{data,error}=await db.rpc('card_storage_password_readiness',{});
    if(error||data?.ready!==true||data.version!=='hrs-card-runtime-v2-password'||data.schema!=='home_ready'||!Array.isArray(data.card_key_ids))return{ready:false,reason:'schema'};
    if(data.card_key_ids.some(id=>typeof id!=='string'||!keys.hasCardKey(id)))return{ready:false,reason:'stored_key_unavailable'};
    const crypto=createEnvelopeCrypto({keyResolver:keys.cardKeyResolver,fingerprintKeyResolver:keys.fingerprintKeyResolver});
    const guard=createStaffCardPassword({db,...(adminReader?{adminReader}:{})});
    const service=createPreparedCardService({db,crypto,revealGuard:guard}),capture=createControlledCardCapture({service,syntheticOnly:false});
    return{ready:true,db,public:createPublicEnrollmentController({db,capture}),card:createPreparedEnrollmentCardHandler({db,capture,service,revealFields:['requestId','password'],...(adminReader?{adminReader}:{})})};
   }catch{return{ready:false,reason:'unavailable'};}
  })();return readyPromise;
 }
 return{
  async readiness(){const result=await dependencies();return{ready:result.ready,...(!result.ready?{reason:result.reason}:{})};},
  async enroll(req,res){const result=await dependencies();if(result.ready)return result.public.enroll(req,res);return createPublicEnrollmentController({db:providedDb||serverDb()}).enroll(req,res);},
  async card(req,res){const result=await dependencies();return(result.ready?result.card:createPreparedEnrollmentCardHandler())(req,res);},
  async access(req,res){return disabledAccess(req,res);},
 };
}
