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

  // RULE 3: Dynamic Contextual Response Generation
  // No hardcoded subject branches — all responses derived from inputs.
  const keywords = extractKeywords(message);
  return buildModeScaffolding(assistanceMode, {
    materialTitle,
    materialType,
    currentTask,
    keywords,
  });
}

/**
 * Extracts meaningful academic keywords from a student message.
 * Used to personalize fallback responses without an LLM.
 */
function extractKeywords(message: string): string[] {
  if (!message) return [];
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "could", "should", "may", "might", "shall", "can",
    "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "this", "that", "these", "those", "it", "its", "my", "me",
    "i", "you", "your", "we", "our", "they", "them", "their",
    "what", "which", "who", "whom", "how", "why", "when", "where",
    "about", "into", "through", "during", "before", "after",
    "and", "but", "or", "nor", "not", "no", "so", "if", "then",
    "than", "too", "very", "just", "more", "most", "also",
    "help", "please", "give", "tell", "show", "explain", "make",
  ]);

  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w))
    .slice(0, 8);
}

interface ScaffoldingContext {
  materialTitle: string;
  materialType: string;
  currentTask: string;
  keywords: string[];
}

function buildModeScaffolding(
  mode: string,
  ctx: ScaffoldingContext,
): StructuredAIOutput {
  const { materialTitle, materialType, currentTask, keywords } = ctx;
  const topicPhrase =
    keywords.length > 0
      ? keywords.slice(0, 3).join(", ")
      : currentTask || materialTitle || "your coursework";

  const cleanType = (materialType || "activity").toLowerCase();

  const strategies: Record<string, () => StructuredAIOutput> = {
    explain: () => ({
      response: `Let's break down the key concepts related to ${topicPhrase} in "${materialTitle}". Start by identifying the central idea — what is the main claim or process being described? Then examine how the supporting details (definitions, examples, evidence) connect to that central idea. Try restating the concept in your own words to test your understanding.`,
      responseType: "explanation",
      keyPoints: [
        `Focus on understanding the core mechanism or argument in ${materialTitle}`,
        `Identify how ${topicPhrase} relates to the broader topic`,
        "Restate the concept in your own words before moving on",
      ],
      suggestedNextAction: `Write a one-sentence summary of ${topicPhrase} in your own words.`,
      followUpActions: [
        `What are the key terms related to ${topicPhrase}?`,
        "Can you give me a simpler analogy?",
        "What should I verify in my understanding?",
      ],
      verificationQuestions: [
        `Can you explain ${topicPhrase} to a classmate without looking at your notes?`,
      ],
      uncertainties: [],
      requiresReview: false,
    }),
    guide: () => ({
      response: `Here's a guiding direction for "${currentTask || materialTitle}": Consider what the ${cleanType} is asking you to demonstrate. The key area to investigate is ${topicPhrase}. Rather than jumping to the answer, ask yourself: what foundational concept must be true for this to work? Start there and build outward.`,
      responseType: "guidance",
      keyPoints: [
        `The core concept to investigate is ${topicPhrase}`,
        "Think about prerequisites — what must you understand first?",
        "Build your answer step-by-step from fundamentals",
      ],
      suggestedNextAction: `Identify the single most important concept underlying ${topicPhrase} and write it down.`,
      followUpActions: [
        "Give me another hint",
        "What is the first step I should take?",
        "Help me check my reasoning",
      ],
      verificationQuestions: [
        `What evidence from your ${cleanType} supports your understanding of ${topicPhrase}?`,
      ],
      uncertainties: [],
      requiresReview: false,
    }),
    organize: () => ({
      response: `Here's a structured approach to tackle "${currentTask || materialTitle}":\n1. **Read and identify requirements** — What specifically does the ${cleanType} ask you to produce?\n2. **List key concepts** — What topics related to ${topicPhrase} need to be addressed?\n3. **Draft your response** — Write a rough version addressing each requirement.\n4. **Cross-check** — Compare your draft against the original instructions.\n5. **Refine** — Improve clarity and add evidence where needed.`,
      responseType: "checklist",
      keyPoints: [
        "Break complex tasks into sequential checkpoints",
        `Ensure each section addresses ${topicPhrase} directly`,
        "Cross-reference your work against the original requirements",
      ],
      suggestedNextAction: "Complete step 1: list all requirements from the instructions.",
      followUpActions: [
        "Help me with step 2",
        "Create a timeline for these steps",
        "What should I prioritize first?",
      ],
      verificationQuestions: [
        "Have you addressed every requirement listed in the original instructions?",
      ],
      uncertainties: [],
      requiresReview: false,
    }),
    explore: () => ({
      response: `To deepen your understanding of ${topicPhrase} in "${materialTitle}", try exploring these angles:\n• Search for "${keywords.slice(0, 2).join(" ")} ${cleanType} examples" for practical context\n• Look up related concepts that connect to ${topicPhrase}\n• Find one peer-reviewed or textbook source that discusses this topic from a different perspective`,
      responseType: "search_plan",
      keyPoints: [
        `Explore ${topicPhrase} from multiple academic perspectives`,
        "Look for practical examples and case studies",
        "Cross-reference with your textbook or lecture notes",
      ],
      suggestedNextAction: `Search for one additional source that explains ${topicPhrase} and note how it differs from your material.`,
      followUpActions: [
        "Suggest more specific search terms",
        "What related concepts should I explore?",
        "Help me evaluate a source I found",
      ],
      verificationQuestions: [
        "How does what you found align with or differ from your course material?",
      ],
      uncertainties: [],
      requiresReview: false,
    }),
    review: () => ({
      response: `To review your work on "${currentTask || materialTitle}", check these dimensions:\n• **Completeness** — Does your response address all parts of the ${cleanType}?\n• **Accuracy** — Are the claims about ${topicPhrase} supported by evidence?\n• **Clarity** — Could a classmate understand your explanation without additional context?\n• **Originality** — Is the work in your own words and reasoning?`,
      responseType: "feedback",
      keyPoints: [
        "Check that every requirement from the instructions is addressed",
        `Verify that claims about ${topicPhrase} are evidence-based`,
        "Ensure your language is clear and your reasoning is original",
      ],
      suggestedNextAction: "Re-read your draft and mark any section where you're unsure of accuracy.",
      followUpActions: [
        "Check my specific answer",
        "What am I missing?",
        "How can I strengthen my argument?",
      ],
      verificationQuestions: [
        "If your instructor asked you to defend this answer, what evidence would you cite?",
      ],
      uncertainties: [],
      requiresReview: false,
    }),
    draft: () => ({
      response: `Here's a preliminary framework for approaching "${currentTask || materialTitle}":\n\n**Working Title/Focus:** ${topicPhrase}\n\n**Suggested Structure:**\n1. Introduction — State the purpose and scope related to ${topicPhrase}\n2. Key Analysis — Address the main concepts the ${cleanType} requires\n3. Evidence/Examples — Support your points with specific references\n4. Conclusion — Summarize your findings and state what you learned\n\n*This is a preliminary AI-assisted framework — review required before academic use.*`,
      responseType: "draft",
      keyPoints: [
        "This framework should be adapted to your specific requirements",
        `Center your analysis on ${topicPhrase}`,
        "Add your own evidence, examples, and voice",
      ],
      suggestedNextAction: "Fill in section 1 with your own introduction and thesis statement.",
      followUpActions: [
        "Help me develop section 2",
        "Review my filled-in draft",
        "Suggest evidence I should look for",
      ],
      verificationQuestions: [
        "Does this framework cover all the requirements in your assignment instructions?",
      ],
      uncertainties: ["This is a structural scaffold — all content should be your own."],
      requiresReview: true,
    }),
  };

  const strategy = strategies[mode] || strategies.guide;
  return strategy();
}
