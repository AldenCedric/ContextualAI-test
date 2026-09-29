# StudyFlow — Contextual AI Academic Companion

A polished Next.js prototype designed for thesis defense presentation, demonstrating contextual AI-assisted academic task support for university students.

> **Product Statement:**  
> _"From academic material to manageable next steps—with AI assistance you can review and control."_

> **Alternative Product Description:**  
> _"StudyFlow helps students understand activities, handouts, assignments, and projects by providing contextual AI guidance instead of only generating direct answers."_

---

## 1. Project Purpose

StudyFlow addresses the challenge of cognitive overload and passive dependency in generative AI for higher education. Rather than acting as a generic chatbot that produces unvetted full answers, StudyFlow provides **Contextual AI-Assisted Academic Task Support**.

The application scaffolds students through the workflow:  
**Academic Material → Understanding → Manageable Actions → Contextual AI Assistance → Student Review**

Students can work with a wide range of academic materials:

- Class activities & worksheets
- Handouts & readings
- Problem sets
- Presentations
- Research activities
- Assignments & project milestones

---

## 2. Technology Stack

- **Framework:** Next.js 16.3.7 (App Router, Turbopack)
- **Library:** React 19.2.8
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Language Model:** Google Gemini 3.8 Flash (`gemini-3.8-flash`) via server-side REST API route with centralized constants ([`lib/constants.ts`](ContextualAI-test/lib/constants.ts))
- **Continuous Integration (CI):** GitHub Actions ([`.github/workflows/ci.yml`](ContextualAI-test/.github/workflows/ci.yml)) validating TypeScript type check, ESLint, and production build on every push and pull request to `main`
- **Dynamic Contextual Engine:** Client- and server-side data-driven scaffolding engine synthesizing responses dynamically from material metadata, student queries, and assistance modes ([`lib/contextual-engine.ts`](ContextualAI-test/lib/contextual-engine.ts))
- **Architecture:** Zero-database demonstration prototype using client-side state and browser `localStorage` for offline persistence

---

## 3. Installation Steps

Clone the repository and install dependencies using standard Node package managers:

```bash
git clone <repository-url>
cd contextual-ai
npm install
```

---

## 4. Environment-Variable Setup

Create a `.env.local` file in the root directory (or ensure your server-side environment contains the variables):

```env
GEMINI_API_KEY=
GEMINI_API_KEY_FALLBACK_1=
GEMINI_API_KEY_FALLBACK_2=
```

> **Security Warning:**  
> ⚠️ Real Gemini API keys must remain strictly confidential on the server side. Never prefix them with `NEXT_PUBLIC_`, never commit `.env` or `.env.local` to git (both are protected in `.gitignore`), and never expose them in client components or error messages.

---

## 5. Development & Verification Commands

All development, linting, and build commands are orchestrated using `npm`:

```bash
# Start the Next.js development server
npm run dev

# Run TypeScript strict type-checking
npx tsc --noEmit

# Run ESLint validation
npm run lint

# Compile production build
npm run build

# Start production server
npm start
```

### GitHub Actions CI Pipeline

The project includes an automated CI workflow at [`.github/workflows/ci.yml`](file:///c:/Users/user/source/repos/AldenCedric/ContextualAI-test/.github/workflows/ci.yml) that executes sequentially on every push and pull request to `main`:

1. **Dependency Installation:** `npm install` using Node 22 with npm caching.
2. **Type Check:** `npx tsc --noEmit` verifies strict TypeScript typing across all components, utilities, and API routes.
3. **Lint:** `npm run lint` enforces Next.js and React coding standards.
4. **Build:** `npm run build` verifies full Turbopack static and dynamic route compilation.
5. **Concurrency Management:** Redundant runs on the same branch are automatically cancelled (`cancel-in-progress: true`) to preserve runner resources.

---

## 6. How to Test AI Modes, Key Rotation & Dynamic Fallback Behavior

### Testing the Primary Gemini Key

1. Navigate to `/dashboard` or `/materials`.
2. Select **"Photosynthesis Activity"** (or any custom material).
3. Click **"Open Task Companion"**.
4. Select **Guide** mode.
5. Send: _"Give me a hint without giving me the complete answer."_
6. Notice the green **Live AI** indicator badge, footer indicator showing `Gemini 3.8 Flash`, and structured response card (key points, verification questions, and follow-up prompts).

### Testing Fallback Behavior (Key Rotation)

1. Go to `/prototype-controls`.
2. Under **AI Service Mode**, choose **"Force Fallback Key 1"** (simulates primary key quota exhaustion or temporary outage) or **"Force Fallback Key 2"**.
3. Notice the yellow top banner: _"Prototype demonstration controls enabled — using fallback-1 mode."_
4. Return to the Task Companion and send another message.
5. The system automatically switches to the backup AI key and displays the **Backup AI service** badge.

### Testing the Dynamic Contextual Scaffolding Engine (Zero-Hardcoded Fallback)

1. Go to `/prototype-controls`.
2. Select **"Force Local Template"** or **"Demo Simulation Mode"**.
3. Return to the Task Companion with any material — including custom-titled materials or diverse subjects (e.g., Literature, History, Computer Science).
4. Send an inquiry (e.g., _"Help me understand how recursion works"_ or _"What are the main arguments for this case?"_).
5. **Observe Dynamic Synthesis:**
   - The engine does **not** return rigid, hardcoded text.
   - It performs intelligent tokenization and stop-word filtering ([`extractKeywords`](ContextualAI-test/lib/contextual-engine.ts#L284)) to extract meaningful concepts directly from your input.
   - It invokes [`buildModeScaffolding`](ContextualAI-test/lib/contextual-engine.ts#L315) across the selected assistance mode (`explain`, `guide`, `organize`, `explore`, `review`, `draft`), tailoring the pedagogical structure to the material title, material type, active task, and extracted keywords.
   - The response remains formatted as a structured, interactive card with key points, next steps, verification questions, and follow-up chips.

### Testing Metacognitive Scaffolding & Safeguards

1. **Cognitive Offloading Refusal:** Try sending _"Do my homework for me"_ or _"Write this entire essay for me"_. The engine detects the offloading trigger and politely refuses to do the student's work, providing guiding hints instead.
2. **Document Anomaly Detection:** Attach a document with gibberish (e.g., keyboard mashing or excessive consonant clusters). The system detects the anomaly and flags it before processing.

---

## 7. Presentation Demo Sequence (3 to 5 Minutes)

Follow this exact sequence during the thesis defense presentation:

1. **Open the Dashboard (`/dashboard`):** Show the greeting, today's next step, upcoming deadlines, AI literacy tip, and live service status.
2. **Open "Photosynthesis Activity":** Review instructions, description, current task, and student notes area.
3. **Open the Task Companion:** Highlight the contextual header (material title, current task, active assistance mode, service status) and footer model indicator (`Gemini 3.8 Flash`).
4. **Select Guide mode:** Explain the cognitive scaffolding philosophy (hints and questions rather than instant answers).
5. **Send prompt:** _"Give me a hint without giving me the complete answer."_
6. **Show the Gemini response:** Walk through response card components: key points, verification question, suggested next step.
7. **Select "Explain this more simply":** Click the follow-up chip to trigger an immediate contextual query.
8. **Show the follow-up response:** Point out that the model preserves context and responds with structured clarity.
9. **Select "Save Response":** Triggers the cognitive checkpoint modal (_"Review this before saving"_).
10. **Answer the review questions:** Fill in main idea, what to verify, and what to explain in own words.
11. **Save & Review AI Learning Receipt:** Inspect the local verifiable record showing student agency, date/time, and review answers.
12. **Open "Academic Stress Handout":** Switch context to a different material type.
13. **Ask:** _"Help me identify the main ideas and what I should verify."_
14. **Switch to Local Fallback / Demo Mode:** Navigate to `/prototype-controls` and select **Force Local Template** or **Demo Simulation Mode**.
15. **Send an arbitrary subject request:** In the Task Companion, submit a novel inquiry (e.g., _"Break down the methodology section"_).
16. **Demonstrate Dynamic Resilience:** Show that the application never crashes and does **not** rely on hardcoded static answers; it synthesizes a material- and query-aware pedagogical scaffold on the fly.
17. **Highlight CI/CD Quality Assurance:** Mention that all TypeScript contracts, linting rules, and production builds are continuously validated via GitHub Actions with pnpm.
18. **Open Future-Feature Roadmap:** Review the planned roadmap items for production transition.

---

## 8. Implemented Features

### Generic Academic Routes
- `/` — Presentation landing page with interactive flow visualization and mode showcase.
- `/dashboard` — Daily agenda, continue where left off, deadlines, literacy prompts, quick actions.
- `/materials` — Categorized directory with live title search and material-type filtering.
- `/materials/[materialId]` — Detailed material briefing, progress tracker, interactive student notes, and saved assistance drawer.
- `/materials/[materialId]/chat` — Full contextual Task Companion with live prompt suggestions, mode switching, and structured card rendering.
- `/prototype-controls` — Interactive defense control panel with key simulation toggles and demo reset.

### 6 Contextual Assistance Modes
- 💡 **Explain:** Clarifies instructions or foundational concepts with conceptual breakdown and analogies.
- 🧭 **Guide:** Provides hints, prerequisites, and probing questions before giving a full answer.
- 📋 **Organize:** Breaks broad tasks into sequential, actionable checkpoints.
- 🔍 **Explore:** Suggests targeted search terms and related inquiry questions from multiple angles.
- ✅ **Review:** Reviews the student's attempt across completeness, accuracy, clarity, and originality.
- 📝 **Draft:** Generates preliminary outlines clearly tagged with _"Preliminary AI-assisted output — review required."_

### Dynamic Contextual Scaffolding Engine ([`lib/contextual-engine.ts`](ContextualAI-test/lib/contextual-engine.ts))
- **Elimination of Hardcoded Branches:** Replaced all hardcoded subject-specific paths with a data-driven synthesis pipeline.
- **Intelligent Keyword Extraction ([`extractKeywords`](ContextualAI-test/lib/contextual-engine.ts#L284)):** Natural language tokenization with stop-word filtering extracts meaningful academic terminology from user messages.
- **Mode-Specific Pedagogical Scaffolding ([`buildModeScaffolding`](ContextualAI-test/lib/contextual-engine.ts#L315)):** Dedicated strategies for each of the 6 assistance modes dynamically interpolate material metadata (title, type, task) with extracted keywords.
- **Resilient JSON Recovery:** API routes dynamically construct fallback response cards using material metadata when raw model output cannot be parsed as JSON, eliminating brittle static fallbacks.
- **Core Thesis Safeguards:** Strictly enforces cognitive offloading detection (refusing direct answer generation), document text anomaly detection (gibberish/consonant cluster filtering), and safe token window slicing.

### Centralized Model & System Constants ([`lib/constants.ts`](ContextualAI-test/lib/constants.ts))
- Single source of truth for canonical model identifiers (`GEMINI_MODEL = "gemini-3.8-flash"`) and human-readable UI labels (`GEMINI_MODEL_LABEL = "Gemini 3.8 Flash"`).
- Global constraints: `MAX_MESSAGE_LENGTH = 2000`, `MAX_HISTORY_ENTRIES = 6`, `RATE_LIMIT_MAX_REQUESTS = 35`, and `RATE_LIMIT_WINDOW_MS = 60000`.
- Synchronized across API route handlers (`app/api/chat/route.ts`) and client-side UI footers (`components/TaskCompanion.tsx`).

### Automated CI/CD Quality Pipeline ([`.github/workflows/ci.yml`](ContextualAI-test/.github/workflows/ci.yml))
- GitHub Actions CI running on pushes and pull requests to `main`.
- Canonical package manager enforcement (`pnpm@12.6.0` via Corepack and lockfile synchronization).
- Sequential quality gates: `pnpm install --frozen-lockfile` → `tsc --noEmit` → `pnpm run lint` → `pnpm run build`.
- Automatic cancellation of stale workflows on successive commits via GitHub Actions concurrency groups.

### Cognitive Scaffolding & Verification
- **Structured Response Format:** Type-safe JSON handling for key points, next steps, verification questions, and uncertainties.
- **Review Checkpoint Modal:** Interactive reflection modal requiring students to summarize key takeaways, verify evidence, and explain concepts in their own words before saving AI outputs.
- **AI Learning Receipt:** Verifiable local audit receipt capturing student agency, timestamp, assistance mode, and review responses.

### Four-Tier Resilience Architecture
$$\text{Primary Gemini 3.8 Flash} \longrightarrow \text{Fallback Key 1} \longrightarrow \text{Fallback Key 2} \longrightarrow \text{Dynamic Contextual Scaffolding Engine}$$

- **Client-Side Persistence:** LocalStorage support for student notes, conversation history, progress, and settings.

---

## 9. Planned Future Features (Roadmap Placeholders)

The prototype presents non-functional UI placeholders for future enhancements:

1. **Upload Activity or Handout:** Direct PDF, DOCX, and image file ingestion.
2. **OCR Document Extraction:** Optical character recognition for physical worksheets and notes.
3. **Calendar and Time-Blocking:** Integration with Google Calendar, Canvas, and Blackboard.
4. **Screen-Free Routine Support:** Healthy break and study interval reminders.
5. **Wellness Check-Ins:** Periodic student well-being self-reflection modules.
6. **Lock-Screen Widget:** Mobile lock-screen next-step reminders.
7. **Mobile Application:** Native iOS and Android companions.
8. **Optional Privacy Dashboard:** Granular telemetry and stored content governance.
9. **Cloud Synchronization:** Multi-device synchronization.

---

## 10. Known Limitations of the Prototype

- **Storage Scope:** Uses browser `localStorage`; data is per-device/browser.
- **Authentication:** Authentication is intentionally omitted for instant defense evaluation.
- **File Upload:** Relies on pre-configured representative materials and client-side extraction rather than full server-side file management.
- **Rate Limiting:** Implements an in-memory IP rate limiter (35 req/min, defined in [`lib/constants.ts`](file:///c:/Users/user/source/repos/AldenCedric/ContextualAI-test/lib/constants.ts)) appropriate for prototype demonstrations.

---

## 11. Future Supabase Integration Plan

For transition to an institution-ready production system:

1. **Authentication:** Supabase Auth for university SSO (SAML / OAuth2 / eduGAIN).
2. **Relational Database:** PostgreSQL schema storing courses, student profiles, materials, and task states with Row-Level Security (RLS).
3. **Vector Embeddings (pgvector):** Course-pack document indexing for retrieval-augmented generation (RAG) within institutional boundaries.
4. **Encrypted Storage:** Supabase Storage buckets for student uploads with signed URLs and automatic virus scanning.
5. **Real-Time Presence:** Supabase Realtime for peer study groups and instructor oversight.