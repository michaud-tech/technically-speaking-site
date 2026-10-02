const SCENARIOS = {
  "client-expansion": {
    title: "Client expansion pitch",
    brief: `You're an account director at a B2B software company. An existing client uses your core platform across two business units, and you recommend expanding it to a third unit with an analytics module and a structured enablement package.

The expansion would increase the client's annual investment by 18% and require six weeks of implementation support. The third unit currently builds similar reports manually, which takes its operations team about 45 hours each month.

You're speaking to Morgan, the client's VP of Operations. Morgan is accountable for adoption, cost control, and avoiding another tool that teams buy but do not use.

In the two existing units, weekly active use reached 74% after enablement, and reporting time fell by about 30 hours per month. Those results come from the existing deployment; they do not prove the third unit will adopt at the same rate.

Morgan can support the expansion, but finance must approve the added spend. You have ten minutes in the quarterly business review.

Pitch Morgan on approving the expansion and taking the investment to finance. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  "new-business-line": {
    title: "Executive pitch for a new business line",
    brief: `You're a director at a professional services company. You recommend testing a new compliance analytics service for mid-market clients before building a full business line.

The proposed six-month pilot would require a $350,000 budget and four people drawn from consulting, data, sales, and operations. It would delay one planned internal reporting project.

You're speaking to Riley, the COO. Riley is accountable for profitable growth and has pushed back on new offerings that depend on unproven demand or pull strong people away from current clients.

In discovery interviews, 11 of 15 clients described compliance reporting as a growing problem, and four agreed to review a pilot proposal. No client has signed, so the interviews show interest rather than proven demand.

Riley can sponsor the pilot, but the executive team must approve the budget and staffing. You have eight minutes in the operating review.

Pitch Riley on sponsoring the six-month pilot and taking it to the executive team. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  "cross-department": {
    title: "Cross-department project alignment",
    brief: `You're a product manager preparing to launch a new onboarding flow. The launch depends on event tracking from the data platform team so your team can see where new users get stuck.

You need one data engineer for three weeks. The data platform team is already committed to a reliability project, so taking this on would move part of that work into the next sprint.

You're speaking to Alex, a fellow director who leads the data platform team. Alex is accountable for platform reliability and has asked product teams to stop treating tracking work as a late-stage emergency.

In the current onboarding flow, 38% of new users leave before completing setup. Interviews suggest confusion at two steps, but without event tracking you cannot tell how often each issue occurs or whether the new flow fixes it.

Alex can reserve the engineer, but needs a clear reason to change the team's sprint plan. You have fifteen minutes in the cross-functional planning meeting.

Pitch Alex on assigning a data engineer for three weeks and agreeing on the project handoff. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  "project-update": {
    title: "Project update",
    brief: `You're an engineering lead giving an update on a payments migration. The project is two weeks behind because testing uncovered a dependency that was missing from the original plan.

The team can still meet the original launch date by reducing the first release to the three highest-volume payment methods. Supporting all seven methods would move the launch by four weeks.

You're speaking to Dana, the executive sponsor. Dana is accountable for the launch commitment and wants problems surfaced early with a clear recommendation rather than a list of technical details.

The three highest-volume methods cover 86% of transactions. The remaining four are important to a smaller group of customers and could stay on the current system temporarily. The team has not finished testing the temporary connection, so that option still carries delivery risk.

Dana can approve the reduced first release or move the date. You have five minutes in the weekly steering meeting.

Update Dana, recommend one path, and ask for the decision you need. Give the pitch you would actually make, using the words you'd say in the room.`,
  },
  "town-hall": {
    title: "Town hall address",
    brief: `You're the head of customer operations addressing a 120-person department. The company is reorganizing support into industry-focused teams and introducing a shared escalation process next month.

No roles are being eliminated, but about one third of employees will change managers. The current structure has produced inconsistent handoffs and repeated work on complex customer issues.

Your audience includes experienced employees who value their current team relationships, newer employees who want clearer paths for help, and managers who will be responsible for making the transition work.

In the last quarter, 22% of complex tickets moved between teams at least twice, adding an average of 1.8 days to resolution. The new structure is intended to improve ownership, but it has not been tested at this scale and you cannot promise an immediate improvement.

You need employees to understand why the change is happening, use the new escalation process, and bring concerns to the scheduled team sessions. You have seven minutes at the town hall before live questions.

Give the town hall address you would actually deliver. Make the change, its impact, and what employees should do next clear.`,
  }
};

// Personalized outreach pages use the same scoring briefs as /api/assess.
// Keep those scenario IDs available when a recipient emails their results.
Object.assign(SCENARIOS, require("./_lead-scenarios").scenarios);

const RUBRIC = [
  ['T', 'Target Audience'],
  ['E', 'End Goal'],
  ['C', 'Clarity'],
];

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function cleanResult(input) {
  if (!input || typeof input !== 'object') return null;
  const byKey = new Map((Array.isArray(input.pillars) ? input.pillars : []).map((p) => [p && p.key, p]));
  const pillars = RUBRIC.map(([key, name]) => {
    const source = byKey.get(key) || {};
    const lines = (Array.isArray(source.lines) ? source.lines : []).slice(0, 2).map((line) => ({
      label: String(line && line.label || '').slice(0, 100),
      score: Math.max(0, Math.min(2, parseInt(line && line.score, 10) || 0)),
      note: String(line && line.note || '').slice(0, 800),
    }));
    if (lines.length !== 2) return null;
    return { key, name, lines, subtotal: lines.reduce((sum, line) => sum + line.score, 0) };
  });
  if (pillars.some((p) => !p)) return null;
  return {
    total: pillars.reduce((sum, p) => sum + p.subtotal, 0),
    pillars,
    coachingFocus: String(input.coachingFocus || input.topFix || '').slice(0, 1200),
  };
}

function resultHtml({ scenario, pitch, result }) {
  const scores = result.pillars.map((pillar) => `
    <h3 style="margin:28px 0 8px;font-size:18px">${pillar.key} — ${esc(pillar.name)} <span style="color:#6b6b68">${pillar.subtotal}/4</span></h3>
    ${pillar.lines.map((line) => `<div style="padding:12px 0;border-top:1px solid #dad5cb"><strong>${esc(line.label)} — ${line.score}/2</strong><br><span style="color:#555">${esc(line.note)}</span></div>`).join('')}
  `).join('');
  return `<!doctype html><html><body style="margin:0;background:#f4f2ed;color:#1d1d1b;font-family:Arial,sans-serif;line-height:1.55"><div style="max-width:680px;margin:auto;padding:36px 22px">
    <div style="font-size:12px;font-weight:bold;letter-spacing:.16em;color:#6b6b68">TECHNICALLY SPEAKING · YOUR ASSESSMENT</div>
    <h1 style="font-size:34px;line-height:1.08;margin:12px 0 8px">Your case scored ${result.total}/12.</h1>
    <p style="color:#555;margin:0 0 28px">Here’s the brief, exactly what you wrote, and how each part landed.</p>
    <div style="background:#1d1d1b;color:#f4f2ed;padding:24px;border-top:5px solid #f4c400"><div style="color:#f4c400;font-size:12px;font-weight:bold;letter-spacing:.12em">THE BRIEF · ${esc(scenario.title)}</div><p style="white-space:pre-line">${esc(scenario.brief)}</p></div>
    <h2 style="font-size:23px;margin:30px 0 10px">Your pitch</h2><div style="background:#fff;padding:22px;white-space:pre-wrap;border:1px solid #dad5cb">${esc(pitch)}</div>
    <h2 style="font-size:23px;margin:34px 0 6px">Your scores</h2>${scores}
    <div style="background:#1d1d1b;color:#f4f2ed;padding:22px;margin-top:28px;border-top:5px solid #f4c400"><div style="color:#f4c400;font-size:12px;font-weight:bold;letter-spacing:.12em">THE ONE THING TO FIX</div><p style="font-size:17px;margin:9px 0 0">${esc(result.coachingFocus)}</p></div>
    <p style="margin-top:30px"><a href="https://technicallyspeakinghq.com/book" style="display:inline-block;background:#f4c400;color:#1d1d1b;padding:13px 18px;text-decoration:none;font-size:12px;font-weight:bold;letter-spacing:.08em">BOOK A CALL</a></p>
    <p style="font-size:12px;color:#6b6b68;margin-top:28px">You asked for this copy after completing the free Technically Speaking assessment.</p>
  </div></body></html>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!process.env.RESEND_API_KEY || !process.env.RESULTS_FROM_EMAIL || !process.env.RESULTS_LEAD_EMAIL) {
    return res.status(500).json({ error: 'Email delivery is not configured yet.' });
  }
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch (error) {
    return res.status(400).json({ error: 'Bad request.' });
  }
  if (body.website) return res.status(200).json({ ok: true });
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (body.purpose === 'hr-course-registration') {
    const eventNames = {
      'people-people': 'The People People Conference',
      'disrupt-hr-kw': 'DisruptHR KW',
      'other': 'Other'
    };
    const eventName = eventNames[String(body.event || '')] || eventNames.other;
    const leadResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESULTS_FROM_EMAIL,
        to: [process.env.RESULTS_LEAD_EMAIL],
        reply_to: email,
        subject: `New HR course registration · ${eventName}`,
        text: `New registration for Sell the Impact of HR\n\nEmail: ${email}\nSource: ${eventName}\nRegistered: ${new Date().toISOString()}`,
      }),
    });
    if (!leadResponse.ok) {
      console.error('Resend HR registration error', leadResponse.status, await leadResponse.text());
      return res.status(502).json({ error: 'We could not save your registration. Please try again.' });
    }
    return res.status(200).json({ ok: true });
  }
  const scenario = SCENARIOS[body.scenarioId];
  const pitch = String(body.pitch || '').trim();
  const result = cleanResult(body.result);
  if (!scenario || pitch.length < 15 || pitch.length > 6000 || !result) return res.status(400).json({ error: 'These results could not be emailed.' });

  const participantResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESULTS_FROM_EMAIL,
      to: [email],
      reply_to: process.env.RESULTS_LEAD_EMAIL,
      subject: `Your TECH assessment results — ${result.total}/12`,
      html: resultHtml({ scenario, pitch, result }),
    }),
  });
  if (!participantResponse.ok) {
    console.error('Resend participant error', participantResponse.status, await participantResponse.text());
    return res.status(502).json({ error: 'Could not send the email. Please try again.' });
  }

  // Lead notification intentionally contains only the opted-in address. The
  // participant's brief, pitch, scores, and feedback remain private to them.
  const leadResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESULTS_FROM_EMAIL,
      to: [process.env.RESULTS_LEAD_EMAIL],
      reply_to: email,
      subject: `New assessment lead: ${email}`,
      text: `A visitor requested a copy of their TECH assessment results.\n\nEmail: ${email}`,
    }),
  });
  if (!leadResponse.ok) {
    // Their results were delivered, so do not tell the participant delivery
    // failed just because the internal lead notification had an issue.
    console.error('Resend lead notification error', leadResponse.status, await leadResponse.text());
  }
  return res.status(200).json({ ok: true });
};
