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

const currentScenario = SCENARIOS.realistic;
const programYears = 2;
const preDegree = 7230; 
const postDegreeEntry = 81220;
const postDegreeSenior = 172970;
const annualGrowthPct = 7.5;
const emiUSDAnnual = 20000; 
const loanTenure = 10;
const totalCostUSD = 80000; // e.g. 40k/yr

const cashFlows = [];

for (let t = 0; t < programYears + 10; t++) {
  let cf = 0;
  const preDegreeGrowth = 0.08 * currentScenario.salaryGrowthMult;
  const currentPreDegree = preDegree * Math.pow(1 + preDegreeGrowth, t);
  const preDegreeNet = currentPreDegree * (1 - currentScenario.taxIN);

  if (t < programYears) {
    cf = -preDegreeNet - (totalCostUSD / programYears);
  } else {
    const workYear = t - programYears;
    let currentSalary = postDegreeEntry * currentScenario.salaryGrowthMult * Math.pow(1 + (annualGrowthPct / 100) * currentScenario.salaryGrowthMult, workYear);
    const capSalary = postDegreeSenior * currentScenario.salaryGrowthMult;
    if (currentSalary > capSalary) currentSalary = capSalary;

    const postDegreeNet = currentSalary * (1 - currentScenario.taxUS);
    
    cf = postDegreeNet - preDegreeNet;
  }

  cashFlows.push(cf);
}

console.log("Cash flows:", cashFlows.map(c => Math.round(c)));
console.log("Project IRR:", (calculateIRR(cashFlows) * 100).toFixed(2) + "%");
