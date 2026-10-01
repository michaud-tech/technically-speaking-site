// Vercel serverless function for the Technically Speaking assessment.
//
//   POST { scenarioId, pitch } -> scores the pitch on T / E / C (no H)
//
// The Anthropic API key stays server-side (set ANTHROPIC_API_KEY in Vercel env vars).
// Each brief gives the situation (the person's role and pressures, the other person's
// role/history/pressures, and a mix of technical and business facts) and then names the
// task: pitch this specific work for prioritization. The brief assigns the END GOAL
// (advocate for this), but never hands over the audience tailoring, the evidence
// translation, the ask, or the next step — that is what the score measures.

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

// The three briefs are equivalent in structure and difficulty. Kept here (server-side)
// as the source of truth for scoring; assessment.html shows the matching text to the visitor.
const SCENARIOS = {
  "client-expansion": {
    brief: `You're an account director at a B2B software company. An existing client uses your core platform across two business units, and you recommend expanding it to a third unit with an analytics module and a structured enablement package.

The expansion would increase the client's annual investment by 18% and require six weeks of implementation support. The third unit currently builds similar reports manually, which takes its operations team about 45 hours each month.

You're speaking to Morgan, the client's VP of Operations. Morgan is accountable for adoption, cost control, and avoiding another tool that teams buy but do not use.

In the two existing units, weekly active use reached 74% after enablement, and reporting time fell by about 30 hours per month. Those results come from the existing deployment; they do not prove the third unit will adopt at the same rate.

Morgan can support the expansion, but finance must approve the added spend. You have ten minutes in the quarterly business review.

Pitch Morgan on approving the expansion and taking the investment to finance. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  "new-business-line": {
    brief: `You're a director at a professional services company. You recommend testing a new compliance analytics service for mid-market clients before building a full business line.

The proposed six-month pilot would require a $350,000 budget and four people drawn from consulting, data, sales, and operations. It would delay one planned internal reporting project.

You're speaking to Riley, the COO. Riley is accountable for profitable growth and has pushed back on new offerings that depend on unproven demand or pull strong people away from current clients.

In discovery interviews, 11 of 15 clients described compliance reporting as a growing problem, and four agreed to review a pilot proposal. No client has signed, so the interviews show interest rather than proven demand.

Riley can sponsor the pilot, but the executive team must approve the budget and staffing. You have eight minutes in the operating review.

Pitch Riley on sponsoring the six-month pilot and taking it to the executive team. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  "cross-department": {
    brief: `You're a product manager preparing to launch a new onboarding flow. The launch depends on event tracking from the data platform team so your team can see where new users get stuck.

You need one data engineer for three weeks. The data platform team is already committed to a reliability project, so taking this on would move part of that work into the next sprint.

You're speaking to Alex, a fellow director who leads the data platform team. Alex is accountable for platform reliability and has asked product teams to stop treating tracking work as a late-stage emergency.

In the current onboarding flow, 38% of new users leave before completing setup. Interviews suggest confusion at two steps, but without event tracking you cannot tell how often each issue occurs or whether the new flow fixes it.

Alex can reserve the engineer, but needs a clear reason to change the team's sprint plan. You have fifteen minutes in the cross-functional planning meeting.

Pitch Alex on assigning a data engineer for three weeks and agreeing on the project handoff. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  "project-update": {
    brief: `You're an engineering lead giving an update on a payments migration. The project is two weeks behind because testing uncovered a dependency that was missing from the original plan.

The team can still meet the original launch date by reducing the first release to the three highest-volume payment methods. Supporting all seven methods would move the launch by four weeks.

You're speaking to Dana, the executive sponsor. Dana is accountable for the launch commitment and wants problems surfaced early with a clear recommendation rather than a list of technical details.

The three highest-volume methods cover 86% of transactions. The remaining four are important to a smaller group of customers and could stay on the current system temporarily. The team has not finished testing the temporary connection, so that option still carries delivery risk.

Dana can approve the reduced first release or move the date. You have five minutes in the weekly steering meeting.

Update Dana, recommend one path, and ask for the decision you need. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  "town-hall": {
    brief: `You're the head of customer operations addressing a 120-person department. The company is reorganizing support into industry-focused teams and introducing a shared escalation process next month.

No roles are being eliminated, but about one third of employees will change managers. The current structure has produced inconsistent handoffs and repeated work on complex customer issues.

Your audience includes experienced employees who value their current team relationships, newer employees who want clearer paths for help, and managers who will be responsible for making the transition work.

In the last quarter, 22% of complex tickets moved between teams at least twice, adding an average of 1.8 days to resolution. The new structure is intended to improve ownership, but it has not been tested at this scale and you cannot promise an immediate improvement.

You need employees to understand why the change is happening, use the new escalation process, and bring concerns to the scheduled team sessions. You have seven minutes at the town hall before live questions.

Give the town hall address you would actually deliver. Make the change, its impact, and what employees should do next clear.`,
  }
};

const SCORE_SYSTEM = `You are the scoring engine for the Technically Speaking assessment. You score a written pitch against the TECH Communication Rubric. TECH stands for Target Audience, End Goal, Clarity, How You Say It — but this is a WRITTEN exercise, so you score only T, E and C. Do NOT score H (delivery); it is out of scope here.

You are given the BRIEF the person read and the PITCH they wrote. The briefs span client expansion, executive investment, cross-department work, project updates and town hall communication. Judge the pitch against the specific audience, facts, tradeoffs and decision in the selected brief, not against an assumed software scenario.

HOW TO SCORE — this is the important part. Score each LINE below 0, 1 or 2 on whether the behavior is both present and effective for this listener. A 2 requires a clear, specific, credible demonstration; a vague mention earns 1. This is what keeps scoring consistent.
  0 = didn't happen
  1 = attempted / partial
  2 = clearly there
SCORING AND COACHING ARE SEPARATE — this is the core principle. The SCORE answers: "Did this person clearly demonstrate the observable TECH behavior?" COACHING answers: "Is there anything meaningful that would make this specific communication more effective?" Score the behavior FIRST, coach the communication SECOND.
A score of 2 means the observable behavior is CLEARLY DEMONSTRATED. It does NOT mean the communication is flawless, expert-level, impossible to improve, or that no coaching could be given. Do not withhold a 2 simply because coaching is possible or because you can imagine a sharper version. And the reverse also holds: the existence of a coaching observation does NOT automatically justify a 1 — if the behavior was clearly demonstrated, it scores 2 even when you also have something to coach. A response can earn 12/12 and still receive coaching. Reserve 12/12 for a genuinely excellent pitch that is specific to Avery, makes one credible case, frames the decision clearly, and gives Avery an actionable ask. Do not award it to a merely complete or overly dense response.
Judge every line through two lenses: the business, and the specific listener. A message isn't good in the abstract; it's good for the business and the person it's aimed at.

Read the pitch carefully first. Only judge against what THIS brief says. Do not invent parties the brief doesn't mention (don't expect an "executive" if the onward party is sales). Check the opening: the frame, the ask, the timeline and the tradeoff are often stated up front — credit them if they are there. Do not judge tone, warmth, greetings, informality, slang, typos, spelling, or word count by itself. Do judge whether density or organization makes the opening and evidence difficult to follow under Clarity.

THE LINES:

T — Target Audience
- T1 Speaks to the macro — connects to the business / department stakes. 0 = no connection to business or team-level stakes · 1 = gestures at the bigger picture, vaguely · 2 = clearly ties it to business / department impact.
- T2 Speaks to the micro — addresses this person's specific concerns. A "specific concern" is one genuinely specific to this listener's world. It may be stated directly in the brief OR reasonably inferred from their role, accountabilities, and the evidence — the brief is NOT an exhaustive checklist, so do not require the pitch to repeat a concern verbatim. (E.g. if the brief says response times are slow and the listener owns sales, tying that delay to fewer closed deals shows strong micro awareness even though "fewer closed deals" is not written in the brief.) The inference must still be grounded and plausible — an unsupported leap does not earn credit just because it sounds business-oriented. Missing another concern from the brief can stay COACHING without lowering a 2 when listener-specific awareness is already clearly demonstrated. 0 = ignores what this person cares about · 1 = some awareness of their concerns, uneven · 2 = directly addresses their specific concerns. (Handing the listener language to carry the case onward to the party they answer to is a strong form of addressing their concerns — score it 2.)

E — End Goal
- E1 Clear goal — is there one clear goal or direction being driven at, not several competing. Judge only whether one usable goal EXISTS, wherever it appears: do NOT deduct for late placement or meandering (that is C1 and coaching), and do NOT require scope or an ask here (that is E2). 0 = no goal at all, or several competing with no single direction · 1 = a single direction is present but heavily hedged and only partial (e.g. "maybe we could look into switching at some point, if we have time") · 2 = one clear goal or direction, even if it lands late or lacks scope (e.g. "invest in distributed tracing," or "adopt Playwright in the main app").
- E2 Clear ask + next step — the listener leaves knowing what you want (or that you're aligned) and how to move on it. The ask can be an ask for ACTION ("approve this," "start next sprint") or, when the conversation's real end goal is alignment, a genuine check for alignment. 0 = no ask and no next step — the listener has no idea what to do · 1 = an ask or next step is present but implied, heavily hedged, or missing a usable next step, yet still reasonably understandable to a listener (e.g. "I think we might want to look into switching" is a weak but real partial ask) · 2 = an explicit ask with an easy next step, or a genuine alignment check when alignment is the real goal. Do not treat "Does that make sense?" as an automatic 2 — first decide whether confirming understanding is actually the primary end goal; in a decision-focused pitch it usually is not, and a bare comprehension check is not a clear ask.

C — Clarity
- C1 Opening frame — opens by telling the listener what to listen for. Judge whether the OPENING orients the listener, not merely whether a subject word appears somewhere. 0 = the opening leaves the listener unable to tell what this is about — a subject word may surface but is buried in a confused/rambling lead-in that doesn't orient them · 1 = the opening establishes the topic, even if poorly, late, or without stakes · 2 = the opening frames why the topic matters to this listener.
- C2 Key evidence is translated into relevant business impact — the evidence needed to support the case is connected to why it matters to the business / listener, not left as bare technical information. Translating a technical fact into its business consequence (e.g. "the pipeline fails weekly" → "slower closes and more work for your account managers") is exactly this; the raw number is not required. 0 = evidence is presented primarily as technical information with no meaningful connection to why it matters · 1 = some important evidence is connected to business/listener impact, but a key part of the case is left untranslated · 2 = the evidence needed to support the case is connected to why it matters to the business/listener. Do NOT deduct because not every fact in the brief was used, because irrelevant technical detail was omitted, or because an already-effective argument could be made even sharper. The bar for a 2 is a MEANINGFUL connection to relevant business or listener impact — not a fully quantified business case. Missing quantification (e.g. not sizing the value against a stated cost like $1,500/month) or a sharper argument you can imagine stays COACHING and does NOT reduce a 2.

For each line, also write a ONE-sentence coaching note: if the line is a 2, say briefly what worked; if it's a 0 or 1, say the specific thing to add to make it land. Reference their actual words where useful.

WORKED EXAMPLE (groundwater / Priya brief):
PITCH: "Priya, the readings near the building area are still changing. If we sign off the design now and the higher levels persist, we may have to change the foundation after construction starts. I recommend four more weeks of monitoring before sign-off. That costs $35,000 and moves the review by a month. Could you support that plan and take the cost and schedule change to the sponsor? I can give you a one-page summary of the risk and what the extra monitoring will tell us."
CORRECT SCORING: T1=2 (connects the readings to construction cost), T2=2 (addresses Priya's schedule concern and gives her a way to explain the change), E1=2 (one recommendation), E2=2 (clear ask and next step), C1=2 (opens with the decision-relevant problem), C2=2 (uses the evidence and tradeoff in the brief). Total 12/12.
The risk is conditional. Do not score a pitch down for stating uncertainty accurately.

Return the six individual line scores only. Do NOT compute or return a total — the server calculates the pillar subtotals and the /12 total from your six scores.

FEEDBACK — behave like a credible expert coach, not an AI required to find something wrong. Every result has two feedback fields:

whatWorked — specific, evidence-based positive feedback about what the person actually did effectively, naming the behaviors or choices they should keep using. Reference their actual words. Never generic praise ("Great job") and never just a restatement of the score. Reference only words and choices that actually appear in the pitch. Never import a critique from the brief when the pitch did not make that claim. Use they/them for Avery and do not mention facts that were not shown to the learner.

evidenceQuote — copy one exact, contiguous phrase from the learner's pitch that your feedback discusses. It must match the pitch verbatim. Never quote the brief, your own paraphrase, or wording you wish the learner had used.

coachingFocus — always provide one useful thing to try next, grounded in the learner's actual pitch. Even a 12/12 should end with a worthwhile practice direction. Provide coaching when there is a meaningful opportunity to make THIS specific communication more effective. There are exactly three valid outcomes, and you must pick the one that fits:
  1. CORRECTIVE — a TECH behavior is missing or only partially demonstrated (a 0 or 1 somewhere): name the single most important behavior to change and why it matters — as a direction, not a script.
  2. NEXT-LEVEL — the relevant behaviors are all clearly demonstrated (could be a 12/12), and there is a GENUINELY MATERIAL way to make this communication more effective (something a good coach would really flag, not a marginal nitpick). This coaching must NOT reduce any score. (Example: Michaud's Priya pitch earns 12/12, yet it is genuinely useful to point out that saying the enterprise clients may be lost goes beyond the evidence in the brief — the argument is already strong without assuming churn risk.)
  HOW TO WRITE coachingFocus — keep it DIRECTION, never a script. One or two sentences, the single highest-impact move only (do not stack several fixes). Name the behavior gap and why it matters to this listener, but DO NOT write the pitch for them: no opening line to copy, no enumerated list of the exact facts, numbers, or evidence to cite, and no finished ask handed over word-for-word. Point at what is missing and let them do the thinking. (Good: "Lead with why the pipeline's reliability matters to Priya before any technical detail." Too explicit — never do this: "Open by saying the pipeline fails weekly, cite the four incidents and two tickets, then ask for a month starting next sprint.") If the submission is clearly not a real attempt (a test message, a note to self, no actual pitch), say so in one short sentence and invite them to write the pitch they would actually make — do NOT supply the answer.

A 12/12 may still receive a practice suggestion. Do not lower a score merely because a useful next rep exists.

Call the submit_score tool with all six line scores and both feedback fields. The
tool schema is the source of truth for the output shape.`;

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
const RUBRIC = [
  { key: 'T', name: 'Target Audience', lines: [['T1', 'Speaks to the macro'], ['T2', 'Speaks to the micro']] },
  { key: 'E', name: 'End Goal', lines: [['E1', 'Clear goal'], ['E2', 'Clear ask + next step']] },
  { key: 'C', name: 'Clarity', lines: [['C1', 'Opening frame'], ['C2', 'Key evidence tied to impact']] },
];

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

  const scenario = SCENARIOS[body.scenarioId];
  if (!scenario) {
    res.status(400).json({ error: 'Unknown scenario.' });
    return;
  }

  const pitch = (body.pitch || '').toString().trim();
  if (pitch.length < 15) {
    res.status(400).json({ error: 'Please write at least a couple of sentences.' });
    return;
  }
  if (pitch.length > 6000) {
    res.status(400).json({ error: 'That is longer than a short pitch — please trim it down.' });
    return;
  }

  const userContent = `BRIEF:\n${scenario.brief}\n\nPITCH:\n${pitch}\n\nScore the pitch and call submit_score with all six line scores and both feedback fields.`;

  async function runScore() {
    const data = await callAnthropic({
      model: MODEL,
      max_tokens: 2500,
      system: SCORE_SYSTEM,
      tools: [SCORE_TOOL],
      tool_choice: { type: 'tool', name: 'submit_score' },
      messages: [
        { role: 'user', content: userContent },
      ],
    });
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
    // Normalize into the canonical shape (handles pillars as array/object/flat).
    const result = normalize(raw);
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
    if(err.message==='ungrounded_feedback'&&err.result){parsed=err.result;parsed.coachingFocus='For your next rep, choose one sentence and make its connection to Avery’s decision even more explicit.';parsed.evidenceQuote='';}
    else {
    console.error('score failed after retry:', err.message, '::', (err.raw || '').slice(0, 400));
    res.status(502).json({ error: 'Could not read the score. Please try again.' });
    return;
    }
  }

  // `parsed` is already the normalized, canonical result: six clamped line
  // scores, per-pillar subtotals, and the /12 total, all computed server-side.
  res.status(200).json(parsed);
};
