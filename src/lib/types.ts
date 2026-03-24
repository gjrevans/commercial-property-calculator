export interface CalculatorInputs {
  // Purchase & Financing
  purchasePrice: number;
  downPaymentPercent: number;
  downPaymentDollar: number;
  downPaymentMode: "percent" | "dollar";
  interestRate: number;
  amortizationYears: number;
  projectionYears: number;

  // Closing Costs
  legalFees: number;
  propertyInspection: number;
  appraisal: number;
  landTransferTax: number;
  landTransferTaxOverride: boolean;
  environmentalAssessment: number;
  closingCostsOverride: number | null;

  // Annual Operating Costs
  propertyTax: number;
  propertyTaxInflation: number;
  insurance: number;
  insuranceInflation: number;
  maintenance: number;
  maintenanceInflation: number;

  // Optional Income
  annualRentalIncome: number;
  rentalIncomeTaxRate: number;
  rentAnnualIncrease: number;

  // Current Costs Avoided (money you stop paying by owning)
  currentRent: number;
  currentInsurance: number;
  currentOther: number;
  costsAvoidedInflation: number;

  // Property Value
  appreciationRate: number;

  // Rent vs Own Comparison
  investmentReturnRate: number;
}

export interface YearRow {
  year: number;
  mortgagePayment: number;
  principalPaid: number;
  interestPaid: number;
  propertyTax: number;
  insurance: number;
  maintenance: number;
  totalCosts: number;
  rentalIncomeGross: number;
  rentalIncomeTax: number;
  rentalIncomeNet: number;
  costsAvoided: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  remainingBalance: number;
  equityBuilt: number;
  estimatedPropertyValue: number;
  netWorthPosition: number;
}

export interface ComparisonRow {
  year: number;
  rentCost: number;
  ownCost: number;
  annualSavings: number; // positive = owning is cheaper, negative = renting is cheaper
  investmentBalance: number; // grows when renting is cheaper
  ownNetWorth: number; // property value - remaining mortgage
  rentNetPosition: number; // investment balance (from savings of cheaper option)
  advantage: number; // own net worth - rent net position (positive = owning wins)
}

export interface CalculationResult {
  schedule: YearRow[];
  monthlyPayment: number;
  totalClosingCosts: number;
  downPaymentAmount: number;
  mortgageAmount: number;
  comparison: ComparisonRow[];
  summary: {
    totalCostOverPeriod: number;
    totalEquityBuilt: number;
    estimatedPropertyValue: number;
    netWorthPosition: number;
    effectiveMonthlyCost: number;
  };
}
