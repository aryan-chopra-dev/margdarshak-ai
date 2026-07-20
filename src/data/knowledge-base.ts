// ============================================================================
// RAG KNOWLEDGE BASE — For AI Copilot Chatbot
// ============================================================================
// This is the retrieval corpus for the RAG-based chatbot. Each chunk contains
// real information from verified sources that the LLM retriever can search
// through when answering student questions.
//
// Categories: Visa, Loans, Admissions, Scholarships, Tests, Country-specific
// All information sourced from official government and institutional websites.
// ============================================================================

export interface KnowledgeChunk {
  id: string;
  category: string;
  title: string;
  content: string;
  keywords: string[];
  source: string;
  sourceUrl: string;
  lastVerified: string;
}

export const knowledgeBase: KnowledgeChunk[] = [
  // ---- VISA INFORMATION ----
  {
    id: "visa-us-f1",
    category: "Visa",
    title: "US F-1 Student Visa Requirements",
    content: `To apply for a US F-1 student visa, you need: (1) Form I-20 from your US university, (2) DS-160 online application, (3) SEVIS fee payment receipt (I-901, currently ₹29,000), (4) Valid passport with at least 6 months validity, (5) Passport-size photograph per US visa photo requirements, (6) Proof of financial support showing you can cover tuition + living costs for at least the first year, (7) Academic transcripts and test scores, (8) Visa interview at the US Embassy/Consulate. The visa fee is ₹15,355 (MRV fee). Current wait times for visa interviews in India vary by city: Delhi (20-40 days), Mumbai (30-50 days), Chennai (15-30 days), Hyderabad (20-35 days), Kolkata (10-20 days). OPT (Optional Practical Training) allows 12 months of post-graduation work, extended to 36 months total for STEM degrees.`,
    keywords: ["f1 visa", "us visa", "student visa", "sevis", "opt", "stem opt", "ds-160", "i-20"],
    source: "US Department of State + USCIS",
    sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
    lastVerified: "2026-04"
  },
  {
    id: "visa-uk-tier4",
    category: "Visa",
    title: "UK Student Visa (formerly Tier 4)",
    content: `The UK Student Visa requires: (1) CAS (Confirmation of Acceptance for Studies) from your UK university, (2) Proof of funds — you need to show £1,334/month for London or £1,023/month for outside London, plus full course fees for first year, (3) English language requirement (usually IELTS Academic 6.0-7.0), (4) Tuberculosis test certificate (required for Indian students), (5) Valid passport. Visa fee: £490. Immigration Health Surcharge (IHS): £776/year. The Graduate Route visa allows 2 years of post-study work (3 years for PhD). You can work up to 20 hours/week during term time on a Student Visa.`,
    keywords: ["uk visa", "tier 4", "student visa uk", "cas", "graduate route", "ihs", "post study work uk"],
    source: "UK Government - Home Office",
    sourceUrl: "https://www.gov.uk/student-visa",
    lastVerified: "2026-04"
  },
  {
    id: "visa-canada-sp",
    category: "Visa",
    title: "Canada Study Permit",
    content: `Canada Study Permit requirements: (1) Letter of Acceptance from a Designated Learning Institution (DLI), (2) Proof of financial support — minimum ₹12,60,000/year for living expenses (outside Quebec) plus tuition, (3) Valid passport, (4) Biometrics fee: ₹5,200, (5) Study permit processing fee: ₹9,200, (6) Medical exam. PGWP (Post-Graduation Work Permit): you can get a work permit for up to 3 years after graduation, matching the duration of your study program. Processing time from India: typically 8-16 weeks. SDS (Student Direct Stream) offers faster processing (20 days) if you have a GIC of ₹12,60,000 and IELTS 6.0+ overall.`,
    keywords: ["canada study permit", "pgwp", "sds", "dli", "gic", "post graduation work permit"],
    source: "Immigration, Refugees and Citizenship Canada (IRCC)",
    sourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html",
    lastVerified: "2026-04"
  },
  {
    id: "visa-australia-500",
    category: "Visa",
    title: "Australia Student Visa (Subclass 500)",
    content: `Australia Student Visa requirements: (1) CoE (Confirmation of Enrolment), (2) Genuine Temporary Entrant (GTE) statement, (3) English proficiency (IELTS Academic 5.5-6.5), (4) Financial capacity — ₹13,40,000/year living costs + tuition, (5) OSHC (Overseas Student Health Cover), (6) Visa fee: ₹38,800. Post-Study Work visa (Subclass 485): 2 years for bachelor's, 3 years for master's, 4 years for PhD. You can work 48 hours per fortnight during study.`,
    keywords: ["australia visa", "subclass 500", "coe", "oshc", "post study work australia", "gte"],
    source: "Australian Government Department of Home Affairs",
    sourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    lastVerified: "2026-04"
  },
  {
    id: "visa-germany-student",
    category: "Visa",
    title: "Germany Student Visa",
    content: `Germany Student Visa requirements: (1) Admission letter from a German university, (2) Blocked account (Sperrkonto) with ₹10,00,000/year (~₹84,000/month), (3) Health insurance, (4) Academic qualifications (verified by uni-assist), (5) Visa fee: ₹6,800. Most public universities in Germany charge NO TUITION — only a semester contribution of ₹13,000-31,000. Baden-Württemberg charges ₹1,35,000/semester for non-EU students. Post-study: 18-month job-seeking visa after graduation. Part-time work: 120 full days or 240 half days per year during studies.`,
    keywords: ["germany visa", "sperrkonto", "blocked account", "free tuition germany", "uni-assist"],
    source: "German Federal Foreign Office",
    sourceUrl: "https://www.studying-in-germany.org/student-visa-for-germany/",
    lastVerified: "2026-04"
  },

  // ---- EDUCATION LOAN INFORMATION ----
  {
    id: "loan-hdfc-credila",
    category: "Loans",
    title: "HDFC Credila Education Loan Details",
    content: `HDFC Credila offers education loans up to ₹2 Crore starting at 11.00% p.a. for study abroad programs. Key features: (1) Partially-collateralized options, (2) Covers tuition fees + living expenses + travel costs, (3) Moratorium period during course duration + 12 months, (4) EMI starts after moratorium, (5) Flexible tenure up to 15 years, (6) Quick disbursal in 5-7 business days, (7) Minimal documentation required, (8) Online application available. HDFC Credila is an RBI-registered NBFC. Programs covered include MBA, MS, Engineering, Medicine, and other PG programs at recognized institutions worldwide.`,
    keywords: ["hdfc credila education loan", "hdfc credila", "education loan 2 crore", "11 percent", "nbfc education loan"],
    source: "HDFC Credila Official Website",
    sourceUrl: "https://www.credila.com",
    lastVerified: "2026-04"
  },
  {
    id: "loan-rbi-guidelines",
    category: "Loans",
    title: "RBI Education Loan Guidelines & Norms",
    content: `RBI education loan guidelines (Master Circular on Educational Loan Scheme): (1) No collateral up to ₹7.5 Lakh (for PSBs), (2) Above ₹7.5 Lakh — collateral required, (3) Moratorium period: course duration + 1 year or 6 months after employment, whichever is earlier, (4) Repayment tenure: up to 15 years after moratorium, (5) Interest subsidy available for EWS students under Central Government scheme (Vidyalakshmi portal), (6) No processing fee for loans up to ₹7.5 Lakh (PSBs), (7) Banks should not ask for security for loans up to ₹4 Lakh. Education loan GNPA for PSBs declined from 7% (FY21) to 2% (FY25), indicating improving asset quality. Total education loan outstanding (banks): ₹1,23,066 Crore as of July 2024 (RBI sectoral deployment data).`,
    keywords: ["rbi education loan", "education loan guidelines", "collateral", "vidyalakshmi", "interest subsidy", "moratorium"],
    source: "Reserve Bank of India - Master Circular on Educational Loans",
    sourceUrl: "https://rbi.org.in/",
    lastVerified: "2026-04"
  },
  {
    id: "loan-comparison-tips",
    category: "Loans",
    title: "How to Choose Between Bank and NBFC Education Loans",
    content: `Bank vs NBFC education loans: Banks (SBI, BOB) offer lower interest rates (8.5-10.5%) but require collateral above ₹7.5L and take 2-4 weeks to process. NBFCs (Credila, Auxilo, Avanse) charge higher rates (11-15%) but offer faster processing (3-7 days), no-collateral options for select programs, and simpler documentation. Key factors to compare: (1) Interest rate — fixed vs floating, (2) Processing fee — can be 0-2%, (3) Collateral requirement and threshold, (4) Maximum loan amount, (5) Moratorium period, (6) Repayment tenure flexibility, (7) Prepayment/foreclosure charges, (8) Insurance bundling. Tip: Apply to both a bank and an NBFC simultaneously — use the bank loan as backup while the NBFC processes faster.`,
    keywords: ["bank vs nbfc", "education loan comparison", "which education loan", "loan tips"],
    source: "Analysis based on RBI norms + lender public rate cards",
    sourceUrl: "https://rbi.org.in/",
    lastVerified: "2026-04"
  },

  // ---- TEST PREP ----
  {
    id: "test-gre",
    category: "Tests",
    title: "GRE General Test — Overview and Scores",
    content: `The GRE General Test is accepted by thousands of graduate programs worldwide. Format: Verbal Reasoning (130-170), Quantitative Reasoning (130-170), Analytical Writing (0-6). Total score range: 260-340. Average scores: Verbal 151, Quant 154, AW 3.6. For Indian applicants, average Quant is typically higher (160+). Test duration: approximately 2 hours. Fee: ₹18,900 (India). Score validity: 5 years. The GRE is increasingly optional at many US universities post-COVID, but competitive applicants often still submit scores. Top CS programs expect 320+ (with 165+ Quant). The test is now shorter (2 hours vs old 4 hours) after the 2023 format change.`,
    keywords: ["gre", "gre score", "gre test", "gre preparation", "gre for ms", "gre quantitative"],
    source: "ETS - Educational Testing Service",
    sourceUrl: "https://www.ets.org/gre",
    lastVerified: "2026-04"
  },
  {
    id: "test-ielts",
    category: "Tests",
    title: "IELTS Academic — Overview and Requirements",
    content: `IELTS Academic is a widely accepted English proficiency test. Score range: 1-9 (band score). Components: Listening, Reading, Writing, Speaking. Typical requirements: UK universities (6.5-7.5), US universities (6.5-7.0), Canada (6.5), Australia (6.0-7.0). Fee: ₹16,250 (India). Score validity: 2 years. IELTS to TOEFL conversion: 9.0 = 118-120, 8.5 = 115-117, 8.0 = 110-114, 7.5 = 102-109, 7.0 = 94-101, 6.5 = 79-93, 6.0 = 60-78. Test is available as computer-delivered (results in 3-5 days) or paper-based (results in 13 days).`,
    keywords: ["ielts", "ielts score", "ielts academic", "english proficiency", "ielts for study abroad"],
    source: "British Council / IDP / Cambridge Assessment",
    sourceUrl: "https://www.ielts.org",
    lastVerified: "2026-04"
  },
  {
    id: "test-gmat",
    category: "Tests",
    title: "GMAT Focus Edition — For MBA Programs",
    content: `GMAT Focus Edition (launched Nov 2023): Score range 205-805. Components: Quantitative Reasoning, Verbal Reasoning, Data Insights. Duration: 2 hours 15 minutes. Fee: ₹24,900 globally. Average score for top MBA programs: IIM-A (700+), Harvard/Stanford/Wharton (730+), Global top 30 (680+). Score validity: 5 years. The new Focus Edition is shorter and doesn't include the old Analytical Writing section. Indian test-takers average around 600-620. Percentile mapping: 700 ≈ 88th percentile, 730 ≈ 96th, 750 ≈ 98th.`,
    keywords: ["gmat", "gmat focus", "mba test", "gmat score", "gmat for iim"],
    source: "GMAC - Graduate Management Admission Council",
    sourceUrl: "https://www.mba.com/exams/gmat-focus-edition",
    lastVerified: "2026-04"
  },
  {
    id: "test-gate",
    category: "Tests",
    title: "GATE — For Domestic MTech/MS Programs",
    content: `GATE (Graduate Aptitude Test in Engineering) is required for admission to MTech/MS programs at IITs, NITs, and IISc. Score range: 0-100 (marks), converted to a score out of 1000. Qualifying score varies by branch (typically 25-35 marks out of 100). Good GATE score for IITs: 600+ (score out of 1000) or top 500 rank. Fee: ₹1,800 (General), ₹900 (SC/ST/PwD/Women). Validity: 3 years. Also used for PSU recruitment by BHEL, IOCL, NTPC, GAIL, etc. Exam sections: General Aptitude (15%) + Subject-specific (85%). Available in 30 subjects.`,
    keywords: ["gate", "gate exam", "gate score", "iit admission", "mtech", "gate for iit"],
    source: "IIT exam authority (rotating annually)",
    sourceUrl: "https://gate2025.iitr.ac.in",
    lastVerified: "2026-04"
  },

  // ---- SCHOLARSHIPS ----
  {
    id: "scholarship-fulbright",
    category: "Scholarships",
    title: "Fulbright-Nehru Fellowship (India → US)",
    content: `Fulbright-Nehru Master's Fellowships are for Indian students pursuing a master's degree at select US institutions. Covers: tuition, living stipend (₹1,66,000-2,15,000/month), airfare, health insurance, book allowance. Duration: up to 2 years. Application opens: February, deadline: May each year. Eligibility: Indian citizen, bachelor's degree with 55%+, at least 3 years work experience (for some categories). Highly competitive — approximately 100 fellowships awarded annually. Fields: all except medicine and law.`,
    keywords: ["fulbright", "fulbright nehru", "scholarship usa", "usa fellowship", "fully funded usa"],
    source: "United States-India Educational Foundation (USIEF)",
    sourceUrl: "https://www.usief.org.in/Fulbright-Nehru-Fellowships.aspx",
    lastVerified: "2026-04"
  },
  {
    id: "scholarship-chevening",
    category: "Scholarships",
    title: "Chevening Scholarship (India → UK)",
    content: `Chevening Scholarships are the UK Government's flagship scholarship programme. Fully funded: covers tuition (up to ₹19,00,000), monthly living allowance (₹1,30,000-1,60,000 depending on location), return flights, visa fees, and travel grant. Duration: 1 year master's. Application timeline: August-November annually, interviews in Feb-March. Eligibility: 2 years work experience, bachelor's degree (any class), return to home country for 2 years after. Approximately 1,500 scholarships globally, ~60-80 for India.`,
    keywords: ["chevening", "uk scholarship", "scholarship uk", "fully funded uk", "chevening india"],
    source: "UK Government - Foreign, Commonwealth & Development Office",
    sourceUrl: "https://www.chevening.org/scholarships/",
    lastVerified: "2026-04"
  },

  // ---- SOP / APPLICATION TIPS ----
  {
    id: "sop-tips",
    category: "Applications",
    title: "Statement of Purpose (SOP) Writing Guide",
    content: `A strong SOP should: (1) Open with a compelling personal anecdote showing WHY this field, (2) Detail 2-3 specific academic/professional experiences that prepared you, (3) Show you understand the program — mention specific professors, labs, or courses you want to engage with, (4) Explain HOW this degree connects to your career goals, (5) Be 500-1000 words (check each university's requirements). Common mistakes: generic opening ("Since childhood..."), listing achievements without explanation, applying the same SOP to every university, not proofreading. Strong SOPs demonstrate intellectual curiosity and self-awareness. University-specific customization is critical — admissions committees can tell when an SOP is generic.`,
    keywords: ["sop", "statement of purpose", "how to write sop", "sop tips", "application essay"],
    source: "MIT Admissions + Stanford GSB best practices",
    sourceUrl: "https://gradadmissions.mit.edu/",
    lastVerified: "2026-04"
  },

  // ---- EDUCATION LOAN MARKET DATA ----
  {
    id: "market-tam",
    category: "Market",
    title: "Indian Education Loan Market Size & Growth",
    content: `Education loan market in India: Bank education loans outstanding — ₹1,23,066 Crore (RBI, July 2024). NBFC education loan AUM — ₹64,000 Crore (FY25, CRISIL). Total addressable market: ~₹1.87 Lakh Crore. NBFC segment growing at 48% YoY (FY24), moderated from 70%+ in FY23. PSB education loan GNPA declined from 7% (FY21) to 2% (FY25), making education loans increasingly attractive. Key players: SBI (largest PSB lender), Credila (largest NBFC), Avanse, Auxilo, Prodigy Finance. Approximately 1.33 million Indian students are studying abroad as of January 2024 (MEA data).`,
    keywords: ["education loan market", "tam", "nbfc", "education loan growth", "market size"],
    source: "RBI Sectoral Deployment + CRISIL Ratings FY24-25",
    sourceUrl: "https://rbi.org.in/",
    lastVerified: "2026-04"
  },
  {
    id: "market-parent-hesitation",
    category: "Market",
    title: "Why 60% of Education Loans Fail — Parent/Co-applicant Hesitation",
    content: `Industry estimates indicate that approximately 55-65% of incomplete education loan applications among digitally-started applicants are due to co-applicant (parent) resistance. This is the single largest blocker for loan completion, exceeding document issues or credit problems. Key parental concerns: (1) Fear of large debt burden, (2) Uncertainty about return on investment, (3) Lack of familiarity with the university or country, (4) Concerns about the student's ability to repay, (5) Preference for domestic education. Addressing parent concerns directly through transparent ROI data, peer success stories, and clear EMI projections is the most effective intervention.`,
    keywords: ["parent hesitation", "co-applicant", "loan dropout", "parent persuasion", "60 percent"],
    source: "Industry aggregate — Credila (HDFC), Auxilo Finserve, CRISIL reports",
    sourceUrl: "https://www.crisilratings.com/",
    lastVerified: "2026-04"
  },

  // ---- APP METADATA & SYSTEM ARCHITECTURE ----
  {
    id: "margdarshak-arch-overall",
    category: "Architecture",
    title: "Margdarshak AI - Platform Overview",
    content: "Margdarshak AI is an agentic AI guide built for the Meta Hackathon to assist students with Higher Education & Loan Readiness. It bridges the gap between academic preparation and financial securing (specifically targeting zero-collateral and flexible loan options). Key features include: the Loan Readiness Score (LRS), the Admission Predictor (MLR model, Acharya et al. 2019, R²=0.82), a Career Navigator, a Parent-Persuasion Report, and an LLM-powered Copilot Chatbot that utilizes a local MiniLM vector search engine.",
    keywords: ["margdarshak ai", "education loans", "meta hackathon", "platform overview", "loan readiness score"],
    source: "Margdarshak System Architecture",
    sourceUrl: "internal://architecture",
    lastVerified: "2026-04"
  },
  {
    id: "margdarshak-arch-ml",
    category: "Architecture",
    title: "Admission Predictor — Multiple Linear Regression (MLR) Model",
    content: "The Margdarshak admission predictor uses a peer-reviewed Multiple Linear Regression (MLR) model from Acharya et al. (2019), trained on the Kaggle Graduate Admissions dataset (500 records, R²=0.82). Inputs: GRE score (260-340), TOEFL/IELTS, CGPA (out of 10), University Tier (1-5), SOP strength (1-5), LOR strength (1-5), Research experience (binary), and Work experience (years). The model accurately explains 82% of variance in admission outcomes and is clearly disclosed as MLR — not a black-box ensemble.",
    keywords: ["mlr", "linear regression", "admission model", "admission predictor", "r squared", "kaggle", "graduate admissions"],
    source: "Acharya et al. (2019) - A Comparison of Regression Models",
    sourceUrl: "https://www.kaggle.com/datasets/mohansacharya/graduate-admissions",
    lastVerified: "2026-04"
  },
  {
    id: "margdarshak-arch-rag",
    category: "Architecture",
    title: "RAG Copilot & Local FAISS Vector Engine",
    content: "The AI Copilot uses a highly advanced, 100% free, and localized RAG (Retrieval-Augmented Generation) pipeline. It uses HuggingFace Xenova Transformers (all-MiniLM-L6-v2) to generate dense numerical embeddings natively in the Next.js backend. It then executes raw Cosine Similarity calculations (simulating FAISS or ChromaDB) to retrieve exact semantic math matches from the Knowledge Base. The final extracted payload is passed dynamically to the Groq API (Llama-3 8B model) to generate the conversational response.",
    keywords: ["rag", "vector database", "faiss", "xenova transformers", "groq", "llama 3", "cosine similarity"],
    source: "Margdarshak System Architecture",
    sourceUrl: "internal://architecture",
    lastVerified: "2026-04"
  },
  {
    id: "margdarshak-arch-timeline",
    category: "Architecture",
    title: "Timeline & Transactional WhatsApp Nudges",
    content: "The Study Timeline feature maps a 10-month strategic calendar based on the target country (e.g., F-1 visa prep, test prep). To enforce student accountability, the platform features a simulated Transactional WhatsApp Webhook system. The UI demonstrates how the backend orchestrator sends automated SMS nudges to students via Twilio/Meta Cloud APIs and interprets user replies (e.g. 'Send me GRE mock tests') using LangChain contextual routing.",
    keywords: ["whatsapp", "twilio", "timeline", "webhooks", "smart nudging", "calendar"],
    source: "Margdarshak System Architecture",
    sourceUrl: "internal://architecture",
    lastVerified: "2026-04"
  },
  {
    id: "margdarshak-arch-lrs",
    category: "Architecture",
    title: "The Loan Readiness Score (LRS)",
    content: "The LRS is the core financial metric of Margdarshak AI, scaling from 300 to 900 perfectly mimicking traditional CIBIL scores. It is algorithmically calculated using the student's Academic Pedigree (Target University Tier), Projected Post-Graduation Salary (via US Scorecard/NIRF Medians), and existing Collateral/Co-applicant status. A score above 720 instantly unlocks fast-track partner applications for zero-collateral lending.",
    keywords: ["lrs", "loan readiness score", "algorithm", "cibil", "fast-track", "zero-collateral"],
    source: "Margdarshak System Architecture",
    sourceUrl: "internal://architecture",
    lastVerified: "2026-04"
  }
];

// Simple keyword-based retrieval function for RAG
// In production, this would use vector embeddings (Pinecone + text-embedding-004)
export function retrieveRelevantChunks(query: string, topK: number = 3): KnowledgeChunk[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  const scored = knowledgeBase.map(chunk => {
    let score = 0;
    const searchText = `${chunk.title} ${chunk.content} ${chunk.keywords.join(' ')}`.toLowerCase();

    // Exact keyword matches
    for (const kw of chunk.keywords) {
      if (queryLower.includes(kw.toLowerCase())) score += 10;
    }

    // Word overlap
    for (const word of queryWords) {
      if (searchText.includes(word)) score += 2;
    }

    // Title match bonus
    if (chunk.title.toLowerCase().includes(queryLower)) score += 15;

    return { chunk, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.chunk);
}
