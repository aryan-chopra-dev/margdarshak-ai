// ============================================================================
// REAL LOAN DATA — All figures from verified public sources
// ============================================================================
// Sources:
//   Credila (HDFC): credila.com (public rate card)
//   Prodigy Finance: prodigyfinance.com (public terms)
//   SBI: sbi.co.in/web/personal-banking/loans/education-loans
//   RBI Guidelines: rbi.org.in (education loan norms)
// ============================================================================

export interface LoanProduct {
  id: string;
  lender: string;
  type: 'nbfc' | 'bank';
  interestRateMin: number;
  interestRateMax: number;
  maxLoanAmountINR: number;
  processingFee: string;
  collateralRequired: string;
  moratoriumMonths: number;
  maxTenureYears: number;
  domesticLoans: boolean;
  abroadLoans: boolean;
  processingTimeDays: string;
  features: string[];
  highlighted?: boolean;
  dataSource: string;
  sourceUrl: string;
}

export const loanProducts: LoanProduct[] = [
  {
    id: "credila",
    lender: "Credila Financial Services (HDFC)",
    type: "nbfc",
    interestRateMin: 11.00,
    interestRateMax: 13.50,
    maxLoanAmountINR: 20000000,
    processingFee: "1% + GST (non-refundable)",
    collateralRequired: "Required above ₹7.5 Lakh",
    moratoriumMonths: 12,
    maxTenureYears: 15,
    domesticLoans: true,
    abroadLoans: true,
    processingTimeDays: "5-7 business days",
    features: [
      "High loan amounts up to ₹2 Crore",
      "Backed by HDFC Ltd",
      "Part-disbursement facility",
      "Co-applicant mandatory",
      "Covers tuition + living + travel"
    ],
    highlighted: true,
    dataSource: "Credila Official Website",
    sourceUrl: "https://www.credila.com"
  },
  {
    id: "prodigy",
    lender: "Prodigy Finance",
    type: "nbfc",
    interestRateMin: 12.50,
    interestRateMax: 15.50,
    maxLoanAmountINR: 50000000,
    processingFee: "1% administration fee",
    collateralRequired: "No collateral, no co-signer",
    moratoriumMonths: 6,
    maxTenureYears: 10,
    domesticLoans: false,
    abroadLoans: true,
    processingTimeDays: "3-5 business days",
    features: [
      "No collateral, no co-signer required",
      "For top-ranked universities only",
      "Covers tuition + living expenses",
      "Study abroad only (not domestic)",
      "Community-funded lending model"
    ],
    dataSource: "Prodigy Finance Official Website",
    sourceUrl: "https://prodigyfinance.com"
  },
  {
    id: "auxilo",
    lender: "Auxilo Finserve",
    type: "nbfc",
    interestRateMin: 11.50,
    interestRateMax: 14.50,
    maxLoanAmountINR: 10000000,
    processingFee: "1-2% + GST",
    collateralRequired: "No collateral up to ₹7.5 Lakh",
    moratoriumMonths: 12,
    maxTenureYears: 12,
    domesticLoans: true,
    abroadLoans: true,
    processingTimeDays: "5-7 business days",
    features: [
      "No collateral up to ₹7.5 Lakh",
      "Custom repayment plans",
      "Domestic + abroad coverage",
      "Doorstep document pickup"
    ],
    dataSource: "Auxilo Finserve Official Website",
    sourceUrl: "https://www.auxilo.com"
  },
  {
    id: "mpower",
    lender: "MPOWER Financing",
    type: "nbfc",
    interestRateMin: 13.00,
    interestRateMax: 16.00,
    maxLoanAmountINR: 60000000,
    processingFee: "2% origination fee",
    collateralRequired: "No cosigner required",
    moratoriumMonths: 6,
    maxTenureYears: 10,
    domesticLoans: false,
    abroadLoans: true,
    processingTimeDays: "2-3 business days",
    features: [
      "No cosigner required",
      "Fixed interest rates",
      "US & Canada universities only",
      "Online-first process",
      "Career support included"
    ],
    dataSource: "MPOWER Financing Official Website",
    sourceUrl: "https://www.mpowerfinancing.com"
  },
  {
    id: "sbi",
    lender: "SBI Education Loan (Scholar/Global Ed-Vantage)",
    type: "bank",
    // From sbi.co.in: 8.50% - 10.50% for education loans
    interestRateMin: 8.50,
    interestRateMax: 10.50,
    maxLoanAmountINR: 15000000,
    processingFee: "₹10,000 flat (refundable for PSB candidates)",
    collateralRequired: "Required above ₹7.5 Lakh (RBI norm)",
    moratoriumMonths: 12,
    maxTenureYears: 15,
    domesticLoans: true,
    abroadLoans: true,
    processingTimeDays: "15-30 business days",
    features: [
      "Lowest interest rates (PSB)",
      "Government bank security",
      "RBI compliant collateral norms",
      "Interest subsidy for EWS students (Vidyalakshmi)",
      "Slower processing than NBFCs",
      "100% finance for premier institutions"
    ],
    dataSource: "SBI Official Education Loan Page",
    sourceUrl: "https://sbi.co.in/web/personal-banking/loans/education-loans"
  },
  {
    id: "bob",
    lender: "Bank of Baroda (Baroda Scholar)",
    type: "bank",
    interestRateMin: 8.70,
    interestRateMax: 10.20,
    maxLoanAmountINR: 10000000,
    processingFee: "₹10,000 flat",
    collateralRequired: "Required above ₹4 Lakh",
    moratoriumMonths: 12,
    maxTenureYears: 15,
    domesticLoans: true,
    abroadLoans: true,
    processingTimeDays: "10-21 business days",
    features: [
      "Baroda Scholar for premier institutes",
      "Low rates for IIT/IIM/NIT",
      "Collateral required above ₹4L",
      "Interest concession for girls: 0.50%"
    ],
    dataSource: "Bank of Baroda Official Website",
    sourceUrl: "https://www.bankofbaroda.in/personal-banking/loans/education-loan"
  },
];

// EMI Calculation helper (standard reducing balance formula)
export function calculateEMI(principal: number, annualRate: number, tenureYears: number) {
  const monthlyRate = annualRate / 12 / 100;
  const months = tenureYears * 12;
  if (monthlyRate === 0) return { emi: Math.round(principal / months), totalPayment: principal, totalInterest: 0, months };
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
              (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  return {
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    months
  };
}

// Generate yearly repayment schedule
export function generateRepaymentSchedule(principal: number, annualRate: number, tenureYears: number) {
  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const emi = monthlyRate === 0
    ? principal / totalMonths
    : (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const rows = [];
  let balance = principal;

  for (let year = 1; year <= tenureYears; year++) {
    const openingBalance = balance;
    let yearPrincipal = 0;
    let yearInterest = 0;

    for (let m = 0; m < 12; m++) {
      const interest = balance * monthlyRate;
      const princ = Math.min(emi - interest, balance);
      yearPrincipal += princ;
      yearInterest += interest;
      balance = Math.max(0, balance - princ);
      if (balance === 0) break;
    }

    rows.push({
      year,
      openingBalance,
      principalPaid: yearPrincipal,
      interestPaid: yearInterest,
      closingBalance: balance,
    });

    if (balance === 0) break;
  }

  return rows;
}
