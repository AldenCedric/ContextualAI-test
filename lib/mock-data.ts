import { Material, AssistanceMode, MaterialType, LanguageMode } from "./types";

export const mockMaterials: Material[] = [
  {
    id: "photosynthesis-activity",
    title: "Photosynthesis Activity",
    type: "Activity",
    description:
      "Explain the biochemical process of photosynthesis and identify the specific roles of sunlight, water, carbon dioxide, and glucose.",
    instructions:
      "Activity Objective:\n1. Diagram the light-dependent reactions in the thylakoid membrane and the Calvin cycle in the stroma.\n2. Explain the biochemical role of glucose as an energy storage molecule.\n3. Compare reactant inputs (H2O, CO2, photon energy) to chemical outputs (C6H12O6, O2).\n4. Format your submission in 2-3 structured paragraphs with chemical equations balanced.",
    content:
      "Section A: Light Reactions\nPhotons excite electrons in Photosystem II (P680), initiating photolysis of H2O into protons, electrons, and O2 gas. Electrons transfer along the electron transport chain (ETC) to Photosystem I (P700), generating NADPH and establishing a proton gradient across the thylakoid membrane to drive ATP synthase.\n\nSection B: Calvin Cycle (Dark Reactions)\nIn the stroma, Ribulose-1,5-bisphosphate (RuBP) fixes carbon dioxide catalyzed by the RuBisCO enzyme. ATP and NADPH reduce 3-phosphoglycerate (3-PGA) into glyceraldehyde-3-phosphate (G3P), which condenses to form glucose (C6H12O6).",
    progress: 30,
    status: "in-progress",
    deadline: "2024-12-10",
    currentTask: "Explain the role of glucose in photosynthesis.",
    studentAnswer: "",
  },
  {
    id: "academic-stress-handout",
    title: "Academic Stress Handout",
    type: "Handout",
    description:
      "Review the clinical literature on academic stressors, sleep architecture disruption, and neurocognitive performance in undergraduate students.",
    instructions:
      "Handout Reading & Synthesis Tasks:\n1. Read sections on cortisol circadian rhythms and non-REM sleep reduction during exam periods.\n2. Answer Question 3: How does chronic academic stress disrupt the bidirectional cortisol-sleep consolidation loop?\n3. Propose two evidence-based behavioral interventions grounded in sleep hygiene.",
    content:
      "Handout Topic: Stress Endocrinology & Cognitive Memory\nUnder prolonged academic distress, sustained hypothalamic-pituitary-adrenal (HPA) axis hyperactivation elevates systemic cortisol levels during nocturnal intervals. Consequently, slow-wave sleep (Stage N3) and REM sleep duration are truncated. Because hippocampal-to-neocortical memory consolidation predominantly occurs during slow-wave sleep, students experiencing chronic sleep deprivation suffer decreased synaptic plasticity, working memory deficits, and heightened subjective anxiety.",
    progress: 60,
    status: "in-progress",
    deadline: "2024-12-08",
    currentTask: "Answer Question 3 about academic stress and sleep.",
    studentAnswer: "",
  },
  {
    id: "statistics-problem-set",
    title: "Statistics Problem Set",
    type: "Problem Set",
    description:
      "Solve descriptive and inferential statistics problems, calculate sample variances, and evaluate hypothesis tests.",
    instructions:
      "Problem Set Guidelines:\n1. Differentiate sample parameters (s, s^2, x̄) from population parameters (σ, σ^2, μ).\n2. Calculate mean, median, sample variance, and sample standard deviation for Dataset A (n = 15).\n3. State the null hypothesis (H0) and calculate the test statistic (t-score) at alpha = 0.05.\n4. Show every computational step; do not report raw answers without supporting methodology.",
    content:
      "Problem 1: Given sample observations: 12, 14, 15, 18, 19, 21, 22, 23, 25, 27, 28, 30, 31, 34, 36 (n = 15). Calculate:\na) Sample mean and sample variance (using n - 1 degrees of freedom).\nb) Standard error of the mean (SE = s / sqrt(n)).\nc) Construct a 95% two-tailed confidence interval around the mean.",
    progress: 0,
    status: "not-started",
    deadline: "2024-12-13",
    currentTask: "Solve the first descriptive-statistics problem.",
    studentAnswer: "",
  },
  {
    id: "responsible-ai-presentation",
    title: "Responsible AI Presentation",
    type: "Presentation",
    description:
      "Create an academic slide deck examining cognitive offloading, algorithmic bias, and ethical guidelines for generative AI adoption in university coursework.",
    instructions:
      "Presentation Requirements:\n1. Slide Deck Structure: 8-10 slides with clear visual hierarchy and speaker notes.\n2. Thesis: Generative AI tools must serve as metacognitive scaffolding rather than cognitive offloading mechanisms.\n3. Case Studies: Highlight academic integrity policies, equity of access, and transparency in student prompt disclosures.\n4. Deliverable: Title slide, problem statement, literature synthesis, proposed framework, and discussion prompts.",
    content:
      "Key Literature Summary:\nRecent research in educational technology indicates that unconstrained AI text generation leads to rapid cognitive offloading—diminishing critical thinking and schema formation. A responsible pedagogical model positions the AI as a metacognitive tutor: asking Socratic questions, proposing counterarguments, and structuring student reflection while leaving drafting and evaluation to the learner.",
    progress: 15,
    status: "in-progress",
    deadline: "2024-12-15",
    currentTask: "Create an outline for the presentation.",
    studentAnswer: "",
  },
  {
    id: "reflection-paper-wellbeing",
    title: "Reflection Paper on Student Well-Being",
    type: "Reflection Paper",
    description:
      "Write a critical self-reflection linking empirical well-being frameworks with personal academic routines and burnout mitigation.",
    instructions:
      "Reflection Paper Guidelines:\n1. Length: 750 - 1,000 words.\n2. Grounding: Integrate the PERMA well-being model (Seligman) or Self-Determination Theory (Deci & Ryan).\n3. Narrative: Connect personal study patterns with psychological autonomy, competence, and relatedness.\n4. Action Plan: Articulate three concrete boundaries to protect sleep and mental health during project deadlines.",
    content:
      "Prompt Excerpt: Academic achievement frequently comes at the expense of psychological well-being. Using Self-Determination Theory, reflect on whether your current study practices are driven by autonomous motivation or controlled pressure (grade anxieties). What shifts can you implement to sustain both academic rigor and mental wellness?",
    progress: 20,
    status: "in-progress",
    deadline: "2024-12-18",
    currentTask: "Draft the introductory paragraph and thesis statement.",
    studentAnswer: "",
  },
  {
    id: "research-activity-learning",
    title: "Research Activity on Student Learning",
    type: "Research Activity",
    description:
      "Formulate a focused research inquiry, evaluate peer-reviewed articles, and establish a search string methodology on active learning strategies.",
    instructions:
      "Research Activity Deliverables:\n1. Formulate a primary research question using PICO or FINER criteria.\n2. Construct Boolean search strings (e.g. 'active learning' AND 'undergraduate STEM' AND 'retention').\n3. Select three empirical peer-reviewed studies published within the last 5 years.\n4. Summarize methodology, sample size, limitations, and key findings in a comparative matrix.",
    content:
      "Research Context: University STEM departments report varied efficacy when transitioning from traditional lecture formats to flipped classrooms and active inquiry. Your task is to investigate what instructional scaffolds produce measurable gains in conceptual mastery and exam retention.",
    progress: 0,
    status: "not-started",
    deadline: "2024-12-20",
    currentTask: "Develop a focused research question.",
    studentAnswer: "",
  },
  {
    id: "reading-comprehension-worksheet",
    title: "Reading Comprehension Worksheet",
    type: "Worksheet",
    description:
      "Analyze a dense academic reading on cognitive load theory, extract foundational definitions, and evaluate author claims.",
    instructions:
      "Worksheet Tasks:\n1. Define intrinsic, extraneous, and germane cognitive load based on Sweller (1988).\n2. Answer Item 2: How does instructional split-attention increase extraneous load?\n3. Evaluate the author's argument regarding multi-modal learning presentations.",
    content:
      "Reading Excerpt: Cognitive Load Theory posits that human working memory has strictly limited processing capacity. Intrinsic cognitive load refers to the inherent difficulty of the learning material itself. Extraneous cognitive load is generated by poor instructional design or unnecessary mental processing. Germane cognitive load represents the mental effort devoted to schema acquisition and automation.",
    progress: 45,
    status: "in-progress",
    deadline: "2024-12-12",
    currentTask: "Complete Item 2 on instructional split-attention.",
    studentAnswer: "",
  },
  {
    id: "group-project-instructions",
    title: "Group Project Instructions",
    type: "Group Project",
    description:
      "Coordinate team roles, project milestones, research deliverables, and final presentation deadlines for a collaborative term study.",
    instructions:
      "Collaborative Project Steps:\n1. Team Charter: Define member roles (Lead Investigator, Data Analyst, Technical Editor, Presenter).\n2. Milestone Schedule: Set bi-weekly checkpoints across literature review, data gathering, draft review, and slide design.\n3. Risk Assessment: Identify contingency plans for team scheduling conflicts and scope management.\n4. Peer Evaluation Rubric: Agree on collaboration metrics.",
    content:
      "Project Specification: Teams of 4 students will conduct an exploratory study on educational technology adoption among university peers. Deliverables include a 15-page joint research report and a 15-minute presentation with equal member participation.",
    progress: 10,
    status: "in-progress",
    deadline: "2024-12-22",
    currentTask: "Draft the team charter and milestone schedule.",
    studentAnswer: "",
  },
];

export const ASSISTANCE_MODES: Array<{
  id: AssistanceMode;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    id: "understand",
    label: "Understand",
    description:
      "Explain instructions, what the activity asks, and define terms.",
    icon: "lightbulb",
  },
  {
    id: "guide",
    label: "Guide",
    description:
      "Ask guiding questions and give hints without giving full answers.",
    icon: "compass",
  },
  {
    id: "organize",
    label: "Organize",
    description:
      "Break material into manageable actions and structured checklists.",
    icon: "clipboard-list",
  },
  {
    id: "explore",
    label: "Explore",
    description:
      "Suggest focused search terms, related concepts, and questions.",
    icon: "search",
  },
  {
    id: "review",
    label: "Review",
    description:
      "Review student answers for missing requirements and reasoning.",
    icon: "check-circle",
  },
  {
    id: "draft",
    label: "Draft",
    description:
      "Provide preliminary AI-assisted examples or structural outlines.",
    icon: "file-edit",
  },
];

export const SUGGESTED_PROMPTS: Record<MaterialType, string[]> = {
  Activity: [
    "Explain the instructions.",
    "Give me a hint.",
    "Help me start.",
    "Check my answer.",
  ],
  Handout: [
    "Summarize the key concepts.",
    "Ask me questions about this.",
    "Explain the difficult part.",
    "What should I verify?",
  ],
  "Problem Set": [
    "Explain the method.",
    "Give me the first hint.",
    "Check my solution.",
    "Show a similar example.",
  ],
  Presentation: [
    "Help me create an outline.",
    "Challenge my main argument.",
    "Suggest audience questions.",
    "Review my structure.",
  ],
  "Reflection Paper": [
    "Help me brainstorm my thesis.",
    "Guide my reflection structure.",
    "Check my draft for depth.",
    "How can I strengthen my reflection?",
  ],
  "Research Activity": [
    "Help me narrow the question.",
    "Suggest search terms.",
    "What should I verify?",
    "Review my source evaluation.",
  ],
  Worksheet: [
    "Explain Question 1.",
    "Give me a hint for the second item.",
    "Check my drafted answer.",
    "Break down difficult terms.",
  ],
  "Group Project": [
    "Help us define team roles.",
    "Create a milestone checklist.",
    "Review our project plan.",
    "Suggest collaboration checkpoints.",
  ],
  Assignment: [
    "Explain the instructions.",
    "Help me plan my approach.",
    "Can you review my draft?",
    "Break this into manageable steps.",
  ],
  Reading: [
    "Summarize the author's main argument.",
    "Explain key technical terms.",
    "What are the main claims to verify?",
    "Ask me 3 comprehension questions.",
  ],
};

export const FOLLOW_UP_ACTIONS: string[] = [
  "Explain more simply",
  "Give me a hint",
  "Ask me a question",
  "Challenge this answer",
  "Generate search terms",
  "Show a similar example",
  "Review my attempt",
  "Create a checklist",
  "Verify what I should check",
  "Save this response",
];

export const LOCALIZED_FALLBACK_TEMPLATES: Record<
  LanguageMode,
  Record<MaterialType, string>
> = {
  english: {
    Activity:
      "Let's begin by identifying what the activity asks you to explain, compare, calculate, or create. Write your initial understanding first, then list the information you need.",
    Handout:
      "Start by identifying the main topic, three important terms, the main claim, supporting examples, and one question that remains unclear.",
    "Problem Set":
      "Identify what the problem asks, list the information provided, select the relevant concept or formula, and explain your first step before completing the solution.",
    Presentation:
      "Define the topic, identify the audience, choose three main points, add supporting evidence, and prepare one possible counterargument.",
    "Reflection Paper":
      "State your central insight, connect personal experience with course theory, highlight key challenges, and articulate concrete behavioral changes.",
    "Research Activity":
      "Narrow the topic, formulate a focused question, generate search terms, identify possible sources, and note what must be verified.",
    Worksheet:
      "Read the worksheet question carefully, locate the relevant reading section, write your definition or explanation in your own words, and double-check requirements.",
    "Group Project":
      "Establish team roles, agree on communication channels, decompose deliverables into phased milestones, and set internal deadlines prior to final submission.",
    Assignment:
      "Identify what the assignment asks, outline required deliverables, draft an initial framework, and verify against the instructor rubric.",
    Reading:
      "Preview headings, identify the central thesis, extract defining terminology, and summarize the author's core claims in your own words.",
  },
  filipino: {
    Activity:
      "Simulan natin sa pagtukoy kung ano ang hinihingi ng activity: magpaliwanag, magkumpara, magkalkula, o gumawa. Isulat muna ang iyong paunang pagkaunawa, pagkatapos ay ilista ang mga konseptong kailangan mo.",
    Handout:
      "Simulan sa pagtukoy ng pangunahing paksa, tatlong mahalagang termino, ang pangunahing argumento, mga halimbawa, at isang tanong na nais mong linawin.",
    "Problem Set":
      "Tukuyin kung ano ang itinatanong sa problema, ilista ang mga ibinigay na datos, piliin ang angkop na formula o konsepto, at ipaliwanag ang iyong unang hakbang bago magkwenta.",
    Presentation:
      "Tukuyin ang paksa, alamin ang tagapakinig, pumili ng tatlong pangunahing punto, maglagay ng ebidensya, at maghanda ng posibleng katanungan mula sa klase.",
    "Reflection Paper":
      "Ipahayag ang iyong pangunahing natutunan, iugnay ang personal na karanasan sa aralin, at maglatag ng mga konkretong hakbang para sa iyong pag-unlad.",
    "Research Activity":
      "Gawing tiyak ang paksa, bumuo ng malinaw na tanong-pananaliksik, maglista ng search terms, at kilalanin ang mga maaasahang sanggunian.",
    Worksheet:
      "Basahin nang mabuti ang aytem sa worksheet, hanapin ang kaugnay na bahagi sa babasahin, at isulat ang sagot sa sarili mong mga salita.",
    "Group Project":
      "Magtakda ng gampanin para sa bawat miyembro, magkasundo sa iskedyul ng bawat bahagi, at magtakda ng pagsusuri bago ang pinal na pasahan.",
    Assignment:
      "Alamin ang layunin ng takdang-aralin, ilatag ang balangkas, at suriin ang iyong gawa ayon sa rubric ng guro.",
    Reading:
      "Tingnan ang mga pamagat, tukuyin ang pangunahing kaisipan ng may-akda, at ibuod ang mahahalagang ideya sa sarili mong pangungusap.",
  },
  taglish: {
    Activity:
      "Start muna by identifying kung ano talaga ang hinihingi ng activity. Isulat ang initial understanding mo, then list the information or concepts na kailangan mong i-check.",
    Handout:
      "Check the handout by noting the main topic, 3 key terms, the main claim, and one question na hindi pa masyadong clear sa iyo.",
    "Problem Set":
      "Alamin muna kung ano ang hinahanap sa problem, i-list ang given values, piliin ang formula or concept na gagamitin, at i-explain ang first step mo bago mag-calculate.",
    Presentation:
      "Define your topic, alamin kung sino ang audience, pumili ng 3 main points na may supporting evidence, at mag-prepare ng counterargument.",
    "Reflection Paper":
      "Isulat ang main reflection mo, i-connect ang personal academic routine sa concepts sa class, at mag-outline ng realistic action plan.",
    "Research Activity":
      "Narrow down the topic, gumawa ng focused research question, mag-generate ng search terms, and list kung aling sources ang kailangan i-verify.",
    Worksheet:
      "Basahin ang item sa worksheet, i-locate ang topic sa reading material, at i-draft ang sagot using your own words bago mag-submit.",
    "Group Project":
      "I-clarify ang roles ng bawat group member, gumawa ng milestone checklist, at mag-set ng internal deadline bago ang final presentation.",
    Assignment:
      "Break down the assignment requirements, gumawa ng outline ng points mo, at i-compare ang draft sa rubric ng instructor.",
    Reading:
      "Tingnan ang headings, hanapin ang main thesis ng author, i-note ang technical terms, at i-summarize ang key points in your own words.",
  },
};

// Legacy fallback template alias for backward compatibility
export const FALLBACK_TEMPLATES = LOCALIZED_FALLBACK_TEMPLATES.english;

export const FUTURE_FEATURES = [
  {
    id: "upload",
    title: "Upload Activity or Handout",
    description:
      "Upload documents directly for AI-assisted analysis and task extraction.",
    icon: "upload",
  },
  {
    id: "ocr",
    title: "OCR Document Extraction",
    description:
      "Extract text from photos of handwritten or printed materials.",
    icon: "camera",
  },
  {
    id: "calendar",
    title: "Calendar and Time-Blocking",
    description: "Integrate with academic calendars and plan study blocks.",
    icon: "calendar",
  },
  {
    id: "screen-free",
    title: "Screen-Free Routine Support",
    description: "Reminders and routines for healthy study breaks.",
    icon: "leaf",
  },
  {
    id: "wellness",
    title: "Wellness Check-Ins",
    description: "Brief periodic check-ins for student well-being awareness.",
    icon: "heart",
  },
  {
    id: "widget",
    title: "Lock-Screen Widget",
    description:
      "Quick access to current task and next deadline from the lock screen.",
    icon: "smartphone",
  },
  {
    id: "mobile",
    title: "Mobile Application",
    description: "Native mobile apps for iOS and Android.",
    icon: "tablet-smartphone",
  },
  {
    id: "privacy",
    title: "Optional Privacy Dashboard",
    description: "Review and manage all data stored by the application.",
    icon: "shield-check",
  },
  {
    id: "cloud",
    title: "Cloud Synchronization",
    description:
      "Sync materials, progress, and saved responses across devices.",
    icon: "cloud",
  },
];
