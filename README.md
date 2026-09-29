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
- **Language Model:** Google Gemini Flash (`gemini-2.0-flash`) via server-side REST API route
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

## 5. How to Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 6. How to Test the AI Modes & Fallback Behavior

### Testing the Primary Gemini Key

1. Navigate to `/dashboard` or `/materials`.
2. Select **"Photosynthesis Activity"**.
3. Click **"Open Task Companion"**.
4. Select **Guide** mode.
5. Send: _"Give me a hint without giving me the complete answer."_
6. Notice the green **Live AI** indicator badge and structured response (key points, verification questions, and follow-up prompts).

### Testing Fallback Behavior (Key Rotation)

1. Go to `/prototype-controls`.
2. Under **AI Service Mode**, choose **"Force Fallback Key 1"** (simulates primary key quota/failure) or **"Force Fallback Key 2"**.
3. Notice the yellow top banner: _"Prototype demonstration controls enabled — using fallback-1 mode."_
4. Return to the Task Companion and send another message.
5. The system automatically switches to the backup AI key and displays the **Backup AI service** badge.

### Testing Local Template Mode (Complete API Failure Handling)

1. Go to `/prototype-controls`.
2. Select **"Force Local Template"**.
3. Return to the Task Companion and send a message.
4. The system gracefully serves a material-specific, structured academic template with the notice:
   > _"This is a general academic template, not a live AI response. Adapt it to your instructor's requirements."_

---

## 7. Presentation Demo Sequence (3 to 5 Minutes)

Follow this exact sequence during the thesis defense presentation:

1. **Open the Dashboard (`/dashboard`):** Show the greeting, today's next step, upcoming deadlines, AI literacy tip, and live service status.
2. **Open "Photosynthesis Activity":** Review instructions, description, current task, and student notes area.
3. **Open the Task Companion:** Highlight the contextual header (material title, current task, active assistance mode, service status).
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
14. **Switch to Local Fallback Mode:** Navigate to `/prototype-controls` and select **Force Local Template**.
15. **Send another request:** In the Task Companion, submit another query.
16. **Demonstrate resilience:** Show that the application never crashes, returning a structured local academic guide.
17. **Open Future-Feature Roadmap:** Review the planned roadmap items for production transition.

---

## 8. Implemented Features

- **Generic Academic Routes:**
  - `/` — Presentation landing page with interactive flow visualization and mode showcase.
  - `/dashboard` — Daily agenda, continue where left off, deadlines, literacy prompts, quick actions.
  - `/materials` — Categorized directory with live title search and material-type filtering.
  - `/materials/[materialId]` — Detailed material briefing, progress tracker, interactive student notes, and saved assistance drawer.
  - `/materials/[materialId]/chat` — Full contextual Task Companion with live prompt suggestions, mode switching, and structured card rendering.
  - `/prototype-controls` — Interactive defense control panel with key simulation toggles and demo reset.
- **6 Contextual Assistance Modes:**
  - 💡 **Explain:** Clarifies instructions or foundational concepts.
  - 🧭 **Guide:** Provides hints and probing questions before giving a full answer.
  - 📋 **Organize:** Breaks broad tasks into manageable action steps.
  - 🔍 **Explore:** Suggests targeted search terms and related inquiry questions.
  - ✅ **Review:** Reviews the student's attempt, providing constructive feedback.
  - 📝 **Draft:** Generates preliminary outlines clearly tagged with _"Preliminary AI-assisted output — review required."_
- **Structured Response Format:** Type-safe JSON handling for key points, next steps, verification questions, and uncertainties.
- **Cognitive Scaffolding (Review Checkpoint):** Interactive reflection modal before saving critical AI drafts.
- **AI Learning Receipt:** Verifiable local audit receipt of student-AI collaboration.
- **Three-Tier Fallback Mechanism:**
  $$\text{Primary Key} \longrightarrow \text{Fallback Key 1} \longrightarrow \text{Fallback Key 2} \longrightarrow \text{Local Academic Template}$$
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
- **File Upload:** Relies on pre-configured representative materials rather than dynamic file parsers.
- **Rate Limiting:** Implements an in-memory IP rate limiter (30 req/min) appropriate for single-instance prototype demos.

---

## 11. Future Supabase Integration Plan

For transition to an institution-ready production system:

1. **Authentication:** Supabase Auth for university SSO (SAML / OAuth2 / eduGAIN).
2. **Relational Database:** PostgreSQL schema storing courses, student profiles, materials, and task states with Row-Level Security (RLS).
3. **Vector Embeddings (pgvector):** Course-pack document indexing for retrieval-augmented generation (RAG) within institutional boundaries.
4. **Encrypted Storage:** Supabase Storage buckets for student uploads with signed URLs and automatic virus scanning.
5. **Real-Time Presence:** Supabase Realtime for peer study groups and instructor oversight.
