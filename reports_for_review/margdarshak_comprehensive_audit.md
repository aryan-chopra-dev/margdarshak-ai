# Comprehensive Engineering Audit: Margdarshak AI
**Date:** May 3, 2026
**Scope:** Strict 9-Lens Process Failure & Logic Gap Audit
**Goal:** Surface critical missing failure modes, hidden inconsistencies, and incomplete features that compromise system integrity.

---

## Executive Summary & Calibration

The Margdarshak AI platform is currently suffering from a severe case of "demo-ware" syndrome. While the UI visually implies a robust, AI-driven backend backed by ML models and verified data, the underlying logic is highly fragmented, simulated, and disconnected. 

1. **System Invariant:** The system must provide mathematically sound financial and academic guidance. This invariant is currently broken.
2. **Workflow:** Onboarding → Profile Configuration → Loan Readiness Scoring → University Shortlisting → AI Chat Assistance.
3. **High Impact Modules:** The state management layer (`src/lib/store.ts`) and profile APIs, which are currently failing to synchronize data.
4. **Least Tested:** The AI and mathematical modules (`admissions.ts`, `ChatWidget.tsx`), which contain hardcoded mathematical contradictions.
5. **Quality Standard:** The project claims to use advanced ML ("XGBoost", "Pinecone Vector DB") and rigorous financial algorithms, but these are structurally unenforced and falsified.

---

## Phase 1: Unconstrained Exploration (Raw Observations)

During an unconstrained pass of the codebase, several deeply concerning patterns were identified:
- **Database Fragmentation:** The application connects to two completely different database providers (Prisma/SQLite via `lib/prisma.ts` and Postgres/Supabase via `lib/supabase.ts`) to manage the exact same user profile data.
- **Deceptive User Interfaces:** The `ChatWidget` component injects fake orchestrator logs (e.g., `> Calling Pinecone Vector DB (text-embedding-004)...`) to deceive the user into thinking complex logic is occurring, when it is simply running a synchronous `Array.filter()` on local static data.
- **Ephemeral User State:** The core value proposition of the app requires users to input detailed academic records and shortlist universities. However, these actions only modify local `Zustand` memory. Refreshing the browser permanently deletes all configured user data.

---

## Phase 2: Structured Audit (Lens Analysis)

### LENS 1: Acknowledge-But-Not-Fixed Patterns
**Finding:** Profile "Save Changes" is a No-Op.
* **File:** `src/app/(dashboard)/profile/page.tsx:34`
* **Evidence:** `// In the future this will sync to PostgreSQL via an API route`
* **Consequence:** Users who spend time configuring their academic profile will lose all data upon closing the tab. The "Save Changes" button provides a false success state, which breaks user trust and prevents the ML Predictor from retaining accurate data.
* **Fix:** Implement the `POST /api/profile` fetch call and synchronize the Zustand state with the active database.
* **Complexity:** Low
* **Priority:** Critical

### LENS 2: Silent Failures / No-Op Logic
**Finding:** ROI Calculator ignores Loan Interest.
* **File:** `src/app/(dashboard)/roi-calculator/page.tsx:53`
* **Evidence:** `const roi = ((earningsGain10yr - afterScholarship) / afterScholarship * 100);`
* **Consequence:** The ROI Calculator features interactive sliders for "Loan Interest Rate" and "Loan Repayment Tenure". While these update the visual EMI card, the actual loan interest (`emi.totalInterest`) is mathematically omitted from the `roi` and `breakEvenYears` equations. The loan sliders are purely placebo, leading to drastically incorrect financial advice.
* **Fix:** Subtract `emi.totalInterest` from `earningsGain10yr` or add it to the cost basis before calculating the ROI percentage.
* **Complexity:** Trivial
* **Priority:** High

**Finding:** Fallback Silences AI Failures.
* **File:** `src/app/api/scholarships/evaluate/route.ts:55`
* **Evidence:** If the Groq LLM returns invalid JSON, the `catch` block silently returns a fake 50% score with the reasoning `"Eligibility engine temporarily degraded. Review manually."`
* **Consequence:** Users receive a fake score instead of a proper error state, misleading them into thinking they are a 50% fit for a scholarship they might be highly qualified for.
* **Fix:** Return an explicit 500 API error and handle it gracefully on the client UI.

### LENS 3: Model Inconsistencies
**Finding:** Loan Readiness Score (LRS) Ceiling Math is Broken.
* **File:** `src/lib/store.ts:122`
* **Evidence:** `const total = 300 + (profileScore * 0.25 * 5.5) + (docScore * 0.25 * 5.5) + (coAppScore * 0.20 * 5.5) + (shortlistScore * 0.15 * 5.5);`
* **Consequence:** The LRS claims to be out of 850. However, the weights applied in the calculation only sum to 85% (0.25 + 0.25 + 0.20 + 0.15). The remaining 15% (`engagementSignal`) is completely omitted. A perfect user can mathematically never score higher than 767.5, making the 850 goal mathematically impossible.
* **Fix:** Add `(engagementSignal * 0.15 * 5.5)` to the `total` equation.
* **Complexity:** Trivial
* **Priority:** Medium

### LENS 6: Incomplete Features Shipped as Complete
**Finding:** Multiple Linear Regression falsely marketed as XGBoost.
* **File:** `src/data/admissions.ts:94`
* **Evidence:** `let rawProb = admissionModel.intercept + m.greScore * params.greScore + ...` (Paired with UI text: "ML model trained via XGBoost")
* **Consequence:** The application heavily markets a sophisticated "XGBoost Gradient Boosting" ML model. However, the logic is simply a hardcoded multiple linear regression equation. Because XGBoost is a non-linear ensemble algorithm, applying linear coefficients is mathematically fraudulent and produces completely invalid admission probabilities.
* **Fix:** Rename the UI to correctly state "Multiple Linear Regression", or implement an ONNX runtime to execute the actual compiled XGBoost model.
* **Complexity:** Medium
* **Priority:** High

### LENS 8: Process Failures
**Finding:** Memory Leaks in Serverless Architecture.
* **File:** `src/app/api/vector-search/route.ts:21`
* **Evidence:** `let kbEmbeddingsCache: { ... }[] = [];`
* **Consequence:** The application uses an in-memory global array to store FAISS vector embeddings for the RAG system. In serverless environments (like Vercel), this cache is frequently purged. Every invocation triggers a localized, synchronous re-vectorization of the entire knowledge base via `@xenova/transformers`, causing severe memory limit crashes and unacceptable latency.
* **Fix:** Pre-compute embeddings and store them in an actual persistent vector database (e.g., Pinecone, Supabase pgvector).
* **Complexity:** High
* **Priority:** Critical

### LENS 9: Constants & Configuration Leakage
**Finding:** Hardcoded pre-degree baseline salary.
* **File:** `src/app/(dashboard)/roi-calculator/page.tsx:47`
* **Evidence:** `const preDegree = 4820; // Indian baseline from PLFS`
* **Consequence:** The ROI calculator hardcodes a single pre-degree salary ($4,820) for all users, regardless of their current work experience, field, or location. This mathematically ruins the "Salary Multiplier" and ROI projections for users with existing mid-level or senior experience.
* **Fix:** Dynamically calculate `preDegree` based on the user's `workExperienceYears` and `targetField`.
* **Complexity:** Low
* **Priority:** Medium

---

## Phase 3: Missing Failure Modes

These failure modes are critical architectural flaws that fall outside the traditional bounds of the 9-lens framework:

### [NEW-1] Security Vulnerabilities (API Payload Leakage)
* **Definition:** Exposing sensitive server-side validation tokens to the client environment.
* **Evidence:** `src/app/api/auth/send-otp/route.ts:88` returns `demoOtp: otp` in the JSON response to the browser payload.
* **Consequence:** Any user can intercept the HTTP response payload via their browser's Network tab and read the OTP, allowing complete authentication bypass without owning the email or phone number.
* **Why Missed:** Standard code analysis focuses on state symmetry and logic, not network-level payload sanitization or data exfiltration.

### [NEW-2] Distributed State Desynchronization (Hydration Failure)
* **Definition:** The client's local storage permanently diverging from the database's source of truth due to lack of hydration upon login.
* **Evidence:** `src/app/(auth)/login/page.tsx:79` calls `login(data.profile.name, ...)` setting the Zustand state, but it never fetches the user's previously saved `docsUploaded` or `shortlistedUniversities` from the API.
* **Consequence:** Returning users log in to a blank local slate. If they subsequently trigger a save operation, their blank local state will destructively overwrite their rich database profile.
* **Why Missed:** Lenses evaluate module-to-module code consistency, but rarely track temporal consistency across network boundaries and multiple login sessions.

### [NEW-3] Database Provider Schizophrenia
* **Definition:** Competing ORMs and database drivers managing the exact same data entities in isolated network siloes.
* **Evidence:** `src/app/api/auth/verify-otp/route.ts` creates user profiles using the Supabase Postgres client (`supabase.from('profiles').upsert()`). Simultaneously, `src/app/api/profile/route.ts` fetches and updates profiles using Prisma and SQLite (`prisma.profile.findUnique()`).
* **Consequence:** Users successfully verify their OTP and are created in Supabase, but any attempt to interact with the profile API yields a `404 Not Found` because the systems are talking to completely disjointed databases.
* **Why Missed:** Model Inconsistencies (Lens 3) captures mismatched physics or mathematical logic, but architectural split-brain regarding infrastructure dependencies is a fundamentally different class of error.

---

## Phase 4: Contradiction Analysis

* **Code vs. Documentation:** The `ChatWidget.tsx` explicitly renders traces that state `> Calling Pinecone Vector DB` and `> XGBoost Scoring Engine: Evaluating admission probabilities`, but the actual code executes a synchronous `Array.filter()` on local static data. This is textbook UI deception.
* **Module vs. Module:** `api/auth/send-otp` leverages Supabase, while `api/auth/register` leverages Prisma/SQLite. They are both meant to handle user authentication, yet they store records in completely different databases.
* **Logic vs. Intent:** The platform demands extensive, precise data from the user (CGPA, specific work experience years, IELTS scores) to calculate an ROI and Admission chance. However, the underlying ROI equations completely ignore the work experience years, and the Admission Predictor utilizes simplified linear weights rather than the complex machine learning models advertised.

---

## Phase 5: Deliverable Backlog

*Sorted by Priority × Complexity (Critical+Trivial first, Low+High last)*

| Priority | Complexity | Finding ID | Issue Description | Real-World Impact |
| :--- | :--- | :--- | :--- | :--- |
| **Critical** | **Trivial** | `[NEW-1]` | OTP leaked in JSON API response | Allows complete authentication bypass via the Network tab. |
| **Critical** | **Low** | `[FM-1]` | Profile `save` button is a No-Op | 100% data loss of user preferences upon browser refresh. |
| **Critical** | **Medium** | `[NEW-3]` | Split-brain Database (Prisma vs Supabase) | Users created via OTP cannot be found or updated by the Profile API. |
| **Critical** | **High** | `[FM-8]` | In-memory Vector cache in Serverless | Causes severe lambda memory leaks and massive cold-start latency. |
| **High** | **Trivial** | `[FM-2]` | ROI Calculator ignores Loan Interest | Loan sliders are mathematical placebos; financial advice is false. |
| **High** | **Medium** | `[FM-6]` | Linear Regression masked as XGBoost | Fraudulent model claims; admission probabilities are fundamentally inaccurate. |
| **High** | **Medium** | `[NEW-2]` | Missing store hydration on Login | Returning users will inadvertently overwrite/delete their cloud data. |
| **Medium** | **Trivial** | `[FM-3]` | LRS Score math drops 15% weight | Users can never mathematically achieve the maximum advertised score of 850. |
| **Medium** | **Low** | `[FM-9]` | Hardcoded $4,820 Pre-Degree Salary | Skews ROI drastically for senior applicants or those in high-earning fields. |
