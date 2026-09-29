// Vercel serverless function for the Technically Speaking assessment.
//
//   POST { scenarioId, pitch } -> scores the pitch on T / E / C (no H)
//
// The Anthropic API key stays server-side (set ANTHROPIC_API_KEY in Vercel env vars).
// Each brief gives the situation (the person's role and pressures, the other person's
// role/history/pressures, and a mix of technical and business facts) and then names the
// task: make the case for prioritizing this specific work. The brief assigns the END GOAL
// (advocate for this), but never hands over the audience tailoring, the evidence
// translation, the ask, or the next step — that is what the score measures.

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

// The three briefs are equivalent in structure and difficulty. Kept here (server-side)
// as the source of truth for scoring; assessment.html shows the matching text to the visitor.
const COURSE = require('../course-data.js');
const SCENARIOS = {
  [COURSE.scenarioId]: { brief: COURSE.brief },
  'textnow-interns': {
    brief: `You're a TextNow intern working with a small team on an innovation challenge. TextNow is prioritizing user trust and wants to reduce harmful interactions without creating unnecessary warnings for legitimate messages. Your team has developed an in-app feature that identifies signals commonly associated with suspicious messages, explains why a message may be risky and offers safer next steps before the user responds. You recommend a four-week pilot with a limited group of users. The pilot would require support from one product designer and two engineers, which means delaying a planned onboarding experiment by one sprint.

You're presenting to Avery, the executive sponsoring the challenge. Avery is accountable for choosing challenge projects that produce credible learning and are realistic enough to earn support from product and engineering. Avery cares about user trust, speed to evidence and making good use of limited design and engineering time. Your team interviewed 14 TextNow users. Nine said they were sometimes unsure whether an unexpected message was legitimate. The other five did not report uncertainty; this does not establish that they felt comfortable or trusted the message. In a separate prototype test with different participants, six of eight correctly identified the warning and chose a safer next step without help. These results measure different things in different samples, so they are not a before-and-after comparison and cannot support a percentage-point improvement claim. Both samples were small. The test did not measure whether the feature reduces harmful interactions over time. The pilot would test usage, comprehension and false warnings before the company considers a wider release.

Avery can sponsor the pilot, but the product and engineering leads need to agree to the people and sprint time.

Make the case to Avery for sponsoring the four-week pilot. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  'gsw-partnership': {
    brief: `You're on the Golden State Warriors Global Partnerships team. A national financial services brand is considering renewing its partnership for another three years. You recommend expanding the partnership beyond its current arena presence to include a co-branded content series and a community financial-literacy program. The expanded package would increase the partner's annual investment by 15%.

You're speaking to Jordan, the brand's Chief Marketing Officer. Jordan is accountable for growth and brand relevance, and has said the renewal needs to do more than generate impressions.

The current partnership's hospitality inventory was 82% utilized. Co-branded content performed 34% above the team's usual engagement benchmark, and last season's community event reached 12,000 Bay Area students and families. Direct lead attribution is incomplete, so you cannot claim the partnership caused new account growth. The strongest evidence is engagement, participation and access to Warriors fans.

Jordan can support the direction, but the additional investment needs approval from the brand's finance lead. You have ten minutes with Jordan in the renewal meeting.

Make the case to Jordan for the expanded three-year renewal. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  payments: {
    brief: `You're a senior engineer responsible for the payments service. You believe the team needs six weeks to replace part of the service before building more features on top of it. The current architecture is seven years old, has fourteen dependencies, and has become increasingly difficult for engineers to change safely. Your team has spent a lot of time responding to incidents, and the project would displace two items currently planned for Q3.

You're speaking to Dana, your VP of Engineering. Dana is accountable for delivering the Q3 roadmap and has pushed back before on technical cleanup that wasn't connected to a customer outcome.

The payments service has caused three incidents this quarter. Each one took checkout down for customers, and the most recent took nearly four hours to resolve.

Dana can support the project, but because it changes the roadmap, she'll need to take the recommendation to the product executive. You have five minutes with Dana in the roadmap review.

Make the case to Dana for prioritizing the payments-service replacement. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  pipeline: {
    brief: `You're a hydrogeologist advising a client on a site they want to develop. You recommend four more weeks of groundwater monitoring before they finalize the design. The first two rounds of samples show changing levels near the proposed building area. You can't yet tell whether the changes are seasonal or point to a larger problem. The extra work will cost $35,000 and could delay the design sign-off by a month.

You're speaking to Priya, the client's project director. She is accountable for the schedule and has pushed back before when technical teams asked for more data without explaining what decision it would change.

If the current design proceeds and the higher readings persist, the client may need to change the foundation plan after construction begins, at a much higher cost.

Priya can support the monitoring, but she will need to take the cost and schedule change to the client sponsor. You have ten minutes with Priya before the design review.

Make the case to Priya for four more weeks of groundwater monitoring. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  auth: {
    brief: `You're a scientist leading a product safety study. You recommend extending the study by five weeks before the company commits to a launch date. Early results look promising, but one measure has varied widely across batches. The team needs another set of tests to learn whether the variation is a measurement issue or a real safety concern. The additional work will use $80,000 of the project budget and move the planned launch decision into the next quarter.

You're speaking to Marcus, the program director. He is accountable for the launch plan and has previously asked the team to separate real risk from scientific caution.

If the variation is real, a launch based on the current results could lead to a recall. If it is a measurement issue, the new tests should let the team move ahead with more confidence.

Marcus can approve the work, but because it moves the launch plan, he will need to explain the change to the executive team. You have five minutes with Marcus in the planning review.

Make the case to Marcus for extending the safety study. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
};

const {buildEvaluationPrompt}=require('./evaluation-policy.js');

const PRACTICE_TOOL = {name:'submit_practice_notes',description:'Return notes for the requested TECH pillar without grades.',input_schema:{type:'object',additionalProperties:false,properties:{evidenceQuote:{type:'string'},notes:{type:'array',items:{type:'object',additionalProperties:false,properties:{code:{type:'string'},note:{type:'string'}},required:['code','note']}}},required:['evidenceQuote','notes']}};

async function callAnthropic(body) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    const err = new Error('anthropic_error');
    err.detail = detail;
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Structured-output tool: forcing the model to call this returns the score as
// already-parsed JSON (tool_use.input), which can't be broken by prose,
// markdown fences, or a truncated text block the way free-text JSON can.
const SCORE_TOOL = {
  name: 'submit_score',
  description: 'Return the six TECH line scores (T1,T2,E1,E2,C1,C2) and the two feedback fields.',
  // Without strict mode, `required` is guidance rather than a guarantee: the
  // model can legally emit `{ pillars: [] }`. Strict tool use constrains the
  // generated input to this schema before it reaches the handler.
  strict: true,
  input_schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      scores: {
        type: 'object',
        additionalProperties: false,
        properties: Object.fromEntries(
          ['T1', 'T2', 'E1', 'E2', 'C1', 'C2'].map((code) => [code, {
            type: 'object',
            additionalProperties: false,
            properties: {
              score: { type: 'integer', description: '0, 1, or 2' },
              note: { type: 'string' },
            },
            required: ['score', 'note'],
          }])
        ),
        required: ['T1', 'T2', 'E1', 'E2', 'C1', 'C2'],
      },
      whatWorked: { type: 'string' },
      coachingFocus: { type: 'string' },
      evidenceQuote: { type: 'string', description: 'An exact contiguous quote from the pitch that the feedback discusses.' },
    },
    required: ['scores', 'whatWorked', 'coachingFocus', 'evidenceQuote'],
  },
};

// Pull the first COMPLETE, balanced JSON object out of the model's reply.
// Robust to code fences, prose before/after, and (unlike a greedy regex) to a
// second stray brace. Returns null if there's no object or it's truncated.
function extractJson(text) {
  if (!text) return null;
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
    } else if (ch === '"') inStr = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(text.slice(start, i + 1)); }
        catch (e) { return null; }
      }
    }
  }
  return null; // object never closed -> reply was truncated
}

// Canonical rubric skeleton. The server always emits EXACTLY this shape, so a
// slightly-off model response can never crash the handler or misrender results.
const RUBRIC = require('../assessment-rubric.js');

// Collect { score, note } by line code (T1..C2) from whatever shape the model
// returned — pillars as an array, pillars as an object map, or a flat lines list.
function collectLines(parsed) {
  const map = {};
  const take = (lines) => {
    if (Array.isArray(lines)) lines.forEach((l) => { if (l && l.code) map[String(l.code).toUpperCase().trim()] = l; });
  };
  const pillars = parsed && parsed.pillars;
  if (Array.isArray(pillars)) pillars.forEach((p) => take(p && p.lines));
  else if (pillars && typeof pillars === 'object') Object.keys(pillars).forEach((k) => take(pillars[k] && pillars[k].lines));
  if (parsed && Array.isArray(parsed.lines)) take(parsed.lines);
  // Current strict schema: line codes are object keys, so no model-generated
  // code or label can be missing or misspelled.
  if (parsed && parsed.scores && typeof parsed.scores === 'object') {
    Object.keys(parsed.scores).forEach((code) => {
      const line = parsed.scores[code];
      if (line && typeof line === 'object') map[String(code).toUpperCase().trim()] = line;
    });
  }
  return map;
}

// Build a guaranteed-valid response from the model's line scores.
function normalize(parsed) {
  const clamp = (n) => Math.max(0, Math.min(2, parseInt(n, 10) || 0));
  const map = collectLines(parsed);
  let total = 0;
  const pillars = RUBRIC.map((p) => {
    let sub = 0;
    const lines = p.lines.map(([code, label]) => {
      const src = map[code] || {};
      const score = clamp(src.score);
      sub += score;
      return { code, label, score, note: (src.note == null ? '' : String(src.note)) };
    });
    total += sub;
    return { key: p.key, name: p.name, subtotal: sub, lines };
  });
  return {
    total,
    pillars,
    whatWorked: parsed && parsed.whatWorked != null ? String(parsed.whatWorked) : '',
    coachingFocus: parsed && parsed.coachingFocus != null ? String(parsed.coachingFocus) : '',
    evidenceQuote: parsed && parsed.evidenceQuote != null ? String(parsed.evidenceQuote).trim() : '',
    _found: Object.keys(map),
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'Server is not configured (missing ANTHROPIC_API_KEY).' });
    return;
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch (e) {
    res.status(400).json({ error: 'Bad request.' });
    return;
  }

  const exercise = typeof body.practiceAction === 'string' && Object.hasOwn(COURSE.exercises, body.practiceAction) ? COURSE.exercises[body.practiceAction] : null;
  if(body.conversation && (body.practiceAction!=='objection'||!require('./conversation.js').validHistory(body.conversation,false)))return res.status(400).json({error:'Invalid conversation.'});
  const scenario = exercise ? {brief: exercise.context} : SCENARIOS[body.scenarioId];
  if (!scenario) {
    res.status(400).json({ error: 'Unknown scenario.' });
    return;
  }

  const pitch = (body.pitch || '').toString().trim();
  if (pitch.length < (exercise ? 1 : 15)) {
    res.status(400).json({ error: 'Please write at least a couple of sentences.' });
    return;
  }
  if (pitch.length > 6000) {
    res.status(400).json({ error: 'That is longer than a short pitch — please trim it down.' });
    return;
  }

  const relevant = exercise ? RUBRIC.find(p=>p.key===exercise.pillar) : null;
  const outputTool = exercise ? PRACTICE_TOOL : SCORE_TOOL;
  const userContent = exercise
    ? `ACTIVITY:\n${scenario.brief}${body.conversation ? "\n\nCONVERSATION (context only; evaluate the learner, not Priya):\n"+body.conversation.map(t=>(t.role==='user'?'Learner':'Priya')+': '+t.content).join('\n') : ""}\n\nREQUESTED ACTION:\n${exercise.task}\n\nRELEVANT TECH BEHAVIOURS:\n${relevant.lines.map(([code,label])=>code+' '+label).join('\n')}\n\nLEARNER RESPONSE:\n${pitch}\n\nOffer notes on this activity using submit_practice_notes.`
    : `BRIEF:\n${scenario.brief}\n\nPITCH:\n${pitch}\n\nScore the pitch and call submit_score with all six line scores and both feedback fields.`;

  async function runScore() {
    const data = await callAnthropic({
      model: MODEL,
      max_tokens: 2500,
      system: buildEvaluationPrompt(exercise ? 'practice' : 'pitch'),
      tools: [outputTool],
      tool_choice: { type: 'tool', name: outputTool.name },
      messages: [
        { role: 'user', content: userContent },
      ],
    });
    if (data.stop_reason === 'max_tokens') throw new Error('truncated_response');
    const blocks = data.content || [];
    // Preferred path: the forced tool call returns already-parsed JSON.
    const tool = blocks.find((c) => c && c.type === 'tool_use' && c.input && typeof c.input === 'object');
    let raw = tool ? tool.input : null;
    if (!raw) {
      // Fallback: if a text reply came back instead, salvage JSON from it.
      const text = blocks.filter((c) => c && c.type === 'text' && typeof c.text === 'string').map((c) => c.text).join('').trim();
      raw = extractJson(text);
      if (!raw) {
        const e = new Error('no_json');
        e.raw = 'stop_reason=' + data.stop_reason + ' blocks=' + blocks.map((b) => b.type).join(',') + ' text=' + text.slice(0, 300);
        throw e;
      }
    }
    if(exercise){
      const complete = value => typeof value==='string' && value.trim().length>5 && /[.!?][”"')]*$/.test(value.trim());
      if(!Array.isArray(raw.notes)||raw.notes.length!==relevant.lines.length||!relevant.lines.every(([code])=>raw.notes.filter(n=>n.code===code&&complete(n.note)).length===1))throw new Error('incomplete_feedback');
      if(typeof raw.evidenceQuote!=='string'||!raw.evidenceQuote.trim()||!pitch.includes(raw.evidenceQuote))throw new Error('ungrounded_feedback');
      return {grader:'assessment',purpose:'practice-notes-v4',behaviours:relevant.lines.map(([code,label])=>({code,label,note:raw.notes.find(n=>n.code===code).note}))};
    }
    // Normalize into the canonical shape (handles pillars as array/object/flat).
    const result = normalize(raw);
    const complete = s => typeof s === 'string' && s.trim().length > 5 && /[.!?][”"')]*$/.test(s.trim());
    const sourceLines = collectLines(raw);
    if (!['T1','T2','E1','E2','C1','C2'].every(code => [0,1,2].includes(sourceLines[code]?.score) && complete(sourceLines[code]?.note)) || !complete(result.whatWorked) || !complete(result.coachingFocus)) throw new Error('incomplete_feedback');
    if (result._found.length < 6) {
      const e = new Error('bad_shape');
      e.raw = 'found=[' + result._found.join(',') + '] rawkeys=[' + Object.keys(raw || {}).join(',') + ']';
      throw e;
    }
    delete result._found;
    if(!result.evidenceQuote || !pitch.includes(result.evidenceQuote)){const e=new Error('ungrounded_feedback');e.raw='quote='+result.evidenceQuote;e.result=result;throw e}
    return result;
  }

  let parsed;
  try {
    try {
      parsed = await runScore();
    } catch (e1) {
      if (e1.message === 'anthropic_error') throw e1;
      // Transient bad/truncated reply — try exactly once more before giving up.
      console.error('score attempt 1 failed:', e1.message, '::', (e1.raw || '').slice(0, 400));
      parsed = await runScore();
    }
  } catch (err) {
    if (err.message === 'anthropic_error') {
      console.error('Anthropic error', err.status, err.detail);
      res.status(502).json({ error: 'The scorer is unavailable right now. Please try again in a moment.' });
      return;
    }
    {
    console.error('score failed after retry:', err.message, '::', (err.raw || '').slice(0, 400));
    res.status(502).json({ error: 'Could not read the score. Please try again.' });
    return;
    }
  }

  // `parsed` is already the normalized, canonical result: six clamped line
  // scores, per-pillar subtotals, and the /12 total, all computed server-side.
  res.status(200).json(parsed);
};
