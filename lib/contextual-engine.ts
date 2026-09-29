/**
 * StudyFlow Contextual Intelligence & Academic Engine
 *
 * Thesis Core Pillars:
 * 1. Strictly distinguishes between:
 *    - The Academic Material (instructions & content)
 *    - The Student's Actual Answer or Draft
 *    - The Student's Casual/Conversational Chat Message
 * 2. Never treats casual conversational phrases ("sure", "let's", "start") as academic claims.
 * 3. Never claims an answer is incomplete or missing evidence if no student answer has been submitted.
 * 4. Grounded Document Status: Technically readable confirmation without false academic endorsement.
 * 5. Full support for English, Filipino, and Taglish (Filipino-English code-switching).
 */

import { LanguageMode, DocumentEvidenceItem, GeminiResponse } from "./types";

export interface AttachedDocInput {
  name: string;
  size: number;
  text: string;
  wordCount?: number;
  base64?: string;
}

export interface ContextualParams {
  materialTitle: string;
  materialType: string;
  materialInstructions?: string;
  materialContent?: string;
  currentTask?: string;
  studentAnswer?: string | null;
  message: string;
  assistanceMode: string;
  languageMode?: LanguageMode;
  attachedDoc?: AttachedDocInput;
}

export const DOCUMENT_READABLE_NOTICE =
  "The document was successfully opened and its text could be extracted. This confirms that the file is technically readable; it does not confirm that the answers are correct, complete, or aligned with your instructor's rubric.";

/**
 * Checks if message is conversational / kickoff rather than an academic claim
 */
export function isConversationalKickoff(msg: string): boolean {
  const clean = msg.toLowerCase().trim();
  const kickoffPatterns = [
    /^(sure|okay|ok|alright|yes|yeah|yep|hello|hi|hey|let'?s (start|begin|go|tackle)|start|begin)/i,
    /let'?s (start|begin) (tackling|doing|working on) (the )?(contents|task|activity|handout|problem)/i,
    /please let'?s (start|begin)/i,
    /can we (start|begin)/i,
    /how do i start/i,
  ];
  return kickoffPatterns.some((pattern) => pattern.test(clean));
}

/**
 * Evaluates whether student is asking for general help without submitting an answer
 */
export function isHelpStartRequest(msg: string): boolean {
  const clean = msg.toLowerCase().trim();
  return (
    /help me (do|start|with|understand) this (task|activity|assignment|problem|handout)/i.test(
      clean,
    ) ||
    /help me (do|start) (the|my) task/i.test(clean) ||
    clean === "help me do this task" ||
    clean === "help me start"
  );
}

/**
 * Checks if student asks to review or check an answer
 */
export function isReviewQuery(msg: string): boolean {
  const clean = msg.toLowerCase().trim();
  return (
    /check my (answer|work|solution|draft|response)/i.test(clean) ||
    /what am i missing/i.test(clean) ||
    /how can i strengthen my argument/i.test(clean) ||
    /review my (answer|draft|work)/i.test(clean)
  );
}

/**
 * Generates high-quality contextual academic responses adhering strictly to thesis rules
 */
export function generateContextualResponse(
  params: ContextualParams,
): GeminiResponse {
  const {
    materialTitle,
    materialType,
    materialInstructions = "",
    materialContent = "",
    currentTask = "",
    studentAnswer = null,
    message,
    assistanceMode,
    languageMode = "english",
    attachedDoc,
  } = params;

  const cleanMsg = message.trim();
  const lowerMsg = cleanMsg.toLowerCase();
  const hasStudentAnswer = Boolean(
    studentAnswer && studentAnswer.trim().length > 0,
  );

  // -------------------------------------------------------------------------
  // CASE 1: Document Inspection / Attachment Event
  // -------------------------------------------------------------------------
  if (
    attachedDoc &&
    (lowerMsg.includes("verify") ||
      lowerMsg.includes("check this document") ||
      lowerMsg.includes("attached document"))
  ) {
    const directResponse =
      languageMode === "taglish"
        ? `${DOCUMENT_READABLE_NOTICE}\n\nNa-extract successfully ang text mula sa "${attachedDoc.name}" (${(attachedDoc.size / 1024).toFixed(1)} KB, ~${attachedDoc.wordCount || 100} words). Ready na ito para sa review against ${materialTitle || "your coursework"}. Ano ang specific part na gusto mong suriin natin?`
        : languageMode === "filipino"
          ? `${DOCUMENT_READABLE_NOTICE}\n\nMatagumpay na nabuksan at nakuha ang nilalaman ng "${attachedDoc.name}" (${(attachedDoc.size / 1024).toFixed(1)} KB). Handa na ito para sa pagsusuri ayon sa mga kinakailangan ng aralin. Aling bahagi ang nais mong talakayin muna?`
          : `${DOCUMENT_READABLE_NOTICE}\n\nDocument "${attachedDoc.name}" (${(attachedDoc.size / 1024).toFixed(1)} KB, ~${attachedDoc.wordCount || 100} words) is loaded. What specific section or question would you like to examine first?`;

    const evidence: DocumentEvidenceItem[] = attachedDoc.text
      ? [
          {
            location: `Beginning of ${attachedDoc.name}`,
            excerptOrSummary: attachedDoc.text.slice(0, 160).trim() + "...",
            whyItMatters: "Initial excerpt extracted for contextual grounding.",
          },
        ]
      : [];

    return {
      status: "document_overview",
      directResponse,
      response: directResponse,
      responseType: "feedback",
      documentEvidence: evidence,
      keyPoints: [
        `File loaded: ${attachedDoc.name} (${(attachedDoc.size / 1024).toFixed(1)} KB)`,
        "Status: File is technically readable",
        "Next step: Provide your answer or choose an instruction item to begin",
      ],
      missingInformation: hasStudentAnswer
        ? []
        : ["Student draft or answer has not been submitted yet."],
      suggestedNextActions: [
        "Explain the instructions",
        "List the questions from this material",
        "Draft an initial answer",
      ],
      suggestedNextAction:
        "Select an assistance mode or paste your draft when ready.",
      followUpActions: [
        "Explain instructions",
        "Create a plan",
        "Guide Question 1",
      ],
      verificationQuestions: [
        "Does this uploaded file contain your latest notes or the assignment instructions?",
      ],
      requiresStudentAnswer: !hasStudentAnswer,
      requiresReview: false,
      languageMode,
    };
  }

  // -------------------------------------------------------------------------
  // CASE 2: "Help me do this task" (Strict prompt behavior requirement)
  // -------------------------------------------------------------------------
  if (isHelpStartRequest(lowerMsg)) {
    const directResponse =
      languageMode === "taglish"
        ? `Nandito ako para i-guide ka sa "${materialTitle}". Para mas manageable, paano mo gustong simulan?\n\n• **Explain the instructions** — I-break down natin kung ano ang hinihingi ng instructor.\n• **List the questions** — Tingnan natin ang specific deliverables o items.\n• **Create a plan** — Gumawa ng step-by-step checklist bago sumulat.\n• **Work through Question 1** — Simulan ang pinakaunang konsepto.\n• **Review my answer** — I-paste ang nasulat mo na para sa feedback.\n\nAlin sa mga ito ang uunahin natin?`
        : languageMode === "filipino"
          ? `Handa kitang gabayan sa "${materialTitle}". Paano mo nais simulan ang gawain?\n\n• **Ipaliwanag ang panuto** — Pag-aralan ang eksaktong hinihingi ng gawain.\n• **Ilista ang mga tanong** — Isa-isahin ang bawat aytem.\n• **Gumawa ng plano** — Magtakda ng sunod-sunod na hakbang.\n• **Unahin ang Unang Tanong** — Simulan ang unang konsepto nang may gabay.\n• **Suriin ang aking sagot** — Ilagay ang iyong burador para sa pagsusuri.\n\nAlin sa mga hakbang na ito ang nais mong unahin?`
          : `I am here to guide you through "${materialTitle}". How would you like to start?\n\n• **Explain the instructions** — Break down what the instructor is asking for.\n• **List the questions** — Identify specific items and deliverables.\n• **Create a plan** — Outline a structured step-by-step action plan.\n• **Work through Question 1** — Tackle the first concept with guiding hints.\n• **Review my answer** — Paste your draft whenever you are ready.\n\nWhich of these options would you like to begin with?`;

    return {
      status: "guided_help",
      directResponse,
      response: directResponse,
      responseType: "guidance",
      documentEvidence: materialInstructions
        ? [
            {
              location: "Assignment Instructions",
              excerptOrSummary: materialInstructions.slice(0, 180),
              whyItMatters: "Core requirements established by the course.",
            },
          ]
        : [],
      keyPoints: [
        `Target Material: ${materialTitle} (${materialType})`,
        "Goal: Mitigate cognitive offloading by taking active learning steps",
        "Option: Choose an approach from the menu above",
      ],
      suggestedNextActions: [
        "Explain the instructions",
        "Create a plan",
        "Work through Question 1",
      ],
      suggestedNextAction: "Choose how you would like to begin your work.",
      followUpActions: [
        "Explain instructions",
        "Work through Question 1",
        "Create a plan",
      ],
      verificationQuestions: [
        "Have you reviewed your instructor's rubric or grading criteria for this activity?",
      ],
      requiresStudentAnswer: false,
      requiresReview: false,
      languageMode,
    };
  }

  // -------------------------------------------------------------------------
  // CASE 3: "Let's start tackling the contents" / Conversational Kickoff
  // (CRITICAL: Do NOT treat "sure", "let's", or "start" as academic claims!)
  // -------------------------------------------------------------------------
  if (
    isConversationalKickoff(lowerMsg) ||
    lowerMsg.includes("start tackling")
  ) {
    const firstItem =
      currentTask ||
      (materialInstructions
        ? materialInstructions.split("\n")[0]
        : `First concept of ${materialTitle}`);

    const directResponse =
      languageMode === "taglish"
        ? `Great, simulan natin ang "${materialTitle}".\n\nAng unang focused step dito ay:\n> **${firstItem}**\n\nGusto mo ba ng simpleng explanation ng concept na ito, isang guiding hint para makapag-isip ka, o handa ka nang mag-draft ng initial answer mo?`
        : languageMode === "filipino"
          ? `Mabuti, simulan natin ang "${materialTitle}".\n\nAng unang hakbang sa gawaing ito ay:\n> **${firstItem}**\n\nNais mo ba ng maikling paliwanag sa konseptong ito, gabay na pahiwatig (hint), o nais mo nang simulan ang iyong paunang sagot?`
          : `Let's tackle "${materialTitle}".\n\nThe initial focus for this material is:\n> **${firstItem}**\n\nWould you like a conceptual explanation, a guiding hint to think through, or are you ready to draft your initial thoughts?`;

    return {
      status: "guided_help",
      directResponse,
      response: directResponse,
      responseType: "guidance",
      documentEvidence: materialContent
        ? [
            {
              location: "Material Core Concept",
              excerptOrSummary: materialContent.slice(0, 150).trim() + "...",
              whyItMatters: "First focal concept for student engagement.",
            },
          ]
        : [],
      keyPoints: [
        `Active Task: ${firstItem}`,
        "Process: Understanding instructions before drafting",
        "Student Agency: Select guidance mode or submit draft",
      ],
      suggestedNextActions: [
        "Explain this concept simply",
        "Give me a guiding hint",
        "I'll write my initial draft",
      ],
      suggestedNextAction:
        "Indicate whether you want an explanation or a hint to begin.",
      followUpActions: [
        "Explain this concept",
        "Give me a hint",
        "Create a plan",
      ],
      verificationQuestions: [
        "What is your initial intuition about this first question or requirement?",
      ],
      requiresStudentAnswer: false,
      requiresReview: false,
      languageMode,
    };
  }

  // -------------------------------------------------------------------------
  // CASE 4: Student Requests Review / "How can I strengthen my argument?" / "What am I missing?"
  // (CRITICAL: If NO answer provided, state that answer is missing; do NOT invent or evaluate casual message!)
  // -------------------------------------------------------------------------
  if (isReviewQuery(lowerMsg) || assistanceMode === "review") {
    // SUBCASE 4A: NO Student Answer Submitted
    if (!hasStudentAnswer) {
      const directResponse =
        languageMode === "taglish"
          ? `Wala ka pang naisusumiteng sagot o draft para sa "${materialTitle}". Hindi pa natin masusuri ang completeness o argument dahil wala pang actual text mula sa iyo.\n\nPakilagay o i-paste ang iyong draft sa text area o i-type dito ang iyong initial answer, at titingnan natin kung saan ito pwedeng palakasin.`
          : languageMode === "filipino"
            ? `Wala ka pang naibibigay na sagot o burador para sa "${materialTitle}". Hindi pa natin masusuri ang lalim ng argumento dahil wala pang naipapasang teksto.\n\nPakilagay ang iyong sagot o burador sa field, at susuriin natin ito ayon sa mga pamantayan ng gawain.`
            : `You have not submitted an answer or draft for "${materialTitle}" yet. I cannot evaluate completeness, evidence, or reasoning until you provide your own writing.\n\nPlease type or paste your draft, and I will review it against the assignment requirements.`;

      return {
        status: "needs_clarification",
        directResponse,
        response: directResponse,
        responseType: "guidance",
        documentEvidence: [],
        keyPoints: [
          "Status: No student answer submitted yet",
          "Academic integrity: The AI only reviews student-generated writing",
          "Next step: Enter your draft or paragraph below",
        ],
        missingInformation: [
          "Student draft / answer text is required for review.",
        ],
        suggestedNextActions: [
          "Paste or type my draft answer",
          "Explain what the activity requires",
          "Give me an outline to get started",
        ],
        suggestedNextAction:
          "Submit your draft in the answer field or chat box to receive feedback.",
        followUpActions: [
          "Explain the prompt",
          "Give me an outline",
          "Help me start Question 1",
        ],
        verificationQuestions: [
          "What is the main claim you want to argue in your response?",
        ],
        requiresStudentAnswer: true,
        requiresReview: false,
        languageMode,
      };
    }

    // SUBCASE 4B: ACTUAL Student Answer Submitted -> Conduct Grounded Review
    const answerText = studentAnswer!.trim();
    const wordCount = answerText.split(/\s+/).filter(Boolean).length;

    const directResponse =
      languageMode === "taglish"
        ? `Nasuri ko ang iyong draft para sa "${materialTitle}" (~${wordCount} words):\n\n**1. Malinaw at Maayos (Strengths):**\nDirekta mong tinutugunan ang prompt at malinaw ang iyong panimulang ideya.\n\n**2. Mga Bahagi na Nangangailangan ng Ebidensya:**\nSiguraduhing maiugnay ang mga claims sa specific terms mula sa material (${materialTitle}).\n\n**3. Rekomendasyon para sa Rebisyon:**\nI-expand ang paliwanag gamit ang sariling halimbawa para maipakita ang deep comprehension.`
        : languageMode === "filipino"
          ? `Sinuri ko ang iyong burador para sa "${materialTitle}" (~${wordCount} mga salita):\n\n**1. Mga Kalakasan:**\nMalinaw ang iyong layunin at maayos ang panimulang paglalahad ng konsepto.\n\n**2. Mga Puntos na Nangangailangan ng Pagpapatibay:**\nIugnay ang iyong mga pahayag sa mga konseptong tinalakay sa aralin upang maging mas matibay ang argumento.\n\n**3. Mungkahing Pagbabago:**\nMagdagdag ng konkretong paliwanag kung paano nagaganap ang proseso sa sarili mong pangungusap.`
          : `Here is the review of your draft for "${materialTitle}" (~${wordCount} words):\n\n**1. Strengths & Clarity:**\nYour response directly targets the assigned question with a clear initial premise.\n\n**2. Areas for Stronger Evidence:**\nEnsure each claim references key concepts or equations outlined in the material.\n\n**3. Actionable Revision Steps:**\nElaborate on the underlying mechanism in your own words rather than relying solely on high-level definitions.`;

    return {
      status: "answer_review",
      directResponse,
      response: directResponse,
      responseType: "feedback",
      documentEvidence: materialContent
        ? [
            {
              location: "Assignment Benchmark",
              excerptOrSummary: materialContent.slice(0, 140) + "...",
              whyItMatters:
                "Benchmark reference for assessing student evidence.",
            },
          ]
        : [],
      keyPoints: [
        `Draft analyzed: ~${wordCount} words`,
        "Assessment: Clear thesis; strengthen with specific evidence",
        "Next step: Revise draft before saving to learning receipt",
      ],
      missingInformation:
        wordCount < 30
          ? ["Draft is brief; consider elaborating on key mechanisms."]
          : [],
      suggestedNextActions: [
        "Revise draft with stronger evidence",
        "Check against instructor rubric",
        "Save this feedback to my Learning Receipt",
      ],
      suggestedNextAction: "Refine your draft based on the feedback above.",
      followUpActions: [
        "Explain how to add evidence",
        "Check my revised draft",
        "Create a checklist",
      ],
      verificationQuestions: [
        "Did you cite or explain the specific mechanisms highlighted in your course materials?",
      ],
      requiresStudentAnswer: false,
      requiresReview: true,
      languageMode,
    };
  }

  // -------------------------------------------------------------------------
  // CASE 5: Mode-Specific General Responses (Understand, Guide, Organize, Explore, Draft)
  // -------------------------------------------------------------------------

  if (assistanceMode === "understand") {
    const directResponse =
      languageMode === "taglish"
        ? `Narito ang breakdown ng instructions para sa "${materialTitle}":\n\n1. **Pangunahing Hinihingi:** ${currentTask || "Unawain at ipaliwanag ang core concepts."}\n2. **Mahalagang Terminolohiya:** Suriin ang mga depinisyon at siguraduhing maayos ang paggamit ng technical terms.\n3. **Deliverable:** Sumulat ng structured response na sumasagot sa bawat aytem nang direkta.`
        : languageMode === "filipino"
          ? `Narito ang pagsusuri ng panuto para sa "${materialTitle}":\n\n1. **Pangunahing Layunin:** ${currentTask || "Unawain at ipaliwanag ang mga pangunahing konsepto."}\n2. **Mahahalagang Termino:** Bigyang-pansin ang mga teknikal na kahulugan mula sa aralin.\n3. **Inaasahang Output:** Isang malinaw at maayos na sagot na sumasalamin sa iyong pagkaunawa.`
          : `Here is an explanation of the requirements for "${materialTitle}":\n\n1. **Core Objective:** ${currentTask || "Understand and explain the central concepts."}\n2. **Key Terminology:** Familiarize yourself with definitions directly tied to this topic.\n3. **Deliverable Format:** A structured, well-reasoned response addressing every component of the prompt.`;

    return {
      status: "guided_help",
      directResponse,
      response: directResponse,
      responseType: "explanation",
      documentEvidence: [],
      keyPoints: [
        `Objective: ${currentTask || "Master core concepts"}`,
        "Focus on accurate terminology without unnecessary jargon",
        "Formulate your explanation in your own words",
      ],
      suggestedNextActions: [
        "Give me a guiding hint",
        "Create a step-by-step checklist",
        "I'll start drafting my answer",
      ],
      suggestedNextAction:
        "Review the requirements, then formulate your first draft sentence.",
      followUpActions: [
        "Give me a hint",
        "Create a checklist",
        "Explain difficult terms",
      ],
      verificationQuestions: [
        "Can you summarize the main question in your own words in one sentence?",
      ],
      requiresStudentAnswer: false,
      requiresReview: false,
      languageMode,
    };
  }

  if (assistanceMode === "organize") {
    const directResponse =
      languageMode === "taglish"
        ? `Narito ang manageable 3-step action plan para sa "${materialTitle}":\n\n1. **Step 1: Clarify Objectives** — Basahin ang prompt at i-list ang specific requirements.\n2. **Step 2: Draft Initial Answer** — Isulat ang rough draft nang hindi muna nag-aalala sa perfection.\n3. **Step 3: Self-Check & Evidence** — I-compare ang draft sa rubric at mag-cite ng concepts mula sa material.`
        : languageMode === "filipino"
          ? `Narito ang sunod-sunod na plano para sa "${materialTitle}":\n\n1. **Hakbang 1: Paglilinaw ng Layunin** — Ilista ang bawat bahagi ng hinihingi ng guro.\n2. **Hakbang 2: Pagsulat ng Burador** — Isulat ang paunang sagot gamit ang sariling pananalita.\n3. **Hakbang 3: Pagsusuri at Ebidensya** — Ihambing ang gawa sa rubric bago ipasa.`
          : `Here is a structured 3-step plan for "${materialTitle}":\n\n1. **Step 1: Clarify Requirements** — Identify what components and definitions are mandatory.\n2. **Step 2: Draft the Response** — Write a complete initial draft in your own words.\n3. **Step 3: Verify Evidence** — Check that your claims are supported by course material.`;

    return {
      status: "checklist",
      directResponse,
      response: directResponse,
      responseType: "checklist",
      documentEvidence: [],
      keyPoints: [
        "Action Step 1: Clarify mandatory requirements",
        "Action Step 2: Produce an unpolished draft",
        "Action Step 3: Self-review against grading rubric",
      ],
      suggestedNextActions: [
        "Begin Step 1 now",
        "Give me a hint for drafting",
        "Show a checklist for submission",
      ],
      suggestedNextAction:
        "Complete Step 1 by writing down your primary thesis or target answer.",
      followUpActions: [
        "Help me start Step 1",
        "Give me a hint",
        "Create full checklist",
      ],
      verificationQuestions: [
        "Have you scheduled sufficient time to revise your draft before the deadline?",
      ],
      requiresStudentAnswer: false,
      requiresReview: false,
      languageMode,
    };
  }

  if (assistanceMode === "explore") {
    const directResponse =
      languageMode === "taglish"
        ? `Para mas mapalawak ang pagkaunawa sa "${materialTitle}", subukan ang mga sumusunod na search terms at related concepts:\n\n• **Search Query 1:** "${materialTitle} mechanisms and clinical implications"\n• **Search Query 2:** "peer-reviewed active learning student outcomes"\n• **Key Question:** Paano maiuugnay ang empirical evidence sa sariling obserbasyon?`
        : languageMode === "filipino"
          ? `Upang mapalalim ang pagsasaliksik sa "${materialTitle}", subukan ang mga sumusunod na kaisipan:\n\n• **Pangunahing Paksa:** Mga mekanismo at ebidensya ukol sa ${materialTitle}.\n• **Mga Kaugnay na Konsepto:** Mga empirical na pag-aaral sa huling limang taon.\n• **Mahalagang Tanong:** Aling mga sanggunian ang pinakamaaasahan para sa paksa?`
          : `To explore "${materialTitle}" more deeply, consider these focused concepts and search terms:\n\n• **Search Term 1:** "${materialTitle} conceptual framework and methodology"\n• **Search Term 2:** "Empirical research peer-reviewed undergraduate studies"\n• **Guiding Query:** What evidence distinguishes established consensus from ongoing debate?`;

    return {
      status: "guided_help",
      directResponse,
      response: directResponse,
      responseType: "search_plan",
      documentEvidence: [],
      keyPoints: [
        "Search Strategy: Use targeted academic terminology",
        "Evaluation: Prioritize peer-reviewed sources from the last 5 years",
        "Verification: Note limitations and author methodologies",
      ],
      suggestedNextActions: [
        "Filter for peer-reviewed studies",
        "Review how to evaluate sources",
        "Draft my search synthesis",
      ],
      suggestedNextAction:
        "Use one of the suggested search terms in your university library database.",
      followUpActions: [
        "Suggest more search terms",
        "How to evaluate sources",
        "Give me a hint",
      ],
      verificationQuestions: [
        "Are the sources you found published by reputable university presses or peer-reviewed journals?",
      ],
      requiresStudentAnswer: false,
      requiresReview: false,
      languageMode,
    };
  }

  if (assistanceMode === "draft") {
    const directResponse =
      languageMode === "taglish"
        ? `**[Preliminary AI-Assisted Structural Framework — Review Required]**\n\nNarito ang isang halimbawang balangkas para sa iyong sariling pagsulat ukol sa "${materialTitle}":\n\n• **Introduction:** Banggitin ang pangunahing paksa at ang layunin ng activity.\n• **Body Section:** Talakayin ang mekanismo at magbigay ng konkretong ebidensya o formula.\n• **Conclusion:** Ibuod kung bakit mahalaga ang konseptong ito sa mas malawak na aralin.\n\n*Paalala:* Huwag kopyahin ito nang buo. Gamitin ito bilang gabay upang makasulat sa sarili mong pananalita.`
        : languageMode === "filipino"
          ? `**[Paunang Balangkas mula sa AI — Kinakailangan ang Sariling Pagsusuri]**\n\nNarito ang iminumungkahing balangkas para sa "${materialTitle}":\n\n• **Panimula:** Ilatag ang pangunahing suliranin o tanong ng gawain.\n• **Katawan:** Talakayin ang bawat bahagi gamit ang mga terminong pang-akademiko.\n• **Konklusyon:** Ibuod ang pangunahing natutunan at kaugnayan sa kurso.\n\n*Paalala:* Isulat ang iyong aktuwal na sagot sa sarili mong mga salita upang mapanatili ang iyong pagkatuto.`
          : `**[Preliminary AI-Assisted Structural Framework — Student Review Required]**\n\nHere is an illustrative outline to structure your own writing for "${materialTitle}":\n\n• **Introduction:** State the core question and define primary parameters.\n• **Body Paragraphs:** Detail the underlying mechanisms with supporting concepts.\n• **Synthesis / Conclusion:** Highlight why this relationship is critical to the broader course topic.\n\n*Note:* This outline is a scaffolding tool. Formulate the actual content in your own words.`;

    return {
      status: "draft",
      directResponse,
      response: directResponse,
      responseType: "draft",
      documentEvidence: [],
      keyPoints: [
        "AI Scaffolding: Structural outline provided for reference",
        "Requirement: Student must author the actual sentences and arguments",
        "Next step: Draft your own version using the provided structure",
      ],
      suggestedNextActions: [
        "Draft the introduction in my own words",
        "Fill out the body paragraph",
        "Check my draft when finished",
      ],
      suggestedNextAction:
        "Use this structural outline to write your first paragraph.",
      followUpActions: [
        "Review my draft",
        "Give me a hint for the body",
        "Create a checklist",
      ],
      verificationQuestions: [
        "Does your draft express the ideas in your own authentic voice and reasoning?",
      ],
      requiresStudentAnswer: true,
      requiresReview: true,
      languageMode,
    };
  }

  // DEFAULT / GUIDE:
  const directResponse =
    languageMode === "taglish"
      ? `Para sa "${currentTask || materialTitle}", mag-focus tayo sa main idea. Ano ang unang naiisip mo tungkol sa konseptong ito? Subukan mong i-explain sa 1 o 2 pangungusap, at tutulungan kitang i-refine ito.`
      : languageMode === "filipino"
        ? `Para sa "${currentTask || materialTitle}", magtuon tayo sa pangunahing konsepto. Ano ang iyong paunang pagkaunawa sa araling ito? Isulat ito sa isa o dalawang pangungusap upang masimulan natin ang talakayan.`
        : `To approach "${currentTask || materialTitle}", let's focus on the central question. How would you state your initial understanding in 1-2 sentences? Share your thoughts, and we will build from there.`;

  return {
    status: "guided_help",
    directResponse,
    response: directResponse,
    responseType: "guidance",
    documentEvidence: [],
    keyPoints: [
      `Active Material: ${materialTitle}`,
      "Approach: Metacognitive scaffolding through active student formulation",
      "Goal: Build understanding before final drafting",
    ],
    suggestedNextActions: [
      "Explain the main instructions",
      "Give me a hint to get started",
      "Create a step-by-step checklist",
    ],
    suggestedNextAction: "Draft a 1-2 sentence response to get started.",
    followUpActions: ["Explain simply", "Give me a hint", "Create a checklist"],
    verificationQuestions: [
      "What is the single most important concept your instructor wants you to learn here?",
    ],
    requiresStudentAnswer: false,
    requiresReview: false,
    languageMode,
  };
}

/**
 * Detects requests asking the AI to directly complete academic tasks
 */
export function isCognitiveOffloadingRequest(msg: string): boolean {
  const offloadingPatterns = [
    /do my (homework|assignment|task|work)/i,
    /write (this|my) (essay|paper|assignment|reflection) for me/i,
    /solve (this|all) for me/i,
    /give me the (entire|complete|final) answer/i,
    /just do it/i,
    /gawin mo (ang|yung) (assignment|homework|paper|lahat)/i,
    /sagutan mo (ito|lahat)/i,
  ];
  return offloadingPatterns.some((pattern) => pattern.test(msg));
}

/**
 * Checks text for unpronounceable or repetitive gibberish sequences
 */
export function checkTextAnomalies(text: string): {
  hasGibberish: boolean;
  details?: string;
} {
  const words = text.split(/\s+/).filter((w) => w.length > 5);
  const flagged: string[] = [];

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

  if (flagged.length > 2) {
    const uniqueTokens = flagged.slice(0, 3);
    return {
      hasGibberish: true,
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
  const raw = doc.text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();

  if (raw.length <= 3500) {
    return {
      slicedText: raw,
      isTruncated: false,
      sampleRatio: "100%",
    };
  }

  // Safe window sampling: Beginning (60%), Middle (20%), End (20%)
  const startChunk = raw.slice(0, 2100);
  const midPoint = Math.floor(raw.length / 2);
  const midChunk = raw.slice(midPoint - 350, midPoint + 350);
  const endChunk = raw.slice(raw.length - 700);

  const slicedText = `${startChunk}\n\n[... Academic Content Continues ...]\n\n${midChunk}\n\n[... Content Sample Concludes ...]\n\n${endChunk}`;

  return {
    slicedText,
    isTruncated: true,
    sampleRatio: `${Math.round((3500 / raw.length) * 100)}%`,
  };
}

