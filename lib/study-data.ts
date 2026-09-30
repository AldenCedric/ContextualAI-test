/* StudyFlow — Study Data: Subjects, Preloaded Tasks, and Suggested Prompts */

import { Subject, PreloadedTask, ProbingQuestion } from "./types";

/* ── Subjects ── */

export const SUBJECTS: Subject[] = [
  { id: "contemporary-arts", name: "Contemporary Arts" },
  { id: "general-biology", name: "General Biology" },
  { id: "intro-statistics", name: "Introduction to Statistics" },
  { id: "custom", name: "Any Academic Material / Custom Upload" },
];

/* ── Preloaded Tasks ── */

export const PRELOADED_TASKS: PreloadedTask[] = [
  /* Contemporary Arts */
  {
    id: "modern-techniques-traditional-authenticity",
    subjectId: "contemporary-arts",
    title:
      "Modern Techniques vs. Traditional Authenticity in Contemporary Arts",
    instructions: `Guidelines:
- Your essay must contain at least 250 words. Essays with fewer than 250 words will not be accepted.
- Your essay must be your own work. Do not use AI tools, generators, or copied content from the internet. Plagiarism will result in a failing mark.
- Deadline: October 5, 2026, at 4:00 PM.
- Submission format: Messenger, Word, or PDF.`,
    content: `Modern Techniques vs. Traditional Authenticity in Contemporary Arts

Contemporary art is a constantly changing field that reflects the ideas, experiences, and technologies of the modern world. As artists explore new ways of expressing themselves, a debate has emerged between the use of modern techniques and the preservation of traditional authenticity. Modern techniques allow artists to experiment with digital tools, artificial intelligence, photography, video, installation, and other innovative forms. On the other hand, traditional authenticity emphasizes cultural heritage, handmade processes, historical practices, and the personal connection between the artist and their work. Both approaches have an important place in contemporary arts.

Modern techniques have expanded the possibilities available to artists. With digital technology, artists can create images, animations, music, and interactive artworks that would have been difficult or impossible to produce using traditional methods. Digital tools also make it easier for artists to experiment, revise their work, and reach audiences around the world. For younger artists especially, modern technology can serve as a powerful means of communicating contemporary issues such as climate change, social media, globalization, and identity.

However, traditional authenticity remains valuable because it preserves cultural knowledge and human craftsmanship. Traditional painting, sculpture, weaving, pottery, carving, and other forms of artistic expression often carry the history and identity of a community. Handmade artworks can also demonstrate patience, skill, and personal expression in ways that technology cannot completely replace. Preserving these practices helps prevent important cultural traditions from being forgotten.

Rather than viewing modern techniques and traditional authenticity as opposing forces, contemporary artists can combine them. An artist may use traditional patterns, materials, or cultural symbols while incorporating digital design or modern presentation. This combination can create artwork that respects the past while responding to the present.

In conclusion, modern techniques and traditional authenticity both contribute to the development of contemporary arts. Modern technology encourages innovation and provides artists with new forms of expression, while traditional practices preserve culture, history, and craftsmanship. The most meaningful contemporary art can emerge when artists understand their traditions while remaining open to new ideas and technologies. In this way, art can honor the past, represent the present, and inspire the future.`,
  },

  /* General Biology */
  {
    id: "cell-division-mitosis-meiosis",
    subjectId: "general-biology",
    title: "Comparison of Mitosis and Meiosis",
    instructions: `Instructions:
- Answer each question in complete sentences. Minimum 150 words total.
- Include labeled diagrams if applicable.
- Deadline: October 8, 2026.
- Submit as PDF or printed copy.`,
    content: `Cell Division: Mitosis and Meiosis

Cell division is fundamental to the growth, repair, and reproduction of living organisms. There are two primary types of cell division: mitosis and meiosis.

Mitosis produces two genetically identical daughter cells from a single parent cell. It is responsible for growth, tissue repair, and asexual reproduction in organisms. The process involves four stages: prophase, metaphase, anaphase, and telophase, followed by cytokinesis. Each daughter cell receives the same number of chromosomes as the parent cell.

Meiosis, on the other hand, produces four genetically unique haploid cells from a single diploid parent cell. It is essential for sexual reproduction. Meiosis involves two rounds of division (meiosis I and meiosis II) and introduces genetic variation through crossing over and independent assortment. The resulting gametes (sperm and egg cells) contain half the chromosome number of the parent cell.

Understanding the differences between mitosis and meiosis is critical for topics such as genetics, heredity, cancer biology, and developmental biology. Students should be able to compare and contrast the purpose, process, and outcomes of each type of cell division.`,
  },

  /* Introduction to Statistics */
  {
    id: "descriptive-statistics-problem-set",
    subjectId: "intro-statistics",
    title: "Descriptive Statistics Problem Set",
    instructions: `Instructions:
- Show all computations. Answers without solutions will receive partial credit only.
- Use the appropriate formula for each measure.
- Round answers to two decimal places.
- Deadline: October 10, 2026.
- Submit in class or via the learning portal.`,
    content: `Descriptive Statistics: Measures of Central Tendency and Variability

Given the following data set representing test scores of 15 students:
78, 85, 90, 72, 88, 95, 60, 82, 77, 91, 84, 69, 87, 93, 80

Part A: Measures of Central Tendency
1. Calculate the mean of the data set.
2. Determine the median.
3. Identify the mode, if any.

Part B: Measures of Variability
4. Calculate the range.
5. Calculate the variance (use the population variance formula).
6. Calculate the standard deviation.

Part C: Interpretation
7. Based on your calculations, describe the distribution of the scores. Is the data roughly symmetric, skewed left, or skewed right?
8. What does the standard deviation tell you about how spread out the scores are?
9. If a student scored 95, how many standard deviations above the mean is this score?`,
  },
];

/* ── Helper: get tasks for a subject ── */

export function getTasksForSubject(subjectId: string): PreloadedTask[] {
  return PRELOADED_TASKS.filter((t) => t.subjectId === subjectId);
}

/* ── Suggested first-message prompts per assistance mode ── */

export const SUGGESTED_PROMPTS: Record<string, string[]> = {
  explain: [
    "What is this task asking me to do?",
    "Break down the main concepts for me.",
    "What are the key terms I should understand?",
  ],
  guide: [
    "Let's start tackling this task.",
    "Give me a hint to get started.",
    "What should I focus on first?",
  ],
  review: [
    "Check my answer against the task requirements.",
    "Is my argument clear and supported?",
    "What am I missing in my response?",
  ],
};

/* ── Assistance Mode Definitions ── */

export const ASSISTANCE_MODES = [
  {
    id: "explain" as const,
    label: "Explain",
    description: "Clarify the task, instructions, or concepts.",
  },
  {
    id: "guide" as const,
    label: "Guide",
    description: "Hints, questions, and next steps without full answers.",
  },
  {
    id: "review" as const,
    label: "Review",
    description: "Review your actual answer or draft.",
  },
];

/* ── Default Probing Questions ── */

export const DEFAULT_PROBING_QUESTIONS: ProbingQuestion[] = [
  {
    question:
      "What is the single most important concept your instructor wants you to learn here?",
    reason: "Identifying the core objective prevents you from going off-topic.",
  },
  {
    question: "Which claim in this material needs the strongest evidence?",
    reason: "Prioritizing evidence helps build a convincing academic response.",
  },
  {
    question: "What assumption is the response making?",
    reason:
      "Recognizing assumptions helps you evaluate whether the guidance applies to your specific task.",
  },
  {
    question: "How would you explain this concept in your own words?",
    reason:
      "Restating concepts ensures genuine understanding, not surface-level repetition.",
  },
];
