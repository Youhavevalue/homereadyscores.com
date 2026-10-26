export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 return res.status(423).json({error:'This legacy activation endpoint is retired. Submit a pending inquiry at /get-started.'});
}
