import { Material, AssistanceMode, MaterialType } from "./types";

export const mockMaterials: Material[] = [
  {
    id: "photosynthesis-activity",
    title: "Photosynthesis Activity",
    type: "Activity",
    description:
      "Explain the process of photosynthesis and identify the roles of sunlight, water, carbon dioxide, and glucose.",
    progress: 30,
    status: "in-progress",
    deadline: "2024-12-10",
    currentTask: "Explain the role of glucose in photosynthesis.",
  },
  {
    id: "academic-stress-handout",
    title: "Academic Stress Handout",
    type: "Handout",
    description:
      "Read the handout and answer questions about academic stress, sleep, and student well-being.",
    progress: 60,
    status: "in-progress",
    deadline: "2024-12-08",
    currentTask: "Answer Question 3 about academic stress and sleep.",
  },
  {
    id: "statistics-problem-set",
    title: "Statistics Problem Set",
    type: "Problem Set",
    description:
      "Solve the assigned descriptive-statistics problems and explain the method used.",
    progress: 0,
    status: "not-started",
    deadline: "2024-12-13",
    currentTask: "Solve the first descriptive-statistics problem.",
  },
  {
    id: "group-presentation",
    title: "Group Presentation",
    type: "Presentation",
    description:
      "Prepare a presentation about responsible use of generative AI in education.",
    progress: 15,
    status: "in-progress",
    deadline: "2024-12-15",
    currentTask: "Create an outline for the presentation.",
  },
  {
    id: "research-activity",
    title: "Research Activity",
    type: "Research Activity",
    description:
      "Develop a focused question and identify credible sources related to student learning.",
    progress: 0,
    status: "not-started",
    deadline: "2024-12-20",
    currentTask: "Develop a focused research question.",
  },
];

export const ASSISTANCE_MODES: Array<{
  id: AssistanceMode;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    id: "explain",
    label: "Explain",
    description: "Clarify instructions or concepts.",
    icon: "lightbulb",
  },
  {
    id: "guide",
    label: "Guide",
    description: "Provide hints and questions before a full answer.",
    icon: "compass",
  },
  {
    id: "organize",
    label: "Organize",
    description: "Break a broad activity into smaller actions.",
    icon: "clipboard-list",
  },
  {
    id: "explore",
    label: "Explore",
    description: "Suggest search terms, related concepts, and questions.",
    icon: "search",
  },
  {
    id: "review",
    label: "Review",
    description: "Review the student's own attempt.",
    icon: "check-circle",
  },
  {
    id: "draft",
    label: "Draft",
    description: "Generate a preliminary answer or outline when requested.",
    icon: "file-edit",
  },
];

export const SUGGESTED_PROMPTS: Record<MaterialType, string[]> = {
  Activity: [
    "Help me understand the instructions.",
    "Give me a hint.",
    "Check my answer.",
    "Break this activity into steps.",
  ],
  Handout: [
    "Summarize the main ideas.",
    "Ask me questions about this handout.",
    "Explain the most difficult concept.",
    "Help me identify what I should verify.",
  ],
  Assignment: [
    "What is expected in this assignment?",
    "Help me plan my approach.",
    "Can you review my draft?",
    "Break this assignment into steps.",
  ],
  "Problem Set": [
    "Explain the method without solving it.",
    "Give me the first hint.",
    "Check my solution.",
    "Show a similar example.",
  ],
  Presentation: [
    "Help me create an outline.",
    "Challenge my main argument.",
    "Suggest questions the audience may ask.",
    "Review my presentation structure.",
  ],
  "Research Activity": [
    "Help me narrow the question.",
    "Suggest search terms.",
    "What should I verify?",
    "Review my source evaluation.",
  ],
  Reading: [
    "What is the author's main argument?",
    "Help me understand the methodology.",
    "Summarize the key points.",
    "What should I look for while reading?",
  ],
  Project: [
    "How should I break down this project?",
    "What milestones should I set?",
    "Help me brainstorm project ideas.",
    "Review my project plan.",
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

export const FALLBACK_TEMPLATES: Record<MaterialType, string> = {
  Activity: `Try approaching the activity in three stages:
1. Identify the main concept.
2. List the required parts of the response.
3. Explain the concept using your own words.
Before submitting, compare your answer with the original instructions.`,
  Handout: `Review the handout by identifying:
1. The main topic.
2. Three important terms.
3. The author's key claim.
4. Evidence or examples.
5. One question that remains unclear.`,
  Assignment: `Start by identifying:
1. What the assignment is asking.
2. The format and requirements.
3. Key concepts you need to address.
4. How to structure your response.
Review your work against the rubric before submitting.`,
  "Problem Set": `Start by identifying:
1. What the problem is asking.
2. Which values or information are provided.
3. Which concept or formula may apply.
4. What the first step should be.
Do not skip explaining your method.`,
  Presentation: `Begin with:
1. Define the topic.
2. Identify the audience.
3. Choose three main points.
4. Add evidence or examples.
5. Prepare one possible counterargument.
6. End with a clear conclusion.`,
  "Research Activity": `Start by:
1. Narrowing the topic.
2. Formulating a focused question.
3. Listing search terms.
4. Finding possible sources.
5. Checking relevance and limitations.`,
  Reading: `Approach the reading by:
1. Previewing headings and subheadings.
2. Identifying the author's main argument.
3. Noting key terms and definitions.
4. Summarizing each section in your own words.
5. Listing questions that remain unanswered.`,
  Project: `Organize the project by:
1. Defining the goal and scope.
2. Breaking work into milestones.
3. Assigning tasks and deadlines.
4. Identifying required resources.
5. Setting checkpoints for review.`,
};

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
