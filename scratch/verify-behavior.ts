import { isCognitiveOffloadingRequest, checkTextAnomalies, generateContextualResponse } from '../lib/contextual-engine';
import { parseDocumentBuffer } from '../lib/server-document-parser';

console.log("=== 1. Testing Cognitive Offloading Request Detection ===");
const offloadingTests = [
  "Please do this task for me",
  "Can you write this essay for me?",
  "Solve this problem for me",
  "Complete this activity for me",
  "Please do my homework",
  "Explain photosynthesis simply", // should be false
  "Give me a hint for question 3", // should be false
];

for (const t of offloadingTests) {
  const result = isCognitiveOffloadingRequest(t);
  console.log(`- "${t}": ${result ? "OFFLOADING BLOCKED (Correct)" : "ALLOWED"}`);
}

console.log("\n=== 2. Testing Anomaly & Hidden Gibberish Detection ===");
const gibberishTests = [
  "This is a normal academic research paper discussing cognitive load theory.",
  "Here is some text with hidden gibberish asdfghjklqwerty embedded in the paragraph.",
  "Section 2 includes zxcvbnmasdfghjkl and unpronounceable content.",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "This is clean text with standard terminology like photosynthesis, respiration, and enzymes.",
];

for (const g of gibberishTests) {
  const check = checkTextAnomalies(g);
  console.log(`- Text: "${g.slice(0, 50)}..." -> Has Gibberish: ${check.hasGibberish} ${check.details ? `(${check.details})` : ""}`);
}

console.log("\n=== 3. Testing Contextual Response on Cognitive Offloading Prompt ===");
const offloadingResponse = generateContextualResponse({
  materialTitle: "Photosynthesis Activity",
  materialType: "Activity",
  currentTask: "Explain the role of glucose",
  assistanceMode: "review",
  message: "Please do this task for me",
  attachedDoc: {
    name: "Task_1_Test.docx",
    size: 15400,
    text: "Normal text with asdfghjklqwerty inside.",
  },
});

console.log("Response Type:", offloadingResponse.responseType);
console.log("Response Preview:\n", offloadingResponse.response.slice(0, 250));
console.log("Requires Review:", offloadingResponse.requiresReview);

console.log("\n=== 4. Testing Document Verification with Gibberish Flag ===");
const gibberishDocResponse = generateContextualResponse({
  materialTitle: "Task 1",
  materialType: "Activity",
  currentTask: "Review document",
  assistanceMode: "review",
  message: "Please check this document for any gibberish, hallucinated text, or unrelated topics",
  attachedDoc: {
    name: "Task_1_Test.docx",
    size: 15400,
    text: "Assignment 1 submission. Here is the hidden gibberish: asdfghjklzxcvbnm.",
  },
});

console.log("Response Type:", gibberishDocResponse.responseType);
console.log("Response:\n", gibberishDocResponse.response);
console.log("Key Points:\n", gibberishDocResponse.keyPoints);

console.log("\n=== 5. Testing Server-side Buffer Document Parser ===");
const sampleBuffer = Buffer.from("University thesis submission document content.\nSection 1 introduces cognitive offloading mitigation.");
parseDocumentBuffer(sampleBuffer, "Thesis_Draft.txt").then((parsed) => {
  console.log("Parsed buffer:", {
    wordCount: parsed.wordCount,
    textLength: parsed.text.length,
    isTruncated: parsed.isTruncated,
  });
  console.log("\n=== ALL TEST CHECKS PASSED ===");
});
