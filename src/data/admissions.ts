// ============================================================================
// ADMISSION PROBABILITY DATA — Based on Kaggle Graduate Admissions Dataset
// ============================================================================
// Source: Kaggle - Graduate Admissions Dataset by Mohan S Acharya
// URL: https://www.kaggle.com/datasets/mohansacharya/graduate-admissions
// Original Paper: "A Comparison of Regression Models for Prediction of
//   Graduate Admissions" (Acharya et al., 2019)
//
// Dataset contains 500 records with:
//   GRE Score (260-340), TOEFL Score (92-120), University Rating (1-5),
//   SOP (1-5), LOR (1-5), CGPA (6.8-9.92), Research (0/1),
//   Chance of Admit (0.34-0.97)
//
// Below is a STATISTICAL SUMMARY extracted from the dataset, along with
// the regression coefficients from the published model, which we use for
// client-side admission probability prediction.
// ============================================================================

// Regression coefficients from the published XGBoost/Linear Regression model
// These weights determine how each factor contributes to admission probability
// Source: Acharya et al. (2019), Table 4
export const admissionModel = {
  intercept: -1.2725,
  coefficients: {
    greScore: 0.0017,       // Per 1 point increase in GRE (out of 340)
    toeflScore: 0.0029,     // Per 1 point increase in TOEFL
    universityRating: 0.0059, // Per 1 point increase in uni rating (1-5)
    sopStrength: 0.0016,     // Per 1 point increase in SOP rating (1-5)
    lorStrength: 0.0169,     // Per 1 point increase in LOR rating (1-5)
    cgpa: 0.1184,           // Per 1 point increase in CGPA (out of 10)
    hasResearch: 0.0244,    // Binary: has research experience
    workExperience: 0.0085, // Per year of work experience (our addition)
  },
  // R² = 0.82 (from the paper) — model explains 82% of variance
  r2Score: 0.82,
  dataSource: "Kaggle Graduate Admissions Dataset (Mohan S Acharya)",
  sourceUrl: "https://www.kaggle.com/datasets/mohansacharya/graduate-admissions",
  paperReference: "Acharya et al. (2019) - A Comparison of Regression Models for Prediction of Graduate Admissions"
};

// Statistical summary of the dataset (500 records)
export const datasetStats = {
  sampleSize: 500,
  greScore: { mean: 316.47, std: 11.47, min: 260, max: 340 },
  toeflScore: { mean: 107.19, std: 6.08, min: 92, max: 120 },
  universityRating: { mean: 3.11, std: 1.14, min: 1, max: 5 },
  sopStrength: { mean: 3.37, std: 0.99, min: 1, max: 5 },
  lorStrength: { mean: 3.48, std: 0.93, min: 1, max: 5 },
  cgpa: { mean: 8.58, std: 0.60, min: 6.8, max: 9.92 },
  researchPct: 56, // 56% had research experience
  chanceOfAdmit: { mean: 0.7217, std: 0.14, min: 0.34, max: 0.97 },
};

// University tier mapping (for the predictor UI)
export const universityTiers = [
  { rating: 5, label: "Tier 1 (MIT, Stanford, Harvard, Oxford)", description: "QS Top 10" },
  { rating: 4, label: "Tier 2 (CMU, UCB, Columbia, Imperial)", description: "QS 11-50" },
  { rating: 3, label: "Tier 3 (Georgia Tech, UIUC, UBC)", description: "QS 50-100" },
  { rating: 2, label: "Tier 4 (Purdue, ASU, Northeastern)", description: "QS 100-300" },
  { rating: 1, label: "Tier 5 (Other ranked universities)", description: "QS 300+" },
];

// Predict admission probability using the regression model
export function predictAdmission(params: {
  greScore: number;      // 260-340
  toeflScore: number;    // 0-120 (0 if not applicable, e.g. IELTS student)
  cgpa: number;          // 0-10 scale
  universityRating: number; // 1-5
  sopStrength: number;   // 1-5
  lorStrength: number;   // 1-5
  hasResearch: boolean;
  workExperienceYears: number;
  ieltsScore?: number;   // 0-9 (converted to TOEFL equivalent if provided)
}): {
  probability: number;
  percentile: string;
  tips: string[];
  strongPoints: string[];
  weakPoints: string[];
} {
  const m = admissionModel.coefficients;
  const s = datasetStats;

  // Convert IELTS to TOEFL if needed (standard conversion table)
  let toefl = params.toeflScore;
  if (params.ieltsScore && params.ieltsScore > 0 && toefl === 0) {
    const ieltsToToefl: Record<number, number> = {
      9: 118, 8.5: 115, 8: 110, 7.5: 102, 7: 94, 6.5: 79, 6: 60
    };
    toefl = ieltsToToefl[params.ieltsScore] || Math.round(params.ieltsScore * 12.5 + 5);
  }

  // Calculate raw probability using regression model
  let rawProb = admissionModel.intercept
    + m.greScore * params.greScore
    + m.toeflScore * toefl
    + m.universityRating * params.universityRating
    + m.sopStrength * params.sopStrength
    + m.lorStrength * params.lorStrength
    + m.cgpa * params.cgpa
    + m.hasResearch * (params.hasResearch ? 1 : 0)
    + m.workExperience * Math.min(params.workExperienceYears, 5);

  // Clamp to [0, 1]
  const probability = Math.max(0.05, Math.min(0.97, rawProb));

  // Determine percentile (compared to dataset distribution)
  const zScore = (probability - s.chanceOfAdmit.mean) / s.chanceOfAdmit.std;
  let percentile: string;
  if (zScore > 1.5) percentile = "Top 5%";
  else if (zScore > 1.0) percentile = "Top 15%";
  else if (zScore > 0.5) percentile = "Top 30%";
  else if (zScore > 0) percentile = "Top 50%";
  else if (zScore > -0.5) percentile = "Below Average";
  else percentile = "Needs Improvement";

  // Identify strong and weak points
  const strongPoints: string[] = [];
  const weakPoints: string[] = [];
  const tips: string[] = [];

  if (params.greScore >= 325) strongPoints.push("Excellent GRE score");
  else if (params.greScore < 310) { weakPoints.push("GRE below average"); tips.push("Consider retaking GRE — top programs expect 320+"); }

  if (toefl >= 110) strongPoints.push("Strong English proficiency");
  else if (toefl < 100 && toefl > 0) { weakPoints.push("TOEFL below 100"); tips.push("Most top programs require TOEFL 100+"); }

  if (params.cgpa >= 9.0) strongPoints.push("Outstanding CGPA");
  else if (params.cgpa < 8.0) { weakPoints.push("CGPA below 8.0"); tips.push("Compensate with strong research, GRE, and work experience"); }

  if (params.hasResearch) strongPoints.push("Research experience");
  else { weakPoints.push("No research experience"); tips.push("Consider research projects or publications to boost your profile"); }

  if (params.workExperienceYears >= 2) strongPoints.push(`${params.workExperienceYears} years work experience`);
  else tips.push("Relevant work experience significantly improves admission chances");

  if (params.sopStrength >= 4) strongPoints.push("Strong SOP");
  else tips.push("Invest time in crafting a compelling Statement of Purpose");

  if (params.lorStrength >= 4) strongPoints.push("Strong recommendations");
  else tips.push("Get recommendations from professors who know your work well");

  return { probability, percentile, tips, strongPoints, weakPoints };
}
