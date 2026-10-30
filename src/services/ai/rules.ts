/**
 * Lexicons and rule tables for the local demonstration AI engine.
 * These are deliberately transparent, rule-based transformations —
 * NOT a real language model. Results are always labeled as simulated.
 */
import type { ToneId } from '@/types'

/** Common English stopwords for keyword extraction. */
export const STOPWORDS = new Set(
  `a about above after again against all am an and any are aren't as at be because been before being below
  between both but by can cannot could couldn't did didn't do does doesn't doing don't down during each few for
  from further had hadn't has hasn't have haven't having he her here hers herself him himself his how i if in
  into is isn't it its itself just let's me more most mustn't my myself no nor not of off on once only or other
  ought our ours ourselves out over own same shan't she should shouldn't so some such than that the their theirs
  them themselves then there these they this those through to too under until up very was wasn't we were weren't
  what when where which while who whom why with won't would wouldn't you your yours yourself yourselves`
    .split(/\s+/)
    .filter(Boolean),
)

/** Spelling fixes applied by the grammar tool. */
export const SPELLING_FIXES: Record<string, string> = {
  teh: 'the',
  recieve: 'receive',
  recieved: 'received',
  seperate: 'separate',
  definately: 'definitely',
  occured: 'occurred',
  alot: 'a lot',
  untill: 'until',
  wich: 'which',
  thier: 'their',
  adress: 'address',
  accomodate: 'accommodate',
  arguement: 'argument',
  begining: 'beginning',
  calender: 'calendar',
  embarass: 'embarrass',
  enviroment: 'environment',
  goverment: 'government',
  independant: 'independent',
  neccessary: 'necessary',
  occassion: 'occasion',
  publically: 'publicly',
  reccomend: 'recommend',
  refered: 'referred',
  sucessful: 'successful',
  sucessfully: 'successfully',
  wierd: 'weird',
  buisness: 'business',
  bussiness: 'business',
  acheive: 'achieve',
  beleive: 'believe',
  basicly: 'basically',
  tomorow: 'tomorrow',
  truely: 'truly',
  useing: 'using',
  writting: 'writing',
  greatful: 'grateful',
  persue: 'pursue',
  reherse: 'rehearse',
  responsability: 'responsibility',
}

/** Wordy phrase → tighter replacement (used by Improve / Shorten / Concise). */
export const WORDY_PHRASES: Array<[RegExp, string]> = [
  [/\bin order to\b/gi, 'to'],
  [/\bdue to the fact that\b/gi, 'because'],
  [/\bat this point in time\b/gi, 'now'],
  [/\ba large number of\b/gi, 'many'],
  [/\bthe majority of\b/gi, 'most'],
  [/\bhas the ability to\b/gi, 'can'],
  [/\bhave the ability to\b/gi, 'can'],
  [/\bis able to\b/gi, 'can'],
  [/\bare able to\b/gi, 'can'],
  [/\bin the event that\b/gi, 'if'],
  [/\bprior to\b/gi, 'before'],
  [/\bsubsequent to\b/gi, 'after'],
  [/\bmake a decision\b/gi, 'decide'],
  [/\bgive consideration to\b/gi, 'consider'],
  [/\bfor the purpose of\b/gi, 'for'],
  [/\bin the near future\b/gi, 'soon'],
  [/\bon a daily basis\b/gi, 'daily'],
  [/\bin spite of the fact that\b/gi, 'although'],
  [/\bwith regard to\b/gi, 'about'],
  [/\bin reference to\b/gi, 'about'],
]

/** Filler words removed by Improve / Shorten. */
export const FILLER_WORDS = [
  'very',
  'really',
  'quite',
  'actually',
  'basically',
  'literally',
  'simply',
  'totally',
  'definitely',
  'absolutely',
  'honestly',
  'seriously',
  'essentially',
  'virtually',
]

/** Hedge phrases removed by the Confident tone. */
export const HEDGES: RegExp[] = [
  /\bI think that\b/gi,
  /\bI think\b/g,
  /\bI believe that\b/gi,
  /\bI believe\b/g,
  /\bIn my opinion,?\s*/gi,
  /\bIt seems like\b/gi,
  /\bIt seems\b/gi,
  /\bmight be able to\b/gi,
  /\bperhaps\b/gi,
  /\bmaybe\b/gi,
  /\bsort of\b/gi,
  /\bkind of\b/gi,
  /\bhopefully\b/gi,
  /\bpossibly\b/gi,
  /\bjust wanted to\b/gi,
]

/** Substitution lexicons per tone. Applied word-by-word, case preserved. */
export const TONE_LEXICON: Record<ToneId, Record<string, string>> = {
  professional: {
    utilize: 'use',
    commence: 'start',
    terminate: 'end',
    ascertain: 'find out',
    endeavor: 'try',
    facilitate: 'help',
    demonstrate: 'show',
    subsequently: 'later',
    'in conclusion': 'to close',
    stuff: 'material',
    things: 'items',
    awesome: 'excellent',
    huge: 'significant',
    big: 'substantial',
    get: 'obtain',
    kids: 'children',
  },
  friendly: {
    utilize: 'use',
    commence: 'start',
    assist: 'help',
    furthermore: 'also',
    however: 'but',
    therefore: 'so',
    request: 'ask',
    regarding: 'about',
    obtain: 'get',
    purchase: 'buy',
    additional: 'more',
    require: 'need',
    endeavor: 'try',
    'prior to': 'before',
    subsequently: 'later',
    approximately: 'about',
    sufficient: 'enough',
    numerous: 'plenty of',
  },
  formal: {
    use: 'employ',
    help: 'assist',
    show: 'demonstrate',
    start: 'commence',
    end: 'conclude',
    get: 'obtain',
    buy: 'purchase',
    need: 'require',
    ask: 'request',
    'a lot of': 'a considerable amount of',
    'lots of': 'a considerable amount of',
    big: 'significant',
    kids: 'children',
    stuff: 'material',
    find_out: 'determine',
    'look at': 'examine',
    'find out': 'determine',
  },
  confident: {
    maybe: 'certainly',
    perhaps: 'undoubtedly',
    possible: 'proven',
    good: 'excellent',
    nice: 'outstanding',
    tries: 'delivers',
    attempts: 'delivers',
    'could work': 'works',
    'we hope': 'we are certain',
    'we think': 'we know',
  },
  concise: {
    utilize: 'use',
    facilitate: 'help',
    demonstrate: 'show',
    approximately: 'about',
    numerous: 'many',
    sufficient: 'enough',
    additional: 'more',
    currently: 'now',
    'at the present time': 'now',
  },
  persuasive: {
    good: 'remarkable',
    great: 'exceptional',
    useful: 'invaluable',
    important: 'critical',
    helps: 'transforms',
    works: 'delivers results',
    fast: 'rapid',
    easy: 'effortless',
    better: 'superior',
    try: 'experience',
    'you can': 'you can truly',
  },
  academic: {
    shows: 'demonstrates',
    show: 'demonstrate',
    helps: 'facilitates',
    help: 'facilitate',
    use: 'employ',
    uses: 'employs',
    'look at': 'examine',
    'find out': 'determine',
    think: 'posit',
    big: 'substantial',
    huge: 'considerable',
    'a lot of': 'a substantial amount of',
    'lots of': 'a substantial amount of',
    proves: 'suggests',
    kids: 'children',
    stuff: 'material',
    end: 'conclude',
    start: 'commence',
  },
}

/** Contractions used to formalize / relax text. */
export const CONTRACTIONS: Array<[RegExp, string]> = [
  [/\bdon't\b/g, 'do not'],
  [/\bcan't\b/g, 'cannot'],
  [/\bwon't\b/g, 'will not'],
  [/\bisn't\b/g, 'is not'],
  [/\baren't\b/g, 'are not'],
  [/\bwasn't\b/g, 'was not'],
  [/\bweren't\b/g, 'were not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bdidn't\b/g, 'did not'],
  [/\bshouldn't\b/g, 'should not'],
  [/\bcouldn't\b/g, 'could not'],
  [/\bwouldn't\b/g, 'would not'],
  [/\bit's\b/g, 'it is'],
  [/\bthat's\b/g, 'that is'],
  [/\bthere's\b/g, 'there is'],
  [/\bwe're\b/g, 'we are'],
  [/\bthey're\b/g, 'they are'],
  [/\byou're\b/g, 'you are'],
  [/\bI'm\b/g, 'I am'],
  [/\bwe've\b/g, 'we have'],
  [/\bthey've\b/g, 'they have'],
  [/\byou've\b/g, 'you have'],
  [/\bI've\b/g, 'I have'],
  [/\bwe'll\b/g, 'we will'],
  [/\byou'll\b/g, 'you will'],
  [/\bI'll\b/g, 'I will'],
]

/** Modest paraphrase thesaurus for Rewrite Paragraph. */
export const PARAPHRASE_THESAURUS: Record<string, string> = {
  important: 'essential',
  essential: 'critical',
  show: 'demonstrate',
  demonstrates: 'illustrates',
  big: 'substantial',
  good: 'strong',
  great: 'excellent',
  bad: 'poor',
  fast: 'rapid',
  slow: 'gradual',
  make: 'create',
  makes: 'creates',
  help: 'support',
  helps: 'supports',
  use: 'apply',
  uses: 'applies',
  think: 'consider',
  change: 'transform',
  changes: 'transforms',
  problem: 'challenge',
  problems: 'challenges',
  idea: 'concept',
  ideas: 'concepts',
  thing: 'element',
  things: 'elements',
  said: 'noted',
  says: 'notes',
  people: 'individuals',
  start: 'begin',
  started: 'began',
  end: 'finish',
  ended: 'finished',
  hard: 'demanding',
  easy: 'straightforward',
  new: 'fresh',
  old: 'established',
  find: 'identify',
  found: 'identified',
  build: 'construct',
  keep: 'maintain',
  give: 'provide',
  gives: 'provides',
  take: 'adopt',
  know: 'understand',
  clear: 'evident',
  simple: 'uncomplicated',
}

/** Sentence openers sprinkled by the Rewrite tool. */
export const TRANSITION_OPENERS = [
  'Beyond that,',
  'What is more,',
  'Equally important,',
  'Notably,',
  'In addition,',
  'At the same time,',
]

/** Angle templates used by Generate Ideas. */
export const IDEA_ANGLES: Array<{ title: string; template: string }> = [
  {
    title: 'A practical how-to guide',
    template:
      'Write a step-by-step guide: "How to {topic} — from first draft to finished piece", with one concrete action per step.',
  },
  {
    title: 'Common mistakes',
    template:
      'List the five mistakes people make when they {topic_short}, and how a careful writer avoids each one.',
  },
  {
    title: 'A beginner explainer',
    template:
      'Create a plain-language primer on {topic} for someone who has never attempted it before — define every term you use.',
  },
  {
    title: 'A comparison piece',
    template:
      'Compare two contrasting approaches to {topic} in a side-by-side breakdown, ending with guidance on choosing between them.',
  },
  {
    title: 'A case study',
    template:
      'Tell the story of one realistic (clearly illustrative) example where {topic} made the difference between failure and success.',
  },
  {
    title: 'A checklist',
    template:
      'Design a ten-point review checklist that helps a writer verify their {topic_short} is ready to publish.',
  },
  {
    title: 'A myth-busting post',
    template:
      'Take three widely believed myths about {topic} and refute each one with a calm, factual explanation.',
  },
  {
    title: 'An FAQ',
    template:
      'Collect the eight questions people most often ask about {topic} and answer each in two or three sentences.',
  },
]
