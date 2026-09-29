# TECH mini-course · Final review edition

The existing 13-activity mini-course, baseline/final scenario, assessment rubric and ending are preserved. Start at learn.html through the preview server.

## Preview

Requires Node.js 18 or later. On Windows, double-click Preview.cmd. Open http://localhost:4176/learn.html and keep the preview window running. Or run npm start from this folder. No package installation is needed. Use localhost or HTTPS for microphone access, rather than opening the HTML file directly.

## Before giving interns the link

Deploy the course to the existing configured Vercel site. The course files are learn.html, course.js, course-data.js, assessment-rubric.js, api/assess.js and api/practice.js, plus the existing logo and favicon assets. The full original site is included for convenient preview; unrelated pages are unchanged.

The server needs ANTHROPIC_API_KEY. ANTHROPIC_MODEL retains the supplied project's existing default; configure a model supported by your account. Do not place credentials in HTML or JavaScript served to learners. A local preview without the key supports lessons, draft saving and recording, but cannot return AI feedback or complete the scored bookends. It displays an error and keeps the learner's writing.

Before distribution, submit one baseline, one practice response and one final pitch on the configured host, and check a recording with a physical microphone. Live AI service availability and quality were not verified in this session because no API key was available. Nothing has been deployed or sent to interns.

## Changes

- Brief TECH introduction and purpose, then pitch → four parts → return to the pitch.
- Separate teaching and practice situations in Target Audience and End Goal, with the later Clarity separation retained.
- Concrete Sam statement before the four listening demonstrations; a different Dani statement for practice.
- Scoreboard explains winning or losing; Pain to Promise includes three rhythmic Because of that beats.
- All eight highlighted emphasis variations are read in one continuous recording, followed by playback. There is one Record/Stop control and one saved audio file.
- Pace, volume, tone and pauses followed by three editable versions of one sentence: apologising, calm recommendation and urgent. Continue requires all three markups and playback of at least two recordings.
- No instructor audio, placeholder or recording dependency.
- Archivo typography, current site paper/ink/yellow colours, square buttons, fine borders and restrained headings.
- All practice evaluations run through api/assess.js with the same prompt, rubric, model and output validation as the main assessment. api/practice.js only assembles learner responses, supplies the activity context and filters the returned notes to the relevant pillar. It contains no coaching prompt or evaluation logic. Shared display metadata lives in assessment-rubric.js. H has no AI evaluation.
- Incomplete or ungrounded assessment output is rejected with retry guidance instead of being presented as valid feedback.

## Saved work

Writing, feedback, progress and baseline/final scores save in localStorage. Audio saves in IndexedDB on the same browser/device and can be downloaded individually. Successful baselines are locked; editing the final pitch invalidates its old score. Recordings stop after two minutes or when navigating away. Microphone access requires browser permission. Audio is never sent to the coach.

Download my work includes both pitches, feedback, practice writing and delivery markups. Print/save PDF uses the same report. There is no automatic instructor submission. Bring the report to the live session.

## Verification performed

Browser tests used controlled coaching responses and real MediaRecorder with a generated test audio stream, not a physical microphone. Checks passed for all 13 navigation destinations; baseline validation and locking; all seven practice feedback flows; single-take emphasis recording and playback; three markups and two delivery recordings; denied microphone recovery; final submission and comparison; final edit invalidation; error recovery; report content; and storage restoration after reload.

All 13 pages passed horizontal overflow checks at 375, 768 and 1280 CSS pixels. Desktop and mobile layouts were visually inspected, including the mobile activity menu. No browser JavaScript errors were observed in the successful functional run.

Server tests passed for score totals, all seven practice actions, missing configuration, token cutoff, unfinished feedback and invented evidence quotes. Test-only pages, synthetic audio setup and mock scores are excluded from this package.

Physical mobile devices and other browser engines were not tested. Fonts load from Google Fonts with a system-font fallback.

Latest regression checks: all seven practice actions use exactly the same system prompt and tool schema as the full assessment and return only the requested pillar notes. No generic full-assessment coaching is included in section feedback. The homepage heading stays on two lines at small widths, with “for” beginning the second line.

The final examples use fictional product, engineering, user research, support and team-coordination situations relevant to TextNow. Teaching and learner practice use different situations. No sign-in is required; learners download written work at the end and recordings separately. Progress does not sync across devices, and nothing is automatically submitted to the instructor.
