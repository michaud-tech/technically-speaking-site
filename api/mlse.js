// One deployable endpoint; helpers live outside api so they are not separate functions.
const handlers={
 assess:require('../mlse-server/mlse-assess.js'),
 practice:require('../mlse-server/mlse-practice.js'),
 conversation:require('../mlse-server/mlse-conversation.js')
};
module.exports=async(req,res)=>{
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed.'});
 const mode=new URL(req.url,'http://localhost').searchParams.get('mode');
 if(!Object.hasOwn(handlers,mode))return res.status(400).json({error:'Unknown course operation.'});
 return handlers[mode](req,res);
};
