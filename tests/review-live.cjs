// Run on a trusted machine with the same server environment as the host:
// node tests/review-live.cjs > practice-live-review.json
// Makes 21 real evaluator calls. Never prints credentials. No learner data is used.
const assess=require('../api/practice.js'),cases=require('./practice-cases.json');
if(!process.env.ANTHROPIC_API_KEY){console.error('Set the server-side API key and supported model before live review.');process.exit(1);}
(async()=>{const report=[];for(const c of cases){let status=200,result;await assess({method:'POST',body:c},{status(n){status=n;return this;},json(r){result=r;}});report.push({...c,status,result});}console.log(JSON.stringify(report,null,2));if(report.some(r=>r.status!==200))process.exitCode=1;})().catch(e=>{console.error(e.message);process.exitCode=1;});
