# 🎓 Margdarshak AI
### *Your AI-Powered Study Abroad & Education Finance Companion*
> **Powered by Poonawala Fincorp** — Built for the Meta × Poonawala Fincorp Hackathon 2026

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Groq](https://img.shields.io/badge/Groq-Llama--3.1-orange)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## 📌 Problem Statement

Every year, **~700,000 Indian students** aspire to study abroad. The journey from aspiration to enrollment is broken across three distinct pain points:

| Pain Point | Reality |
|---|---|
| **Information Overload** | Students drown in unstructured data — rankings, costs, visa rules, test requirements |
| **Financing Anxiety** | 60% of loan applications stall because parents are not convinced early enough |
| **Post-Sanction Chaos** | After loan approval, students have no unified system to track disbursements, visas, or EMIs |

**Margdarshak AI** solves all three with a single, intelligent platform — combining a proprietary **Loan Readiness Score (LRS)**, an **AI Chat Copilot**, data-driven financial projections, and a **Parent Persuasion Engine** — all natively integrated with Poonawala Fincorp's education loan products.

---

## ✨ Features

### 🔐 Authentication & Onboarding
- **4-Step Guided Onboarding** with real-time field validation (name, email, academics, budget)
- **Persistent Draft State** — users never lose progress mid-onboarding, even if they navigate away
- **Smart Pre-fill** — authenticated profile data auto-populates onboarding fields
- **OTP-based Registration** via email (Nodemailer)

### 📊 Personalized Dashboard
- **Welcome Banner** with streak counter and personalized greeting
- **Quick Action Grid** — 8 feature shortcuts in a single glance
- **Academic Profile Card** — GPA, GRE, TOEFL, IELTS, work experience at a glance
- **Active Loan Banner** — appears post-application with lender name, reference ID, and repayment link
- **Intent Score Tracker** — real-time engagement signal (0–100%) that feeds the LRS

### 🛡️ Loan Readiness Score (LRS)
Margdarshak's proprietary creditworthiness signal, modeled on credit bureau logic (300–850 range):

| Dimension | Weight | What It Measures |
|---|---|---|
| Profile Completeness | 25% | Name, email, GPA, test scores, targets |
| Document Readiness | 25% | Transcripts, passport, admit letter, test score reports |
| Co-applicant Details | 20% | Parent name, phone, income, occupation |
| University Shortlist | 15% | Number of shortlisted universities |
| Engagement Signal | 15% | Platform activity and feature usage |

- **Animated Gauge** — SVG-based circular progress chart with gradient stroke
- **Score Breakdown** — per-dimension progress bars with color-coded health indicators
- **Action Items** — prioritized to-do list to boost score to 700+ (Pre-Approved tier)

### 🌏 Career Navigator
- **University Database** — curated list of top institutions across US, UK, Canada, Germany, Australia, and India
- **Shortlist Mode** — bookmark universities that feed the Parent Report and ROI Calculator
- **QS Ranking Integration** — 2025 rankings displayed per institution

### 📈 ROI Calculator
A financial-grade investment model backed by real data:
- **IRR (Internal Rate of Return)** — 10-year project IRR using Newton-Raphson convergence
- **NPV (Net Present Value)** — Discounted cash flow analysis with configurable discount rates
- **3 Economic Scenarios** — Optimistic, Realistic, Conservative (with distinct salary growth multipliers, tax rates, and inflation)
- **Data Sources** — US Bureau of Labor Statistics (BLS), HESA (UK), NIRF (India), PayScale
- **Salary Trajectory** — Entry → Mid-Career → Senior level mapped per field and country
- **EMI Integration** — Poonawala Fincorp loan terms (rate, tenure) baked into cash flow model
- **Scholarship Slider** — Adjustable 0–80% scholarship impact on total cost

### 🎯 Admission Predictor
- ML-backed admission probability scoring using historical acceptance rate data
- Evaluates GPA, GRE, work experience, and target university selectivity

### 📅 Study Timeline
- Personalized study-abroad action plan
- Deadline tracking for tests, applications, and visa milestones

### 🎓 AI Scholarship Matcher
- Curated database of grants and scholarships (merit-based, need-based, country-specific)
- **AI Fit Prediction** — one-click Groq-powered eligibility assessment returning a percentage match and reasoning
- Auto-sorted by user's target destination
- Country filter (All, US, UK, Europe, Global)
- Graceful error handling with retry on AI engine failure

### 👨‍👩‍👧 Parent Report — Education Investment Dossier
A print-ready, 4-page A4 document designed to convince parents:

| Page | Content |
|---|---|
| **Page 1** | Cover + Executive Summary — ROI headline, EMI, payback period |
| **Page 2** | Student Profile + University Comparison Matrix |
| **Page 3** | Loan Journey (5-step timeline) + EMI Affordability Analysis + Lender Credibility |
| **Page 4** | 10-Year Financial Projection Table + Scholarship Summary + Final Recommendation |

- **AI-selected Recommended University** based on composite ROI Score
- **Section 80E Tax Benefit** breakdown included
- **Print / Download as PDF** button (native browser print)
- Deterministic document ID (no re-render flicker)

### 🛂 Visa Assistance
- Country-specific visa type guides (F-1, Study Permit, Student Visa, etc.)
- Linked from Post-Sanction checklist

### 💳 Loan Application (`/apply`)
- One-click loan application linked to shortlisted universities
- Stores lender, university, principal, reference ID, and submission timestamp in persisted state

### 📆 Post-Sanction Repayment Dashboard
Unlocks after submitting a loan application:
- **Hero Status Card** — moratorium status, reference ID, university, lender details
- **Pre-Departure Checklist** — dynamic status (Loan Sanction → I-20/CAS → Visa Appointment → Proof of Funds → Forex Card)
- **EMI Schedule** — first 3 projected EMI payments with auto-debit dates
- **Full Amortization Table** — year-by-year principal/interest breakdown in a modal
- **Section 80E Certificate Tracker** — expected availability date auto-calculated from EMI start

### 🤖 AI Chat Copilot
A floating, expandable chat widget powered by a RAG (Retrieval-Augmented Generation) pipeline:
- **Intent Router** — matches query to Admission Profile Analysis or RAG Knowledge Base
- **Vector Search** — Xenova MiniLM embeddings for semantic chunk retrieval from local knowledge base
- **Custom LoRA/PEFT Fine-Tuning** — uses a custom dataset to fine-tune LLaMA-3 (8B) to intrinsically adopt the Margdarshak persona and Poonawala Fincorp guidelines
- **Inference Fallback** — dynamically routes to custom endpoints (e.g., Together AI, Ollama) with a safe fallback to Groq (`llama-3.1-8b-instant`)
- **Live LangChain Trace Panel** — shows step-by-step agent reasoning in real time
- **Quick Questions** — pre-set prompts for visa, loans, GRE, and parent persuasion
- **Expandable Mode** — resize between compact and full-height

### 🏆 Gamification
- **LRS Global Leaderboard** — DB-backed real peer rankings from Supabase
- **Daily Streak Tracker** — calendar-aware streak counter with flame badge
- **Achievement Badges** — Early Applicant, Target Locked, LRS Elite, Consistent Scholar
- **Intent Score** — passive engagement signal updated by feature usage

### 🏪 Marketplace
- Partner deals for forex, travel insurance, student SIM, accommodation, and course materials

### 👥 Community
- Community engagement module for peer interaction

### 🔧 Admin Dashboard (`/admin`)
- B2B monetization panel for Poonawala Fincorp administrators
- Platform analytics and application funnel visibility

### 🌙 Theme Support
- Light / Dark mode toggle persisted across sessions

---

## 🏗️ Architecture

```
margdarshak-ai/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth route group (no navbar)
│   │   │   ├── login/           # OTP login page
│   │   │   └── onboarding/      # 4-step onboarding wizard
│   │   ├── (dashboard)/         # Protected dashboard routes
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── loan-score/      # LRS detail page
│   │   │   ├── career-navigator/# University shortlisting
│   │   │   ├── roi-calculator/  # IRR/NPV financial model
│   │   │   ├── admission-predictor/
│   │   │   ├── scholarships/    # AI scholarship matcher
│   │   │   ├── parent-report/   # Printable investment dossier
│   │   │   ├── apply/           # Loan application
│   │   │   ├── repayment/       # Post-sanction dashboard
│   │   │   ├── timeline/        # Study timeline
│   │   │   ├── visa/            # Visa guidance
│   │   │   ├── community/       # Community module
│   │   │   ├── marketplace/     # Partner marketplace
│   │   │   ├── rewards/         # Rewards system
│   │   │   ├── profile/         # User profile
│   │   │   └── admin/           # Admin panel
│   │   ├── (marketing)/         # Public landing pages
│   │   └── api/
│   │       ├── chat/            # Groq LLM endpoint
│   │       ├── vector-search/   # MiniLM semantic retrieval
│   │       ├── scholarships/evaluate/ # AI eligibility
│   │       ├── leaderboard/     # DB-backed LRS rankings
│   │       ├── profile/         # Profile CRUD
│   │       ├── auth/            # Register + Logout
│   │       ├── admin/           # Admin data endpoints
│   │       └── whatsapp/        # WhatsApp notification hook
│   ├── components/
│   │   ├── ChatWidget.tsx       # Floating AI chat
│   │   ├── Navbar.tsx           # Top navigation
│   │   ├── AuthGuard.tsx        # Client-side route protection
│   │   └── ThemeToggle.tsx      # Dark/Light switcher
│   ├── data/
│   │   ├── universities.ts      # University database (QS, tuition, acceptance, earnings)
│   │   ├── salaries.ts          # BLS/HESA salary data by field + country
│   │   ├── loans.ts             # Poonawala loan products + EMI/amortization math
│   │   ├── scholarships.ts      # Scholarship database
│   │   ├── admissions.ts        # Admission probability data
│   │   └── knowledge-base.ts    # RAG knowledge chunks + MiniLM vector retrieval
│   └── lib/
│       ├── store.ts             # Zustand global store (profile, LRS, streaks, chat)
│       ├── prisma.ts            # Prisma client singleton
│       ├── supabase.ts          # Supabase client
│       └── otp-store.ts         # In-memory OTP session store
├── prisma/                      # Prisma schema + migrations
├── supabase/migrations/         # SQL migration files
├── notebooks/
│   └── finetune_llama3_lora.ipynb # Unsloth QLoRA fine-tuning notebook
└── scripts/
    ├── precompute-embeddings.ts # Offline MiniLM embedding precomputation
    └── generate-dataset.ts      # Synthetic Q&A dataset generator
```

### Data Flow

```
User Action
    │
    ▼
Zustand Store (client state + localStorage persistence)
    │
    ├──► LRS Engine (calculateLRS)
    │         └── Weighted composite → 300–850 score
    │
    ├──► API Routes (Next.js Route Handlers)
    │         ├── /api/chat → Groq Llama-3.1
    │         ├── /api/vector-search → Xenova MiniLM
    │         └── /api/leaderboard → Supabase (PostgreSQL)
    │
    └──► Supabase DB
              └── profiles table (LRS score, name, email)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Server Components) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19 |
| **Styling** | TailwindCSS v4 + Vanilla CSS Design System |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **State Management** | Zustand 5 (with `persist` middleware + schema migration) |
| **Database** | Supabase (PostgreSQL) |
| **ORM** | Prisma 7 (with `@prisma/adapter-pg` for Supabase) |
| **AI / LLM** | Groq API — Llama-3.1-8b-instant |
| **Fine-Tuning** | Unsloth (QLoRA), Together AI / Ollama inference |
| **Embeddings** | Xenova Transformers (MiniLM — `@xenova/transformers`) |
| **OCR** | Tesseract.js v7 |
| **Image Processing** | Sharp |
| **Email (OTP)** | Nodemailer |
| **Local Dev DB** | LibSQL / SQLite (`dev.db`) |

---

## 📸 Screenshots

### Dashboard
The central command center showing LRS gauge, quick actions, academic profile, achievements, and leaderboard.

> *Personalized welcome, 8 quick-action cards, sticky LRS sidebar with score breakdown and intent tracker.*

---

### Loan Readiness Score (LRS)
Full breakdown of the 300–850 score across 5 dimensions with actionable improvement steps.

> *Animated circular gauge, color-coded progress bars, document upload section, and "Pre-Approved" unlock trigger.*

---

### ROI Calculator
Financial-grade education investment analysis with real BLS/HESA salary data.

> *IRR, NPV, break-even year, EMI summary, salary trajectory (pre/entry/mid/senior), 3 scenario toggles.*

---

### Parent Report — Investment Dossier
A 4-page printable PDF investment case to present to parents and co-applicants.

> *University comparison matrix, AI recommendation rationale, 10-year financial projection, Section 80E tax benefit, Poonawala Fincorp credibility section.*

---

### AI Chat Copilot
The floating RAG-powered copilot with live LangChain agent traces.

> *Vector retrieval step, Groq generation, expandable widget, markdown-formatted responses.*

---

### Repayment Dashboard
Post-sanction dashboard with EMI schedule, pre-departure checklist, and amortization table.

> *Moratorium status, disbursement tracker, full amortization modal, Section 80E certificate.*

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- npm 9+
- A Supabase project (or use SQLite for local dev)
- A Groq API key (free tier available at [groq.com](https://console.groq.com))

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/margdarshak-ai.git
cd margdarshak-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (Prisma)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# AI / LLM
GROQ_API_KEY=gsk_your-groq-api-key

# Email (OTP)
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Local Development (SQLite):** If you don't have Supabase set up, the app falls back to a local `dev.db` SQLite file for Prisma operations. The leaderboard API will gracefully return empty data.

### 4. Set Up the Database

Run Prisma migrations:
```bash
npx prisma migrate dev --name init
```

Or apply the Supabase SQL directly:
```bash
# Apply via Supabase Dashboard → SQL Editor
cat supabase-setup.sql
```

### 5. (Optional) Precompute Embeddings

For faster vector search on first load:
```bash
npm run precompute
```

### 6. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎬 Demo

### Live Demo
> 🔗 **[https://margdarshak-ai-ten.vercel.app/](https://margdarshak-ai-ten.vercel.app/)**

### Demo Walkthrough

1. **Land on the homepage** → Click "Get Started"
2. **Complete the 4-step onboarding** — enter your name, email, study goals (e.g., CS in US), GPA, and budget
3. **Explore the Dashboard** — view your LRS score, quick actions, and leaderboard ranking
4. **Career Navigator** → shortlist 2–3 universities
5. **ROI Calculator** → compare IRR and NPV across scenarios
6. **Parent Report** → generate and print the investment dossier
7. **Loan Score** → upload mock documents to boost your LRS to 700+
8. **Apply for Loan** → submit a mock application
9. **Repayment Dashboard** → track EMI schedule and pre-departure checklist
10. **Chat Copilot** → ask "What is Poonawala's education loan rate?" and watch the RAG traces

### Sample Credentials for Demo
```
Name:     Aryan Sharma
Email:    aryan@example.com
GPA:      8.7
GRE:      325
Country:  United States
Field:    Computer Science
```

---

## 🔮 Future Improvements

### AI & Intelligence
- [ ] **Real FAISS Vector Index** — Replace in-memory MiniLM similarity with a persistent FAISS or Pinecone index for production-scale RAG
- [ ] **LangChain Agents** — Implement true multi-step agentic reasoning (tool use, web search, document parsing)
- [ ] **Tesseract OCR Pipeline** — Enable actual document upload and OCR extraction for transcript parsing
- [ ] **Groq Vision** — Allow photo uploads of marksheets for automatic GPA extraction
- [ ] **Predictive LRS** — Train an ML model on historical loan approval data to predict actual lender approval probability

### Product & UX
- [ ] **WhatsApp Notifications** — Send LRS progress updates, EMI reminders, and deadline alerts via WhatsApp Business API
- [ ] **Mobile App** — React Native companion app with push notifications
- [ ] **Multi-language Support** — Hindi, Gujarati, Tamil for tier-2/3 city reach
- [ ] **Counselor Marketplace** — Connect students with verified IELTS/visa counselors
- [ ] **University Application Tracker** — Track application status per university (Submitted → Interview → Decision)

### Finance & Lender Integration
- [ ] **Live Lender API Integration** — Real-time loan eligibility check via Poonawala Fincorp's loan origination system
- [ ] **eKYC Integration** — Aadhaar/DigiLocker-based identity verification
- [ ] **Co-applicant Portal** — Separate login for parents to view and co-sign the application
- [ ] **Dynamic Interest Rate Engine** — Real-time rate adjustment based on LRS, CIBIL, and university tier
- [ ] **Loan Comparison Engine** — Compare Poonawala with HDFC Credila, Avanse, and public sector banks

### Platform & Scale
- [ ] **B2B API** — Expose LRS and university matching as an API for EdTech partners and counselors
- [ ] **Analytics Dashboard** — Conversion funnel for Poonawala Fincorp's sales team
- [ ] **A/B Testing Framework** — Experiment with onboarding flows and nudge messaging
- [ ] **Offline Mode** — PWA with service worker for low-connectivity regions
- [ ] **Referral Program** — Peer-to-peer referral with LRS bonus points

---

## 👥 Team

Built with ❤️ for the **Meta × Poonawala Fincorp Hackathon 2026**.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- **Poonawala Fincorp** — Education loan products, rate data, and business context
- **US Bureau of Labor Statistics (BLS)** — Salary benchmarks by field and level
- **HESA (UK)** — Higher education statistics for salary projections
- **QS World University Rankings 2025** — University ranking data
- **Groq** — Ultra-fast LLM inference (Llama 3.1)
- **Supabase** — Open-source Firebase alternative for PostgreSQL
- **Xenova / HuggingFace** — Browser-native transformer embeddings

---

<div align="center">
  <sub>🚀 Margdarshak AI — Guiding every Indian student from aspiration to arrival.</sub>
</div>
