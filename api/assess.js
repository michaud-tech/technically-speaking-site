// Vercel serverless function for the Technically Speaking assessment.
//
//   POST { scenarioId, pitch } -> scores the pitch on T / E / C (no H)
//
// The Anthropic API key stays server-side (set ANTHROPIC_API_KEY in Vercel env vars).
// Each scenario is a neutral brief: the person's role and pressures, the other person's
// role/history/pressures, a mix of technical and business facts, and the decision to move.
// The brief never tells them to tailor, make an ask, or use the audience info — that is
// exactly what the score measures.

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

// The three briefs are equivalent in structure and difficulty. Kept here (server-side)
// as the source of truth for scoring; index.html shows the matching text to the visitor.
const SCENARIOS = {
  payments: {
    brief: `You're a senior engineer responsible for the payments service. You believe the team needs six weeks to replace part of the service before building more features on top of it. The current architecture is seven years old, has fourteen dependencies, and has become increasingly difficult for engineers to change safely. Your team has spent a lot of time responding to incidents, and the project would displace two items currently planned for Q3.

You're speaking to Dana, your VP of Engineering. Dana is accountable for delivering the Q3 roadmap and has pushed back before on technical cleanup that wasn't connected to a customer outcome.

The payments service has caused three incidents this quarter. Each one took checkout down for customers, and the most recent took nearly four hours to resolve.

Dana can support the project, but because it changes the roadmap, she'll need to take the recommendation to the product executive. You have five minutes with Dana in the roadmap review.

Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  pipeline: {
    brief: `You're a senior engineer who owns the data pipeline behind the company's customer-facing analytics dashboards. You believe the team needs about a month to move the pipeline onto a more reliable system before the next wave of enterprise customers onboards. It was built for a tenth of today's data volume, runs on nightly batch jobs, and now fails roughly once a week, each failure needing manual repair. Doing this would push back a reporting feature Sales has been asking for.

You're speaking to Priya, a Director of Product. Priya is measured on new-customer activation and has said before that she doesn't want engineering "gold-plating" systems that already work.

In the last two months, dashboard data has been wrong or delayed for customers four times, and two enterprise accounts have opened support tickets about it.

Priya can back the work, but the reporting feature was promised to Sales leadership, so she'd have to renegotiate that commitment with them. You have ten minutes with Priya before sprint planning.

Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  auth: {
    brief: `You're a senior engineer responsible for the login and account system. You believe the team needs five weeks to rebuild how the service handles authentication before the company's enterprise launch. The current system stores sessions in a way that's now ten years old, relies on a library that's no longer maintained, and takes days of careful work to change without risking lockouts. Taking this on would delay a single sign-on feature already slotted for next quarter.

You're speaking to Marcus, your Director of Engineering. Marcus is accountable for shipping the enterprise launch on schedule and has previously declined work framed as "paying down debt" with no clear payoff.

This quarter, two brief outages locked customers out of their accounts, and the security team has flagged the unmaintained library as a risk in the upcoming enterprise security review.

Marcus can approve the work, but because it moves the launch plan, he'll need to clear it with the head of the enterprise business. You have five minutes with Marcus in the planning review.

Give the pitch you would actually make, using the words you'd say in the room.`,
  },
};

const SCORE_SYSTEM = `You are the scoring engine for the Technically Speaking assessment. You score a written pitch against the TECH Communication Rubric. TECH stands for Target Audience, End Goal, Clarity, How You Say It — but this is a WRITTEN exercise, so you score only T, E and C. Do NOT score H (delivery); it is out of scope here.

You are given the BRIEF the person read and the PITCH they wrote. In every brief the person is a senior engineer recommending a block of remediation work to someone accountable for delivering a roadmap or launch, who has pushed back before on "cleanup" not tied to a business outcome, and who is not the final decision-maker — they must carry the recommendation onward to whatever party the brief names (sometimes an executive, sometimes another team such as sales).

HOW TO SCORE — this is the important part. Score each LINE below 0, 1 or 2 on whether the behavior is PRESENT, not on how "good" it was. This is what keeps scoring consistent.
  0 = didn't happen
  1 = attempted / partial
  2 = clearly there
SCORING AND COACHING ARE SEPARATE — this is the core principle. The SCORE answers: "Did this person clearly demonstrate the observable TECH behavior?" COACHING answers: "Is there anything meaningful that would make this specific communication more effective?" Score the behavior FIRST, coach the communication SECOND.
A score of 2 means the observable behavior is CLEARLY DEMONSTRATED. It does NOT mean the communication is flawless, expert-level, impossible to improve, or that no coaching could be given. Do not withhold a 2 simply because coaching is possible or because you can imagine a sharper version. And the reverse also holds: the existence of a coaching observation does NOT automatically justify a 1 — if the behavior was clearly demonstrated, it scores 2 even when you also have something to coach. A response can earn 12/12 and still receive coaching; a response can also earn 12/12 with no coaching at all.
Judge every line through two lenses: the business, and the specific listener. A message isn't good in the abstract; it's good for the business and the person it's aimed at.

Read the pitch carefully first. Only judge against what THIS brief says. Do not invent parties the brief doesn't mention (don't expect an "executive" if the onward party is sales). Working in sprints is a normal planning unit — "next sprint" is a concrete commitment, not a contradiction of a multi-week timeline. Check the opening: the frame, the ask, the timeline and the tradeoff are often stated up front — credit them if they are there. Do NOT judge tone, warmth, greetings, informality, slang, typos, spelling or length — that is delivery (H), not scored here.

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

WORKED EXAMPLE (pipeline / Priya brief) so you read at the right level:
PITCH: "Hey Priya! I know Sales has been promised the reporting feature, but if we don't push it back by about a month we'll face much bigger client issues. We already have 2 support tickets from our enterprise clients and if we lose them, we're hooped. I can get into the weeds about what's up on our end, but I know you'll have to deliver the news to sales so wanted to help you frame it for them before doing that. [gives Priya the framing for sales]. If that sounds good to you, then I would like the next sprint to be focused on putting the pipeline on a more reliable system. What do you need from me to move that forward?"
CORRECT SCORING: T1=2 (ties it to deals, closing speed, renewals), T2=2 (addresses Priya's world and hands her language for sales), E1=2 (one goal: start the migration), E2=2 (clear ask + "what do you need from me" next step), C1=2 (opens with why it matters to her), C2=2 (the evidence needed to support the case — the weekly failures and the enterprise tickets — is connected to business impact). Total 12/12.
USEFUL COACHING that must NOT lower the score: saying the enterprise customers may be lost ("if we lose them, we're hooped") goes a step beyond the evidence in the brief — the brief has open support tickets, not stated churn. The pitch is already strong without escalating tickets into assumed churn risk, so this belongs in coachingFocus as a way to make it even sharper, never as a deduction. Every relevant TECH behavior is clearly demonstrated.

Return the six individual line scores only. Do NOT compute or return a total — the server calculates the pillar subtotals and the /12 total from your six scores.

FEEDBACK — behave like a credible expert coach, not an AI required to find something wrong. Every result has two feedback fields:

whatWorked — specific, evidence-based positive feedback about what the person actually did effectively, naming the behaviors or choices they should keep using. Reference their actual words. Never generic praise ("Great job") and never just a restatement of the score.

coachingFocus — provide coaching ONLY when there is a meaningful opportunity to make THIS specific communication more effective. There are exactly three valid outcomes, and you must pick the one that fits:
  1. CORRECTIVE — a TECH behavior is missing or only partially demonstrated (a 0 or 1 somewhere): explain the single most important thing they could change to make it land.
  2. NEXT-LEVEL — the relevant behaviors are all clearly demonstrated (could be a 12/12), and there is a GENUINELY MATERIAL way to make this communication more effective (something a good coach would really flag, not a marginal nitpick). This coaching must NOT reduce any score. (Example: Michaud's Priya pitch earns 12/12, yet it is genuinely useful to point out that saying the enterprise clients may be lost goes beyond the evidence in the brief — the argument is already strong without assuming churn risk.)
  3. NO COACHING NEEDED — if the response is already excellent and any "improvement" you can think of is marginal, optional, or invented to fill the field, do NOT manufacture one. Return coachingFocus EXACTLY as: "No notes. This is what good looks like." This is a valid, desirable outcome and is the RIGHT call for a genuinely excellent pitch — choose it over a made-up next-level tweak.
Decide between 2 and 3 honestly: give next-level coaching only when the improvement is real and material; otherwise give No notes. Do not manufacture criticism to fill the field, and do not withhold points because you found something to coach.

Return ONLY valid JSON, no markdown, exactly this shape:
{"pillars":[{"key":"T","name":"Target Audience","lines":[{"code":"T1","label":"Speaks to the macro","score":<0|1|2>,"note":"<one sentence>"},{"code":"T2","label":"Speaks to the micro","score":<0|1|2>,"note":"<one sentence>"}]},{"key":"E","name":"End Goal","lines":[{"code":"E1","label":"Clear goal","score":<0|1|2>,"note":"<one sentence>"},{"code":"E2","label":"Clear ask + next step","score":<0|1|2>,"note":"<one sentence>"}]},{"key":"C","name":"Clarity","lines":[{"code":"C1","label":"Opening frame","score":<0|1|2>,"note":"<one sentence>"},{"code":"C2","label":"Key evidence tied to impact","score":<0|1|2>,"note":"<one sentence>"}]}],"whatWorked":"<specific, evidence-based positive feedback>","coachingFocus":"<corrective or next-level coaching, OR exactly: No notes. This is what good looks like.>"}`;

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
  input_schema: {
    type: 'object',
    properties: {
      pillars: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            name: { type: 'string' },
            lines: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  label: { type: 'string' },
                  score: { type: 'integer', minimum: 0, maximum: 2 },
                  note: { type: 'string' },
                },
                required: ['code', 'label', 'score', 'note'],
              },
            },
          },
          required: ['key', 'name', 'lines'],
        },
      },
      whatWorked: { type: 'string' },
      coachingFocus: { type: 'string' },
    },
    required: ['pillars', 'whatWorked', 'coachingFocus'],
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

  const userContent = `BRIEF:\n${scenario.brief}\n\nPITCH:\n${pitch}\n\nReturn ONLY the single JSON object described in the system prompt — begin your reply with "{" and end with "}", with no code fences and no text before or after.`;

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
    console.error('score failed after retry:', err.message, '::', (err.raw || '').slice(0, 400));
    res.status(502).json({ error: 'Could not read the score. Please try again.' });
    return;
  }

  // `parsed` is already the normalized, canonical result: six clamped line
  // scores, per-pillar subtotals, and the /12 total, all computed server-side.
  res.status(200).json(parsed);
};
