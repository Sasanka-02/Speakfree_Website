// Static site builder for the SpeakFree (R26-IT-086) academic project website.
// Run `node build.js` to regenerate the seven .html pages. The output is plain
// HTML + CSS (no JavaScript), so the pages can be uploaded to the course web as is.
// Writing rule for this site: no em dashes or en dashes anywhere.
const fs = require("fs");
const path = require("path");
const OUT = __dirname;

// ---------------------------------------------------------------- data

const TEAM = [
  {
    c: 1, initials: "PK", name: "P.A.S.S. Kusumsiri", id: "IT22132628", email: "sithirasasanka002@gmail.com",
    component: "Speech Screening and ASR Feature Extraction",
    blurb: "Built the browser based capture pipeline, noise robust preprocessing, and confidence aware ASR and acoustic feature extraction that feeds every downstream component.",
  },
  {
    c: 2, initials: "ER", name: "E.Y. Randiw", id: "IT220257086", email: "randiw2721@gmail.com",
    component: "Speech Alignment and Articulation Analysis",
    blurb: "Built the phoneme level alignment and articulation error detection module that works on Component 1's clean speech features, flagging specific articulation errors for finer grained clinical indicators.",
  },
  {
    c: 3, initials: "IT", name: "I.L.S. Tharushan", id: "IT21315114", email: "sadeepatharushan158@gmail.com",
    component: "AI Severity Prediction",
    blurb: "Built the AI model that combines fluency signals from Component 1 and articulation signals from Component 2 into a single, explainable severity prediction for each screened speaker.",
  },
  {
    c: 4, initials: "MP", name: "M.D.I. Perera", id: "IT22056702", email: "dasunindula2000@gmail.com",
    component: "AI Therapy Assistant and Progress Tracking",
    blurb: "Built the expert recalibratable scoring model, the contextual bandit exercise planner, the conversational assistant, and the differential privacy cohort reporting used by therapists.",
  },
];

const SUPERVISORS = [
  { initials: "CK", name: "Ms. Chathurangika Kahandawaarachchi", role: "Supervisor" },
  { initials: "SS", name: "Ms. Suranjini Silva", role: "Co-supervisor" },
];

// Status reflects the project position in mid October 2026.
// Marks: replace null with the percentage published by the RP team, e.g. "15%".
const MILESTONES = [
  { id: "proposal", title: "Project Proposal", date: "15 March 2026", status: "done", marks: null,
    text: "Initial problem statement, research gap, objectives and four component solution outline submitted as the proposal document, followed by the proposal presentation to the panel (16 to 18 March 2026).",
    deliverables: "Proposal document, proposal presentation slides" },
  { id: "checklist-1", title: "Check List Submission", date: "13 May 2026", status: "done", marks: null,
    text: "First progress checklist submitted per the module requirements, confirming each component's planned scope and current completion.",
    deliverables: "Check list document" },
  { id: "pp1", title: "Progress Presentation 1", date: "11 to 13 May 2026", status: "done", marks: null,
    text: "Early prototypes demonstrated for each component, including browser audio capture, the first ASR scoring pipeline and initial phoneme alignment. Panel feedback was collected and logged for the next phase.",
    deliverables: "PP1 slides, working prototypes" },
  { id: "pp2", title: "Progress Presentation 2", date: "31 August to 2 September 2026", status: "done", marks: null,
    text: "Refined components demonstrated end to end, including severity prediction and the Component 4 adaptive learning and expert validation workflow developed in response to PP1 feedback.",
    deliverables: "PP2 slides, integrated demonstration" },
  { id: "draft-thesis", title: "Draft Thesis and Website Submission", date: "11 October 2026", status: "done", marks: null,
    text: "Draft of each member's individual thesis submitted, together with the complete source code of this academic information website uploaded to the course web.",
    deliverables: "Four draft theses, website source code" },
  { id: "final-checklist", title: "Final Check List Submission", date: "14 October 2026", status: "done", marks: null,
    text: "Final checklist submitted ahead of the final presentation and viva.",
    deliverables: "Final check list document" },
  { id: "final", title: "Final Assessment and Viva", date: "19 to 21 October 2026", status: "next", marks: null,
    text: "Individual theses, the common integrated report and the completed four component system presented together. The session runs as Demonstration (10 minutes), Viva session (35 minutes) and Marking (5 minutes). The website viva and logbook evaluation take place on the same day.",
    deliverables: "Final presentation slides, live system demonstration, logbook, website" },
  { id: "research-paper", title: "Research Paper Submission", date: "23 October 2026", status: "next", marks: null,
    text: "Research paper on the SpeakFree research submitted per the module's internal deadline, with evidence of publication or acceptance due on 1 December 2026.",
    deliverables: "Research paper, publication evidence" },
  { id: "final-thesis", title: "Final Thesis Submission", date: "28 October 2026", status: "upcoming", marks: null,
    text: "Final, revised individual theses submitted following feedback on the drafts.",
    deliverables: "Four final theses, common integrated report" },
];

const STATUS_LABEL = { done: "Completed", next: "Up next", upcoming: "Upcoming" };

// Put each file in the folder shown, or swap the path for a Google Drive link.
const DOCUMENTS = [
  { group: "Planning", items: [
    { title: "Project Charter", meta: "Team document, scope, roles and governance", href: "files/documents/project-charter.pdf" },
    { title: "Topic Assessment Form", meta: "Team document, approved research topic", href: "files/documents/topic-assessment-form.pdf" },
  ]},
  { group: "Proposal", items: [
    { title: "Proposal Document", meta: "Problem, gap, objectives and four component plan", href: "files/documents/proposal-report.pdf" },
  ]},
  { group: "Check Lists", items: [
    { title: "Check List 1", meta: "Submitted 13 May 2026", href: "files/documents/checklist-1.pdf" },
    { title: "Final Check List", meta: "Submitted 14 October 2026", href: "files/documents/checklist-final.pdf" },
  ]},
  { group: "Research Paper", items: [
    { title: "Research Paper", meta: "Team SpeakFree, R26-IT-086", href: "files/documents/research-paper.pdf" },
  ]},
  { group: "Final Documents", items: [
    { title: "Common Integrated Report", meta: "Overall problem, architecture, integration and evaluation", href: null },
    ...TEAM.map((m) => ({ title: `Individual Thesis, Component ${m.c}`, meta: `${m.name}, ${m.component}`, href: null })),
  ]},
];

const PRESENTATIONS = [
  { title: "Proposal Presentation", date: "16 to 18 March 2026", meta: "Problem, research gap and proposed four component solution", href: "files/presentations/proposal-presentation.pdf" },
  { title: "Progress Presentation 1", date: "11 to 13 May 2026", meta: "Early prototypes and panel feedback", href: "files/presentations/progress-presentation-1.pdf" },
  { title: "Progress Presentation 2", date: "31 August to 2 September 2026", meta: "Refined components and response to feedback", href: "files/presentations/progress-presentation-2.pdf" },
  { title: "Final Presentation", date: "19 to 21 October 2026", meta: "Completed system demonstration and viva", href: null },
];

// ---------------------------------------------------------------- helpers

const ICON = {
  mic: '<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3"/>',
  wave: '<path d="M3 12h2M7 8v8M11 5v14M15 8v8M19 10v4M21 12h0"/>',
  brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/><path d="M12 10v4M10 12h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  school: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
  db: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;

let lightboxes = [];
function figure(id, file, caption, alt) {
  lightboxes.push(`<div class="lightbox" id="lb-${id}" role="dialog" aria-label="${alt}">
  <a href="#close" class="backdrop" aria-label="Close"></a>
  <img src="assets/images/${file}" alt="${alt}" loading="lazy">
  <a href="#close" class="close">Close &times;</a>
</div>`);
  return `<figure class="figure">
  <a href="#lb-${id}"><img src="assets/images/${file}" alt="${alt}" loading="lazy"></a>
  <figcaption>${caption}</figcaption>
</figure>`;
}

const NAV = [
  { href: "index.html", key: "home", label: "Home" },
  { href: "domain.html", key: "domain", label: "Domain", sub: [
    ["#literature-survey", "Literature Survey"], ["#research-gap", "Research Gap"], ["#research-problem", "Research Problem"],
    ["#research-objectives", "Research Objectives"], ["#methodology", "Methodology"], ["#technologies", "Technologies Used"],
  ]},
  { href: "milestones.html", key: "milestones", label: "Milestones", sub: MILESTONES.map((m) => ["#" + m.id, m.title]) },
  { href: "documents.html", key: "documents", label: "Documents" },
  { href: "presentations.html", key: "presentations", label: "Presentations" },
  { href: "about.html", key: "about", label: "About Us" },
  { href: "contact.html", key: "contact", label: "Contact Us" },
];

const brand = `<a href="index.html" class="brand">
      <img src="assets/logo/logo-icon.svg" alt="" width="42" height="42">
      <span><span class="brand-name">Speak<span class="free">Free</span></span><span class="brand-sub">R26-IT-086 &middot; SLIIT Research Project</span></span>
    </a>`;

function head(title, desc) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | SpeakFree, R26-IT-086</title>
<meta name="description" content="${desc}">
<link rel="icon" type="image/svg+xml" href="assets/logo/logo-icon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
`;
}

function header(active) {
  const items = NAV.map((n) => {
    const cls = n.key === active ? ' class="active" aria-current="page"' : "";
    if (!n.sub) return `<li><a href="${n.href}"${cls}>${n.label}</a></li>`;
    const sub = n.sub.map(([h, l]) => `<li><a href="${n.href}${h}">${l}</a></li>`).join("");
    return `<li class="has-sub"><a href="${n.href}"${cls}>${n.label}</a><ul class="sub">${sub}</ul></li>`;
  }).join("\n        ");
  return `<header class="site-header">
  <div class="container nav-wrap">
    ${brand}
    <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu">
    <label for="nav-toggle" class="nav-burger" aria-hidden="true"><span></span></label>
    <nav class="main-nav" aria-label="Main">
      <ul>
        ${items}
      </ul>
    </nav>
  </div>
</header>
`;
}

function pageHead(title, desc, crumb) {
  return `<div class="page-head">
  <div class="container">
    <ol class="crumbs"><li><a href="index.html">Home</a></li><li>${crumb || title}</li></ol>
    <h1 class="rise">${title}</h1>
    <p class="rise d1">${desc}</p>
  </div>
</div>
`;
}

function footer() {
  const lbs = lightboxes.join("\n");
  lightboxes = [];
  return `${lbs}
</main>
<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      ${brand}
      <p>AI Based Speech Disorder Screening and Therapy Assistant. Empowering voices, enhancing lives.</p>
    </div>
    <div>
      <h4>Research</h4>
      <ul>
        <li><a href="domain.html#literature-survey">Literature survey</a></li>
        <li><a href="domain.html#research-gap">Research gap</a></li>
        <li><a href="domain.html#methodology">Methodology</a></li>
        <li><a href="domain.html#technologies">Technologies</a></li>
      </ul>
    </div>
    <div>
      <h4>Project</h4>
      <ul>
        <li><a href="milestones.html">Milestones</a></li>
        <li><a href="documents.html">Documents</a></li>
        <li><a href="presentations.html">Presentations</a></li>
      </ul>
    </div>
    <div>
      <h4>Team</h4>
      <ul>
        <li><a href="about.html">About us</a></li>
        <li><a href="contact.html">Contact us</a></li>
        <li>Sri Lanka Institute of Information Technology</li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    An academic information website for the SpeakFree research project, kept separate from the SpeakFree software product. &copy; 2026 Team SpeakFree, R26-IT-086.
  </div>
</footer>
</body>
</html>
`;
}

function page(file, key, title, desc, body) {
  const html = head(title, desc) + header(key) + '<main id="main">\n' + body + footer();
  if (/[–—]|&[nm]dash;/.test(html)) throw new Error(`${file} contains an en or em dash`);
  fs.writeFileSync(path.join(OUT, file), html);
  console.log("wrote", file);
}

// ---------------------------------------------------------------- Home

const COMPONENT_CARDS = [
  { img: "c1-asr.jpg", title: "Speech Screening and ASR Scoring",
    text: "Browser based recording, noise reduction and confidence aware ASR (Whisper, HuBERT, Librosa) that turns raw speech into accuracy, fluency and pronunciation scores." },
  { img: "c2-articulation.jpg", title: "Alignment and Articulation Analysis",
    text: "Forced alignment and phoneme segmentation that time every sound and flag substitutions, distortions and reduced vowels at the phoneme level." },
  { img: "c3-severity.jpg", title: "AI Severity Prediction",
    text: "Combines fluency and articulation signals into a Mild, Moderate or Severe prediction with class probabilities, a risk level and decision support." },
  { img: "c4-therapy.jpg", title: "Personalised Therapy and Progress",
    text: "Adaptive exercise plans, a conversational assistant and progress tracking, with expert recalibration and privacy preserving therapist reports." },
];

page("index.html", "home", "Home",
  "SpeakFree: an AI based online platform for affordable speech disorder screening and personalised, privacy preserving therapy support.",
  `<section class="hero">
  <div class="container hero-grid">
    <div class="rise">
      <span class="eyebrow">SLIIT Research Project &middot; R26-IT-086</span>
      <h1>Speak<span class="free">Free</span></h1>
      <div class="hero-line"></div>
      <p class="subtitle">AI Based Speech Disorder Screening and Therapy Assistant</p>
      <p class="lead">An online platform that screens speech from a simple browser recording, explains what it finds at the phoneme level, predicts severity and guides personalised home therapy, so quality speech care does not depend on where you live.</p>
      <div class="hero-actions">
        <a href="domain.html" class="btn btn-primary">Explore the research</a>
        <a href="documents.html" class="btn btn-ghost">View documents</a>
      </div>
      <div class="tagline"><span class="ico" style="color:#fff">${icon("brain")}</span><span>Empowering Voices.<br>Enhancing Lives.</span></div>
    </div>
    <div class="hero-art rise d2">
      <img src="assets/images/hero-visual.jpg" alt="Studio microphone surrounded by voice analysis panels showing fluency, pronunciation and clarity scores" width="788" height="751">
      <div class="float-chip one">4 integrated components<small>Screening to therapy</small></div>
      <div class="float-chip two">Explainable AI<small>Phoneme level insight</small></div>
    </div>
  </div>
</section>

<div class="container">
  <div class="stats rise d3">
    <div class="stat"><div class="num">4</div><div class="label">Integrated AI components</div></div>
    <div class="stat"><div class="num">3</div><div class="label">Assessment tasks per session</div></div>
    <div class="stat"><div class="num">60<em>-</em>80%</div><div class="label">Reported ASR error rate on disordered speech</div></div>
    <div class="stat"><div class="num">20<em>26</em></div><div class="label">Final year research delivery</div></div>
  </div>
</div>

<section>
  <div class="container">
    <div class="section-head">
      <span class="kicker">The problem</span>
      <h2>Speech screening today is <span class="accent">slow, distant and easy to miss</span></h2>
      <p>Speech disorders are best treated early, yet the path to a diagnosis is long, expensive and often out of reach. Standard speech recognition also performs poorly on disordered speech, so most digital tools cannot fill the gap.</p>
    </div>
    <div class="grid grid-3">
      <article class="card media-card">
        <a class="thumb" href="#lb-p1"><img src="assets/images/problem-cost.jpg" alt="Parent waiting in a speech therapy clinic with an assessment bill" loading="lazy"></a>
        <div class="body">
          <div class="icon">${icon("clock")}</div>
          <h3>Slow, manual and expensive</h3>
          <p>Long wait times, manual scoring that depends on individual judgement, and high expert and administrative costs delay the start of therapy.</p>
        </div>
      </article>
      <article class="card media-card">
        <a class="thumb" href="#lb-p2"><img src="assets/images/problem-access.jpg" alt="Woman in a rural home struggling with an unstable telehealth call" loading="lazy"></a>
        <div class="body">
          <div class="icon">${icon("pin")}</div>
          <h3>Hard to reach outside cities</h3>
          <p>Distance, very few specialists for a large population, long waitlists and weak connectivity make consistent therapy difficult in rural and remote communities.</p>
        </div>
      </article>
      <article class="card media-card">
        <a class="thumb" href="#lb-p3"><img src="assets/images/problem-missed.jpg" alt="Child speaking with a clinician, with subtle speech errors highlighted" loading="lazy"></a>
        <div class="body">
          <div class="icon">${icon("search")}</div>
          <h3>Early signs are easily missed</h3>
          <p>Subtle sound substitutions, cluster simplification, vowel distortion and irregular intonation can be overlooked in a short manual observation.</p>
        </div>
      </article>
    </div>
  </div>
</section>

<section class="alt">
  <div class="container split">
    <div>
      <span class="kicker">Our solution</span>
      <h2>One online pipeline from <span class="accent">screening to therapy</span></h2>
      <p>SpeakFree asks the speaker to complete three short tasks in the browser. Using more than one elicitation task gives a fairer picture of speakers whose fluency varies across contexts.</p>
      <ul class="checks">
        <li><strong>Audio recording:</strong> read a passage aloud into the microphone.</li>
        <li><strong>Picture description:</strong> describe a picture in your own words.</li>
        <li><strong>Scenario description:</strong> describe what is happening in an everyday scene.</li>
      </ul>
      <p>The recordings flow through the four research components, and the results come back as structured, explainable scores with clear next steps for families and clinicians.</p>
    </div>
    ${figure("solution", "solution-tasks.jpg", "<strong>Concept:</strong> the SpeakFree assessment task screen.", "SpeakFree assessment tasks screen with audio recording, picture description and scenario description")}
  </div>
</section>

<section>
  <div class="container">
    <div class="section-head center">
      <span class="kicker">Research components</span>
      <h2>Four components, one research team</h2>
      <p>Each member owns one sub problem. Components are built and tested independently against a shared JSON contract, then integrated end to end.</p>
    </div>
    <div class="grid grid-4">
      ${COMPONENT_CARDS.map((c, i) => `<article class="card media-card c${i + 1} rise d${i + 1}">
        <a class="thumb" href="#lb-c${i + 1}"><img src="assets/images/${c.img}" alt="${c.title} dashboard concept" loading="lazy"></a>
        <div class="body">
          <span class="tag">Component ${i + 1}</span>
          <h3>${c.title}</h3>
          <p>${c.text}</p>
          <div class="owner">${TEAM[i].name}<small>${TEAM[i].id}</small></div>
        </div>
      </article>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="alt">
  <div class="container split reverse">
    <div>
      <span class="kicker">Who it helps</span>
      <h2>Built on trust, <span class="accent">driven by impact</span></h2>
      <ul class="checks">
        <li><strong>Patients and families:</strong> easy assessments from anywhere, early risk detection and clear next steps.</li>
        <li><strong>Therapists and clinicians:</strong> explainable AI insights, personalised therapy plans and progress tracking.</li>
        <li><strong>All ages:</strong> children, adults and elderly speakers, accessible any time.</li>
        <li><strong>Privacy first:</strong> secure HTTPS and JWT protected APIs, with privacy preserving reporting.</li>
      </ul>
      <a href="domain.html#methodology" class="btn btn-ghost">See how it works</a>
    </div>
    ${figure("overview", "overview.jpg", "<strong>Overview:</strong> SpeakFree connects patients, clinicians and the AI analysis engine.", "SpeakFree overview connecting patients, therapists, AI technology and therapy support")}
  </div>
</section>

<section>
  <div class="container">
    <div class="callout">This is an academic information website that documents the SpeakFree research: its background, methodology, milestones and deliverables. It is separate from the SpeakFree screening and therapy application, which is the research product itself.</div>
  </div>
</section>
` + (() => {
    figure("p1", "problem-cost.jpg", "", "Manual speech screening is slow, difficult and expensive");
    figure("p2", "problem-access.jpg", "", "Speech therapy access challenge for rural and remote communities");
    figure("p3", "problem-missed.jpg", "", "Early speech disorder symptoms can be missed");
    COMPONENT_CARDS.forEach((c, i) => figure(`c${i + 1}`, c.img, "", c.title));
    return "";
  })());

// ---------------------------------------------------------------- Domain

const TOC = NAV[1].sub;
page("domain.html", "domain", "Domain",
  "Literature survey, research gap, research problem, objectives, methodology and technologies behind SpeakFree.",
  pageHead("Domain", "The background, literature and methodology behind SpeakFree's four research components.") + `
<section>
  <div class="container with-toc">
    <aside class="toc" aria-label="On this page">
      <h4>On this page</h4>
      <ol>
        ${TOC.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("\n        ")}
      </ol>
    </aside>
    <div>

      <div class="doc-section" id="literature-survey">
        <span class="kicker">01 &middot; Literature survey</span>
        <h2>Where existing tools fall short</h2>
        <p>Automatic speech recognition systems such as Whisper are trained predominantly on fluent speech. On speech containing stuttering, blocks or atypical articulation, reported word error rates climb to 60 to 80 percent. That makes fluency metrics derived naively from a transcript (words per minute, articulation rate, dysfluency density) unreliable exactly where they matter most.</p>
        <p>Dedicated stuttering event classifiers, for example models trained on the SEP-28k dataset, improve event level detection but need labelled, disorder specific data that is scarce and expensive to collect. Existing consumer and clinical screening tools are almost always evaluated only in clean, lab recorded conditions, so their behaviour in noisy, real world environments is largely unverified.</p>
        <p>Screening protocols built around a single elicitation task, typically reading a fixed passage aloud, are also known to underestimate severity in speakers whose fluency varies across conversational, descriptive and read aloud contexts.</p>
        ${figure("missed", "problem-missed.jpg", "<strong>Figure 1.</strong> Manual observation compared with digital speech analysis: subtle signs such as w for r substitution, cluster simplification and irregular intonation are easy to overlook.", "Comparison of manual observation and AI speech analysis for a child's speech")}
      </div>

      <div class="doc-section" id="research-gap">
        <span class="kicker">02 &middot; Research gap</span>
        <h2>What no existing system handles together</h2>
        <p>Most speech practice apps focus on pronunciation drills, word repetition and simple star based feedback. Manual review produces scattered notes and inconsistent observations. Neither delivers a complete, explainable screening and therapy workflow.</p>
        <div class="figure-row">
          ${figure("apps", "gap-basic-apps.jpg", "<strong>Figure 2.</strong> Basic practice apps compared with the missing AI screening and therapy modules.", "Basic speech practice apps and what is missing")}
          ${figure("results", "gap-unclear-results.jpg", "<strong>Figure 3.</strong> Unstructured manual results compared with structured, explainable AI results.", "Unclear manual results compared with structured explainable AI results")}
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Capability</th><th>Manual screening</th><th>Basic practice apps</th><th>SpeakFree</th></tr></thead>
            <tbody>
              <tr><td>Confidence aware ASR scoring on disordered speech</td><td class="no">No</td><td class="part">Limited</td><td class="yes">Yes</td></tr>
              <tr><td>Phoneme level articulation analysis</td><td class="part">Expert dependent</td><td class="no">No</td><td class="yes">Yes</td></tr>
              <tr><td>Severity prediction with probabilities</td><td class="part">Subjective</td><td class="no">No</td><td class="yes">Yes</td></tr>
              <tr><td>Personalised, adaptive therapy plan</td><td class="part">Manual</td><td class="no">No</td><td class="yes">Yes</td></tr>
              <tr><td>Explainable, structured results</td><td class="no">No</td><td class="no">No</td><td class="yes">Yes</td></tr>
              <tr><td>Evaluated on noisy, browser recorded audio</td><td class="no">Not applicable</td><td class="no">Rarely</td><td class="yes">Yes</td></tr>
              <tr><td>Therapist correction of automated scoring</td><td class="part">Not applicable</td><td class="no">No</td><td class="yes">Yes</td></tr>
            </tbody>
          </table>
        </div>
        <ul class="bullets" style="margin-top:22px">
          <li>No system combines confidence aware ASR with acoustic feature extraction specifically to keep fluency metrics clinically meaningful when transcription itself is unreliable.</li>
          <li>No evaluation of a screening pipeline exists under realistic, noisy, browser recorded conditions rather than curated lab audio.</li>
          <li>No integrated platform carries a user from initial screening through articulation analysis, severity classification and ongoing privacy preserving therapy support in one system.</li>
          <li>Few home practice tools let a therapist's expert judgement actually correct an automated scoring model, rather than treating it as a one off satisfaction survey.</li>
        </ul>
      </div>

      <div class="doc-section" id="research-problem">
        <span class="kicker">03 &middot; Research problem</span>
        <h2>One problem, four sub problems</h2>
        <div class="callout orange">Affordable, accessible speech disorder screening and therapy support does not currently exist as a single, privacy respecting online pipeline that works in noisy, real world conditions.</div>
        <p>The overall problem is addressed through four interdependent sub problems, one per team member:</p>
        <div class="grid grid-2">
          <div class="card"><span class="tag">Component 1</span><h3>Noise robust feature extraction</h3><p>How can fluency metrics stay clinically meaningful when ASR is unreliable on disordered, noisy speech?</p></div>
          <div class="card"><span class="tag">Component 2</span><h3>Phoneme level articulation analysis</h3><p>How can articulation errors be located and classified accurately at the phoneme level?</p></div>
          <div class="card"><span class="tag">Component 3</span><h3>AI based severity prediction</h3><p>How can fluency and articulation signals be fused into a reliable, explainable severity level?</p></div>
          <div class="card"><span class="tag">Component 4</span><h3>Privacy preserving therapy support</h3><p>How can home therapy adapt to each user while staying correctable by experts and protecting privacy?</p></div>
        </div>
      </div>

      <div class="doc-section" id="research-objectives">
        <span class="kicker">04 &middot; Research objectives</span>
        <h2>Main and specific objectives</h2>
        <div class="callout"><strong>Main objective:</strong> to design, build and evaluate an AI based online platform that screens speech disorders from browser recorded speech, explains its findings, predicts severity and delivers personalised, privacy preserving therapy support.</div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Component</th><th>Specific objective</th></tr></thead>
            <tbody>
              <tr><td>1, Screening and ASR</td><td>Develop a confidence aware ASR and noise robust feature extraction pipeline that keeps fluency metrics clinically meaningful on disordered, real world speech.</td></tr>
              <tr><td>2, Articulation</td><td>Develop phoneme level forced alignment and articulation error detection on top of Component 1's clean speech features.</td></tr>
              <tr><td>3, Severity</td><td>Develop an AI model that classifies overall speech disorder severity reliably and explainably from the upstream fluency and articulation signals.</td></tr>
              <tr><td>4, Therapy</td><td>Develop a privacy preserving, expert correctable adaptive learning module for personalised home therapy and progress tracking.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="doc-section" id="methodology">
        <span class="kicker">05 &middot; Methodology</span>
        <h2>A design science, component integrated approach</h2>
        <p>The project follows a design science methodology. Each component is a working software artefact, evaluated against its design intent through automated testing, manual end to end scenarios and, for Component 4, a structured expert rating and recalibration workflow. Components are developed independently against an agreed JSON interface contract and integrated in scheduled sessions, with session identifiers linking a single screening session's results across all four components.</p>
        <h3>System architecture</h3>
        <p>A React frontend records the speech tasks and sends the audio (.webm or .wav) to a FastAPI backend, which handles authentication, file validation and task management, stores data in PostgreSQL and forwards the audio over a secure HTTPS call to the AI analysis pipeline.</p>
        ${figure("arch", "architecture.jpg", "<strong>Figure 4.</strong> SpeakFree architecture: React frontend, FastAPI backend and AI analysis pipeline.", "SpeakFree system architecture diagram")}

        <div class="component-block">
          <span class="tag">Component 1 &middot; ${TEAM[0].name}</span>
          <h3>Speech input processing and ASR score output</h3>
          <ol class="pipeline"><li>Speech recording</li><li>Waveform extraction</li><li>ASR processing</li><li>Score output</li><li>JSON result</li></ol>
          <div class="split">
            <div>
              <p>Speech is captured in the browser, denoised and segmented with voice activity detection. Whisper produces the transcript and confidence, while HuBERT embeddings and Librosa acoustic features keep fluency measures meaningful even when the transcript is unreliable.</p>
              <p>Output: word accuracy, fluency score, pronunciation score and duration, delivered as structured JSON through a secure API.</p>
            </div>
            ${figure("m1", "c1-asr.jpg", "<strong>Figure 5.</strong> Speech input processing and ASR score output.", "Component 1 ASR pipeline")}
          </div>
        </div>

        <div class="component-block">
          <span class="tag">Component 2 &middot; ${TEAM[1].name}</span>
          <h3>Speech alignment and articulation analysis</h3>
          <ol class="pipeline"><li>Speech input</li><li>Audio and spectrogram</li><li>Forced alignment</li><li>Phoneme segmentation</li><li>Articulation analysis</li></ol>
          <div class="split">
            <div>
              <p>Words and phonemes are force aligned to the audio so each sound has a start time, end time and boundary confidence. Each phoneme is then rated as accurate, a minor deviation or a misarticulation.</p>
              <p>Output: phoneme accuracy, timing deviation, boundary confidence, word timing consistency, misarticulation rate and flags such as /r/ to /w/ substitution or affricate distortion.</p>
            </div>
            ${figure("m2", "c2-articulation.jpg", "<strong>Figure 6.</strong> Phoneme level timing, forced alignment and articulation accuracy.", "Component 2 articulation analysis")}
          </div>
        </div>

        <div class="component-block">
          <span class="tag">Component 3 &middot; ${TEAM[2].name}</span>
          <h3>AI severity prediction and decision support</h3>
          <div class="split">
            <div>
              <p>Fluency and articulation features are fused to predict a severity class (Mild 0 to 33, Moderate 34 to 66, Severe 67 to 100) with class probabilities, a 0 to 100 severity score and a confidence value.</p>
              <p>Dimension scores for speech clarity, fluency impact, articulation impact and functional communication drive a risk level and a recommended action. Predictions support, but do not replace, clinical judgement.</p>
            </div>
            ${figure("m3", "c3-severity.jpg", "<strong>Figure 7.</strong> AI severity prediction dashboard for clinical decision support.", "Component 3 severity prediction dashboard")}
          </div>
        </div>

        <div class="component-block">
          <span class="tag">Component 4 &middot; ${TEAM[3].name}</span>
          <h3>Personalised therapy recommendations and progress tracking</h3>
          <div class="split">
            <div>
              <p>A contextual bandit planner selects exercises (breathing, syllable repetition, articulation drills, minimal pairs, reading aloud and sentence fluency) based on disorder type, severity, weak areas and progress history.</p>
              <p>An expert recalibratable scoring model lets clinicians correct automated scores, a conversational assistant guides home practice, and differential privacy protects cohort reports shared with therapists.</p>
            </div>
            ${figure("m4", "c4-therapy.jpg", "<strong>Figure 8.</strong> Personalised therapy recommendations and progress tracking.", "Component 4 therapy and progress dashboard")}
          </div>
        </div>
      </div>

      <div class="doc-section" id="technologies">
        <span class="kicker">06 &middot; Technologies used</span>
        <h2>Shared and component specific technology stack</h2>
        <div class="grid grid-2">
          <div class="card"><div class="icon">${icon("brain")}</div><h3>Speech and machine learning</h3><p>Speech recognition, embeddings, acoustic features and model training.</p>
            <div class="tech-list"><span>Whisper</span><span>HuBERT</span><span>PyTorch</span><span>Hugging Face Transformers</span><span>scikit-learn</span><span>Librosa</span><span>WebRTC VAD</span><span>noisereduce</span></div></div>
          <div class="card"><div class="icon">${icon("code")}</div><h3>Backend</h3><p>REST API, background processing and validation.</p>
            <div class="tech-list"><span>Python</span><span>FastAPI</span><span>Uvicorn</span><span>Pydantic</span><span>Celery</span><span>Redis</span></div></div>
          <div class="card"><div class="icon">${icon("mic")}</div><h3>Frontend</h3><p>In browser recording and the assessment interface.</p>
            <div class="tech-list"><span>React (Vite)</span><span>TypeScript</span><span>Tailwind CSS</span><span>Web Audio API</span><span>MediaRecorder</span></div></div>
          <div class="card"><div class="icon">${icon("db")}</div><h3>Data, security and collaboration</h3><p>Storage, secure communication and shared version control.</p>
            <div class="tech-list"><span>PostgreSQL</span><span>JWT</span><span>HTTPS</span><span>Git</span><span>GitHub</span></div></div>
        </div>
      </div>

    </div>
  </div>
</section>
`);

// ---------------------------------------------------------------- Milestones

page("milestones.html", "milestones", "Milestones",
  "Assessments and deadlines of the SpeakFree research project, with dates, marks allocated and status.",
  pageHead("Milestones", "Every assessment in the 2026 Regular Batch research project timeline. Open a milestone to see its details, date and marks allocated.") + `
<section>
  <div class="container">
    <div class="section-head">
      <span class="kicker">At a glance</span>
      <h2>Assessment timeline</h2>
      <p>Dates are taken from the course page's "2026 Regular Batch, Timeline of the RP Project". Status is shown as of October 2026.</p>
    </div>
    <div class="table-wrap ms-overview" style="margin-bottom:44px">
      <table>
        <thead><tr><th>Milestone</th><th>Date</th><th>Marks allocated</th><th>Status</th></tr></thead>
        <tbody>
          ${MILESTONES.map((m) => `<tr><td><a href="#${m.id}">${m.title}</a></td><td>${m.date}</td><td>${m.marks || "To be confirmed"}</td><td><span class="status ${m.status}">${STATUS_LABEL[m.status]}</span></td></tr>`).join("\n          ")}
        </tbody>
      </table>
    </div>

    <div class="section-head">
      <span class="kicker">Details</span>
      <h2>Choose a milestone</h2>
    </div>
    <div class="ms-list">
      ${MILESTONES.map((m, i) => `<details class="milestone is-${m.status}" id="${m.id}"${m.status === "next" && m.id === "final" ? " open" : ""}>
        <summary>
          <span class="ms-num">${String(i + 1).padStart(2, "0")}</span>
          <span><span class="ms-title">${m.title}</span><span class="ms-date">${m.date}</span></span>
          <span class="status ${m.status}">${STATUS_LABEL[m.status]}</span>
          <span class="ms-marks">Marks: ${m.marks || "TBC"}</span>
          <span class="chev" aria-hidden="true"></span>
        </summary>
        <div class="ms-body">
          <p>${m.text}</p>
          <dl>
            <dt>Date</dt><dd>${m.date}</dd>
            <dt>Marks allocated</dt><dd>${m.marks || "To be confirmed by the RP team"}</dd>
            <dt>Deliverables</dt><dd>${m.deliverables}</dd>
            <dt>Status</dt><dd>${STATUS_LABEL[m.status]}</dd>
          </dl>
        </div>
      </details>`).join("\n      ")}
    </div>
  </div>
</section>
`);

// ---------------------------------------------------------------- Documents

function docCard(d, kind) {
  const ext = kind === "slides" ? "PPT" : "PDF";
  const links = d.href
    ? `<a href="${d.href}" class="chip" target="_blank" rel="noopener">View</a><a href="${d.href}" class="chip" download>Download</a>`
    : `<span class="chip muted">Pending</span>`;
  return `<article class="card doc-card${kind === "slides" ? " slides" : ""}${d.href ? "" : " pending"}">
        <div class="file">${ext}</div>
        <div>
          <h3>${d.title}</h3>
          <div class="doc-meta">${d.date ? d.date + " &middot; " : ""}${d.meta}</div>
          <div class="doc-links">${links}</div>
        </div>
      </article>`;
}

page("documents.html", "documents", "Documents",
  "Project documents produced by the SpeakFree team, from the project charter to the final theses.",
  pageHead("Documents", "All documents produced from the start of the research project to the final stage. Items still in progress are marked as pending.") + `
<section>
  <div class="container">
    ${DOCUMENTS.map((g) => `<div class="doc-group">
      <h2>${g.group} <span class="count">${g.items.length}</span></h2>
      <div class="grid grid-3">
      ${g.items.map((d) => docCard(d)).join("\n      ")}
      </div>
    </div>`).join("\n    ")}
  </div>
</section>
`);

// ---------------------------------------------------------------- Presentations

page("presentations.html", "presentations", "Presentations",
  "Slides from each SpeakFree research project presentation.",
  pageHead("Presentations", "Slide decks used at each milestone presentation, with space for the final presentation.") + `
<section>
  <div class="container">
    <div class="grid grid-2">
      ${PRESENTATIONS.map((p) => docCard(p, "slides")).join("\n      ")}
    </div>
  </div>
</section>
`);

// ---------------------------------------------------------------- About

page("about.html", "about", "About Us",
  "The SpeakFree research team, supervisors and contact details.",
  pageHead("About Us", "The four person team behind SpeakFree, each owning one component of the integrated solution.") + `
<section>
  <div class="container">
    <div class="profile rise">
      <div class="profile-logo">
        <img src="assets/logo/logo-icon.svg" alt="SpeakFree logo" width="132" height="132">
        <div class="wordmark">Speak<span class="free">Free</span></div>
        <div class="wordmark-sub">AI Based Speech Disorder Screening and Therapy Assistant</div>
        <div class="wordmark-tag">Empowering Voices. Enhancing Lives.</div>
      </div>
      <div class="profile-body">
        <span class="kicker">Project profile</span>
        <h2>AI Based Speech Disorder Screening and Therapy Assistant</h2>
        <dl class="facts">
          <div><dt>Project ID</dt><dd>R26-IT-086</dd></div>
          <div><dt>Module</dt><dd>IT4010 Research Project</dd></div>
          <div><dt>Batch</dt><dd>2026 Regular Batch</dd></div>
          <div><dt>Department</dt><dd>Information Technology</dd></div>
          <div><dt>Institution</dt><dd>Sri Lanka Institute of Information Technology</dd></div>
          <div><dt>Research area</dt><dd>AI for speech and language health</dd></div>
        </dl>
        <div class="profile-team">
          <div class="faces">${TEAM.map((m) => `<img src="assets/photos/member-${m.c}.jpg" alt="${m.name}" width="52" height="52">`).join("")}</div>
          <span><strong>4 members, 4 components</strong>Supervised by ${SUPERVISORS.map((s) => s.name).join(" and ")}</span>
        </div>
      </div>
    </div>
  </div>
</section>

<section style="padding-top:0">
  <div class="container">
    <div class="section-head center">
      <span class="kicker">Group members</span>
      <h2>Meet the team</h2>
    </div>
    <div class="grid grid-4">
      ${TEAM.map((m) => `<article class="card member c${m.c} rise d${m.c}">
        <img class="photo" src="assets/photos/member-${m.c}.jpg" alt="Photo of ${m.name}" width="132" height="132" loading="lazy">
        <h3>${m.name}</h3>
        <div class="role">Component ${m.c}, ${m.component}</div>
        <div class="sid">${m.id}</div>
        <p>${m.blurb}</p>
        <a class="mail" href="mailto:${m.email}">${m.email}</a>
      </article>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="alt">
  <div class="container">
    <div class="section-head">
      <span class="kicker">Supervision</span>
      <h2>Supervisors</h2>
    </div>
    <div class="grid grid-2">
      ${SUPERVISORS.map((s) => `<div class="card supervisor">
        <div class="avatar">${s.initials}</div>
        <div><h3>${s.name}</h3><p>${s.role}, Department of Information Technology, Sri Lanka Institute of Information Technology</p></div>
      </div>`).join("\n      ")}
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="section-head">
      <span class="kicker">Highlights</span>
      <h2>Achievements so far</h2>
    </div>
    <ul class="checks">
      <li><strong>Research paper</strong> prepared on the SpeakFree research.</li>
      <li><strong>All four components</strong> integrated into one screening to therapy pipeline, demonstrated at Progress Presentation 2.</li>
    </ul>
  </div>
</section>
`);

// ---------------------------------------------------------------- Contact

const TEMPLATE_SUBJECT = "SpeakFree R26-IT-086: [Your subject]";
const TEMPLATE_BODY = "Dear SpeakFree Team,\n\nMy name is [Your name] from [Organisation].\n\nI am contacting you regarding [research / collaboration / website / other].\n\n[Your message]\n\nKind regards,\n[Your name]\n[Phone number]";
const mailto = `mailto:${TEAM[0].email}?cc=${TEAM.slice(1).map((m) => m.email).join(",")}&subject=${encodeURIComponent(TEMPLATE_SUBJECT)}&body=${encodeURIComponent(TEMPLATE_BODY)}`;

page("contact.html", "contact", "Contact Us",
  "Contact the SpeakFree research team.",
  pageHead("Contact Us", "Reach the team behind SpeakFree for questions about the research, collaboration or this website.") + `
<section>
  <div class="container contact-grid">
    <div class="card">
      <span class="kicker">General contacts</span>
      <h2 style="font-size:1.5rem">Get in touch</h2>
      ${TEAM.map((m) => `<div class="contact-item"><div class="icon">${icon("mail")}</div><div><strong>Component ${m.c}, ${m.name}</strong><a href="mailto:${m.email}">${m.email}</a></div></div>`).join("\n      ")}
      <div class="contact-item"><div class="icon">${icon("school")}</div><div><strong>Sri Lanka Institute of Information Technology</strong><span>New Kandy Road, Malabe, Sri Lanka</span></div></div>
    </div>
    <div class="card">
      <span class="kicker">Send a message</span>
      <h2 style="font-size:1.5rem">Write to the team</h2>
      <p>This form opens your e-mail app with the message addressed to the team.</p>
      <form class="contact-form" action="mailto:${TEAM[0].email}" method="post" enctype="text/plain">
        <div class="form-field"><label for="name">Name</label><input id="name" name="name" type="text" placeholder="Your name" required></div>
        <div class="form-field"><label for="email">E-mail</label><input id="email" name="email" type="email" placeholder="you@example.com" required></div>
        <div class="form-field"><label for="topic">Topic</label>
          <select id="topic" name="topic"><option>Research enquiry</option><option>Collaboration</option><option>Website feedback</option><option>Other</option></select></div>
        <div class="form-field"><label for="message">Message</label><textarea id="message" name="message" placeholder="How can we help?" required></textarea></div>
        <button type="submit" class="btn btn-primary">Send message</button>
      </form>
    </div>
  </div>
</section>

<section class="alt">
  <div class="container">
    <div class="section-head">
      <span class="kicker">General e-mail template</span>
      <h2>Use this template when e-mailing us</h2>
      <p>Copy the template below, or open it directly in your e-mail app with every team member already included.</p>
    </div>
    <pre class="template"><b>To:</b> ${TEAM.map((m) => m.email).join(", ")}
<b>Subject:</b> ${TEMPLATE_SUBJECT}

${TEMPLATE_BODY}</pre>
    <p style="margin-top:18px"><a class="btn btn-primary" href="${mailto.replace(/&/g, "&amp;")}">Open template in e-mail app</a></p>
  </div>
</section>
`);
