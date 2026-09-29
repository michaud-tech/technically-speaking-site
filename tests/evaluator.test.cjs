// Controlled-response checks verify architecture and transport, not model judgement.
const assert=require('node:assert/strict');
const {TECH_STANDARD,buildEvaluationPrompt}=require('../api/evaluation-policy.js');
const assess=require('../api/assess.js'),practice=require('../api/practice.js');
const course=require('../course-data.js'),rubric=require('../assessment-rubric.js');
const cases=require('./practice-cases.json');
const pitchPrompt=buildEvaluationPrompt('pitch'),practicePrompt=buildEvaluationPrompt('practice');
assert.ok(pitchPrompt.includes(TECH_STANDARD)&&practicePrompt.includes(TECH_STANDARD));
assert.ok(pitchPrompt.includes('HOW TO SCORE'));
for(const instruction of ['HOW TO SCORE','WORKED EXAMPLE','coachingFocus — always','Call the submit_score'])assert.ok(!practicePrompt.includes(instruction),instruction);
process.env.ANTHROPIC_API_KEY='controlled-test-only';
let current,mode='valid',calls=0;
global.fetch=async(url,options)=>{
 calls++;const body=JSON.parse(options.body),listening=body.tool_choice.name==='submit_listening_note',isPractice=body.tool_choice.name!=='submit_score';
 assert.equal(body.system,isPractice?buildEvaluationPrompt('practice',listening?'listening':'behaviours'):pitchPrompt);
 let input;
 if(isPractice){const e=course.exercises[current.action];assert.ok(body.messages[0].content.includes(e.context));assert.ok(body.messages[0].content.includes(e.task));for(const a of Object.values(current.answers))assert.ok(body.messages[0].content.includes(a));
 input={evidenceQuote:Object.values(current.answers)[0].slice(0,12),notes:rubric.find(p=>p.key===e.pillar).lines.map(([code])=>({code,note:'A complete controlled response for transport testing.'}))};
 if(listening)input={evidenceQuote:input.evidenceQuote,note:'A complete controlled listening note.'};
 if(mode==='incomplete')input.notes[0].note='Unfinished';
 if(mode==='wrong-pillar')input.notes[0].code='H1';
 if(mode==='ungrounded')input.evidenceQuote='A quote absent from the response';
 }else input={scores:Object.fromEntries(rubric.flatMap(p=>p.lines.map(([code])=>[code,{score:2,note:'A complete controlled score note.'}]))),whatWorked:'A complete controlled summary.',coachingFocus:'A complete controlled coaching direction.',evidenceQuote:'Please sponsor'};
 return {ok:true,json:async()=>({stop_reason:mode==='truncated'?'max_tokens':'tool_use',content:[{type:'tool_use',name:body.tool_choice.name,input}]})};
};
async function call(handler,body){let status=200,result;await handler({method:'POST',body},{status(n){status=n;return this;},json(r){result=r;}});return {status,result};}
(async()=>{
 for(current of cases){const r=await call(practice,current);assert.equal(r.status,200);if(current.action==='listen'){assert.equal(r.result.purpose,'listening-note-v1');assert.equal(typeof r.result.note,'string');assert.ok(!r.result.behaviours);}else{assert.equal(r.result.purpose,'practice-notes-v4');assert.equal(r.result.behaviours.length,2);assert.ok(r.result.behaviours.every(b=>b.code.startsWith(course.exercises[current.action].pillar)&&!('score'in b)));}assert.ok(!('total'in r.result));}
 for(mode of ['incomplete','wrong-pillar','ungrounded','truncated']){const n=calls;const r=await call(practice,current=cases[0]);assert.equal(r.status,502);assert.equal(calls-n,2);}
 mode='valid';const r=await call(assess,{scenarioId:course.scenarioId,pitch:'Please sponsor this four-week pilot so we can learn about user trust.'});assert.equal(r.status,200);assert.equal(r.result.total,12);
 console.log('PASS: 21 practice cases route exact tasks/responses to practice-only instructions; shared TECH standard; isolated pitch scoring; malformed, wrong-pillar, invented-quote and truncated responses rejected. Model quality requires live review.');
})().catch(e=>{console.error(e);process.exitCode=1;});
