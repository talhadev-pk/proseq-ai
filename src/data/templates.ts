/**
 * The ProseQ AI template library.
 * Structures are HTML so they open directly in the writing editor.
 */
import type { WritingTemplate } from '@/types'

export const TEMPLATE_CATEGORIES: Array<{
  id: WritingTemplate['category']
  label: string
  blurb: string
}> = [
  { id: 'business', label: 'Business', blurb: 'Proposals, briefs, and summaries that keep teams aligned.' },
  { id: 'marketing', label: 'Marketing', blurb: 'Campaigns, product copy, and newsletters that convert.' },
  { id: 'education', label: 'Education', blurb: 'Notes, research summaries, and lesson plans.' },
  { id: 'communication', label: 'Professional Communication', blurb: 'Emails and letters that say the right thing.' },
  { id: 'creative', label: 'Creative Writing', blurb: 'Story shapes, characters, and journaling.' },
  { id: 'social', label: 'Social Media', blurb: 'Captions and posts built for each platform.' },
  { id: 'blogging', label: 'Blogging', blurb: 'Introductions, outlines, and article frameworks.' },
]

export const TEMPLATES: WritingTemplate[] = [
  /* --- Business ---------------------------------------------------------- */
  {
    id: 'tpl-business-proposal',
    name: 'Business Proposal',
    category: 'business',
    description: 'A persuasive proposal structure for pitching a project, service, or partnership.',
    purpose: 'Use when you need to win internal approval or a client signature.',
    structure: `<h1>[Proposal Title]</h1>
<p><strong>Prepared for:</strong> [Client / Stakeholder] · <strong>Date:</strong> [Date]</p>
<h2>1. The Problem</h2>
<p>Describe the challenge in the reader's own terms. Quantify it where you can — time lost, revenue missed, risk carried.</p>
<h2>2. The Proposed Solution</h2>
<p>Explain what you propose, in one or two plain sentences. Then list the three components of the work.</p>
<ul><li>Component one and its outcome</li><li>Component two and its outcome</li><li>Component three and its outcome</li></ul>
<h2>3. Why Us</h2>
<p>Two or three proof points. Stay factual — no superlatives you cannot defend.</p>
<h2>4. Timeline &amp; Investment</h2>
<p>Phases with dates, and the investment clearly stated. State what is and is not included.</p>
<h2>5. Next Step</h2>
<p>One clear call to action: what you want the reader to do, and by when.</p>`,
  },
  {
    id: 'tpl-project-brief',
    name: 'Project Brief',
    category: 'business',
    description: 'A one-page brief that aligns everyone before work begins.',
    purpose: 'Use at the start of any project to prevent scope drift.',
    structure: `<h1>[Project Name] — Brief</h1>
<h2>Objective</h2>
<p>One sentence: what this project achieves, and how we will know it worked.</p>
<h2>Background</h2>
<p>Why this, why now. Two short paragraphs maximum.</p>
<h2>Scope</h2>
<ul><li><strong>In scope:</strong> …</li><li><strong>Out of scope:</strong> …</li></ul>
<h2>Deliverables</h2>
<ol><li>[Deliverable] — owner — due date</li><li>[Deliverable] — owner — due date</li></ol>
<h2>Constraints &amp; Risks</h2>
<p>Budget, deadlines, dependencies, and the one risk most likely to bite.</p>`,
  },
  {
    id: 'tpl-meeting-summary',
    name: 'Meeting Summary',
    category: 'business',
    description: 'Capture decisions and owners — not transcripts.',
    purpose: 'Send within 24 hours of any meeting that decided anything.',
    structure: `<h1>Meeting Summary — [Topic]</h1>
<p><strong>Date:</strong> [Date] · <strong>Attendees:</strong> [Names]</p>
<h2>Decisions</h2>
<ol><li>[Decision made, and who made the call]</li><li>[Decision made, and who made the call]</li></ol>
<h2>Action Items</h2>
<ul><li>[Action] — <strong>Owner</strong> — due [date]</li><li>[Action] — <strong>Owner</strong> — due [date]</li></ul>
<h2>Open Questions</h2>
<p>Anything unresolved, plus who is chasing the answer.</p>`,
  },
  {
    id: 'tpl-executive-summary',
    name: 'Executive Summary',
    category: 'business',
    description: 'The one page a busy decision-maker will actually read.',
    purpose: 'Use at the top of reports and business cases.',
    structure: `<h1>Executive Summary</h1>
<h2>The Ask</h2>
<p>State the decision or resource you need in the first two lines.</p>
<h2>The Situation</h2>
<p>Three sentences of context. Assume intelligence, not familiarity.</p>
<h2>The Recommendation</h2>
<p>What you propose, the expected outcome, and the main risk — stated plainly.</p>
<h2>The Numbers</h2>
<p>Cost, return, timeline. A small table or three bullet points.</p>`,
  },
  /* --- Marketing --------------------------------------------------------- */
  {
    id: 'tpl-marketing-campaign',
    name: 'Marketing Campaign Brief',
    category: 'marketing',
    description: 'Plan a campaign from audience to measurement in one document.',
    purpose: 'Use before briefing designers, writers, or media buyers.',
    structure: `<h1>[Campaign Name] — Brief</h1>
<h2>Objective</h2>
<p>The single metric this campaign moves, and by how much.</p>
<h2>Audience</h2>
<p>Who they are, what they struggle with, where they already pay attention.</p>
<h2>Core Message</h2>
<p>One sentence a stranger could repeat after hearing it once.</p>
<blockquote>If we do nothing else, the reader must remember: [message]</blockquote>
<h2>Channels &amp; Assets</h2>
<ul><li>Channel — asset — owner</li><li>Channel — asset — owner</li></ul>
<h2>Measurement</h2>
<p>What we track, when we check it, and what result means "do more of this."</p>`,
  },
  {
    id: 'tpl-product-description',
    name: 'Product Description',
    category: 'marketing',
    description: 'Benefits-first product copy with a clear structure.',
    purpose: 'Use for product pages, catalogs, and marketplace listings.',
    structure: `<h1>[Product Name]</h1>
<p><strong>One-line promise:</strong> [What it does, for whom, in plain words]</p>
<h2>Why you'll reach for it</h2>
<p>Lead with the moment of use — the situation the buyer is actually in.</p>
<h2>What makes it different</h2>
<ul><li>[Feature] → which means [benefit]</li><li>[Feature] → which means [benefit]</li></ul>
<h2>The essentials</h2>
<p>Materials, dimensions, compatibility — the facts buyers check last.</p>
<p><em>Close with a single, low-pressure call to action.</em></p>`,
  },
  {
    id: 'tpl-newsletter',
    name: 'Newsletter Issue',
    category: 'marketing',
    description: 'A readable issue structure: one idea, one link, one note.',
    purpose: 'Use for weekly or monthly email updates.',
    structure: `<h1>[Newsletter Name] — Issue [#]</h1>
<h2>The one idea</h2>
<p>Open with a thought your reader can carry into their day. Short paragraphs. One idea only.</p>
<h2>Worth your time</h2>
<p>A link, a book, or a tool — with two sentences on why it earned the click.</p>
<h2>From the desk</h2>
<p>A personal note. What you are working on, what you are learning, what you got wrong.</p>
<blockquote>Until next time — [sign-off]</blockquote>`,
  },
  {
    id: 'tpl-press-release',
    name: 'Press Release',
    category: 'marketing',
    description: 'The classic inverted-pyramid announcement format.',
    purpose: 'Use for launches, milestones, and newsworthy company updates.',
    structure: `<h1>[Headline: what happened, in active voice]</h1>
<p><strong>FOR IMMEDIATE RELEASE</strong> — [City], [Date]</p>
<h2>[City, Date] — [Organization] today announced …</h2>
<p>First paragraph: the who, what, when, where, why. Assume it is the only paragraph that survives.</p>
<h2>Details</h2>
<p>Second paragraph: context and the quote that carries the emotion.</p>
<blockquote>"[Quote from a named person]," said [Name], [Title].</blockquote>
<h2>About [Organization]</h2>
<p>Two sentences of boilerplate.</p>
<p><strong>Media contact:</strong> [Name] · [Email]</p>`,
  },
  /* --- Education --------------------------------------------------------- */
  {
    id: 'tpl-study-notes',
    name: 'Study Notes',
    category: 'education',
    description: 'Cornell-style notes with questions for active recall.',
    purpose: 'Use during lectures and reading sessions.',
    structure: `<h1>[Subject] — [Topic]</h1>
<p><strong>Date:</strong> [Date] · <strong>Source:</strong> [Lecture / Chapter]</p>
<h2>Key Concepts</h2>
<ul><li><strong>[Concept]</strong> — definition in your own words</li><li><strong>[Concept]</strong> — definition in your own words</li></ul>
<h2>Details &amp; Examples</h2>
<p>The supporting explanation, one worked example, and anything the instructor repeated.</p>
<h2>Questions to Test Myself</h2>
<ol><li>[Question that forces recall]</li><li>[Question that connects two ideas]</li></ol>
<h2>Summary</h2>
<p>Three sentences: what this section is really about.</p>`,
  },
  {
    id: 'tpl-research-summary',
    name: 'Research Summary',
    category: 'education',
    description: 'Summarize a paper or source with proper structure.',
    purpose: 'Use while reviewing literature or preparing citations.',
    structure: `<h1>Summary — [Paper Title]</h1>
<p><strong>Authors:</strong> [Names] · <strong>Year:</strong> [Year] · <strong>Field:</strong> [Field]</p>
<h2>Research Question</h2>
<p>What the authors set out to answer, in one sentence.</p>
<h2>Method</h2>
<p>How they answered it — sample, approach, analysis.</p>
<h2>Findings</h2>
<ul><li>[Finding one]</li><li>[Finding two]</li></ul>
<h2>Limitations &amp; My Take</h2>
<p>What the study cannot claim, and how it relates to my own work.</p>`,
  },
  {
    id: 'tpl-lesson-plan',
    name: 'Lesson Plan',
    category: 'education',
    description: 'A lesson structured around objectives, not activities.',
    purpose: 'Use for teaching sessions and workshops.',
    structure: `<h1>Lesson Plan — [Title]</h1>
<p><strong>Duration:</strong> [minutes] · <strong>Level:</strong> [level] · <strong>Topic:</strong> [topic]</p>
<h2>Learning Objectives</h2>
<p>By the end, learners will be able to… (use observable verbs: explain, build, compare).</p>
<h2>Hook (5 min)</h2>
<p>A question, image, or problem that creates the need to know.</p>
<h2>Main Activities</h2>
<ol><li>Direct instruction — [minutes]</li><li>Guided practice — [minutes]</li><li>Independent work — [minutes]</li></ol>
<h2>Check for Understanding</h2>
<p>The exit ticket or question that proves the objective was met.</p>`,
  },
  {
    id: 'tpl-presentation-outline',
    name: 'Presentation Outline',
    category: 'education',
    description: 'A talk that argues, not a deck that lists.',
    purpose: 'Use before opening your slide software.',
    structure: `<h1>[Presentation Title]</h1>
<h2>The Promise</h2>
<p>What the audience will be able to do after twenty minutes with you.</p>
<h2>Opening</h2>
<p>The story, stat, or question that earns attention in the first thirty seconds.</p>
<h2>Three Points</h2>
<ol><li><strong>[Point one]</strong> — evidence — transition</li><li><strong>[Point two]</strong> — evidence — transition</li><li><strong>[Point three]</strong> — evidence — transition</li></ol>
<h2>Close</h2>
<p>Callback to the opening, then one specific ask.</p>`,
  },
  /* --- Professional Communication ---------------------------------------- */
  {
    id: 'tpl-professional-email',
    name: 'Professional Email',
    category: 'communication',
    description: 'Short, courteous, and structured for a reply.',
    purpose: 'Use for most day-to-day business correspondence.',
    structure: `<h1>Email — [Subject Line]</h1>
<p>Hi [Name],</p>
<p><strong>Purpose:</strong> [One sentence — why you are writing.]</p>
<p><strong>Context:</strong> [Two sentences of background. Only what the reader needs.]</p>
<p><strong>The ask:</strong> [Exactly what you need, by when.]</p>
<p>Happy to clarify anything — [closing line].</p>
<p>Best regards,<br/>[Your name]</p>`,
  },
  {
    id: 'tpl-cover-letter',
    name: 'Cover Letter',
    category: 'communication',
    description: 'A letter that argues fit, not a resume in paragraphs.',
    purpose: 'Use for job applications.',
    structure: `<h1>[Your Name]</h1>
<p>[City] · [Email] · [Date]</p>
<p>Dear [Hiring Manager],</p>
<h2>The hook</h2>
<p>Open with the one achievement or conviction that makes you right for <em>this</em> role — not any role.</p>
<h2>The fit</h2>
<p>Two short paragraphs mapping your experience to the job's two biggest needs. Name results with numbers where possible.</p>
<h2>The close</h2>
<p>State enthusiasm once, thank them briefly, and ask for the conversation.</p>
<p>Sincerely,<br/>[Your Name]</p>`,
  },
  {
    id: 'tpl-followup-email',
    name: 'Follow-Up Email',
    category: 'communication',
    description: 'A polite nudge that makes replying easy.',
    purpose: 'Use when you have not heard back after a meeting or proposal.',
    structure: `<h1>Email — Following up: [Original Topic]</h1>
<p>Hi [Name],</p>
<p>I wanted to gently bring [topic] back to the top of your inbox.</p>
<p>Where we left it: [one-sentence recap of the last concrete step].</p>
<p>To make this easy, I have attached [document / link]. A simple yes/no on [specific question] is all I need to keep moving.</p>
<p>If the timing has shifted, no problem at all — just let me know when to check back.</p>
<p>Best regards,<br/>[Your name]</p>`,
  },
  {
    id: 'tpl-outreach-message',
    name: 'Outreach Message',
    category: 'communication',
    description: 'A cold message that leads with value, not a favor.',
    purpose: 'Use for networking, partnerships, and guest-post pitches.',
    structure: `<h1>Outreach — [One-line topic]</h1>
<p>Hi [Name],</p>
<p><strong>The reason I am writing to you specifically:</strong> [something real — their work, a post, a shared interest]. Two sentences maximum.</p>
<p><strong>What I have in mind:</strong> [the proposal, stated concretely].</p>
<p><strong>Why it may be worth your time:</strong> [what is in it for them, honestly].</p>
<p>If it is not a fit, a one-line "not now" is completely fine.</p>
<p>Warmly,<br/>[Your name]</p>`,
  },
  /* --- Creative ---------------------------------------------------------- */
  {
    id: 'tpl-story-outline',
    name: 'Creative Story Outline',
    category: 'creative',
    description: 'A three-act shape with room to breathe.',
    purpose: 'Use before drafting short stories or novels.',
    structure: `<h1>[Working Title]</h1>
<p><strong>Genre:</strong> [genre] · <strong>Premise:</strong> [one sentence]</p>
<h2>Act I — The Setup</h2>
<p>Whose story is this, what do they want, and what stands in the way? End the act on the inciting incident.</p>
<h2>Act II — The Confrontation</h2>
<ul><li>Rising complication</li><li>The midpoint reversal</li><li>All is lost moment</li></ul>
<h2>Act III — The Resolution</h2>
<p>The choice that proves the character changed — or refused to.</p>
<h2>Notes</h2>
<p>Voice, tone, images you want to keep.</p>`,
  },
  {
    id: 'tpl-character-profile',
    name: 'Character Profile',
    category: 'creative',
    description: 'Know your character before the plot tests them.',
    purpose: 'Use during story planning.',
    structure: `<h1>[Character Name]</h1>
<p><strong>Role in story:</strong> [protagonist / antagonist / support]</p>
<h2>Surface</h2>
<p>Age, appearance, first impression they make on others.</p>
<h2>Interior</h2>
<ul><li><strong>Wants:</strong> [goal — concrete]</li><li><strong>Needs:</strong> [the deeper thing they cannot name]</li><li><strong>Fear:</strong> [what they avoid]</li><li><strong>Flaw:</strong> [the weakness that causes trouble]</li></ul>
<h2>Voice</h2>
<p>How they speak: rhythm, vocabulary, what they never say.</p>
<h2>A Defining Moment</h2>
<p>One scene from their past that explains who they are now.</p>`,
  },
  {
    id: 'tpl-poem-free-verse',
    name: 'Poem — Free Verse Draft',
    category: 'creative',
    description: 'A scaffold for a free-verse poem built on one image.',
    purpose: 'Use when an image or feeling will not leave you alone.',
    structure: `<h1>[Working Title]</h1>
<p>[Open with the image, not the feeling. Let the concrete carry the abstract.]</p>
<p>[Second stanza: turn the image — a shift in scale, time, or perspective.]</p>
<p>[Third stanza: complicate it. Introduce tension or a second image.]</p>
<p>[Close: land on the detail the reader will keep. Resist explaining.]</p>
<h2>Revision notes</h2>
<ul><li>Cut every adjective you can survive without</li><li>Read aloud once for rhythm</li></ul>`,
  },
  {
    id: 'tpl-journal-entry',
    name: 'Journal Entry',
    category: 'creative',
    description: 'A reflective structure for daily writing.',
    purpose: 'Use for morning pages or end-of-day reflection.',
    structure: `<h1>[Date]</h1>
<h2>Today in three words</h2>
<p>[Three words — no explanations allowed.]</p>
<h2>What happened</h2>
<p>The facts, briefly. Resist editorializing.</p>
<h2>What I noticed</h2>
<p>One detail you would otherwise forget by tomorrow.</p>
<h2>What I want to remember</h2>
<p>The lesson, the gratitude, or the intention — stated kindly.</p>`,
  },
  /* --- Social Media ------------------------------------------------------ */
  {
    id: 'tpl-social-caption',
    name: 'Social Media Caption',
    category: 'social',
    description: 'A caption with a hook, value, and a soft CTA.',
    purpose: 'Use for Instagram, Facebook, or LinkedIn image posts.',
    structure: `<h1>Caption — [Campaign / Post]</h1>
<h2>Hook (first line is everything)</h2>
<p>[A line that earns the "read more" tap. Curiosity, tension, or a bold claim you can defend.]</p>
<h2>Body</h2>
<p>[Two to four short lines of value: the tip, story, or takeaway.]</p>
<h2>Call to action</h2>
<p>[One soft ask: save, share, comment a keyword.]</p>
<h2>Hashtags</h2>
<p>[5–8 focused tags — mix reach and niche.]</p>`,
  },
  {
    id: 'tpl-linkedin-post',
    name: 'LinkedIn Post',
    category: 'social',
    description: 'A professional narrative post that respects the reader.',
    purpose: 'Use for thought leadership and career updates.',
    structure: `<h1>LinkedIn Post — [Topic]</h1>
<h2>Line 1 (the scroll-stopper)</h2>
<p>[A contrarian observation, a number, or the end of the story first.]</p>
<h2>The story</h2>
<p>[Short paragraphs, one idea each. White space is your friend.]</p>
<h2>The lesson</h2>
<p>[What you would tell someone one step behind you.]</p>
<h2>The invitation</h2>
<p>[A genuine question that invites comments — not engagement bait.]</p>`,
  },
  {
    id: 'tpl-x-thread',
    name: 'X / Twitter Thread',
    category: 'social',
    description: 'An eight-post thread that delivers one complete idea.',
    purpose: 'Use when a single post cannot carry the argument.',
    structure: `<h1>Thread — [Topic]</h1>
<h2>Post 1 — The promise</h2>
<p>[What the reader gets if they follow along. No "🧵" teasing without substance.]</p>
<h2>Posts 2–7 — The argument</h2>
<ol><li>[Point + one line of support]</li><li>[Point + one line of support]</li><li>[Point + one line of support]</li></ol>
<h2>Post 8 — The close</h2>
<p>[Summarize in one line, then point to your profile or a resource.]</p>`,
  },
  {
    id: 'tpl-launch-announcement',
    name: 'Launch Announcement',
    category: 'social',
    description: 'Announce something new without sounding like an ad.',
    purpose: 'Use across social channels on launch day.',
    structure: `<h1>Announcement — [What is launching]</h1>
<h2>The news, plainly</h2>
<p>[What it is, who it is for — in the first sentence.]</p>
<h2>The problem it removes</h2>
<p>[Describe the frustration your audience already feels.]</p>
<h2>What changes for them</h2>
<p>[The before → after, in concrete terms.]</p>
<h2>Where to get it</h2>
<p>[One link, one action. Done.]</p>`,
  },
  /* --- Blogging ---------------------------------------------------------- */
  {
    id: 'tpl-blog-introduction',
    name: 'Blog Introduction',
    category: 'blogging',
    description: 'An intro that earns the scroll.',
    purpose: 'Use at the top of any article.',
    structure: `<h1>[Working Post Title]</h1>
<h2>Opening line</h2>
<p>[A question, a scene, or a surprising fact. No "In today's world…"]</p>
<h2>The problem</h2>
<p>[Name the reader's frustration precisely — they should feel seen by paragraph two.]</p>
<h2>The promise</h2>
<p>[What the article delivers, stated concretely: "By the end, you will be able to…"]</p>
<h2>The roadmap</h2>
<p>[One sentence on how the piece is organized — then get out of the way.]</p>`,
  },
  {
    id: 'tpl-blog-outline',
    name: 'Blog Article Outline',
    category: 'blogging',
    description: 'A complete skeleton before drafting.',
    purpose: 'Use to plan any long-form article.',
    structure: `<h1>[Post Title]</h1>
<p><strong>Working thesis:</strong> [The one argument the whole post supports.]</p>
<h2>1. Introduction</h2>
<ul><li>Hook: [question / stat / scene]</li><li>Promise: [what the reader walks away with]</li></ul>
<h2>2. [Section: Background or context]</h2>
<ul><li>Sub-point + evidence</li></ul>
<h2>3. [Section: The main argument, part one]</h2>
<ul><li>Sub-point + example</li></ul>
<h2>4. [Section: The main argument, part two]</h2>
<ul><li>Sub-point + counter-argument handling</li></ul>
<h2>5. Practical steps</h2>
<ul><li>What to do first</li><li>What to do next</li></ul>
<h2>6. Conclusion</h2>
<ul><li>Recap thesis, end with one action</li></ul>`,
  },
  {
    id: 'tpl-listicle',
    name: 'Listicle Framework',
    category: 'blogging',
    description: 'A list post where every item earns its number.',
    purpose: 'Use for "N ways / N mistakes" posts.',
    structure: `<h1>[Number] [Adjective] [Things] for [Audience]</h1>
<h2>Intro</h2>
<p>[Why this list exists, and the criteria for making it. Two paragraphs.]</p>
<h2>1. [First item — the strongest]</h2>
<p>[What it is, why it works, one example. 80–120 words per item.]</p>
<h2>2. [Second item]</h2>
<p>[Same structure. Vary the openings.]</p>
<h2>3. [Third item]</h2>
<p>[Same structure.]</p>
<h2>The wrap</h2>
<p>[Which item to start with, and why. One paragraph.]</p>`,
  },
  {
    id: 'tpl-seo-blog-brief',
    name: 'SEO Blog Brief',
    category: 'blogging',
    description: 'A brief that keeps the writer and the search intent aligned.',
    purpose: 'Use before commissioning or writing search-targeted content.',
    structure: `<h1>SEO Brief — [Target Keyword]</h1>
<h2>Search intent</h2>
<p>[What the searcher actually wants. Informational / comparison / transactional.]</p>
<h2>Primary &amp; secondary keywords</h2>
<ul><li>Primary: [keyword]</li><li>Secondary: [variants and questions]</li></ul>
<h2>Outline</h2>
<ol><li>H2: [section]</li><li>H2: [section]</li><li>H2: [section]</li></ol>
<h2>Must-answer questions</h2>
<p>[From People-also-ask style research.]</p>
<h2>Meta description draft</h2>
<p>[150–160 characters, active voice, includes the primary keyword once.]</p>`,
  },
]

export function templatesByCategory(category: WritingTemplate['category'] | 'all'): WritingTemplate[] {
  return category === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.category === category)
}

export function getTemplate(id: string): WritingTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id)
}
