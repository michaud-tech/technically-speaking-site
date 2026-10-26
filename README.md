# MLSE Global Partnerships — TECH staff course

A separate 13-activity, approximately 40-minute course for inbound partnership sales staff. Uses the same sequence, teaching tools and activity flow as the existing course, with MLSE-specific examples and applications.

## Review now
Open MLSE-TECH-Preview.html (provided separately). No local web server needed. Use Activities to navigate through the original course sequence. Teaching examples and practice briefs use fictional MLSE partnership conversations. The preview saves drafts locally. Live AI scoring and client replies require the hosted course; audio depends on browser microphone permission.

## Upload to your existing website
Extract the ZIP first. Add its contents at the same level as your existing index.html. Keep api/ and mlse-server/ as folders; do not flatten them. This package contains no homepage, program, learn, HOC, package.json or vercel.json replacement.

New files: mlse.html, mlse-course.js, mlse-course-data.js, mlse-rubric.js; api/mlse.js; four modules inside mlse-server/. The existing Technically Speaking logo and favicon are also included unchanged. Skip those two assets if they already exist.

This adds ONE serverless function: api/mlse.js. The four mlse-server modules must remain outside api/. Check your current total against your hosting plan before deployment.

The page is /mlse.html, or /mlse if your existing Vercel configuration enables cleanUrls. Preserve existing routing settings. The dispatcher uses /api/mlse?mode=assess, practice or conversation.

The hosted course needs ANTHROPIC_API_KEY in server environment variables, never in browser files. ANTHROPIC_MODEL can override the inherited model default; choose a model available to your account. No dependencies are added. Deploy on a current Node runtime with fetch support. This package has not been deployed or tested against a live AI account.

## Content and assessment
All clients, requests, deadlines, availability and internal constraints are fictional, not actual MLSE policy or sellable inventory. Staff practise uncovering the need, giving a clear limit, weighing alternatives and owning a next step. No sale is required for an effective response. Canonical TECH scoring is unchanged: T/E/C six behaviours, 0–2 each, total /12. H is practised aloud. Baseline and final use the same brief. AI coaching is developmental, not a validated measure of sales performance.

Writing and conversation history are sent to the configured AI service only when requested. Drafts and recordings stay in the learner's browser; work is not automatically submitted to an instructor. Use fictional information.

## Checks
Passed browser regression checks for all 13 activities at desktop, 375px and 768px, scoring flow, seven exercises, chat turns, saved drafts, recording/playback persistence, export and failure recovery. AI responses and microphone were simulated. API checks cover missing key, validation, canonical rubric, truncation retry and grounding. Live AI output quality still needs a hosted trial.

## Public background
https://partners.mlse.com/
https://partners.mlse.com/our-philosophy
Public material informed the needs-led partnership context. Scenario facts were invented for training.
