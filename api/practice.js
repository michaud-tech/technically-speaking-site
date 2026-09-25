const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

const BRIEF = `The learner is a TextNow intern preparing an innovation-challenge pitch. TextNow is prioritizing user trust and wants to reduce harmful interactions without creating unnecessary warnings for legitimate messages. Their team proposes an in-app feature that identifies signals associated with suspicious messages, explains why a message may be risky and offers safer next steps. They want a four-week pilot using one product designer and two engineers, delaying an onboarding experiment by one sprint. Avery, the executive sponsor, is accountable for choosing projects that produce credible learning and can earn product and engineering support. Avery cares about user trust, speed to evidence and limited design and engineering time. Nine of 14 interviewed users reported uncertainty about unexpected messages. Six of eight prototype participants noticed the warning and chose a safer action, but the test was small and did not measure long-term harm reduction. Avery can sponsor the idea; product and engineering leaders must approve the people and sprint time.`;

async function anthropic(system, user, maxTokens = 700) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY.' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const action = String(body.action || '');
  const pitch = String(body.pitch || '').trim().slice(0, 6000);

  try {
    if (action === 'ask-avery') {
      const question = String(body.question || '').trim().slice(0, 1200);
      const conversation = Array.isArray(body.conversation) ? body.conversation.slice(-6) : [];
      if (question.length < 5) return res.status(400).json({ error: 'Ask Avery a complete question.' });
      const answer = await anthropic(
        `Act as Avery, the executive sponsor in the brief. Answer the learner's question naturally in 2-4 sentences. Stay fully grounded in the brief and the conversation. You can reveal reasonable details about Avery's priorities, concerns and decision process, but do not invent new research results, budgets or guarantees. If the learner asks a closed or leading question, answer it naturally; do not coach them. If you do not know, say what you would need to learn. Write only Avery's answer.`,
        `BRIEF:\n${BRIEF}\n\nCONVERSATION SO FAR:\n${JSON.stringify(conversation)}\n\nLEARNER QUESTION:\n${question}`,
        350
      );
      return res.status(200).json({ answer });
    }

    if (action === 'coach-listening') {
      const conversation = Array.isArray(body.conversation) ? body.conversation.slice(-8) : [];
      const takeaway = String(body.takeaway || '').trim().slice(0, 2500);
      if (!conversation.length || takeaway.length < 10) return res.status(400).json({ error: 'Ask Avery questions and write what you heard first.' });
      const feedback = await anthropic(
        `You are Michaud's TECH practice coach. Coach active listening through Target Audience. Look for open questions, "tell me more", paraphrasing, checking understanding, and whether the learner surfaced Avery's macro context and micro concerns. Do not praise question quantity. Do not rewrite their work. Return two short paragraphs headed "What you learned" and "Try next". Name one highest-impact listening move.`,
        `BRIEF:\n${BRIEF}\n\nCONVERSATION:\n${JSON.stringify(conversation)}\n\nLEARNER'S TAKEAWAY:\n${takeaway}`,
        600
      );
      return res.status(200).json({ feedback });
    }

    if (action === 'coach-ask') {
      const ask = String(body.ask || '').trim().slice(0, 1800);
      if (ask.length < 10) return res.status(400).json({ error: 'Write the ask you would make to Avery.' });
      const feedback = await anthropic(
        `You are Michaud's TECH practice coach. Coach the learner's end goal and ask. Check that there is one clear outcome, the listener knows what they are being asked to do, the next step is usable, and the ask is light, bright and tight. Consider Avery's actual authority and the need for product and engineering approval. Do not write a replacement ask. Return two short paragraphs headed "What works" and "Make it clearer". Give one highest-impact direction.`,
        `BRIEF:\n${BRIEF}\n\nLEARNER ASK:\n${ask}`,
        550
      );
      return res.status(200).json({ feedback });
    }

    if (action === 'coach-clarity') {
      const method = String(body.method || '').trim();
      const draft = String(body.draft || '').trim().slice(0, 3500);
      if (draft.length < 20) return res.status(400).json({ error: 'Build the story or metaphor first.' });
      const feedback = await anthropic(
        `You are Michaud's TECH practice coach. The learner chose ${method === 'metaphor' ? 'metaphor' : 'the Pain to Promise story spine'} to clarify the TextNow proposal. Check whether it makes the impact easier for Avery to understand, stays grounded in the evidence, and connects to Avery's priorities. For a metaphor, judge the functional comparison, not cleverness. For a story, look for Today, Every day, Imagine if, Because of that, So that, and the ask. Do not rewrite it. Return two short paragraphs headed "What lands" and "Try next" with one highest-impact direction.`,
        `BRIEF:\n${BRIEF}\n\nDRAFT:\n${draft}`,
        600
      );
      return res.status(200).json({ feedback });
    }

    if (action === 'objection') {
      if (pitch.length < 20) return res.status(400).json({ error: 'Write the pitch you would actually make first.' });
      const objection = await anthropic(
        `Act as Avery, the executive sponsor in the brief. Give one realistic, concise objection to the learner's pitch. Base it on Avery's priorities, the limited evidence, the resource tradeoff, or implementation risk. Do not coach, explain, list options, or resolve it. Write only what Avery would say in the room, in 1-3 sentences.`,
        `BRIEF:\n${BRIEF}\n\nPITCH:\n${pitch}`,
        250
      );
      return res.status(200).json({ objection });
    }

    if (action === 'coach-response') {
      if (pitch.length < 20) return res.status(400).json({ error: 'Write the pitch you would actually make first.' });
      const objection = String(body.objection || '').trim().slice(0, 2000);
      const response = String(body.response || '').trim().slice(0, 4000);
      if (response.length < 10) return res.status(400).json({ error: 'Respond to the objection first.' });
      const feedback = await anthropic(
        `You are Michaud's TECH practice coach. Assess how the learner handled pushback. The desired sequence is: (1) loop back both content and concern, (2) check understanding, (3) ask an open question to find the interest underneath, and only then (4) ask permission to offer a path and solve through the other person's lens. Coach the thinking, not personality or polish. Do not rewrite their answer. Return two short paragraphs headed "What worked" and "Try next". Name one highest-impact next move.`,
        `BRIEF:\n${BRIEF}\n\nPITCH:\n${pitch}\n\nAVERY'S OBJECTION:\n${objection}\n\nLEARNER RESPONSE:\n${response}`,
        650
      );
      return res.status(200).json({ feedback });
    }
    return res.status(400).json({ error: 'Unknown action.' });
  } catch (error) {
    console.error('practice error', error);
    return res.status(502).json({ error: 'The coach is unavailable right now. Try again in a moment.' });
  }
};
