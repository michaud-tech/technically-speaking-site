const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

const BRIEF = `The learner is a TextNow intern preparing an innovation-challenge pitch. TextNow wants to improve user trust without adding unnecessary warnings to legitimate messages. The proposed feature identifies signals associated with suspicious messages, explains why a message may be risky, and offers safer next steps. The learner wants a four-week pilot using one product designer and two engineers, delaying an onboarding experiment by one sprint. Avery sponsors the challenge and can sponsor the concept, but product and engineering leaders approve the people and sprint time. Avery cares about user trust, speed to credible evidence, false warnings, and responsible use of limited design and engineering time. In interviews, nine of 14 users said they were sometimes unsure whether an unexpected message was legitimate. The other five did not report uncertainty; that does not establish comfort or trust. In a separate prototype test with different participants, six of eight noticed the warning and chose a safer action. These are different measures in different samples, not a before-and-after comparison. Both samples were small. The prototype did not measure long-term harm reduction. The pilot would test usage, comprehension, false warnings, and which longer-term measures are worth tracking.`;

async function anthropic(system, user, maxTokens = 500) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {'content-type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},
    body: JSON.stringify({model:MODEL,max_tokens:maxTokens,system,messages:[{role:'user',content:user}]})
  });
  if (!response.ok) throw new Error(await response.text());
  const data=await response.json();
  return (data.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('').trim();
}

const coachRule = `You are a practice coach for the TECH communication model. Give brief developmental feedback, never a rewritten answer. Use exactly two headings: "What worked" and "Try next". Under each heading write no more than two sentences. Name one highest-impact next move. Explain the issue plainly, then leave the learner to solve it. Do not provide sample wording, scripts, an "e.g.", or a replacement line. Do not invent deadlines, facts, stakeholders, or requirements. Treat TECH tools as flexible choices, not a rigid checklist.`;
const clean=v=>String(v||'').trim();
const convo=v=>Array.isArray(v)?v.slice(-16):[];

module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed.'});
  if(!process.env.ANTHROPIC_API_KEY)return res.status(500).json({error:'Missing ANTHROPIC_API_KEY.'});
  const b=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{}),action=clean(b.action);
  try{
    if(action==='ask-avery'){
      const message=clean(b.message||b.question).slice(0,1600);if(message.length<5)return res.status(400).json({error:'Write what you would say to Avery.'});
      const answer=await anthropic(`Act as Avery in the brief. Respond naturally in 2-4 sentences to the learner's latest message. They may ask, paraphrase, check understanding, or make a statement. Reveal reasonable detail about Avery's priorities and decision process, but never invent research, budgets, deadlines, or guarantees. If their understanding is wrong, correct it. Do not coach. Write only Avery's response.`,`BRIEF:\n${BRIEF}\n\nCONVERSATION:\n${JSON.stringify(convo(b.conversation))}\n\nLEARNER:\n${message}`,350);
      return res.status(200).json({answer});
    }
    if(action==='coach-listening'){
      if(!convo(b.conversation).length||clean(b.reflection).length<15)return res.status(400).json({error:'Talk with Avery and write what you learned first.'});
      const feedback=await anthropic(`${coachRule} Evaluate the conversation as a whole. Look for whether the learner followed Avery's language, checked assumptions, and learned something that could change the pitch. Do not reward question quantity.`, `BRIEF:\n${BRIEF}\n\nCONVERSATION:\n${JSON.stringify(convo(b.conversation))}\n\nREFLECTION:\n${clean(b.reflection)}`,350);return res.status(200).json({feedback});
    }
    if(action==='coach-ask'){
      if(clean(b.ask).length<10)return res.status(400).json({error:'Write the ask you would make to Avery.'});
      const feedback=await anthropic(`${coachRule} Evaluate whether the primary goal is clear, the ask names a decision Avery can actually make, and the second-best outcome keeps useful movement without becoming a list. Avery can sponsor the concept but cannot assign product and engineering resources alone.`, `BRIEF:\n${BRIEF}\n\nPRIMARY GOAL:\n${clean(b.goal)}\n\nSECOND BEST:\n${clean(b.secondBest)}\n\nASK:\n${clean(b.ask)}`,350);return res.status(200).json({feedback});
    }
    if(action==='start-objection'){
      if(clean(b.ask).length<10)return res.status(400).json({error:'Build your ask before opening the conversation.'});
      const answer=await anthropic(`Act as Avery. Give one realistic objection to this ask in 1-2 sentences. Base it on the evidence, false-warning risk, or the cost of delaying onboarding. State the position naturally. Do not explain the hidden interest, coach, or resolve it.`,`BRIEF:\n${BRIEF}\n\nLEARNER ASK:\n${clean(b.ask)}`,220);return res.status(200).json({answer});
    }
    if(action==='continue-objection'){
      const message=clean(b.message).slice(0,1800);if(message.length<5)return res.status(400).json({error:'Write how you would respond.'});
      const answer=await anthropic(`Act as Avery in a live pushback conversation. Respond naturally in 1-3 sentences. If the learner accurately reflects or checks your concern, confirm or refine it. If they ask an open question, reveal a reasonable underlying interest grounded in the brief. If they argue, stay unconvinced. If they offer a path before understanding you, react as Avery would. Do not coach and do not require a fixed sequence.`, `BRIEF:\n${BRIEF}\n\nCONVERSATION:\n${JSON.stringify(convo(b.conversation))}\n\nLEARNER:\n${message}`,300);return res.status(200).json({answer});
    }
    if(action==='coach-objection'){
      if(convo(b.conversation).filter(x=>x.role==='you').length<1)return res.status(400).json({error:'Respond to Avery at least once first.'});
      const feedback=await anthropic(`${coachRule} Evaluate the conversation as a whole. Look for genuine understanding, useful checking, and whether the learner responded through Avery's concern. A concise combined move may be excellent. Do not penalize the learner for omitting a step that the conversation did not need.`, `BRIEF:\n${BRIEF}\n\nCONVERSATION:\n${JSON.stringify(convo(b.conversation))}`,350);return res.status(200).json({feedback});
    }
    if(action==='coach-structure'){
      if([b.what,b.soWhat,b.nowWhat].some(x=>clean(x).length<5))return res.status(400).json({error:'Complete What, So What, and Now What first.'});
      const feedback=await anthropic(`${coachRule} Evaluate the What / So What / Now What / When structure. Focus on whether So What connects to Avery and whether the next step matches Avery's authority. Timing may be omitted if it is genuinely unknown.`, `BRIEF:\n${BRIEF}\n\nWHAT: ${clean(b.what)}\nSO WHAT: ${clean(b.soWhat)}\nNOW WHAT: ${clean(b.nowWhat)}\nWHEN: ${clean(b.when)}`,350);return res.status(200).json({feedback});
    }
    if(action==='coach-metaphor'){
      if(clean(b.draft).length<20)return res.status(400).json({error:'Build the metaphor first.'});
      const feedback=await anthropic(`${coachRule} Evaluate whether the metaphor compares the idea's core function to something familiar and helps Avery understand impact or risk. Judge usefulness, not cleverness. Flag a misleading comparison without replacing it.`, `BRIEF:\n${BRIEF}\n\nCORE FUNCTION: ${clean(b.coreFunction)}\nFAMILIAR FUNCTION: ${clean(b.familiar)}\nMETAPHOR: ${clean(b.draft)}`,350);return res.status(200).json({feedback});
    }
    if(action==='coach-story'){
      if([b.today,b.everyDay,b.imagine,b.because,b.soThat,b.ask].some(x=>clean(x).length<4))return res.status(400).json({error:'Complete each part of the story first.'});
      const feedback=await anthropic(`${coachRule} Evaluate the Pain to Promise story. Check that each link follows credibly, the promise stays within what a four-week pilot can establish, and the story lands on a decision Avery can make. Do not demand the labels appear in the final pitch.`, `BRIEF:\n${BRIEF}\n\nTODAY: ${clean(b.today)}\nEVERY DAY: ${clean(b.everyDay)}\nIMAGINE IF: ${clean(b.imagine)}\nBECAUSE OF THAT: ${clean(b.because)}\nSO THAT: ${clean(b.soThat)}\nASK: ${clean(b.ask)}`,350);return res.status(200).json({feedback});
    }
    return res.status(400).json({error:'Unknown practice action.'});
  }catch(error){console.error('practice error',error);return res.status(502).json({error:'The coach is unavailable right now. Try again in a moment.'});}
};