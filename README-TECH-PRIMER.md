# TECH mini-course · Final review edition

The existing 13-activity mini-course, baseline/final scenario, assessment rubric and ending are preserved. Start at learn.html through the preview server.

## Preview

Requires Node.js 18 or later. On Windows, double-click Preview.cmd. Open http://localhost:4176/learn.html and keep the preview window running. Or run npm start from this folder. No package installation is needed. Use localhost or HTTPS for microphone access, rather than opening the HTML file directly.

## Before giving interns the link

Deploy the course to the existing configured Vercel site. The course files are learn.html, course.js, course-data.js, assessment-rubric.js, api/assess.js, api/practice.js and api/evaluation-policy.js, plus the existing logo and favicon assets. The full original site is included for convenient preview; unrelated pages are unchanged.

The server needs ANTHROPIC_API_KEY. ANTHROPIC_MODEL retains the supplied project's existing default; configure a model supported by your account. Do not place credentials in HTML or JavaScript served to learners. A local preview without the key supports lessons, draft saving and recording, but cannot return AI feedback or complete the scored bookends. It displays an error and keeps the learner's writing.

Before distribution, submit one baseline, one practice response and one final pitch on the configured host, and check a recording with a physical microphone. Live AI service availability and quality were not verified in this session because no API key was available. Nothing has been deployed or sent to interns.

## Changes

- Brief TECH introduction and purpose, then pitch → four parts → return to the pitch.
- Separate teaching and practice situations in Target Audience and End Goal, with the later Clarity separation retained.
- Concrete Sam statement before the four listening demonstrations; a different Dani statement for practice.
- Scoreboard explains winning or losing; Pain to Promise includes three rhythmic Because of that beats.
- All eight highlighted emphasis variations are read in one continuous recording, followed by playback. There is one Record/Stop control and one saved audio file.
- Pace, volume, tone and pauses followed by three editable versions of one sentence: apologizing, calm recommendation and urgent. Continue requires all three markups and playback of at least two recordings.
- No instructor audio, placeholder or recording dependency.
- Archivo typography, current site paper/ink/yellow colors, square buttons, fine borders and restrained headings.
- All practice evaluations run through api/assess.js using the same canonical TECH interpretation and model as the main assessment, with a practice-notes purpose for short activities. api/practice.js only assembles learner responses, supplies the activity context and returns the relevant pillar notes supplied by that evaluator. It contains no coaching prompt or evaluation logic. Shared display metadata lives in assessment-rubric.js. H has no AI evaluation.
- Incomplete or ungrounded assessment output is rejected with retry guidance instead of being presented as valid feedback.

## Saved work

Writing, feedback, progress and baseline/final scores save in localStorage. Audio saves in IndexedDB on the same browser/device and can be downloaded individually. Successful baselines are locked; editing the final pitch invalidates its old score. Recordings stop after two minutes or when navigating away. Microphone access requires browser permission. Audio is never sent to the coach.

Download my work includes both pitches, feedback, practice writing and delivery markups. Print/save PDF uses the same report. There is no automatic instructor submission. Bring the report to the live session.

## Verification performed

Browser tests used controlled coaching responses and real MediaRecorder with a generated test audio stream, not a physical microphone. Checks passed for all 13 navigation destinations; baseline validation and locking; all seven practice feedback flows; single-take emphasis recording and playback; three markups and two delivery recordings; denied microphone recovery; final submission and comparison; final edit invalidation; error recovery; report content; and storage restoration after reload.

All 13 pages passed horizontal overflow checks at 375, 768 and 1280 CSS pixels. Desktop and mobile layouts were visually inspected, including the mobile activity menu. No browser JavaScript errors were observed in the successful functional run.

Server tests passed for score totals, all seven practice actions, missing configuration, token cutoff, unfinished feedback and invented evidence quotes. Test-only pages, synthetic audio setup and mock scores are excluded from this package.

Physical mobile devices and other browser engines were not tested. Fonts load from Google Fonts with a system-font fallback.

Latest regression checks: 21 practice cases (strong, partial and off-track for each activity) verify exact context/action routing to practice-only instructions, shared TECH definitions, no practice scores, and unchanged full-score output. Invalid notes and invented evidence quotes are rejected. These controlled tests do not establish live model quality.

The final examples use fictional product, engineering, user research, support and team-coordination situations relevant to TextNow. Teaching and learner practice use different situations. No sign-in is required; learners download written work at the end and recordings separately. Progress does not sync across devices, and nothing is automatically submitted to the instructor.

Sam’s activity now establishes their role and the support-tool conversation before the quote, then invites tentative observations about Sam and possible business impact. Practice notes acknowledge useful observations without demanding a finished pitch or manufacturing a correction. Old pitch-mode practice feedback is invalidated; learner drafts and scored bookends remain saved. Purpose routing and complete-note validation were tested with controlled responses. Live model wording remains unverified without the hosting credentials.

## Shared evaluator architecture

api/evaluation-policy.js owns the single canonical TECH standard and composes separate pitch and practice purposes. Practice never inherits the full-pitch scoring directives, worked pitch example, compulsory coaching focus or scoring output instructions. api/assess.js is the one evaluator for both purposes. api/practice.js only transports inputs and results. course-data.js supplies the exact exercise context and requested action, not an independent rubric. Baseline/final receive full T/E/C scores; practice receives relevant notes only; H receives no AI feedback.

Run `node tests/evaluator.test.cjs` for controlled regression checks. The 21 cases in tests/practice-cases.json include the learner examples that exposed the original problem and human review expectations. They are test data, not runtime grading rules. To review actual model judgement, use the configured server environment and run `node tests/review-live.cjs > practice-live-review.json`, then inspect the notes against those expectations. This makes 21 model calls. That live review has not been run in this session because the server credentials are unavailable.

Include api/evaluation-policy.js when deploying; the evaluator now depends on it. Existing drafts and baseline/final results remain saved; older practice notes are cleared so they can be regenerated.

## Final review changes

The objection activity is now a conversation of up to three learner turns. Priya replies in character without grading. Finish and get notes sends the conversation to the existing shared TECH evaluator, which assesses the learner's contributions together. History is saved locally and included in the written export; failed sends preserve the draft for retry. Deploy api/conversation.js alongside the other API files.

The second delivery activity now records all three intentions in one take. Planning notes are optional and never block progress. Existing baseline/final work remains intact.

Clarity practice instructions accept a concise ask followed by its reason, avoid requiring every fact in the brief, and treat What / So What / Now What / When as flexible. Metaphor feedback focuses on the useful and missing connections rather than requiring a pitch introduction or routine disclaimer.

Run node tests/evaluator.test.cjs and node tests/conversation.test.cjs for controlled backend checks. Actual AI conversation/feedback quality still needs a live check on the configured host; local controlled checks are not evidence of live model quality.

Listening practice now uses a conversation with Dani for up to three learner turns. There is no evaluation between turns. Finish returns one brief listening note from the shared evaluator, with no macro/micro rows or discussion of unobserved rubric behaviors. The conversation and note persist locally and appear in the written export. Older listening feedback is cleared while the learner draft remains. Controlled checks passed for role selection, reply routing, single-note rendering, retry preservation, the three-turn limit, reload persistence and export. Live model wording still requires verification on the configured host.
