export type OwnerMode = "landlord" | "owner-occupant";

export interface CalculatorInputs {
  // Mode
  mode: OwnerMode;

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

  // Annual Operating Costs (passed to tenant in NNN)
  propertyTax: number;
  propertyTaxInflation: number;
  insurance: number;
  insuranceInflation: number;
  maintenance: number;
  maintenanceInflation: number;
  snowRemoval: number;
  garbageCollection: number;
  operatingCostsInflation: number; // shared inflation for snow/garbage

  // Optional Income
  annualRentalIncome: number;
  rentalIncomeTaxRate: number;
  rentAnnualIncrease: number;
  isNNNLease: boolean; // NNN = tenant reimburses operating costs (wash for tax)

  // Business Expenses (tax-deductible, NOT passed to tenant)
  accounting: number;
  legal: number;
  otherBusinessExpenses: number;
  businessExpensesInflation: number;

  // Capital Cost Allowance (CCA)
  ccaEnabled: boolean;
  ccaRate: number; // Class 1 = 4%, Class 6 = 10%
  ccaBuildingPortion: number; // % of purchase price that is building (vs land)

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
  nnnReimbursement: number;
  businessExpenses: number;
  ccaDeduction: number;
  taxableIncome: number;
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

export interface LandlordInvestmentRow {
  year: number;
  annualNetCashFlow: number;     // rentalIncomeNet - totalCosts (positive = profitable)
  investorContribution: number;  // money investor puts in (or withdraws) to match cash flows
  investmentBalance: number;     // portfolio value at 7%
  landlordWealth: number;        // property equity + cumulative net cash flows
  advantage: number;             // landlordWealth - investmentBalance (positive = owning wins)
}

export interface CalculationResult {
  schedule: YearRow[];
  monthlyPayment: number;
  totalClosingCosts: number;
  downPaymentAmount: number;
  mortgageAmount: number;
  comparison: ComparisonRow[];
  landlordComparison: LandlordInvestmentRow[];
  summary: {
    totalCostOverPeriod: number;
    totalEquityBuilt: number;
    estimatedPropertyValue: number;
    netWorthPosition: number;
    effectiveMonthlyCost: number;
  };
}
