// One deployable endpoint; helpers live outside api so they are not separate functions.
const handlers={
 assess:require('../ln-server/ln-assess.js'),
 practice:require('../ln-server/ln-practice.js'),
 conversation:require('../ln-server/ln-conversation.js'),
 record:require('../ln-server/ln-record.js'),
 config:async(req,res)=>res.status(200).json({gate:process.env.LIVENATION_GATE==='on'})
};
module.exports=async(req,res)=>{
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed.'});
 const mode=new URL(req.url,'http://localhost').searchParams.get('mode');
 if(!Object.hasOwn(handlers,mode))return res.status(400).json({error:'Unknown course operation.'});
 return handlers[mode](req,res);
};
