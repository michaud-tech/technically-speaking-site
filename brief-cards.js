/* Structured display version of every brief, keyed by scenario id.
   Same facts as the written briefs the scorer reads; only the layout differs.
   Row format: [label, text, isTheTension] */
(function(root){
var C={};
function card(id,goal,setting,person,facts){C[id]={goal:goal,setting:setting,person:person,facts:facts};}

/* ---------- Public assessment ---------- */
card('client-expansion','Get Morgan to approve the expansion and take the investment to finance.',
 'You have ten minutes with Morgan in the quarterly business review. What do you say?',
 {name:'Morgan',role:"The client's VP of Operations",rows:[
  ['Responsible for','Adoption and cost control'],
  ['Wary of','Another tool that teams buy but do not use',1],
  ['Can decide','Can support the expansion, but finance must approve the added spend']]},
 {summary:"You're an account director at a B2B software company. The client uses your platform in two business units.",rows:[
  ['You recommend','Expanding to a third unit with an analytics module and a structured enablement package'],
  ['The cost','18% more annual investment and six weeks of implementation support'],
  ['Today','The third unit builds similar reports by hand, about 45 hours a month'],
  ['Evidence','In the two existing units, weekly active use reached 74% after enablement and reporting time fell by about 30 hours a month'],
  ['Not proven','Those results do not prove the third unit will adopt at the same rate']]});

card('new-business-line','Get Riley to sponsor the six-month pilot and take it to the executive team.',
 'You have eight minutes with Riley in the operating review. What do you say?',
 {name:'Riley',role:'COO',rows:[
  ['Responsible for','Profitable growth'],
  ['Has pushed back on','New offerings that depend on unproven demand or pull strong people away from current clients',1],
  ['Can decide','Can sponsor the pilot, but the executive team approves the budget and staffing']]},
 {summary:"You're a director at a professional services company.",rows:[
  ['You recommend','Testing a compliance analytics service for mid-market clients before building a full business line'],
  ['The cost','$350,000 and four people from consulting, data, sales and operations for six months. One internal reporting project is delayed'],
  ['Evidence','11 of 15 clients described compliance reporting as a growing problem, and four agreed to review a pilot proposal'],
  ['Not proven','No client has signed. The interviews show interest, not proven demand']]});

card('cross-department','Get Alex to assign a data engineer for three weeks and agree on the project handoff.',
 'You have fifteen minutes with Alex in the cross-functional planning meeting. What do you say?',
 {name:'Alex',role:'A fellow director who leads the data platform team',rows:[
  ['Responsible for','Platform reliability'],
  ['Has asked','Product teams to stop treating tracking work as a late-stage emergency',1],
  ['Can decide','Can reserve the engineer, but needs a clear reason to change the sprint plan']]},
 {summary:"You're a product manager preparing to launch a new onboarding flow.",rows:[
  ['You need','One data engineer for three weeks to build event tracking, so you can see where new users get stuck'],
  ['The cost','Part of the data team’s reliability project moves into the next sprint'],
  ['Evidence','38% of new users leave before completing setup. Interviews suggest confusion at two steps'],
  ['Not yet known','Without tracking, you cannot tell how often each issue happens or whether the new flow fixes it']]});

card('project-update','Recommend one path to Dana and get the decision you need.',
 'You have five minutes with Dana in the weekly steering meeting. What do you say?',
 {name:'Dana',role:'Executive sponsor',rows:[
  ['Responsible for','The launch commitment'],
  ['Wants','Problems surfaced early, with a clear recommendation rather than a list of technical details',1],
  ['Can decide','Approve the reduced first release, or move the date']]},
 {summary:"You're an engineering lead on a payments migration.",rows:[
  ['Status','Two weeks behind. Testing uncovered a dependency missing from the original plan'],
  ['Option 1','Keep the launch date by releasing the three highest-volume payment methods first'],
  ['Option 2','Support all seven methods and move the launch by four weeks'],
  ['Evidence','The top three methods cover 86% of transactions. The other four matter to a smaller group and could stay on the current system temporarily'],
  ['Risk','The temporary connection is not fully tested, so that option still carries delivery risk']]});

card('town-hall','Get the department to understand why the change is happening, use the new escalation process and bring concerns to the team sessions.',
 'You have seven minutes at the town hall before live questions. What do you say?',
 {kicker:"Who you're talking to",name:'Your department',role:'120 people in customer operations',rows:[
  ['Experienced staff','Value their current team relationships'],
  ['Newer staff','Want clearer paths for help'],
  ['Managers','Will be responsible for making the transition work'],
  ['What changes','About a third of employees will change managers. No roles are being eliminated',1]]},
 {summary:"You're the head of customer operations.",rows:[
  ['The change','Support reorganizes into industry-focused teams, with a shared escalation process starting next month'],
  ['Why','The current structure causes inconsistent handoffs and repeated work on complex issues'],
  ['Evidence','Last quarter, 22% of complex tickets moved between teams at least twice, adding 1.8 days to resolution on average'],
  ['Not proven','The new structure has not been tested at this scale. You cannot promise an immediate improvement']]});

/* ---------- Client assessments ---------- */
card('gsw-partnership','Get Jordan behind the expanded three-year renewal.',
 'You have ten minutes with Jordan in the renewal meeting. What do you say?',
 {name:'Jordan',role:"The brand's Chief Marketing Officer",rows:[
  ['Responsible for','Growth and brand relevance'],
  ['Has said','The renewal needs to do more than generate impressions',1],
  ['Can decide','Can support the direction, but the brand’s finance lead approves the added investment']]},
 {summary:"You're on the Golden State Warriors Global Partnerships team. A national financial services brand is considering a three-year renewal.",rows:[
  ['You recommend','Expanding beyond arena presence to a co-branded content series and a community financial-literacy program'],
  ['The cost','The partner’s annual investment rises 15%'],
  ['Evidence','Hospitality inventory was 82% used. Co-branded content beat the usual engagement benchmark by 34%. Last season’s community event reached 12,000 Bay Area students and families'],
  ['Not proven','Lead attribution is incomplete, so you cannot claim the partnership caused new account growth']]});

card('textnow-interns','Get Avery to sponsor the four-week pilot.',
 'You have five minutes with Avery at the innovation challenge final. What do you say?',
 {name:'Avery',role:'The executive sponsoring the innovation challenge',rows:[
  ['Wants','Ideas that solve a real user problem and can be tested quickly'],
  ['Has warned','Don’t confuse an interesting prototype with evidence that people will use it',1],
  ['Can decide','Can sponsor the pilot, but the product and engineering leads must agree to the people and sprint time']]},
 {summary:"You're a TextNow intern on an innovation challenge team.",rows:[
  ['The idea','An in-app feature that helps people recognize suspicious messages before they respond'],
  ['You recommend','A four-week pilot with a limited group of users'],
  ['The cost','One product designer and two engineers. A planned onboarding experiment slips one sprint'],
  ['Evidence','9 of 14 users interviewed were sometimes unsure if a message was legitimate. In a prototype test, 6 of 8 spotted the warning and chose a safer step without help'],
  ['Not yet known','The test was small and did not measure whether harmful interactions go down. The pilot would test usage, comprehension and false warnings']]});

var SNAPDOG={goal:'Get Morgan to name an ops lead and join a 45‑minute kickoff in the next two weeks.',
 setting:"You're speaking to Morgan for two minutes before a meeting. What do you say?",
 person:{name:'Morgan',role:"Director of operations, amphitheatres. Doesn't report to you.",rows:[
  ['Responsible for','Concessions staffing, gate flow and site builds'],
  ['Measured on','Smooth event execution and avoiding last-minute staffing surprises'],
  ['Under pressure','The team is already stretched for next season'],
  ['What happened','Found out about this deal from the announcement email. Last year, another sponsor’s promises landed on ops late and the team spent the summer fixing them.',1]]},
 facts:{title:'The deal (already signed)',summary:'Snap Dog, a national hot dog brand · $1.2M · 3 years · 6 amphitheatres',
  bullets:['Branded concession stands at every venue','Snap Dog Night: $5 hot dogs at one show per venue each summer','A food truck at the gates before the biggest shows'],
  rows:[['Confirmed','Snap Dog staffs the truck and supplies the stand fronts. The deal pays for the stand conversions.'],
   ['Not yet known','Snap Dog Night is new here. Line lengths and staffing are unknown.'],
   ['Deadline','Snap Dog wants to announce the Snap Dog Night dates by March 1.'],
   ["Can't change",'What was signed'],['Still open','How and where it runs']],
  note:'Snap Dog and every detail here are fictional, for training only.'}};
C['livenation-snapdog-v1']=SNAPDOG;

/* ---------- Courses ---------- */
card('textnow-primer-v1','Get Avery to sponsor the four-week pilot.',
 "You're in the room with Avery. What do you say?",
 {name:'Avery',role:'The executive sponsoring the innovation challenge',rows:[
  ['Cares about','Learning quickly and making good use of limited engineering time',1],
  ['The company wants','To improve user trust without adding unnecessary warnings'],
  ['Can decide','Can sponsor the pilot, but product and engineering leads must agree to the people and time']]},
 {summary:"You're a TextNow intern. Your team built a prototype that warns people about suspicious messages and suggests a safer next step.",rows:[
  ['You want','A four-week pilot with a small group of users'],
  ['The cost','One designer and two engineers. A planned onboarding experiment slips one sprint'],
  ['Evidence','In a small prototype test, most participants understood the warning and chose a safer next step'],
  ['Not yet known','Whether it reduces harmful interactions, or how often it flags legitimate messages']]});

card('textnow-prework-v1','Get Riley to sponsor the six-week pilot.',
 "You're in the room with Riley. What do you say?",
 {name:'Riley',role:'The VP who sponsors cross-team operations',rows:[
  ['Cares about','Measurable impact'],
  ['Wary of','New meetings that don’t lead to decisions',1],
  ['The company wants','To keep more users while running a lean team'],
  ['Can decide','Can sponsor the pilot, but each team lead must agree to give a person']]},
 {summary:"You work at TextNow. Support, product, engineering and marketing each see the same user problems from different angles, and nobody puts the pieces together.",rows:[
  ['You want','A six-week pilot: a 30-minute review every two weeks where one person each from support, product, engineering and marketing agree one owner for each of the top three complaints'],
  ['The cost','Four people for three 30-minute sessions, plus about two hours of your prep before each. A small task on your team moves back a week'],
  ['Evidence','Last quarter, one login issue was reported by four teams before anyone owned it. It took five weeks to fix'],
  ['Not yet known','How many issues are like this, or whether a shared review fixes them faster']]});

card('hr-predictable-scheduling-v1','Get Jordan to approve the 12-week pilot and choose two Customer Operations teams.',
 "You're in the room with Jordan. What do you say?",
 {name:'Jordan',role:'COO',rows:[
  ['Responsible for','Customer service levels, labor costs and keeping the operation flexible when demand changes'],
  ['Position','Agrees schedule instability is a problem, but does not want a process that leaves shifts uncovered',1]]},
 {summary:'You lead People and Culture at a 450-person service company.',rows:[
  ['The problem','Last-minute schedule changes in Customer Operations contribute to missed shifts, overtime and turnover'],
  ['You want','A 12-week pilot with two 40-person teams: schedules published three weeks ahead, a simpler shift-swap process, and tracking of absences, overtime and service levels'],
  ['The cost','$12,000 to configure and support. Overtime may rise in the first month while supervisors adjust'],
  ['Evidence','31% of Customer Operations leavers mentioned unpredictable schedules. Supervisors spend about 18 hours a week filling last-minute gaps']]});

card('mlse-inbound-partnerships-v3','Tell Jordan what can’t be delivered, connect a way forward to the real need, and agree the next step.',
 'Respond to Jordan now. What do you say?',
 {name:'Jordan',role:'Marketing director at Northstar, a business-software company',rows:[
  ['Real goal','Get priority prospects into meaningful conversations with Northstar’s sales team before quarter-end'],
  ['Under pressure','Needs a credible recommendation for an internal meeting on Friday. Their VP likes the player idea',1],
  ['Can decide','Can prioritise requirements and take a recommendation to the VP, who approves spend']]},
 {summary:'Jordan asked for a Raptors game night in five weeks: a player appearance, a branded in-venue activation and space for 30 prospective customers. The specific game is flexible.',rows:[
  ['Confirmed no','No player in that window. The activation conflicts with an existing partner commitment. Delivery cannot take on a new custom activation in five weeks'],
  ['Worth checking','A hospitality-led experience with a structured customer discussion. It may support the conversations, but may not attract the same guests'],
  ['Not yet known','Space for 30, budget fit, rights, service scope and delivery capacity'],
  ['Later option','More planning time, but misses the quarter-end objective and still needs approval'],
  ['You can','Own the feasibility check and update Jordan by Thursday, even if the answer is no'],
  ["You can't",'Promise space, pricing, rights, talent, delivery capacity or attendance']],
  note:'All clients, availability and constraints are fictional, not MLSE policy.'});

card('house-of-common-client-pitch-v1','Get Jordan to back the focused approach and agree to a scoping conversation.',
 "You're speaking with Jordan. What do you say?",
 {name:'Jordan',role:'Marketing director at a regional workplace-design company',rows:[
  ['The problem','Prospects think the company only sells furniture, so sales spends meetings explaining the wider service',1],
  ['Under pressure','A website refresh in six weeks, and a proposal to take to the managing director. Limited time to coordinate a production'],
  ['Can decide','Can agree to scoping and champion a proposal. The managing director approves the spend']]},
 {summary:"You're on House of Common's creative and client-facing team.",rows:[
  ['You recommend','Focused art direction and a photo-and-video shoot around one completed project: the team and space, plus a short client-and-team story about the process'],
  ['Today','The website has polished photos of finished rooms, but little showing the team with a client or the design process'],
  ['Not proven','No evidence it will increase sales'],
  ['Not yet known','Client permission, production access, exact scope, price and delivery timing'],
  ['You can','Recommend an approach and arrange scoping with your producer. You cannot commit to a price or shoot date']]});

/* ---------- Personal /for/ pages ---------- */
card('lead-jon-1','Get Dana to approve the dedicated POC team and take it to global sales leadership.',
 'You have ten minutes with Dana in the monthly forecast review. What do you say?',
 {name:'Dana',role:'SVP of Sales, Americas',rows:[
  ['Responsible for','The quarterly number'],
  ['Has pushed back on','Anything that reduces SE coverage on live deals',1],
  ['Can decide','Can approve the team, but has to present the headcount shift to global sales leadership']]},
 {summary:"You're the VP of Sales Engineering for the Americas at WalkMe, now part of SAP.",rows:[
  ['You recommend','A dedicated four-person POC team instead of every SE building their own'],
  ['The cost','About $780,000 a year. Four SEs leave deal coverage, and the rest carry about 15% more opportunities for two quarters'],
  ['Evidence','Deals with a POC closed at 41% versus 23% without. The average POC took 19 days, and 30% slipped past the evaluation window. A two-SE pilot cut build time to 9 days'],
  ['Not proven','The pilot covered only 11 deals']]});

card('lead-jon-2','Get Jon to sponsor a monthly product-gap review and raise it with product leadership.',
 'You have fifteen minutes with Jon in your one-on-one. What do you say?',
 {name:'Jon',role:'VP of Sales Engineering, Americas',rows:[
  ['Responsible for','SE capacity, win rates, and the working relationship with product'],
  ['Under pressure','Has asked the team to protect selling time this quarter. Product has complained about one-off feature requests from the field',1],
  ['Can decide','Can sponsor the review and raise it with product leadership']]},
 {summary:"You're a senior solutions engineer on Jon's team at WalkMe.",rows:[
  ['You recommend','A monthly review where SEs bring deal-blocking product gaps to product management'],
  ['The cost','About two hours per SE each month, plus one SE lead to run it'],
  ['Evidence','Last quarter, the same integration gap was a blocker in 9 deals worth $6.2M. Three were lost, six are still open'],
  ['Not proven','You pulled this together informally from SE notes. The real number could be higher or lower']]});

card('lead-sriram-1','Get Priya to approve the staged launch and take it to her SVP.',
 'You have ten minutes with Priya in the weekly launch review. What do you say?',
 {name:'Priya',role:'VP who owns the online grocery product line',rows:[
  ['Responsible for','Holiday revenue and customer experience'],
  ['Already','Committed the feature to her own leadership',1],
  ['Can decide','Can approve the staged plan, but will have to explain the change to her SVP']]},
 {summary:"You're a Director of Engineering at Walmart Global Tech. Your teams own a service behind online grocery checkout.",rows:[
  ['The request','A new item-substitution feature fully live before the holiday code freeze'],
  ['You recommend','Launch in 10% of stores before the freeze, everywhere else in January'],
  ['The trade-off','A full launch skips two weeks of load testing. The staged launch misses about half the projected holiday benefit'],
  ['Evidence','The feature is estimated to cut out-of-stock cancellations by 4%, from a two-week test in 40 stores'],
  ['Not proven','It has not been tested at holiday volume, when checkout traffic runs about three times higher']]});

card('lead-sriram-2','Get Sriram to approve six weeks on the alert sources and handle the dependent team.',
 'You have fifteen minutes with Sriram in your one-on-one. What do you say?',
 {name:'Sriram',role:'Director of Engineering',rows:[
  ['Responsible for','Reliability through peak season, delivery commitments to partner teams, and keeping engineers',1],
  ['Can decide','Can approve the six weeks and talk to the waiting team’s director']]},
 {summary:"You're an engineering manager in Sriram's org at Walmart Global Tech.",rows:[
  ['You recommend','Two engineers for six weeks to fix the top alert sources before peak season'],
  ['The cost','An API change another team is waiting on slips about a month'],
  ['Evidence','After-hours pages averaged 34 a week over eight weeks, up from 12 in the spring. 60% came from four alerts. Two engineers have raised burnout'],
  ['Not proven','You believe most of those four alerts are noise, but have only confirmed it for two']]});

card('lead-roberto-1','Get your CEO to approve the new timeline and take it to the board.',
 'You have ten minutes with your CEO in the executive staff meeting. What do you say?',
 {name:'Your CEO',role:'Tulip',rows:[
  ['Responsible for','Growth after the Series D, accountable to the board'],
  ['Has said','Told customers and investors that AI is at the centre of the roadmap',1],
  ['Can decide','Can approve the new timeline, but will need to explain it at the next board meeting']]},
 {summary:"You're the Chief Product and Technology Officer at Tulip.",rows:[
  ['You recommend','Hold general release of the AI operator assistant until it has a validation package for regulated manufacturers, about one quarter late'],
  ['The cost','Feature revenue slips, and competitors get time to announce something first'],
  ['Evidence','About 40% of recurring revenue is life sciences and medical device customers who need documented validation. In early access, 6 of 9 regulated customers said they would not deploy without it'],
  ['Also true','Non-regulated customers could use it now, but they are a smaller share of expansion revenue']]});

card('lead-roberto-2','Get Roberto to approve the sync rebuild and reset the roadmap with sales leadership.',
 'You have fifteen minutes with Roberto in roadmap planning. What do you say?',
 {name:'Roberto',role:'Chief Product and Technology Officer',rows:[
  ['Responsible for','The roadmap, platform reliability, and the commitments sales has made',1],
  ['Can decide','Can approve the quarter, and would need to reset expectations with sales leadership']]},
 {summary:"You're an engineering lead in Roberto's org at Tulip. Customer deployments have grown much larger.",rows:[
  ['You recommend','One quarter rebuilding how app data syncs between the cloud and devices on the factory floor'],
  ['The cost','A team of six for the quarter. Two features sales already previewed to customers get delayed'],
  ['Evidence','Sync-delay tickets rose 70% over two quarters, mostly from the 15 largest customers. Three of them renew in the next six months'],
  ['Not proven','The estimated limit, about twice today’s largest deployment, comes from load tests, not production']]});

card('lead-suzanne-1','Get Elena to approve the revised rollout and take it to the executive committee.',
 'You have twenty minutes with Elena in the quarterly strategy session. What do you say?',
 {name:'Elena',role:"The bank's CTO",rows:[
  ['Responsible for','Delivery speed and regulatory compliance'],
  ['Already','Publicly backed the 40-team expansion',1],
  ['Can decide','Can approve the revised rollout, but must explain it to the executive committee']]},
 {summary:"You're a Chief Developer Advisor at Microsoft, working with a large European bank.",rows:[
  ['The plan','Expand AI coding agents from 3 teams to 40 this quarter'],
  ['You recommend','10 teams first, with a named human owner for every type of change the agents can ship'],
  ['The cost','Delays productivity gains leadership already announced, and adds work for engineering managers'],
  ['Evidence','Pilot pull requests merged 35% faster. But 14 of 200 agent-made changes reached production with no clear owner, including one that changed a data retention setting'],
  ['Context','None caused an incident. The regulator expects every production change to have an accountable owner']]});

card('lead-suzanne-2','Get Suzanne to replace the two keynotes with six customer workshops.',
 'You have fifteen minutes with Suzanne. What do you say?',
 {name:'Suzanne',role:'Chief Developer Advisor',rows:[
  ['Responsible for','Helping developers change how they work, and showing leadership the team has broad influence'],
  ['Under pressure','Will have to explain why the team appears at fewer major events',1]]},
 {summary:"You're a developer advisor at Microsoft. Your team has two conference keynotes planned for the next six months.",rows:[
  ['You recommend','Replace them with hands-on workshops for six large customers'],
  ['The trade-off','Keynotes reach thousands and keep the team visible. Workshops reach far fewer people and take about three times the preparation'],
  ['Evidence','Last year’s keynotes reached about 9,000 people, with little evidence teams changed practices. In two pilot workshops, both customers changed how they review AI-agent code within a month'],
  ['Not proven','Only two customers, and both were already eager to take part']]});

card('lead-andrew-1','Get your CEO to approve the date and align commercial leadership behind it.',
 'You have fifteen minutes with your CEO in the executive leadership meeting. What do you say?',
 {name:'Your CEO',role:'Travelport',rows:[
  ['Responsible for','Revenue retention and the transformation story with investors'],
  ['Can decide','Can approve the date, but needs commercial leadership aligned before it is announced',1]]},
 {summary:"You're the CTO of Travelport. TripServices is live with partners, but most agencies still book through older connections.",rows:[
  ['You recommend','Announce a firm date, 18 months out, after which new features are built only on TripServices'],
  ['The risk','Some agencies will see a forced migration they haven’t budgeted for. Commercial expects pushback from at least two large accounts'],
  ['Evidence','About 45% of engineering capacity goes to maintaining older connections. Agencies on TripServices cut content integration from months to weeks'],
  ['Not proven','No agency has fully migrated every workflow, so customer migration cost is still an estimate']]});

card('lead-andrew-2','Get Andrew to approve the agent booking pilot and agree the trade-off with product.',
 'You have fifteen minutes with Andrew in the architecture review. What do you say?',
 {name:'Andrew',role:'CTO',rows:[
  ['Responsible for','Platform modernisation, AI strategy, and the reliability of bookings on the platform',1],
  ['Can decide','Can approve the pilot, and would need to agree the hotel delay with product']]},
 {summary:"You're an engineering director in Andrew's org at Travelport.",rows:[
  ['You recommend','A 12-week pilot letting AI agents complete bookings, changes and cancellations through TripServices for one travel management company'],
  ['The cost','A squad of five plus a support rota. Hotel content improvements promised to agencies slip a quarter'],
  ['Evidence','Discovery through AI tools is growing fast. The partner has agreed to share data'],
  ['Not proven','In the partner’s testing, 1 in 8 agent bookings needed human correction, mostly fare rules and changes. No other customers have committed']]});

card('lead-solal-1','Get Maya to approve the change and align product leadership.',
 'You have ten minutes with Maya in the planning review. What do you say?',
 {name:'Maya',role:'VP of Engineering',rows:[
  ['Responsible for','Roadmap delivery and Evo’s growth story',1],
  ['Can decide','Can approve the change, but must align it with product leadership']]},
 {summary:"You're a Director of Engineering at Snyk. Evo now drives most new deals.",rows:[
  ['The request','Product leadership wants three more agent security features this half'],
  ['You recommend','Ship two, and use the remaining capacity to cut false positives in agent scanning'],
  ['The risk','A competitor may ship the dropped feature first. Sales has mentioned it to two prospects'],
  ['Evidence','Enterprise customers dismissed 38% of agent-scan findings last quarter. Two large customers raised the noise in renewal conversations'],
  ['Not proven','The estimate that this could halve dismissals is based on 500 findings from four customers']]});

card('lead-solal-2','Get Solal to approve the escalation rotation and take the routing change to support.',
 'You have fifteen minutes with Solal in your one-on-one. What do you say?',
 {name:'Solal',role:'Director of Engineering',rows:[
  ['Responsible for','Roadmap delivery and satisfaction among enterprise customers',1],
  ['Can decide','Can approve the rotation, and would agree the routing change with the head of support']]},
 {summary:"You're a team lead in Solal's group at Snyk. Engineers keep getting pulled into customer escalations without warning.",rows:[
  ['You recommend','A weekly rotation: one engineer handles all escalations, the rest stay on roadmap work'],
  ['The cost','The team runs one engineer down every week, and support changes how it routes issues'],
  ['Evidence','Engineers logged 110 hours on escalations over six weeks, spread across seven people. The team missed two of its last four sprint goals'],
  ['Not proven','Another team reported less context switching with a rotation, but you don’t have their delivery numbers']]});

card('lead-rahul-1','Get your CEO to approve the rebuild and take it to the board.',
 'You have fifteen minutes with your CEO in the operating review. What do you say?',
 {name:'Your CEO',role:'GreenSky',rows:[
  ['Responsible for','Origination growth, keeping contractors on the platform, and funding partners’ confidence in credit quality and compliance'],
  ['Can decide','Can approve the rebuild, but will need to take the investment to the board',1]]},
 {summary:"You're SVP of Software Engineering at GreenSky. Loan volume is expected to grow with new funding partnerships.",rows:[
  ['You recommend','Replace the application flow contractors use to submit loan applications, over three quarters'],
  ['The cost','About $4M, and two teams off smaller sales requests for most of next year'],
  ['Evidence','22% of applications started on mobile are abandoned, versus 9% on desktop. Contractors name the flow as a top reason for using another lender'],
  ['Not proven','Design tests suggest mobile abandonment could halve, but they ran with 30 contractors in a usability lab']]});

card('lead-rahul-2','Get Rahul to approve automated compliance checks and take them to the head of compliance.',
 'You have fifteen minutes with Rahul in the engineering leadership meeting. What do you say?',
 {name:'Rahul',role:'SVP of Software Engineering',rows:[
  ['Responsible for','Delivery speed, and making sure nothing ships that creates regulatory risk in consumer lending',1],
  ['Can decide','Can approve the work and raise it with the head of compliance']]},
 {summary:"You're an engineering manager in Rahul's org at GreenSky.",rows:[
  ['Today','Every release waits about four days for a manual compliance review'],
  ['You recommend','Automated checks for the most common rules, so routine changes can ship without waiting'],
  ['The cost','Two engineers for one quarter. Compliance would have to agree to rely on the checks, which they have resisted before'],
  ['Evidence','Of last quarter’s 60 releases, compliance requested no changes on 48 and found real issues in 5'],
  ['Limits','The checks would cover 3 of those 5. The other 2 would still need a person']]});

card('lead-jacob-1','Get Chris to change the search and take it to the CTO.',
 'You have thirty minutes with Chris in the weekly search check-in. What do you say?',
 {name:'Chris',role:"The client's VP of Engineering",rows:[
  ['Responsible for','Delivering a platform rewrite, and not adding management layers without a clear need',1],
  ['Can decide','Can change the scope, but has to take it back to the CTO']]},
 {summary:"You lead Crossley Staffing, a technical executive search firm, eight weeks into a Director of Platform Engineering search.",rows:[
  ['You recommend','Search for a Principal Engineer now, and hire the director later'],
  ['The cost','About six weeks, and the role the CTO approved and budgeted for would change'],
  ['Evidence','Five of six finalists asked who will do the hands-on architecture. No one on the team is above mid-level, and two candidates withdrew after meeting them'],
  ['Not proven','You’ve seen this pattern before, but every company is different and the principal market is tight too']]});

card('lead-jacob-2','Get Jacob to approve the pause and lead the conversation with the client.',
 'You have fifteen minutes with Jacob before the team meeting. What do you say?',
 {name:'Jacob',role:'Leads the firm',rows:[
  ['Responsible for','Revenue, the firm’s reputation for judgment over speed, and how the team spends its time',1],
  ['Can decide','Can approve the pause, and would have the conversation with the client’s CTO']]},
 {summary:"You're a senior recruiter at Crossley Staffing working a VP of Engineering search.",rows:[
  ['You recommend','Pause the search until the client signs off on a written role definition'],
  ['The risk','Strains a client that gave the firm three searches this year, and the fee won’t land this quarter'],
  ['Evidence','The requirements changed three times in two months. About 120 hours spent. Two of the last four candidates were turned down for criteria not in the brief at the time'],
  ['Not confirmed','The hiring manager said privately that the CTO and CEO disagree on the role. You haven’t heard it from either of them']]});

card('lead-amit-1','Get Noa to approve the pipeline rebuild and explain it to her VP.',
 'You have fifteen minutes with Noa in quarterly planning. What do you say?',
 {name:'Noa',role:'Your director',rows:[
  ['Responsible for','Conversion gains across search, and showing measurable experiment wins every quarter',1],
  ['Can decide','Can approve the plan, and would explain the slower experiment pace to her VP']]},
 {summary:"You're a Machine Learning Manager at Booking.com. Your team owns a model that ranks accommodation results in a group of markets.",rows:[
  ['You recommend','Spend the next two quarters rebuilding the feature pipeline for real-time signals, instead of small model tweaks'],
  ['The cost','Far fewer A/B experiments, and the steady wins Noa reports upward slow down'],
  ['Evidence','14 winning experiments last year, but the average gain per win fell from 0.4% to 0.1% conversion. An offline test with real-time availability and price signals showed a much larger lift'],
  ['Not proven','Offline results have overstated online gains before']]});

card('lead-amit-2','Get Amit to hold the rollout and bring product along.',
 'You have ten minutes with Amit in the team sync. What do you say?',
 {name:'Amit',role:'Machine Learning Manager',rows:[
  ['Responsible for','The team’s experiment results, and model decisions that hold up with product and leadership'],
  ['Under pressure','The product manager wants to ship this week, and the win counts toward the team’s quarterly goals',1],
  ['Can decide','Can delay the rollout, and would need to tell the product manager and product director']]},
 {summary:"You're a senior data scientist on Amit's team at Booking.com.",rows:[
  ['The result','A new ranking model won its A/B test with a 0.6% conversion lift'],
  ['You recommend','Hold the rollout two weeks to check cancellations and complaints'],
  ['Why','It seems to lift bookings by favouring properties with stricter cancellation policies. Non-refundable bookings rose from 31% to 36%'],
  ['Not yet known','Customer service contacts haven’t risen, but most stays booked during the test haven’t happened yet']]});

card('lead-juncao-1','Get Taylor to approve the guardrails and align product and finance.',
 'You have fifteen minutes with Taylor in the growth leadership review. What do you say?',
 {name:'Taylor',role:'VP of Growth',rows:[
  ['Responsible for','New-customer growth targets and the pace of the growth roadmap',1],
  ['Can decide','Can approve the work, and would align product and finance on the new ship criteria']]},
 {summary:"You lead growth engineering at DoorDash. Your teams run constant experiments on promotions and onboarding.",rows:[
  ['You recommend','Shared guardrail metrics, so every growth experiment is checked for its effect on 30-day order retention before it ships'],
  ['The cost','One team for a quarter. Some experiments take two to four weeks longer to conclude'],
  ['Evidence','Of last half’s 40 shipped wins, 6 raised first orders but lowered 30-day retention. For 3, the net effect was negative'],
  ['Not proven','The review was done by hand on a sample, and teams don’t all measure retention the same way']]});

card('lead-juncao-2','Get Juncao to approve the merge and get the team leads on board.',
 'You have fifteen minutes with Juncao in the growth engineering staff meeting. What do you say?',
 {name:'Juncao',role:'Head of Growth Engineering',rows:[
  ['Responsible for','Growth teams shipping fast, without degrading the customer experience',1],
  ['Can decide','Can approve the work, and would need to agree it with the team leads']]},
 {summary:"You're a staff engineer on Juncao's team at DoorDash. Three growth teams each built their own service for promotional notifications.",rows:[
  ['You recommend','Merge them into one shared service next quarter'],
  ['The cost','Two engineers from each team for six weeks, and each team’s experiment roadmap slips'],
  ['Evidence','Last quarter, 4% of customers got duplicate or conflicting promotions on the same day. Two incidents came from a change the other services didn’t pick up'],
  ['Not proven','A prototype cut campaign setup from about five days to two, but hasn’t been tested at full volume']]});

root.TS_BRIEF_CARDS=C;
if(typeof module!=='undefined'&&module.exports)module.exports=C;
})(typeof window!=='undefined'?window:globalThis);
