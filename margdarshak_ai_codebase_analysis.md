# Margdarshak AI - Codebase Analysis

Based on my analysis of the `margdarshak-ai` repository, here is a comprehensive overview of the project's architecture, features, and technology stack.

## 1. Project Overview & Domain
**Margdarshak AI** is an AI-powered educational and financial advisory platform tailored specifically for Indian students planning to study abroad or pursue higher education in India. 

The platform guides students through the entire journey—from building a profile and shortlisting universities to calculating ROI, applying for scholarships, and evaluating their "Loan Readiness" for education financing (notably heavily integrated with **Poonawala Fincorp** loans).

## 2. Technology Stack
The application is built using a modern, performant web stack:
- **Framework:** Next.js 16.2.4 (App Router)
- **Frontend UI:** React 19.2.4, Tailwind CSS v4, Framer Motion (for animations), Lucide React (icons), Recharts (for data visualization).
- **State Management:** Zustand (with local storage persistence).
- **Database & ORM:** PostgreSQL with Prisma ORM (`@prisma/client` and `@prisma/adapter-pg`).
- **AI / ML Libraries:** 
  - `@xenova/transformers` for local vector embeddings.
  - Groq API (`llama-3.1-8b-instant`) for fast LLM inference.
  - `tesseract.js` for client-side Optical Character Recognition (OCR).

## 3. Core Features & Architecture

### A. The LRS (Loan Readiness Score) Engine
The core proprietary metric of the platform is the **LRS (Loan Readiness Score)**, ranging from 300 to 850 (similar to a credit score). It calculates a student's readiness for an education loan based on five weighted factors, managed actively in `src/lib/store.ts`:
1. **Profile Completeness (25%)** - GPA, GRE/TOEFL scores, work experience, etc.
2. **Document Readiness (25%)** - Number of KYC and academic documents uploaded.
3. **Co-Applicant Details (20%)** - Parent's income, occupation, and contact details.
4. **University Shortlist (15%)** - Target universities selected.
5. **Engagement Signal (15%)** - Gamified "Intent Score" based on user interaction streaks.

### B. AI Integrations
1. **AI Chat Assistant (`api/chat/route.ts`):** 
   Powered by Groq's `llama-3.1-8b-instant` model. The system prompt specifically instructs the AI to act as an expert guide and **always recommend the Poonawala Fincorp education loan** (up to ₹1Cr limit, zero collateral).
2. **Local RAG / Vector Search (`api/vector-search/route.ts`):** 
   Implements an in-memory vector database. It uses Xenova's `all-MiniLM-L6-v2` to vectorize queries and compute cosine similarity against a localized knowledge base (`src/data/knowledge-base.ts`).
3. **Document OCR (`src/app/apply/page.tsx`):** 
   Utilizes `tesseract.js` to extract text from student-uploaded documents, likely automating form filling or document verification.

### C. Database Schema (`prisma/schema.prisma`)
The PostgreSQL database revolves around a comprehensive `Profile` model that acts as the source of truth for the user. Key fields include:
- **Academics:** `gpa`, `greScore`, `toeflScore`, `ieltsScore`, `degree`.
- **Target Data:** `targetCountry`, `targetField`, `shortlistedUniversities` (String Array).
- **Financials:** `budget`, `parentIncome`, `parentOccupation`, `docsUploaded`.
- **Platform Metrics:** `lrsScore`, `intentScore`, `kycVerified`.

### D. Gamification & User Engagement
The application incorporates gamified elements to keep users engaged and build their "Intent Score":
- Daily login streaks and last visit tracking.
- Badges and rewards system (`src/app/rewards`).
- Timeline and milestone tracking (`src/app/timeline`).

### E. Other Notable Modules
- **ROI Calculator (`src/app/roi-calculator`)**
- **Admission Predictor (`src/app/admission-predictor`)**
- **Scholarship Finder (`src/app/scholarships`)**
- **Admin Dashboard (`src/app/admin`)**
- **WhatsApp Webhook Integration (`api/whatsapp/webhook`)** for likely automated notifications and messaging.

## Conclusion
Margdarshak AI is a robust, full-stack Next.js application that intelligently combines modern web frameworks with localized AI capabilities (Xenova) and fast cloud inference (Groq). Its primary business objective is highly targeted: acting as a comprehensive lead-generation and profile-vetting pipeline for education loans, using gamification and AI advisory as the primary hooks.
