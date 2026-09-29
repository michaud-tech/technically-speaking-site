// Transport and section filtering only. All evaluation runs in the main assessment.
const assess=require('./assess.js');
const COURSE=require('../course-data.js');
module.exports=async(req,res)=>{
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed.'});
 let body;try{body=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch(_){return res.status(400).json({error:'Bad request.'});}
 if(!body||!Object.hasOwn(COURSE.exercises,body.action))return res.status(400).json({error:'Unknown practice activity.'});
 const exercise=COURSE.exercises[body.action];
 if(exercise.fields.some(k=>typeof body.answers?.[k]!=='string'||!body.answers[k].trim()))return res.status(400).json({error:'Add a response to each prompt first.'});
 const pitch=exercise.fields.map(k=>exercise.fields.length>1?k+': '+body.answers[k].trim():body.answers[k].trim()).join('\n\n');
 let status=200;
 return assess({method:'POST',body:{practiceAction:body.action,pitch}}, {
  status(n){status=n;return this;},
  json(result){
   if(status!==200)return res.status(status).json(result);
   const pillar=result.pillars.find(p=>p.key===exercise.pillar);
   return res.status(200).json({grader:'assessment',behaviours:pillar.lines.map(({code,label,note})=>({code,label,note}))});
  }
 });
};
