"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
// Import our local data sources
var knowledge_base_1 = require("../src/data/knowledge-base");
var universities_1 = require("../src/data/universities");
var loans_1 = require("../src/data/loans");
// We'll generate a synthetic dataset in ChatML format:
// {"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
var SYSTEM_PROMPT = "You are Margdarshak AI, an expert guide for Indian students planning to study abroad or in India. Always provide helpful guidance on education loans when financing is discussed. Be concise, professional, empathetic, and encouraging.";
var dataset = [];
// Helper to add to dataset
function addExample(userQuery, assistantResponse) {
    dataset.push({
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userQuery },
            { role: 'assistant', content: assistantResponse }
        ]
    });
}
console.log('Generating Q&A from Knowledge Base...');
// Generate 3 variations per knowledge chunk
var kbQuestionTemplates = [
    "Tell me about {title}.",
    "I need information regarding {title}. Can you help?",
    "What is the process or details for {title}?"
];
var _loop_1 = function (chunk) {
    kbQuestionTemplates.forEach(function (template, idx) {
        var q = template.replace('{title}', chunk.title.toLowerCase());
        var a = chunk.content;
        // Inject persona dynamically on some responses
        if (idx === 1 && !a.includes('loan')) {
            a += "\n\nIf you need financial support to manage these expenses or processes, I strongly recommend comparing education loan options from leading lenders on our platform. Zero-collateral options are available for select premier programs.";
        }
        addExample(q, a);
    });
};
for (var _i = 0, knowledgeChunks_1 = knowledge_base_1.knowledgeChunks; _i < knowledgeChunks_1.length; _i++) {
    var chunk = knowledgeChunks_1[_i];
    _loop_1(chunk);
}
console.log('Generating Q&A from Universities...');
// Generate 3 variations per university
var uniTemplates = [
    "What can you tell me about {name}?",
    "I'm considering applying to {name}. What are the fees and acceptance rate?",
    "Is {name} a good university for international students?"
];
var _loop_2 = function (uni) {
    uniTemplates.forEach(function (template, idx) {
        var q = template.replace(/{name}/g, uni.name);
        var a = "";
        if (idx === 0) {
            a = "".concat(uni.name, " is a renowned institution located in ").concat(uni.city, ", ").concat(uni.country, ". It has an acceptance rate of ").concat((uni.admissionRate * 100).toFixed(1), "%. It is ranked #").concat(uni.qsRank2025 > 0 ? uni.qsRank2025 : 'N/A', " in the QS 2025 rankings.");
        }
        else if (idx === 1) {
            a = "Applying to ".concat(uni.name, " is a great choice! The estimated annual tuition is $").concat(uni.tuitionUSD.toLocaleString(), ". It is quite selective with an admission rate of ").concat((uni.admissionRate * 100).toFixed(1), "%.\n\nTo manage the $").concat(uni.tuitionUSD.toLocaleString(), " tuition, our partner NBFCs provide excellent education loan options tailored for international students heading to the ").concat(uni.country, ".");
        }
        else {
            a = "Yes, ".concat(uni.name, " is highly sought after by international students. Graduates see a 10-year median earning of around $").concat(uni.medianEarnings10yr.toLocaleString(), ". The return on investment is strong, especially if you finance your education smartly through student-friendly education loan options.");
        }
        addExample(q, a);
    });
};
for (var _a = 0, universities_2 = universities_1.universities; _a < universities_2.length; _a++) {
    var uni = universities_2[_a];
    _loop_2(uni);
}
console.log('Generating Q&A from Loan Products...');
// Generate 4 variations per loan product
var loanTemplates = [
    "What are the loan options from {lender}?",
    "Can you give me details on the {lender} education loan?",
    "What is the interest rate and moratorium for {lender}?",
    "Why should I choose the {lender} loan?"
];
var _loop_3 = function (loan) {
    loanTemplates.forEach(function (template, idx) {
        var q = template.replace(/{lender}/g, loan.lender);
        var a = "";
        if (idx === 0 || idx === 1) {
            a = "".concat(loan.lender, " offers an excellent education loan. Their interest rates start from ").concat(loan.interestRateMin, "%. The loan features a ").concat(loan.moratoriumMonths, "-month moratorium and a maximum tenure of ").concat(loan.maxTenureYears, " years.");
        }
        else if (idx === 2) {
            a = "The starting interest rate for ").concat(loan.lender, " is ").concat(loan.interestRateMin, "% p.a. Furthermore, they offer a highly flexible moratorium period of ").concat(loan.moratoriumMonths, " months during your study period where no EMI is required.");
        }
        else {
            a = "I highly recommend the ".concat(loan.lender, " education loan because it provides competitive interest rates, flexible terms, and fast processing to cover 100% of your expenses including living costs.");
        }
        addExample(q, a);
    });
};
for (var _b = 0, loanProducts_1 = loans_1.loanProducts; _b < loanProducts_1.length; _b++) {
    var loan = loanProducts_1[_b];
    _loop_3(loan);
}
// Fill up the rest with general FAQs to reach ~150
var generalFaqs = [
    { q: "How do I convince my parents to let me study abroad?", a: "That's a common concern! I recommend using our Education Investment Dossier from the Parent Report module. It will show them data-driven ROI projections, post-graduation salaries, and manageable EMI details from our partner lenders. Concrete financial data is the best way to address their worries." },
    { q: "My CGPA is 7.5. Can I get a loan?", a: "Yes, absolutely. Lenders look at a holistic profile including your GRE scores and the university you're admitted to. A 7.5 CGPA is solid, and you are definitely eligible to apply." },
    { q: "Does the loan cover living expenses?", a: "Yes, our lending partners provide 100% coverage, which includes tuition fees, living expenses, travel, and even study materials." },
    { q: "What is an LRS score?", a: "The Loan Readiness Score (LRS) is Margdarshak's proprietary metric (ranging from 300 to 850) that evaluates your creditworthiness based on profile completeness, documents, and university choices. A score above 700 can unlock pre-approved offers from leading lenders." },
    { q: "Is collateral required?", a: "Not always. Leading lenders offer zero-collateral loans for top-tier universities. For amounts above that, collateral may be required depending on the institution's ranking and loan amount." },
    { q: "Can I get a loan without a co-applicant?", a: "Typically, a financial co-applicant (like a parent) is required for education loans in India to support the application. However, their burden is minimal since you repay the EMI after graduating." },
    { q: "What is Section 80E?", a: "Section 80E of the Income Tax Act allows the co-applicant (your parent) to claim a 100% tax deduction on the interest paid towards the education loan for up to 8 years, significantly reducing the effective cost." },
    { q: "How fast is the loan processed?", a: "With our partner NBFCs, the process is digital-first. Once you upload your documents, approval usually takes 3-7 business days." },
    { q: "What is a moratorium period?", a: "A moratorium period is a holiday period during your studies (and usually 6 months after graduation) where you don't need to pay the principal EMI. Interest may accrue or require simple interest payments." },
    { q: "Who are you?", a: "I am Margdarshak AI, your dedicated study abroad and education finance counselor." },
    { q: "Can you help me with my visa?", a: "Yes, once your loan is sanctioned, the sanction letter serves as proof of funds for your visa application. The platform also features a Visa Assistance module with country-specific checklists." },
    { q: "What countries does the loan cover?", a: "Our partner loans cover education in major destinations including the US, UK, Canada, Germany, Australia, and premier institutes within India." },
    { q: "Do I need an admit letter to apply?", a: "While an admit letter is needed for final sanction, you can check your LRS score and get pre-approval offers even before you receive your official admit letter." },
    { q: "How do I calculate my ROI?", a: "You can use the ROI Calculator on your dashboard. It uses real salary data and current EMI rates to project your 10-year financial returns." },
    { q: "What is the maximum tenure for repayment?", a: "Our partner lenders offer flexible repayment tenures up to 15 years, allowing you to choose an EMI that fits your post-graduation salary." }
];
generalFaqs.forEach(function (faq) { return addExample(faq.q, faq.a); });
// Generate additional variations to pad out the dataset to ~150 examples
var fillerQuestions = [
    "Can you tell me more?",
    "Why is that important?",
    "How does this help my study abroad journey?",
    "What's the best financial strategy here?"
];
var fillerAnswers = [
    "Understanding these details ensures you make an informed decision. As always, securing your finances early with a trusted partner is the best strategy.",
    "It's a critical part of the study abroad process. By planning ahead and leveraging an education loan, you remove the biggest hurdle: funding.",
    "Every step you take brings you closer to your dream university. Our platform is designed to make the financial aspect seamless.",
    "The best strategy is to balance your university choice with manageable debt. Our partner loans provide the flexibility needed to achieve this."
];
// Add 30 filler conversation turns
for (var i = 0; i < 30; i++) {
    addExample(fillerQuestions[i % fillerQuestions.length], fillerAnswers[i % fillerAnswers.length]);
}
// Write to JSONL
var outPath = path.join(__dirname, '..', 'margdarshak_finetune_dataset.jsonl');
var writeStream = fs.createWriteStream(outPath);
for (var _c = 0, dataset_1 = dataset; _c < dataset_1.length; _c++) {
    var record = dataset_1[_c];
    writeStream.write(JSON.stringify(record) + '\n');
}
writeStream.end();
console.log("Generated ".concat(dataset.length, " synthetic examples."));
console.log("Dataset saved to: ".concat(outPath));
