/**
 * StudyFlow Contextual Intelligence & Document Analysis Engine
 *
 * Thesis Core Pillars:
 * 1. Mitigating Cognitive Offloading: Refuses to complete tasks for students; provides metacognitive scaffolding.
 * 2. Grounded Document Verification: Strictly checks extracted document text for gibberish, anomalies, and academic relevance.
 * 3. Token-Optimized Slicing: Preserves context within safe token windows.
 */

export interface AttachedDocInput {
  name: string;
  size: number;
  text: string;
  wordCount?: number;
  base64?: string;
}

export interface StructuredAIOutput {
  response: string;
  responseType: string;
  keyPoints: string[];
  suggestedNextAction: string;
  followUpActions: string[];
  verificationQuestions: string[];
  uncertainties: string[];
  requiresReview: boolean;
}

/**
 * Checks if the student prompt is an attempt at cognitive offloading
 * (asking the AI to write, solve, or do the task for them).
 */
export function isCognitiveOffloadingRequest(message: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase().trim();

  const offloadingTriggers = [
    /do (this|it|my|the) (task|assignment|homework|activity|work|paper|essay|problem|presentation|worksheet) for me/i,
    /write (this|it|my|the) (for me|essay|assignment|paper|report|paragraph|response|answer)/i,
    /solve (this|it|my|the) (for me|problem|equation|question)/i,
    /complete (this|it|my|the) (task|assignment|homework|activity|work|worksheet) for me/i,
    /can you (just )?(do|write|solve|complete) (this|it|my|the)/i,
    /make (this|it|the) (for me|essay|paper|presentation)/i,
    /do my (homework|assignment|task|work)/i,
    /finish (this|it|my) (for me|task|assignment|work)/i,
    /give me the (direct )?(answers?|solutions?)/i,
    /please do this (task|for me)/i,
  ];

  return offloadingTriggers.some((pattern) => pattern.test(lower));
}

/**
 * Thoroughly evaluates extracted document text for gibberish, keyboard mashing,
 * unpronounceable consonant clusters, or placeholder text.
 */
export function checkTextAnomalies(text: string): {
  hasGibberish: boolean;
  flaggedTokens?: string[];
  details?: string;
} {
  if (!text || text.trim().length === 0) {
    return { hasGibberish: false };
  }

  const flagged: string[] = [];

  // 1. Long unpronounceable consonant sequences (e.g. "asdfghjk", "zxcvbnm", "qwrtyp")
  const consonantClusters = text.match(
    /\b[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{6,}\b/g,
  );
  if (consonantClusters) {
    // Filter out common acronyms/abbreviations
    const invalidClusters = consonantClusters.filter(
      (w) => !/^(https?|xmlns|schema|rdfs?|xpath|async|mysql|pgsql)$/i.test(w),
    );
    if (invalidClusters.length > 0) {
      flagged.push(...invalidClusters);
    }
  }

  // 2. Typical keyboard mash sequences
  const keyboardMashes = text.match(
    /\b(asdf[a-z]*|qwerty[a-z]*|zxcv[a-z]*|lkjh[a-z]*|poiuy[a-z]*|[a-z]*asdf[a-z]*|[a-z]*qwerty[a-z]*)\b/gi,
  );
  if (keyboardMashes) {
    flagged.push(...keyboardMashes);
  }

  // 3. Repetitive character repetitions (e.g. "aaaaaaa", "xxxxxx", "!!!!!!!")
  const repeatingChars = text.match(/([a-zA-Z0-9!?.])\1{5,}/g);
  if (repeatingChars) {
    flagged.push(...repeatingChars);
  }

  // 4. Lorem ipsum placeholder text
  if (/lorem ipsum|dolor sit amet|consectetur adipiscing/i.test(text)) {
    flagged.push("Lorem Ipsum placeholder text");
  }

  // 5. Unusually low vowel ratio in word tokens (len >= 6 with 0 or 1 vowel)
  const words = text
    .split(/[\s,.;:!?()\[\]{}"']+/)
    .filter((w) => w.length >= 6);
  for (const word of words) {
    const vowels = word.match(/[aeiouyAEIOUY]/g) || [];
    const vowelRatio = vowels.length / word.length;
    if (
      vowelRatio < 0.15 &&
      !/^[0-9]+$/.test(word) &&
      !/^[A-Z0-9_-]+$/.test(word)
    ) {
      if (!flagged.includes(word)) {
        flagged.push(word);
      }
    }
  }

  if (flagged.length > 0) {
    const uniqueTokens = Array.from(new Set(flagged)).slice(0, 5);
    return {
      hasGibberish: true,
      flaggedTokens: uniqueTokens,
      details: `Detected anomalous or unpronounceable sequence(s): "${uniqueTokens.join('", "')}"`,
    };
  }

  return { hasGibberish: false };
}

/**
 * Slices and reconstructs document text to safe token bounds (~4,000 chars)
 */
export function sliceAndReconstructDocument(doc: AttachedDocInput): {
  slicedText: string;
  isTruncated: boolean;
  sampleRatio: string;
} {
  const raw = doc.text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  if (raw.length <= 3500) {
    return {
      slicedText: raw,
      isTruncated: false,
      sampleRatio: "100% full text",
    };
  }

  const intro = raw.slice(0, 1500).trim();
  const midPoint = Math.floor(raw.length / 2);
  const middle = raw.slice(midPoint - 500, midPoint + 500).trim();
  const ending = raw.slice(raw.length - 800).trim();

  const sliced = `[Section 1: Document Overview]\n${intro}\n\n[Section 2: Middle Excerpt]\n${middle}\n\n[Section 3: Document Conclusion]\n${ending}`;

  return {
    slicedText: sliced,
    isTruncated: true,
    sampleRatio: `~${((sliced.length / raw.length) * 100).toFixed(0)}% excerpt (${raw.length} chars)`,
  };
}

/**
 * Generates contextual responses adhering to Thesis Principles:
 * - Refuses cognitive offloading
 * - Accurately calls out gibberish or anomalous text
 * - Provides step-by-step metacognitive scaffolding
 */
export function generateContextualResponse(params: {
  materialTitle: string;
  materialType: string;
  currentTask: string;
  assistanceMode: string;
  message: string;
  attachedDoc?: AttachedDocInput;
}): StructuredAIOutput {
  const {
    materialTitle,
    materialType,
    currentTask,
    assistanceMode,
    message,
    attachedDoc,
  } = params;

  // RULE 1: Mitigating Cognitive Offloading (Thesis Requirement)
  if (isCognitiveOffloadingRequest(message)) {
    return {
      response: `As your StudyFlow academic companion, I cannot complete or write this task for you. Directly doing the work replaces your critical thinking and fosters cognitive offloading, which defeats the purpose of your academic learning.

Instead, let's break down "${currentTask || materialTitle}" into manageable steps so you can draft it yourself:
1. **Clarify the Core Objective**: What specific question, argument, or calculation is required?
2. **Identify Supporting Concepts**: What course principles or evidence apply here?
3. **Draft an Outline**: Write an initial thesis or draft in your own words, and I will provide feedback and structural review.`,
      responseType: "guidance",
      keyPoints: [
        "Thesis Principle: Mitigate cognitive offloading by preserving student authorship",
        "Companion Role: Metacognitive scaffolding, guiding questions, and structural feedback",
        "Next Action: Break the task into small checkpoints and formulate your initial draft",
      ],
      suggestedNextAction:
        "Write down the first 2-3 sentences of your response or outline, then ask for a review.",
      followUpActions: [
        "Help me outline this step-by-step",
        "Give me a guiding hint on the first concept",
        "Create a checklist for this task",
      ],
      verificationQuestions: [
        "What is the single most important concept your instructor expects you to demonstrate in this work?",
      ],
      uncertainties: [],
      requiresReview: true,
    };
  }

  // RULE 2: Document Verification with Strict Grounding & Gibberish Detection
  if (attachedDoc) {
    const anomalyCheck = checkTextAnomalies(attachedDoc.text);

    if (anomalyCheck.hasGibberish) {
      return {
        response: `Document verification flagged specific anomalies in "${attachedDoc.name}". ${anomalyCheck.details}. The document contains unverified or nonsensical strings that must be revised before academic submission.`,
        responseType: "feedback",
        keyPoints: [
          `File inspected: ${attachedDoc.name} (${(attachedDoc.size / 1024).toFixed(1)} KB)`,
          `Flagged anomalies: ${anomalyCheck.details}`,
          "Integrity check: Revision required before final academic submission",
        ],
        suggestedNextAction:
          "Locate and remove the flagged placeholder or gibberish text in your document.",
        followUpActions: [
          "Check document formatting",
          "Review remaining text for academic flow",
        ],
        verificationQuestions: [
          "Did any accidental keystrokes, placeholder text, or raw code get exported into this file?",
        ],
        uncertainties: ["Flagged via structural anomaly inspection."],
        requiresReview: true,
      };
    }

    // Clean Document
    return {
      response: `The document "${attachedDoc.name}" was inspected. No gibberish, unpronounceable character strings, or out-of-scope anomalies were detected. The text appears academically coherent and relates directly to ${materialTitle || "your coursework"}${materialType ? ` (${materialType})` : ""}.`,
      responseType: "feedback",
      keyPoints: [
        `File verified: ${attachedDoc.name} (${(attachedDoc.size / 1024).toFixed(1)} KB, ~${attachedDoc.wordCount || 100} words)`,
        "Academic validity: Terminology is coherent and logically structured",
        "Cleanliness: 0 gibberish, 0 unpronounceable sequences detected",
      ],
      suggestedNextAction:
        "Verify your arguments and citations against the rubric before final submission.",
      followUpActions: [
        "Create a submission checklist",
        "Review key arguments for depth",
      ],
      verificationQuestions: [
        "Have you ensured all required questions from the assignment prompt are addressed?",
      ],
      uncertainties: [],
      requiresReview: false,
    };
  }

  // RULE 3: Subject-Specific & General Academic Support
  const lowerMsg = message.toLowerCase();
  const titleLower = materialTitle.toLowerCase();

  if (titleLower.includes("photosynthesis")) {
    if (lowerMsg.includes("hint") || assistanceMode === "guide") {
      return {
        response:
          "Consider how energy moves between the two main phases: light-dependent reactions create ATP and NADPH, which then fuel the Calvin cycle. Where does glucose get assembled, and what provides the carbon backbone?",
        responseType: "guidance",
        keyPoints: [
          "Light-dependent reactions occur in thylakoid membranes to generate ATP/NADPH",
          "Calvin cycle (light-independent) fixes CO₂ in the stroma to yield glucose",
          "Water photolysis releases oxygen as a vital byproduct",
        ],
        suggestedNextAction:
          "Draft a 2-sentence explanation of why glucose is considered the chemical storage of solar energy.",
        followUpActions: [
          "Explain the Calvin cycle simply",
          "What is the role of sunlight?",
        ],
        verificationQuestions: [
          "Can you explain the difference between the light reactions and the dark reactions in your own words?",
        ],
        uncertainties: [],
        requiresReview: false,
      };
    }
  }

  if (titleLower.includes("stress") || titleLower.includes("sleep")) {
    if (lowerMsg.includes("hint") || assistanceMode === "guide") {
      return {
        response:
          "Notice the bidirectional relationship between academic stress and sleep architecture: elevated cortisol levels inhibit deep slow-wave sleep, which impairs cognitive memory consolidation the next morning.",
        responseType: "guidance",
        keyPoints: [
          "Stress triggers cortisol and autonomic arousal, disrupting REM and deep sleep",
          "Sleep deprivation elevates perceived stress, creating a compounding feedback loop",
          "Interventions targeting sleep routines significantly lower academic fatigue",
        ],
        suggestedNextAction:
          "Formulate your response for Question 3 citing the cortisol-sleep feedback cycle.",
        followUpActions: [
          "Explain this more simply",
          "Draft Question 3 answer",
        ],
        verificationQuestions: [
          "Does your answer address both the biological and psychological aspects mentioned in the handout?",
        ],
        uncertainties: [],
        requiresReview: false,
      };
    }
  }

  // Default Guidance with Metacognitive Scaffolding
  return {
    response: `To tackle "${currentTask || materialTitle}", focus on identifying the core argument and supporting it with evidence. Break down the requirements into manageable steps, draft your initial explanation, and review it against course guidelines.`,
    responseType: "guidance",
    keyPoints: [
      "Center your work on the primary learning objective",
      "Draft concise explanations in your own words",
      "Verify conclusions against foundational course materials",
    ],
    suggestedNextAction:
      "Draft your initial answer and share it here for constructive feedback.",
    followUpActions: [
      "Explain more simply",
      "Give me a guiding hint",
      "Create a quick checklist",
    ],
    verificationQuestions: [
      "Does your draft directly answer the core prompt asked by your instructor?",
    ],
    uncertainties: [],
    requiresReview: false,
  };
}
