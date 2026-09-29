'use strict';
const COURSE = {...TECH_COURSE, rubric:TECH_RUBRIC};
const KEY = 'tech-course-textnow-primer-v1';
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state={current:'start',complete:[],fields:{},scores:{},feedback:{}};
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&typeof s==='object'){state.current=LESSONS.some(l=>l.id===s.current)?s.current:'start';state.complete=Array.isArray(s.complete)?[...new Set(s.complete.filter(id=>LESSONS.some(l=>l.id===id)))]:[];for(const k of ['fields','scores','feedback'])if(s[k]&&typeof s[k]==='object'&&!Array.isArray(s[k]))state[k]=s[k];}}catch(_){}
for(const id of Object.keys(state.feedback))if(state.feedback[id]?.purpose!=='practice-notes-v4')delete state.feedback[id];
let busy=0; const pendingScores=new Set();
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));$('saveStatus').textContent='Saved in this browser.';}catch(_){$('saveStatus').textContent='Browser storage unavailable. Download your work before leaving.';}renderNav();}
function mark(id){if(!state.complete.includes(id))state.complete.push(id);}
function renderNav(){
  $('nav').replaceChildren();
  for(const group of [...new Set(LESSONS.map(l=>l.group))]){
    const wrap=document.createElement('div');wrap.className='nav-group-wrap';const title=document.createElement('div');title.className='nav-group';title.textContent=group;wrap.append(title);
    for(const l of LESSONS.filter(l=>l.group===group)){const b=document.createElement('button');b.textContent=l.title;b.dataset.nav=l.id;b.className=(l.id===state.current?'active ':'')+(state.complete.includes(l.id)?'done':'');if(l.id===state.current)b.setAttribute('aria-current','step');b.onclick=()=>go(l.id);wrap.append(b);}$('nav').append(wrap);
  }
  const p=Math.round(state.complete.length/LESSONS.length*100);$('bar').style.width=p+'%';$('bar').parentElement.setAttribute('aria-valuenow',p);$('progressLabel').textContent=`${state.complete.length} of ${LESSONS.length} activities complete`;
}
function go(id,focus=true){
  
  if(!LESSONS.some(l=>l.id===id))id='start';stopRecording();document.querySelectorAll('audio').forEach(a=>a.pause());state.current=id;
  document.querySelectorAll('[data-page]').forEach(s=>s.hidden=s.dataset.page!==id);
  if(id==='final'||id==='comparison')renderFinal();if(id==='comparison'&&state.scores.baseline&&state.scores.final)mark(id);
  $('nav').classList.remove('open');$('menuToggle').setAttribute('aria-expanded','false');save();
  if(focus){document.querySelector(`#page-${id} h1,#page-${id} h2`).focus({preventScroll:true});window.scrollTo(0,0);}
}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
document.querySelectorAll('[data-next]').forEach(b=>b.onclick=()=>{const id=b.dataset.next;if(!canCompleteAudio(id))return;if(id==='baseline'&&!state.scores.baseline){$('baselineStatus').textContent='Submit your first pitch before continuing.';$('baselinePitch').focus();return;}if(id==='final'&&!state.scores.final){$('finalStatus').textContent='Submit your final pitch to compare the two attempts.';return;}mark(id);go(LESSONS[LESSONS.findIndex(l=>l.id===id)+1].id);});
$('menuToggle').onclick=()=>{const open=$('nav').classList.toggle('open');$('menuToggle').setAttribute('aria-expanded',open);};
document.querySelectorAll('[data-brief]').forEach(el=>el.innerHTML=COURSE.brief.split('\n\n').map(p=>`<p>${esc(p)}</p>`).join(''));
document.querySelectorAll('[data-save]').forEach(el=>{el.value=typeof state.fields[el.id]==='string'?state.fields[el.id]:'';el.addEventListener('input',()=>{state.fields[el.id]=el.value;if(el.id==='finalPitch'&&state.scores.final){delete state.scores.final;state.complete=state.complete.filter(x=>!['final','comparison'].includes(x));$('finalResult').replaceChildren();}const activity=Object.entries(COURSE.exercises).find(([,x])=>x.fields.includes(el.id));if(activity){delete state.feedback[activity[0]];$(activity[0]+'Feedback').hidden=true;state.complete=state.complete.filter(x=>x!==activity[0]);}save();});});
async function post(path,body){
  if(location.protocol==='file:')throw new Error('Open this course through the site or local preview server to use the coach. Your draft is saved.');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),65000);
  try{const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});let data;try{data=await response.json();}catch(_){throw new Error('The coach did not return a readable response. Your work is saved. Please try again.');}if(!response.ok)throw new Error(data.error||'The coach is unavailable. Please try again.');return data;}catch(e){if(e.name==='AbortError')throw new Error('The coach took too long. Your work is saved. Please try again.');throw e;}finally{clearTimeout(timer);}
}
function validateScore(data){
  if(!data||!Array.isArray(data.pillars)||data.pillars.length!==3)throw new Error('The score was incomplete. Please try again.');let total=0;
  COURSE.rubric.forEach(r=>{const p=data.pillars.find(p=>p.key===r.key);if(!p||!Array.isArray(p.lines)||p.lines.length!==2)throw new Error('The score was incomplete. Please try again.');let sub=0;r.lines.forEach(([code])=>{const line=p.lines.find(x=>x.code===code);if(!line||![0,1,2].includes(line.score)||!line.note?.trim())throw new Error('The score was incomplete. Please try again.');sub+=line.score;});if(p.subtotal!==sub)throw new Error('The score could not be verified. Please try again.');total+=sub;});
  if(data.total!==total||!data.whatWorked?.trim()||!data.coachingFocus?.trim())throw new Error('The score was incomplete. Please try again.');
}
function scoreHTML(d){return `<div class="result"><p class="score-total">${d.total}/12 <small>Written pitch · T / E / C</small></p>`+COURSE.rubric.map(r=>{const p=d.pillars.find(x=>x.key===r.key);return `<div class="pillar"><h3>${r.name}<span>${p.subtotal}/4</span></h3>`+r.lines.map(([code,label])=>{const l=p.lines.find(l=>l.code===code);return `<div class="score-line"><strong>${label} · ${l.score}/2</strong><p>${esc(l.note)}</p></div>`;}).join('')+'</div>';}).join('')+`<h3>What worked</h3><p>${esc(d.whatWorked)}</p><h3>Coaching focus</h3><p>${esc(d.coachingFocus)}</p><p class="hint">How You Say It is not scored from writing.</p></div>`;}
function restoreScore(kind){const s=state.scores[kind];if(!s)return;try{validateScore(s.result);}catch(_){delete state.scores[kind];return;}$(kind+'Result').innerHTML=scoreHTML(s.result);if(kind==='baseline'){$('baselinePitch').value=s.pitch;$('baselinePitch').readOnly=true;$('scoreBaseline').disabled=true;$('scoreBaseline').textContent='Baseline saved';$('baselineStatus').textContent='Your original pitch and feedback are saved for the final comparison.';}}
async function score(kind){
  const field=$(kind+'Pitch'),pitch=field.value.trim(),btn=$(kind==='baseline'?'scoreBaseline':'scoreFinal'),status=$(kind+'Status');
  if(pendingScores.has(kind))return;if(kind==='baseline'&&state.scores.baseline)return;if(kind==='final'&&!state.scores.baseline){status.textContent='Complete your baseline first. You can find it under Start.';return;}if(pitch.length<30){status.textContent='Write at least a couple of sentences for your pitch.';field.focus();return;}
  busy++;pendingScores.add(kind);btn.disabled=true;field.readOnly=true;status.textContent='Your TECH coach is reading the pitch. This usually takes 10–15 seconds.';
  try{const result=await post('/api/assess',{scenarioId:COURSE.scenarioId,pitch});validateScore(result);state.scores[kind]={pitch,result,savedAt:new Date().toISOString()};state.fields[kind+'Pitch']=pitch;mark(kind);save();$(kind+'Result').innerHTML=scoreHTML(result);status.textContent=kind==='baseline'?'Your original pitch and feedback are saved for the final comparison.':'Final pitch saved. Continue to see what changed.';if(kind==='baseline')btn.textContent='Baseline saved';renderFinal();}catch(e){status.textContent=e.message;}finally{busy--;pendingScores.delete(kind);btn.disabled=kind==='baseline'&&!!state.scores.baseline;field.readOnly=btn.disabled;}
}
$('scoreBaseline').onclick=()=>score('baseline');$('scoreFinal').onclick=()=>score('final');
function practiceHTML(d){return d.behaviours.map(b=>`<p><strong>${esc(b.code)} · ${esc(b.label)}</strong><br>${esc(b.note)}</p>`).join('');}
document.querySelectorAll('[data-coach]').forEach(btn=>btn.onclick=async()=>{
  const id=btn.dataset.coach,exercise=COURSE.exercises[id],box=$(id+'Feedback'),answers=Object.fromEntries(exercise.fields.map(k=>[k,$(k).value.trim()]));box.hidden=false;if(Object.values(answers).some(s=>!s.length)){box.textContent='Add a short response to each prompt first.';return;}
  busy++;btn.disabled=true;exercise.fields.forEach(k=>$(k).readOnly=true);box.textContent='Your coach is reading your response…';
  try{const result=await post('/api/practice',{action:id,answers});const expected=COURSE.rubric.find(r=>r.key===exercise.pillar).lines;if(!Array.isArray(result.behaviours)||result.behaviours.length!==2||expected.some(([code])=>!result.behaviours.some(b=>b.code===code&&b.note)))throw new Error('The feedback was incomplete. Please try again.');state.feedback[id]=result;box.innerHTML=practiceHTML(result);save();}catch(e){box.textContent=e.message;}finally{busy--;btn.disabled=false;exercise.fields.forEach(k=>$(k).readOnly=false);}
});
function renderFinal(){
  const base=state.scores.baseline,final=state.scores.final;$('originalPitch').textContent=base?.pitch||'Your original pitch will appear here after you submit your baseline.';$('scoreFinal').disabled=!base;
  if(!base)$('finalStatus').textContent='Complete your baseline first using the activity navigation.';else if($('finalStatus').textContent.startsWith('Complete your baseline'))$('finalStatus').textContent='';
  if(!base||!final){$('comparison').innerHTML='<p>Submit both pitches to see your scores and feedback together.</p>';return;}
  $('comparison').innerHTML='<p>Look at the changes in your words as well as the scores.</p><table class="comparison-table"><caption class="hint">Same scenario. Same six rubric behaviours.</caption><thead><tr><th scope="col">Pillar</th><th scope="col">Baseline</th><th scope="col">Final</th></tr></thead><tbody>'+COURSE.rubric.map(r=>`<tr><th scope="row">${r.name}</th><td>${base.result.pillars.find(p=>p.key===r.key).subtotal}/4</td><td>${final.result.pillars.find(p=>p.key===r.key).subtotal}/4</td></tr>`).join('')+`<tr><th scope="row">Total</th><td><strong>${base.result.total}/12</strong></td><td><strong>${final.result.total}/12</strong></td></tr></tbody></table><details open><summary>Baseline pitch and feedback</summary><div class="original">${esc(base.pitch)}</div>${scoreHTML(base.result)}</details><details open><summary>Final pitch and feedback</summary><div class="original">${esc(final.pitch)}</div>${scoreHTML(final.result)}</details>`;
}
function report(){let text='THE TECH MODEL · TEXTNOW MINI-COURSE\n\n'+COURSE.brief+'\n';for(const kind of ['baseline','final']){const s=state.scores[kind];text+='\n\n'+kind.toUpperCase()+'\n'+(s?.pitch||state.fields[kind+'Pitch']||'Not yet written');if(s){text+=`\n\nTotal: ${s.result.total}/12`;for(const p of s.result.pillars){text+=`\n${p.name}: ${p.subtotal}/4`;for(const l of p.lines)text+=`\n  ${l.label}: ${l.score}/2. ${l.note}`;}text+='\n\nWhat worked: '+s.result.whatWorked+'\nCoaching focus: '+s.result.coachingFocus;}}for(const [id,e] of Object.entries(COURSE.exercises)){text+='\n\n'+LESSONS.find(x=>x.id===id).title.toUpperCase();for(const f of e.fields)text+='\n'+f+': '+(state.fields[f]||'Not yet written');const d=state.feedback[id];if(d?.grader==='assessment'&&d.purpose==='practice-notes-v4'){for(const b of d.behaviours)text+='\n'+b.label+': '+b.note;}}if(Array.isArray(state.fields.objectionHistory))for(const t of state.fields.objectionHistory)text+='\n'+(t.role==='user'?'You':'Priya')+': '+t.content;for(let i=0;i<3;i++)if(state.fields['markup'+i])text+='\n\nOptional delivery notes '+(i+1)+': '+state.fields['markup'+i];return text+'\n\nHow You Say It: practised separately; not scored from writing.\n';}
$('download').onclick=()=>{const url=URL.createObjectURL(new Blob([report()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='my-tech-mini-course.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('print').onclick=()=>{$('printReport').textContent=report();window.print();};
let dbPromise;
function recordingDB(){if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open('tech-primer-audio-v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('recordings');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});return dbPromise;}
async function audioStore(mode,id,blob){const db=await recordingDB();return new Promise((resolve,reject)=>{const tx=db.transaction('recordings',mode==='get'?'readonly':'readwrite'),store=tx.objectStore('recordings');const req=mode==='get'?store.get(id):mode==='clear'?store.clear():store.put(blob,id);tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
let activeRecording=null,requestingMic=false;const audioURLs={};
const recordingIds=['emphasisAll','deliveryAll'];
const recorded=new Set(),listened=new Set(Array.isArray(state.fields.audioListened)?state.fields.audioListened:[]);

function canCompleteAudio(id){
 if(id==='emphasis'&&(!recorded.has('emphasisAll')||!listened.has('emphasisAll'))){$('emphasisGate').textContent='Record all eight versions in one take, then listen back before continuing.';return false;}
 if(id==='delivery'&&(!recorded.has('deliveryAll')||!listened.has('deliveryAll'))){$('deliveryGate').textContent='Record all three deliveries in one take, then listen back before continuing. Notes are optional.';return false;}
 return true;
}
recordingIds.forEach(id=>{$(id+'Audio').addEventListener('error',()=>{$(id+'Status').textContent='This recording could not be played. Please record this version again.';});});
recordingIds.forEach(id=>$(id+'Audio').addEventListener('ended',()=>{listened.add(id);state.fields.audioListened=[...listened];save();}));
function showRecording(id,blob){if(audioURLs[id])URL.revokeObjectURL(audioURLs[id]);const url=URL.createObjectURL(blob);audioURLs[id]=url;$(id+'Audio').src=url;$(id+'Audio').hidden=false;const a=$(id+'Download');a.href=url;a.download='tech-'+id+(blob.type.includes('mp4')?'.m4a':blob.type.includes('ogg')?'.ogg':'.webm');a.hidden=false;recorded.add(id);listened.delete(id);document.querySelector('[data-recorder="'+id+'"]').classList.add('recorded');}
function recordingButtons(){
  document.querySelectorAll('[data-record]').forEach(b=>b.disabled=!!activeRecording||requestingMic);document.querySelectorAll('[data-stop]').forEach(b=>b.disabled=b.dataset.stop!==activeRecording?.id);}
function stopRecording(){if(!activeRecording)return;const r=activeRecording;clearInterval(r.timer);if(r.recorder.state!=='inactive')r.recorder.stop();r.stream.getTracks().forEach(t=>t.stop());}
document.querySelectorAll('[data-record]').forEach(b=>b.onclick=async()=>{
  const id=b.dataset.record;if(activeRecording||requestingMic)return;requestingMic=true;recordingButtons();let stream;
  try{if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw new Error('unsupported');stream=await navigator.mediaDevices.getUserMedia({audio:true});if(state.current!==(id.startsWith('emphasis')?'emphasis':'delivery')){stream.getTracks().forEach(t=>t.stop());return;}const recorder=new MediaRecorder(stream),chunks=[],started=Date.now();document.querySelectorAll('audio').forEach(a=>a.pause());
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=async()=>{const blob=new Blob(chunks,{type:recorder.mimeType});stream.getTracks().forEach(t=>t.stop());clearInterval(activeRecording?.timer);activeRecording=null;recordingButtons();if(!blob.size){$(id+'Status').textContent='No audio was captured. Please try again.';return;}showRecording(id,blob);state.fields.audioListened=[...listened];state.complete=state.complete.filter(x=>x!==(id.startsWith('emphasis')?'emphasis':'delivery'));save();$(id+'Status').textContent='Listen back. This recording is saved on your device.';try{await audioStore('put',id,blob);}catch(_){$(id+'Status').textContent='Listen back, then save your recording. This browser could not keep audio after a refresh.';}};
    recorder.onerror=()=>{$(id+'Status').textContent='Recording was interrupted. Try again.';stopRecording();};recorder.start();activeRecording={id,recorder,stream,timer:setInterval(()=>{const s=Math.floor((Date.now()-started)/1000);$(id+'Timer').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');if(s>=120)stopRecording();},250)};$(id+'Timer').textContent='00:00';$(id+'Status').textContent=id==='emphasisAll'?'Recording… Read all eight versions, then stop and listen.':'Recording… Try all three deliveries, then stop and listen.';
  }catch(_){stream?.getTracks().forEach(t=>t.stop());$(id+'Status').textContent='Microphone unavailable. Allow microphone access on HTTPS or localhost and try again. Check your browser’s microphone permission, then press Record again.';}finally{requestingMic=false;recordingButtons();}
});
document.querySelectorAll('[data-stop]').forEach(b=>b.onclick=stopRecording);
for(const id of recordingIds)audioStore('get',id).then(blob=>{if(blob){const heard=listened.has(id);showRecording(id,blob);if(heard)listened.add(id);$(id+'Status').textContent='Your saved recording. Listen back or record another version.';}}).catch(()=>{});

$('reset').onclick=async()=>{if(busy||requestingMic||activeRecording){alert('Finish the current recording or coach request before restarting.');return;}if(!confirm('Erase your saved pitches, feedback, progress and recordings for this mini-course?'))return;try{localStorage.removeItem(KEY);}catch(_){alert('Browser storage could not be cleared.');return;}try{await audioStore('clear');}catch(_){}location.reload();};
window.addEventListener('beforeunload',e=>{if(busy||activeRecording||requestingMic){e.preventDefault();e.returnValue='';}});
restoreScore('baseline');restoreScore('final');for(const [id,d] of Object.entries(state.feedback))if(COURSE.exercises[id]&&d.grader==='assessment'&&d.purpose==='practice-notes-v4'&&Array.isArray(d.behaviours)){const el=$(id+'Feedback');el.innerHTML=practiceHTML(d);el.hidden=false;}renderFinal();go(state.current,false);


// The conversation stores successful pairs only; failed sends keep the draft for retry.
let conversationBusy=false;
let conversation=Array.isArray(state.fields.objectionHistory)?state.fields.objectionHistory:[];
if(conversation.length>6||conversation.length%2||conversation.some((t,i)=>!t||t.role!==(i%2?'assistant':'user')||typeof t.content!=='string'))conversation=[];
function renderConversation(){
 $('objectionConversation').innerHTML=conversation.map(t=>`<div class="conversation-turn ${t.role==='assistant'?'priya':''}"><strong>${t.role==='user'?'You':'Priya'}</strong><p>${esc(t.content)}</p></div>`).join('');
 $('sendObjection').disabled=conversationBusy||conversation.length>=6;
 $('finishObjection').disabled=conversationBusy||conversation.length<2;
 $('restartObjection').disabled=conversationBusy;
 $('objection').readOnly=conversationBusy||conversation.length>=6;
}
$('sendObjection').onclick=async()=>{
 if(conversationBusy||conversation.length>=6)return;
 const content=$('objection').value.trim();if(!content){$('objectionStatus').textContent='Write what you would say to Priya first.';return;}
 conversationBusy=true;busy++;renderConversation();$('objectionStatus').textContent='Priya is replying…';
 try{const history=[...conversation,{role:'user',content}],data=await post('/api/conversation',{history});if(typeof data.reply!=='string'||!data.reply.trim())throw Error('The reply was incomplete. Please try again.');conversation=[...history,{role:'assistant',content:data.reply}];state.fields.objectionHistory=conversation;state.fields.objection='';$('objection').value='';delete state.feedback.objection;$('objectionFeedback').hidden=true;state.complete=state.complete.filter(x=>x!=='objection');save();$('objectionStatus').textContent=conversation.length>=6?'You’ve had three turns. Finish to get notes on the conversation.':`${conversation.length/2} of 3 turns. Reply again, or finish when you’re ready.`;}catch(e){$('objectionStatus').textContent=e.message;}finally{conversationBusy=false;busy--;renderConversation();}
};
$('finishObjection').onclick=async()=>{
 if(conversationBusy||!conversation.length)return;
 conversationBusy=true;busy++;renderConversation();const box=$('objectionFeedback');box.hidden=false;box.textContent='Your coach is reading the conversation…';
 try{const data=await post('/api/practice',{action:'objection',history:conversation});if(!Array.isArray(data.behaviours)||!['E1','E2'].every(code=>data.behaviours.some(b=>b.code===code&&typeof b.note==='string')))throw Error('The notes were incomplete. Please try again.');state.feedback.objection=data;box.innerHTML=practiceHTML(data);mark('objection');save();$('objectionStatus').textContent='Conversation saved. You can continue or try a new conversation.';}catch(e){box.textContent=e.message;}finally{conversationBusy=false;busy--;renderConversation();}
};
$('restartObjection').onclick=()=>{if(conversationBusy)return;if(conversation.length&&!confirm('Replace this practice conversation with a new one? Download your work first if you want to keep it.'))return;conversation=[];state.fields.objectionHistory=[];delete state.feedback.objection;$('objectionFeedback').hidden=true;state.complete=state.complete.filter(x=>x!=='objection');$('objectionStatus').textContent='Start with Priya’s comment above.';save();renderConversation();};
renderConversation();
