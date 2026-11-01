// Email gate records for Live Nation. Only active when LIVENATION_GATE=on.
// Participant gets their own results. Technically Speaking gets an anonymized copy:
// a stable participant ID (HMAC of the email), never the email itself.
const crypto=require('node:crypto');
const COURSE=require('../ln-course-data.js');
const KINDS={'assessment':'Assessment','course-baseline':'Course baseline','course-final':'Course final'};
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clean(r){
 if(!r||!Array.isArray(r.pillars))return null;
 const pillars=COURSE.rubric.map(p=>{const s=r.pillars.find(x=>x&&x.key===p.key);if(!s||!Array.isArray(s.lines))return null;
  const lines=p.lines.map(([code,label])=>{const l=s.lines.find(x=>x&&x.code===code)||{};return{code,label,score:Math.max(0,Math.min(2,parseInt(l.score,10)||0)),note:String(l.note||'').slice(0,800)};});
  return{key:p.key,name:p.name,lines,subtotal:lines.reduce((n,l)=>n+l.score,0)};});
 if(pillars.some(p=>!p))return null;
 return{pillars,total:pillars.reduce((n,p)=>n+p.subtotal,0),whatWorked:String(r.whatWorked||'').slice(0,1200),coachingFocus:String(r.coachingFocus||'').slice(0,1200)};
}
const pid=email=>'P-'+crypto.createHmac('sha256',process.env.LIVENATION_ID_SALT||'technically-speaking-livenation').update(email).digest('hex').slice(0,8);
function scoreText(r){return r.pillars.map(p=>`${p.key} ${p.name}: ${p.subtotal}/4 (`+p.lines.map(l=>`${l.code} ${l.score}`).join(', ')+')').join('\n');}
function scoreHtml(title,pitch,r){return `<h3 style="margin:24px 0 6px">${esc(title)} · ${r.total}/12</h3><p style="white-space:pre-line;background:#fff;border-left:3px solid #f4c400;padding:12px 14px">${esc(pitch)}</p>`+r.pillars.map(p=>`<p style="margin:14px 0 4px"><b>${esc(p.key)} · ${esc(p.name)}: ${p.subtotal}/4</b></p>`+p.lines.map(l=>`<p style="margin:2px 0 6px">${esc(l.label)} · ${l.score}/2<br><span style="color:#66635c">${esc(l.note)}</span></p>`).join('')).join('')+`<p><b>Coaching focus:</b> ${esc(r.coachingFocus)}</p>`;}
async function send(payload){const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${process.env.RESEND_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({from:process.env.RESULTS_FROM_EMAIL,...payload})});if(!r.ok)throw Error('resend '+r.status);}
module.exports=async(req,res)=>{
 if(process.env.LIVENATION_GATE!=='on')return res.status(404).json({error:'Not available.'});
 if(!process.env.RESEND_API_KEY||!process.env.RESULTS_FROM_EMAIL||!process.env.RESULTS_LEAD_EMAIL)return res.status(503).json({error:'Results email is not configured.'});
 let b;try{b=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch(_){return res.status(400).json({error:'Bad request.'});}
 const email=String(b?.email||'').trim().toLowerCase().slice(0,254);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({error:'Enter a valid email.'});
 if(!Object.hasOwn(KINDS,b.kind)||b.scenarioId!==COURSE.scenarioId)return res.status(400).json({error:'Unknown result type.'});
 const round=b.kind==='assessment'?(b.round==='end'?'end':'start'):(b.kind==='course-final'?'course end':'course start');
 const pitch=String(b.pitch||'').trim().slice(0,6000),result=clean(b.result);
 if(pitch.length<15||!result)return res.status(400).json({error:'These results could not be saved.'});
 const id=pid(email),when=new Date().toISOString(),label=KINDS[b.kind];
 try{
  await send({to:[process.env.RESULTS_LEAD_EMAIL],subject:`[Live Nation] ${id} · ${label} · ${round} · ${result.total}/12`,
   text:`Participant: ${id}\nType: ${label}\nRound: ${round}\nScenario: ${b.scenarioId}\nSubmitted: ${when}\n\nTotal: ${result.total}/12\n${scoreText(result)}\n\nPITCH\n${pitch}\n\nCoaching focus: ${result.coachingFocus}`});
 }catch(e){console.error('ln-record lead',e.message);return res.status(502).json({error:'Results could not be saved. Please try again.'});}
 if(b.kind!=='course-baseline'){
  const base=b.kind==='course-final'?b.baseline:null,baseRes=base&&clean(base.result);
  const html=`<div style="font-family:Arial,sans-serif;background:#f4f2ed;color:#1d1d1b;padding:24px;max-width:640px"><p style="color:#66635c;font-size:12px;letter-spacing:.12em">TECHNICALLY SPEAKING × LIVE NATION</p><h2 style="margin:6px 0 12px">Your TECH results</h2>`+(baseRes?scoreHtml('Your first pitch',String(base.pitch||'').slice(0,6000),baseRes):'')+scoreHtml(baseRes?'Your final pitch':'Your pitch',pitch,result)+`<p style="color:#66635c;font-size:13px;margin-top:24px">Scores describe this attempt, not your ability in every conversation.</p></div>`;
  try{await send({to:[email],reply_to:process.env.RESULTS_LEAD_EMAIL,subject:`Your TECH results: ${result.total}/12`,html});}catch(e){console.error('ln-record participant',e.message);}
 }
 return res.status(200).json({ok:true});
};
