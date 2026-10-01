// Personalized lead assessments. Underscore prefix = Vercel does NOT expose this as an endpoint
// and it is not served as a static file, so the lead list stays private.
//
// Each lead gets a page at /for/<slug> with two briefs:
//   mode "up"   = the lead is the speaker, pitching their own leadership
//   mode "down" = someone on the lead's team is pitching the lead
// After editing, run:  node tools/build-lead-pages.cjs
//
// Brief structure mirrors the main assessment: [role + pressures], [the cost/tradeoff],
// [the listener + what they're accountable for], [evidence + its limits], [decision + setting].
// The final `ask` stays neutral: it names the decision, not how to pitch it.

const LEADS = [
  {
    "slug": "jon",
    "name": "Jon Brockway",
    "firstName": "Jon",
    "title": "VP, Sales Engineering - Americas",
    "company": "WalkMe",
    "scenarios": [
      {
        "mode": "up",
        "label": "Making the case for a dedicated POC team",
        "paras": [
          "You're the VP of Sales Engineering for the Americas at WalkMe, now part of SAP. Your solution engineers build proofs of concept for enterprise deals, and you recommend creating a dedicated four-person POC team instead of having every SE build their own.",
          "The team would cost about $780,000 a year and take four SEs out of direct deal coverage. For the next two quarters, the remaining SEs would each carry roughly 15% more opportunities.",
          "You're speaking to Dana, the SVP of Sales for the Americas. Dana is accountable for the quarterly number and has pushed back on anything that reduces SE coverage on live deals.",
          "Over the last two quarters, deals with a POC closed at 41% versus 23% without one. But the average POC took 19 days to build, and 30% slipped past the customer's evaluation window. A two-SE pilot in one region cut build time to 9 days, but it covered only 11 deals.",
          "Dana can approve the team but has to present the headcount shift to global sales leadership. You have ten minutes in the monthly forecast review."
        ],
        "ask": "Pitch Dana on approving the dedicated POC team and taking it to global sales leadership. Give the pitch you would actually make, using the words you'd say in the room."
      },
      {
        "mode": "down",
        "label": "A solutions engineer asking for a product-gap review",
        "paras": [
          "You're a senior solutions engineer on Jon's team at WalkMe. The same integration gap keeps coming up in enterprise deals, and you recommend a monthly review where SEs bring deal-blocking product gaps to product management.",
          "It would take about two hours per SE each month, plus one SE lead to run it. Jon has asked the team to protect selling time this quarter.",
          "You're speaking to Jon, the VP of Sales Engineering for the Americas. Jon is accountable for SE capacity and win rates, and for a working relationship with product, who have complained about one-off feature requests from the field.",
          "Last quarter you found 9 deals worth a combined $6.2M where the same gap was raised as a blocker. Three were lost and six are still open. You pulled this together informally from SE notes, so the real number could be higher or lower.",
          "Jon can sponsor the review and raise it with product leadership. You have fifteen minutes in your one-on-one."
        ],
        "ask": "Pitch Jon on sponsoring the monthly product-gap review and raising it with product leadership. Give the pitch you would actually make, using the words you'd say in the room."
      }
    ]
  },
  {
    "slug": "sriram",
    "name": "Sriram Bolla",
    "firstName": "Sriram",
    "title": "Director of Engineering",
    "company": "Walmart Global Tech",
    "scenarios": [
      {
        "mode": "up",
        "label": "Recommending a staged launch before the holiday freeze",
        "paras": [
          "You're a Director of Engineering at Walmart Global Tech. Your teams own a service behind online grocery checkout. A business partner wants a new item-substitution feature fully live before the holiday code freeze; you recommend launching it in 10% of stores before the freeze and everywhere else in January.",
          "A full launch would mean skipping two weeks of load testing. The staged launch means the business misses about half of the projected holiday benefit.",
          "You're speaking to Priya, the VP who owns the online grocery product line. Priya is accountable for holiday revenue and customer experience, and has already committed the feature to her own leadership.",
          "The business case estimates the feature cuts out-of-stock cancellations by 4%. That comes from a two-week test in 40 stores during a normal period. It hasn't been tested at holiday volume, when checkout traffic runs about three times higher.",
          "Priya can approve the staged plan but will have to explain the change to her SVP. You have ten minutes in the weekly launch review."
        ],
        "ask": "Pitch Priya on approving the staged launch and taking it to her SVP. Give the pitch you would actually make, using the words you'd say in the room."
      },
      {
        "mode": "down",
        "label": "An engineering manager asking for time to fix on-call",
        "paras": [
          "You're an engineering manager in Sriram's org at Walmart Global Tech. Your team's after-hours pages have climbed sharply, and you recommend dedicating two engineers for six weeks to fix the top alert sources before peak season.",
          "That would push back an API change another team is waiting on by about a month.",
          "You're speaking to Sriram, the Director of Engineering. Sriram is accountable for reliability through peak season, delivery commitments to partner teams, and keeping engineers.",
          "Over the last eight weeks the team averaged 34 after-hours pages a week, up from 12 in the spring. Sixty percent came from four alerts, and two engineers have raised burnout in one-on-ones. You believe most of those four alerts are noise, but you've only confirmed it for two.",
          "Sriram can approve the six weeks and talk to the waiting team's director. You have fifteen minutes in your one-on-one."
        ],
        "ask": "Pitch Sriram on approving the six weeks and handling the conversation with the dependent team. Give the pitch you would actually make, using the words you'd say in the room."
      }
    ]
  },
  {
    "slug": "roberto",
    "name": "Roberto Grandillo",
    "firstName": "Roberto",
    "title": "Chief Product and Technology Officer",
    "company": "Tulip",
    "scenarios": [
      {
        "mode": "up",
        "label": "Holding an AI release for regulated customers",
        "paras": [
          "You're the Chief Product and Technology Officer at Tulip. Since the Series D, the company has been pushing to ship AI features for frontline workers. You recommend holding general release of a new AI assistant for operators until it has a validation package for regulated manufacturers, about one quarter later than planned.",
          "The delay pushes out revenue from the feature and gives competitors time to announce something similar first.",
          "You're speaking to your CEO. The CEO is accountable to the board for growth after the raise and has told customers and investors that AI is at the centre of the roadmap.",
          "About 40% of recurring revenue comes from life sciences and medical device customers, who need documented validation before using a tool on a regulated line. In early access, 6 of 9 regulated customers said they would not deploy without it. Non-regulated customers could use it now, but they're a smaller share of expansion revenue.",
          "The CEO can approve the new timeline but will need to explain it at the next board meeting. You have ten minutes in the executive staff meeting."
        ],
        "ask": "Pitch your CEO on approving the new timeline and taking it to the board. Give the pitch you would actually make, using the words you'd say in the room."
      },
      {
        "mode": "down",
        "label": "An engineering lead asking to rebuild data sync",
        "paras": [
          "You're an engineering lead in Roberto's org at Tulip. Customer deployments have grown much larger, and you recommend spending one quarter rebuilding how app data syncs between the cloud and devices on the factory floor.",
          "It would take a team of six for the quarter and delay two roadmap features that sales has already previewed to customers.",
          "You're speaking to Roberto, the Chief Product and Technology Officer. Roberto is accountable for the roadmap, platform reliability, and the commitments sales has made.",
          "Support tickets about sync delays rose 70% over the last two quarters, mostly from the 15 largest customers. Three of them renew in the next six months. Engineering estimates the current design hits its limit at about twice today's largest deployment, but that's from load tests, not production.",
          "Roberto can approve the quarter and would need to reset expectations with sales leadership. You have fifteen minutes in roadmap planning."
        ],
        "ask": "Pitch Roberto on approving the rebuild and resetting the roadmap with sales leadership. Give the pitch you would actually make, using the words you'd say in the room."
      }
    ]
  },
  {
    "slug": "suzanne",
    "name": "Suzanne Daniels",
    "firstName": "Suzanne",
    "title": "Chief Developer Advisor",
    "company": "Microsoft",
    "scenarios": [
      {
        "mode": "up",
        "label": "Slowing a customer's AI agent rollout",
        "paras": [
          "You're a Chief Developer Advisor at Microsoft, working with a large European bank that plans to expand AI coding agents from 3 teams to 40 this quarter. You recommend expanding to 10 teams first, with a named human owner for every type of change the agents are allowed to ship.",
          "The slower rollout delays productivity gains the bank's leadership has already announced internally, and adds work for engineering managers who take on ownership.",
          "You're speaking to Elena, the bank's CTO. Elena is accountable for delivery speed and regulatory compliance, and has publicly backed the 40-team expansion.",
          "In the pilot teams, pull requests merged 35% faster. In a review of 200 agent-made changes, 14 reached production with no clear human owner, including one that changed a data retention setting. None caused an incident, but the bank's regulator expects every production change to have an accountable owner.",
          "Elena can approve the revised rollout but must explain it to the executive committee. You have twenty minutes in the quarterly strategy session."
        ],
        "ask": "Pitch Elena on the revised rollout and on taking it to the executive committee. Give the pitch you would actually make, using the words you'd say in the room."
      },
      {
        "mode": "down",
        "label": "An advisor asking to trade keynotes for workshops",
        "paras": [
          "You're a developer advisor on Suzanne's team at Microsoft. You recommend replacing two of the team's planned conference keynotes next half with hands-on workshops at six large customers.",
          "Workshops take about three times the prep per event and reach far fewer people. The team's visibility at major events would drop.",
          "You're speaking to Suzanne, the Chief Developer Advisor. Suzanne is accountable for the team's impact on how developers actually work, and for the team's standing with leadership.",
          "Last year's keynotes reached around 9,000 attendees, but follow-up surveys showed few teams changed their practices. In two pilot workshops, both customers changed how they review agent-made code within a month. Two is a small sample, and both customers were already keen.",
          "Suzanne can approve the change and would need to explain the lighter event presence to her leadership. You have fifteen minutes in your one-on-one."
        ],
        "ask": "Pitch Suzanne on approving the workshop plan and explaining it to her leadership. Give the pitch you would actually make, using the words you'd say in the room."
      }
    ]
  },
  {
    "slug": "andrew",
    "name": "Andrew Jordan",
    "firstName": "Andrew",
    "title": "Chief Technology Officer",
    "company": "Travelport",
    "scenarios": [
      {
        "mode": "up",
        "label": "Setting a firm date to stop building on legacy",
        "paras": [
          "You're the CTO of Travelport. TripServices, the cloud-native API platform, is live with partners, but most agencies still book through older connections. You recommend announcing a firm date, 18 months out, after which new features are built only on TripServices.",
          "Some agencies will see this as forcing a migration they haven't budgeted for, and the commercial team expects pushback from at least two large accounts.",
          "You're speaking to your CEO. The CEO is accountable for revenue retention and for the company's transformation story with investors.",
          "Engineering spends about 45% of its capacity maintaining the older connections. Agencies already on TripServices have cut the time to integrate new content from months to weeks. No agency has completed a full migration of every workflow yet, so the migration cost for customers is still an estimate.",
          "The CEO can approve the date but needs commercial leadership aligned before it's announced. You have fifteen minutes in the executive leadership meeting."
        ],
        "ask": "Pitch your CEO on approving the date and aligning commercial leadership behind it. Give the pitch you would actually make, using the words you'd say in the room."
      },
      {
        "mode": "down",
        "label": "An engineering director proposing an agent booking pilot",
        "paras": [
          "You're an engineering director in Andrew's org at Travelport. You recommend a 12-week pilot letting AI agents complete bookings through TripServices for one travel management company, including changes and cancellations, not just search.",
          "It needs a squad of five plus a dedicated support rota, and would delay hotel content improvements promised to several agencies by one quarter.",
          "You're speaking to Andrew, the CTO. Andrew is accountable for platform modernisation, AI strategy, and the reliability of the bookings running through the platform.",
          "Discovery through AI tools is growing fast. In the partner's own testing, 1 in 8 agent-made bookings needed human correction, mostly on fare rules and changes. The partner has agreed to share data; no other customers have committed.",
          "Andrew can approve the pilot and would need to agree the hotel delay with product. You have fifteen minutes in the architecture review."
        ],
        "ask": "Pitch Andrew on approving the pilot and agreeing the trade-off with product. Give the pitch you would actually make, using the words you'd say in the room."
      }
    ]
  },
  {
    "slug": "solal",
    "name": "Solal Fitoussi",
    "firstName": "Solal",
    "title": "Director of Engineering",
    "company": "Snyk",
    "scenarios": [
      {
        "mode": "up",
        "label": "Trading a feature for less scan noise",
        "paras": [
          "You're a Director of Engineering at Snyk. Evo now drives most new deals, and product leadership wants your teams to ship three more agent security features this half. You recommend shipping two and using the remaining capacity to cut false positives in agent scanning.",
          "Dropping a feature means a competitor may get there first, and sales has already mentioned it to two prospects.",
          "You're speaking to Maya, the VP of Engineering. Maya is accountable for roadmap delivery and for Evo's growth story.",
          "Last quarter, enterprise customers dismissed 38% of agent-scan findings as not relevant, and two large customers raised the noise in renewal conversations. Your team estimates the work could halve dismissals, but that's based on 500 findings from four customers.",
          "Maya can approve the change but must align it with product leadership. You have ten minutes in the planning review."
        ],
        "ask": "Pitch Maya on approving the change and aligning product leadership. Give the pitch you would actually make, using the words you'd say in the room."
      },
      {
        "mode": "down",
        "label": "A team lead proposing an escalation rotation",
        "paras": [
          "You're a team lead in Solal's group at Snyk. Engineers keep getting pulled into customer escalations without warning. You recommend a weekly rotation where one engineer handles all escalations and the rest stay on roadmap work.",
          "Every week the team runs one engineer down on roadmap work, and support will have to change how it routes issues.",
          "You're speaking to Solal, the Director of Engineering. Solal is accountable for roadmap delivery and for satisfaction among enterprise customers.",
          "Over six weeks, engineers logged 110 hours on escalations spread across seven people, and the team missed two of its last four sprint goals. Another team tried a rotation and reported less context switching, but you don't have their delivery numbers.",
          "Solal can approve the rotation and would need to agree the routing change with the head of support. You have fifteen minutes in your one-on-one."
        ],
        "ask": "Pitch Solal on approving the rotation and taking the routing change to support. Give the pitch you would actually make, using the words you'd say in the room."
      }
    ]
  },
  {
    "slug": "rahul",
    "name": "Rahul Kulkarni",
    "firstName": "Rahul",
    "title": "SVP, Software Engineering",
    "company": "GreenSky",
    "scenarios": [
      {
        "mode": "up",
        "label": "Rebuilding the contractor application flow",
        "paras": [
          "You're SVP of Software Engineering at GreenSky. Loan volume is expected to grow with new funding partnerships, and you recommend replacing the application flow contractors use to submit customer loan applications, over three quarters.",
          "The rebuild needs about $4M and takes two teams off smaller requests from the sales team for most of next year.",
          "You're speaking to your CEO. The CEO is accountable for origination growth, keeping contractors on the platform, and keeping funding partners confident in credit quality and compliance.",
          "About 22% of applications contractors start on mobile are abandoned before submission, versus 9% on desktop. Contractors name the application flow as a top reason for using another lender. Design tests suggest a new flow could halve mobile abandonment, but they were run with 30 contractors in a usability lab.",
          "The CEO can approve the rebuild but will need to take the investment to the board. You have fifteen minutes in the operating review."
        ],
        "ask": "Pitch your CEO on approving the rebuild and taking it to the board. Give the pitch you would actually make, using the words you'd say in the room."
      },
      {
        "mode": "down",
        "label": "An engineering manager proposing automated compliance checks",
        "paras": [
          "You're an engineering manager in Rahul's org at GreenSky. Every release goes through a manual compliance review that adds about four days. You recommend building automated checks for the most common rules so routine changes can ship without waiting.",
          "It takes two engineers for one quarter, and the compliance team would have to agree to rely on the checks, which they've resisted before.",
          "You're speaking to Rahul, the SVP of Software Engineering. Rahul is accountable for delivery speed and for making sure nothing ships that creates regulatory risk in consumer lending.",
          "Of last quarter's 60 releases, compliance requested no changes on 48 and found real issues in 5. Automated checks would cover the rules behind 3 of those 5; the other 2 would still need a person.",
          "Rahul can approve the work and raise it with the head of compliance. You have fifteen minutes in the engineering leadership meeting."
        ],
        "ask": "Pitch Rahul on approving the work and taking it to the head of compliance. Give the pitch you would actually make, using the words you'd say in the room."
      }
    ]
  },
  {
    "slug": "jacob",
    "name": "Jacob Crossley",
    "firstName": "Jacob",
    "title": "Engineering Leadership & Technical Hiring",
    "company": "Crossley Staffing",
    "scenarios": [
      {
        "mode": "up",
        "label": "Re-scoping a client's director search",
        "paras": [
          "You lead Crossley Staffing, a technical executive search firm. A mid-size industrial software client hired you to find a Director of Platform Engineering. After eight weeks of interviews, you recommend changing the search to a Principal Engineer and hiring the director later.",
          "Changing course costs the client about six weeks, and the role their CTO approved and budgeted for would change.",
          "You're speaking to Chris, the client's VP of Engineering. Chris is accountable for delivering a platform rewrite and for not adding management layers without a clear need.",
          "Five of the six finalists asked the same question: who will do the hands-on architecture work? The team has no one above mid-level, and two candidates withdrew after meeting them. You've seen this pattern before, but every company is different and the principal market is tight too.",
          "Chris can change the scope but has to take it back to the CTO. You have thirty minutes in the weekly search check-in."
        ],
        "ask": "Pitch Chris on changing the search and taking it to the CTO. Give the pitch you would actually make, using the words you'd say in the room."
      },
      {
        "mode": "down",
        "label": "A recruiter asking to pause a search",
        "paras": [
          "You're a senior recruiter at Crossley Staffing working a VP of Engineering search. The client has changed the requirements three times in two months. You recommend pausing the search until the client signs off on a written role definition.",
          "Pausing risks the relationship with a client that has given the firm three searches this year, and the fee won't land this quarter.",
          "You're speaking to Jacob, who leads the firm. Jacob is accountable for revenue, the firm's reputation for judgment over speed, and how the team spends its time.",
          "You've spent about 120 hours on the search, and two of the last four candidates you presented were turned down for criteria that weren't in the brief at the time. The hiring manager has said privately that the CTO and CEO disagree on the role. You haven't heard that from either of them.",
          "Jacob can approve the pause and would need to have the conversation with the client's CTO. You have fifteen minutes before the team meeting."
        ],
        "ask": "Pitch Jacob on approving the pause and leading the conversation with the client. Give the pitch you would actually make, using the words you'd say in the room."
      }
    ]
  },
  {
    "slug": "amit",
    "name": "Amit Livne",
    "firstName": "Amit",
    "title": "Machine Learning Manager",
    "company": "Booking.com",
    "scenarios": [
      {
        "mode": "up",
        "label": "Trading quick wins for a pipeline rebuild",
        "paras": [
          "You're a Machine Learning Manager at Booking.com. Your team owns a model that ranks accommodation results in a group of markets. You recommend shifting the team's next two quarters from small model tweaks to rebuilding the feature pipeline so the model can use real-time signals.",
          "During the rebuild the team would run far fewer A/B experiments, and the steady wins your director reports upward would slow down.",
          "You're speaking to Noa, your director. Noa is accountable for conversion gains across search and for showing measurable experiment wins every quarter.",
          "Last year the team shipped 14 winning experiments, but the average gain per win fell from 0.4% to 0.1% conversion. An offline test using real-time availability and price signals showed a much larger lift, but offline results have overstated online gains before.",
          "Noa can approve the plan and would need to explain the slower experiment pace to her VP. You have fifteen minutes in quarterly planning."
        ],
        "ask": "Pitch Noa on approving the rebuild and explaining it to her VP. Give the pitch you would actually make, using the words you'd say in the room."
      },
      {
        "mode": "down",
        "label": "A data scientist asking to hold a winning test",
        "paras": [
          "You're a senior data scientist on Amit's team at Booking.com. A new ranking model just won its A/B test with a 0.6% conversion lift. You recommend holding the rollout for two weeks: it seems to lift bookings by favouring properties with stricter cancellation policies, and you want to check cancellations and complaints first.",
          "The product manager wants to ship this week, and the win counts toward the team's quarterly goals.",
          "You're speaking to Amit, the Machine Learning Manager. Amit is accountable for the team's experiment results and for model decisions that hold up with product and leadership.",
          "In the test, non-refundable bookings rose from 31% to 36% of the total. Customer service contacts haven't risen yet, but most stays booked during the test haven't happened.",
          "Amit can delay the rollout and would need to tell the product manager and product director. You have ten minutes in the team sync."
        ],
        "ask": "Pitch Amit on holding the rollout and bringing product along. Give the pitch you would actually make, using the words you'd say in the room."
      }
    ]
  },
  {
    "slug": "juncao",
    "name": "Juncao Li",
    "firstName": "Juncao",
    "title": "Head of Growth Engineering",
    "company": "DoorDash",
    "scenarios": [
      {
        "mode": "up",
        "label": "Adding a retention check to growth experiments",
        "paras": [
          "You lead growth engineering at DoorDash. Your teams run constant experiments on promotions and onboarding. You recommend building shared guardrail metrics so every growth experiment is checked for its effect on 30-day order retention before it ships.",
          "Building it takes one team a quarter, and some experiments would take two to four weeks longer to conclude.",
          "You're speaking to Taylor, the VP of Growth. Taylor is accountable for new-customer growth targets and the pace of the growth roadmap.",
          "In a review of last half's 40 shipped wins, 6 raised first orders but lowered 30-day retention, and for 3 of them the net effect was negative. The review was done by hand on a sample, and teams don't all measure retention the same way.",
          "Taylor can approve the work and would align product and finance on the new ship criteria. You have fifteen minutes in the growth leadership review."
        ],
        "ask": "Pitch Taylor on approving the guardrails and aligning product and finance. Give the pitch you would actually make, using the words you'd say in the room."
      },
      {
        "mode": "down",
        "label": "A staff engineer proposing one notification service",
        "paras": [
          "You're a staff engineer on Juncao's team at DoorDash. Three growth teams have each built their own service for sending promotional notifications. You recommend merging them into one shared service next quarter.",
          "It takes two engineers from each team for six weeks, and each team's experiment roadmap slips.",
          "You're speaking to Juncao, the Head of Growth Engineering. Juncao is accountable for growth teams shipping fast and for not degrading the customer experience.",
          "Last quarter, 4% of customers got duplicate or conflicting promotions on the same day, and two incidents came from a change in one service the others didn't pick up. A prototype cut new-campaign setup from about five days to two, but it hasn't been tested at full volume.",
          "Juncao can approve the work and would need to agree it with the team leads. You have fifteen minutes in the growth engineering staff meeting."
        ],
        "ask": "Pitch Juncao on approving the merge and getting the team leads on board. Give the pitch you would actually make, using the words you'd say in the room."
      }
    ]
  }
];

const scenarios = {};
LEADS.forEach((lead) => {
  lead.scenarios.forEach((s, i) => {
    s.id = `lead-${lead.slug}-${i + 1}`;
    scenarios[s.id] = { title: s.label, brief: `${s.paras.join('\n\n')}\n\n${s.ask}` };
  });
});

module.exports = { LEADS, scenarios };
