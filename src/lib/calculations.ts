import { CalculatorInputs, YearRow, ComparisonRow, CalculationResult } from "./types";

/**
 * BC Property Transfer Tax schedule (commercial property).
 * 1% on first $200k, 2% on $200k-$2M, 3% on $2M+
 */
export function calculateBCLandTransferTax(purchasePrice: number): number {
  let tax = 0;
  if (purchasePrice <= 200000) {
    tax = purchasePrice * 0.01;
  } else if (purchasePrice <= 2000000) {
    tax = 200000 * 0.01 + (purchasePrice - 200000) * 0.02;
  } else {
    tax = 200000 * 0.01 + 1800000 * 0.02 + (purchasePrice - 2000000) * 0.03;
  }
  return Math.round(tax * 100) / 100;
}

export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  amortizationYears: number
): number {
  if (principal <= 0) return 0;
  if (annualRate <= 0) return principal / (amortizationYears * 12);

  const monthlyRate = annualRate / 100 / 12;
  const numPayments = amortizationYears * 12;
  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  return payment;
}

export function getDownPaymentAmount(inputs: CalculatorInputs): number {
  if (inputs.downPaymentMode === "percent") {
    return inputs.purchasePrice * (inputs.downPaymentPercent / 100);
  }
  return inputs.downPaymentDollar;
}

export function getClosingCosts(inputs: CalculatorInputs): number {
  if (inputs.closingCostsOverride !== null) {
    return inputs.closingCostsOverride;
  }

  const ltt = inputs.landTransferTaxOverride
    ? inputs.landTransferTax
    : calculateBCLandTransferTax(inputs.purchasePrice);

  return (
    inputs.legalFees +
    inputs.propertyInspection +
    inputs.appraisal +
    ltt +
    inputs.environmentalAssessment
  );
}

function inflatedValue(base: number, inflationPercent: number, year: number): number {
  return base * Math.pow(1 + inflationPercent / 100, year - 1);
}

export function generateSchedule(inputs: CalculatorInputs): CalculationResult {
  const downPayment = getDownPaymentAmount(inputs);
  const mortgageAmount = Math.max(0, inputs.purchasePrice - downPayment);
  const monthlyPayment = calculateMonthlyPayment(
    mortgageAmount,
    inputs.interestRate,
    inputs.amortizationYears
  );
  const totalClosingCosts = getClosingCosts(inputs);

  const monthlyRate = inputs.interestRate / 100 / 12;
  let remainingBalance = mortgageAmount;
  let cumulativeCashFlow = -(downPayment + totalClosingCosts); // upfront costs
  let totalPrincipalPaid = 0;

  const schedule: YearRow[] = [];

  for (let year = 1; year <= inputs.projectionYears; year++) {
    // Calculate mortgage principal/interest split for this year
    let yearPrincipal = 0;
    let yearInterest = 0;
    let yearMortgagePayment = 0;

    for (let month = 0; month < 12; month++) {
      if (remainingBalance <= 0) break;

      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = Math.min(
        monthlyPayment - interestPayment,
        remainingBalance
      );

      yearInterest += interestPayment;
      yearPrincipal += principalPayment;
      yearMortgagePayment += interestPayment + principalPayment;
      remainingBalance -= principalPayment;
    }

    remainingBalance = Math.max(0, remainingBalance);
    totalPrincipalPaid += yearPrincipal;

    // Operating costs with inflation
    const propertyTax = inflatedValue(inputs.propertyTax, inputs.propertyTaxInflation, year);
    const insurance = inflatedValue(inputs.insurance, inputs.insuranceInflation, year);
    const maintenance = inflatedValue(inputs.maintenance, inputs.maintenanceInflation, year);

    const totalCosts = yearMortgagePayment + propertyTax + insurance + maintenance;

    // Rental income
    const rentalIncomeGross =
      inputs.annualRentalIncome > 0
        ? inputs.annualRentalIncome * Math.pow(1 + inputs.rentAnnualIncrease / 100, year - 1)
        : 0;
    const rentalIncomeTax = rentalIncomeGross * (inputs.rentalIncomeTaxRate / 100);
    const rentalIncomeNet = rentalIncomeGross - rentalIncomeTax;

    // Costs avoided (money you stop paying by owning — not taxed)
    const baseCostsAvoided = inputs.currentRent + inputs.currentInsurance + inputs.currentOther;
    const costsAvoided = baseCostsAvoided > 0
      ? inflatedValue(baseCostsAvoided, inputs.costsAvoidedInflation, year)
      : 0;

    // Cash flow
    const netCashFlow = rentalIncomeNet + costsAvoided - totalCosts;
    cumulativeCashFlow += netCashFlow;

    // Equity & value
    const equityBuilt = downPayment + totalPrincipalPaid;
    const estimatedPropertyValue =
      inputs.purchasePrice * Math.pow(1 + inputs.appreciationRate / 100, year);
    const netWorthPosition = estimatedPropertyValue - remainingBalance;

    schedule.push({
      year,
      mortgagePayment: Math.round(yearMortgagePayment * 100) / 100,
      principalPaid: Math.round(yearPrincipal * 100) / 100,
      interestPaid: Math.round(yearInterest * 100) / 100,
      propertyTax: Math.round(propertyTax * 100) / 100,
      insurance: Math.round(insurance * 100) / 100,
      maintenance: Math.round(maintenance * 100) / 100,
      totalCosts: Math.round(totalCosts * 100) / 100,
      rentalIncomeGross: Math.round(rentalIncomeGross * 100) / 100,
      rentalIncomeTax: Math.round(rentalIncomeTax * 100) / 100,
      rentalIncomeNet: Math.round(rentalIncomeNet * 100) / 100,
      costsAvoided: Math.round(costsAvoided * 100) / 100,
      netCashFlow: Math.round(netCashFlow * 100) / 100,
      cumulativeCashFlow: Math.round(cumulativeCashFlow * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      equityBuilt: Math.round(equityBuilt * 100) / 100,
      estimatedPropertyValue: Math.round(estimatedPropertyValue * 100) / 100,
      netWorthPosition: Math.round(netWorthPosition * 100) / 100,
    });
  }

  // Rent vs Own comparison
  const comparison: ComparisonRow[] = [];
  const baseCostsAvoided = inputs.currentRent + inputs.currentInsurance + inputs.currentOther;
  let investmentBalance = 0;
  const returnRate = inputs.investmentReturnRate / 100;

  for (let i = 0; i < schedule.length; i++) {
    const row = schedule[i];
    const year = row.year;

    // Rent scenario: what you'd pay if you kept renting (the "costs avoided" values)
    const rentCost = baseCostsAvoided > 0
      ? inflatedValue(baseCostsAvoided, inputs.costsAvoidedInflation, year)
      : 0;

    // Own scenario: total cash out for the year (all costs minus any rental income)
    // In year 1, also include down payment + closing costs
    const ownCost = row.totalCosts - row.rentalIncomeNet + (year === 1 ? downPayment + totalClosingCosts : 0);

    // Positive = owning costs more (renting saves money), negative = renting costs more (owning saves money)
    const annualDifference = ownCost - rentCost;

    // Grow existing balance, then add this year's savings
    investmentBalance = investmentBalance * (1 + returnRate) + annualDifference;

    // If investment balance is positive, renter has savings invested
    // If negative, owner had extra cash that could have been invested (but we track as owner advantage)
    const rentNetPosition = Math.max(0, investmentBalance);
    const ownNetWorth = row.netWorthPosition;
    const advantage = ownNetWorth - rentNetPosition;

    comparison.push({
      year,
      rentCost: Math.round(rentCost * 100) / 100,
      ownCost: Math.round(ownCost * 100) / 100,
      annualSavings: Math.round(-annualDifference * 100) / 100, // positive = owning cheaper
      investmentBalance: Math.round(investmentBalance * 100) / 100,
      ownNetWorth: Math.round(ownNetWorth * 100) / 100,
      rentNetPosition: Math.round(rentNetPosition * 100) / 100,
      advantage: Math.round(advantage * 100) / 100,
    });
  }

  const lastYear = schedule[schedule.length - 1];
  const totalCostOverPeriod =
    downPayment +
    totalClosingCosts +
    schedule.reduce((sum, row) => sum + row.totalCosts, 0);
  const totalIncomeOverPeriod = schedule.reduce(
    (sum, row) => sum + row.rentalIncomeNet + row.costsAvoided,
    0
  );

  return {
    schedule,
    comparison,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalClosingCosts: Math.round(totalClosingCosts * 100) / 100,
    downPaymentAmount: Math.round(downPayment * 100) / 100,
    mortgageAmount: Math.round(mortgageAmount * 100) / 100,
    summary: {
      totalCostOverPeriod: Math.round((totalCostOverPeriod - totalIncomeOverPeriod) * 100) / 100,
      totalEquityBuilt: lastYear ? Math.round(lastYear.equityBuilt * 100) / 100 : 0,
      estimatedPropertyValue: lastYear
        ? Math.round(lastYear.estimatedPropertyValue * 100) / 100
        : inputs.purchasePrice,
      netWorthPosition: lastYear ? Math.round(lastYear.netWorthPosition * 100) / 100 : 0,
      effectiveMonthlyCost: lastYear
        ? Math.round((-lastYear.cumulativeCashFlow / (inputs.projectionYears * 12)) * 100) / 100
        : 0,
    },
  };
}
