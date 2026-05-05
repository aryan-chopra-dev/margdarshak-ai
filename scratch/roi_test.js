const SCENARIOS = {
  realistic:  { 
    salaryGrowthMult: 1.0, 
    taxUS: 0.30, 
    taxIN: 0.20, 
    discountRate: 0.10, 
  }
};

function calculateIRR(cashFlows, guess = 0.1) {
  const maxTries = 100;
  let rate = guess;
  for (let i = 0; i < maxTries; i++) {
    let npv = 0;
    let dNpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t);
      if (t > 0) {
        dNpv -= t * cashFlows[t] / Math.pow(1 + rate, t + 1);
      }
    }
    if (Math.abs(npv) < 1e-5) return rate;
    const newRate = rate - npv / dNpv;
    if (Math.abs(newRate - rate) < 1e-5) return newRate;
    rate = newRate;
  }
  return rate;
}

function calculateNPV(rate, cashFlows) {
  return cashFlows.reduce((npv, cf, t) => npv + cf / Math.pow(1 + rate, t), 0);
}

const currentScenario = SCENARIOS.realistic;
const programYears = 2;
const preDegree = 7230; // 6 LPA
const postDegreeEntry = 81220;
const postDegreeSenior = 172970;
const annualGrowthPct = 7.5;
const emiUSDAnnual = 20000; // rough guess
const loanTenure = 10;

const cashFlows = [];
let cumulativeUnlevered = 0;
let breakEvenYears = -1;

for (let t = 0; t < programYears + 10; t++) {
  let cf = 0;
  const preDegreeGrowth = 0.08 * currentScenario.salaryGrowthMult;
  const currentPreDegree = preDegree * Math.pow(1 + preDegreeGrowth, t);
  const preDegreeNet = currentPreDegree * (1 - currentScenario.taxIN);

  if (t < programYears) {
    cf = -preDegreeNet;
  } else {
    const workYear = t - programYears;
    let currentSalary = postDegreeEntry * currentScenario.salaryGrowthMult * Math.pow(1 + (annualGrowthPct / 100) * currentScenario.salaryGrowthMult, workYear);
    const capSalary = postDegreeSenior * currentScenario.salaryGrowthMult;
    if (currentSalary > capSalary) currentSalary = capSalary;

    const postDegreeNet = currentSalary * (1 - currentScenario.taxUS);
    
    cf = postDegreeNet - preDegreeNet;
    
    if (workYear < loanTenure) {
      cf -= emiUSDAnnual;
    }
  }

  cashFlows.push(cf);
  cumulativeUnlevered += cf;
  if (breakEvenYears === -1 && cumulativeUnlevered > 0) {
    const prev = cumulativeUnlevered - cf;
    breakEvenYears = t - 1 + Math.abs(prev) / cf;
  }
}

console.log("Cash flows:", cashFlows.map(c => Math.round(c)));
console.log("IRR:", (calculateIRR(cashFlows) * 100).toFixed(2) + "%");
console.log("NPV:", Math.round(calculateNPV(currentScenario.discountRate, cashFlows)));
console.log("Break Even:", breakEvenYears);
