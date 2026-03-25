import { CalculatorInputs } from "./types";

const SHARED_DEFAULTS = {
  // Purchase & Financing
  downPaymentMode: "percent" as const,
  interestRate: 5.2,
  amortizationYears: 25,
  projectionYears: 10,

  // Closing Costs (unused fields kept for type compat)
  legalFees: 3000,
  propertyInspection: 1000,
  appraisal: 3000,
  landTransferTax: 0,
  landTransferTaxOverride: false,
  environmentalAssessment: 0,

  // Annual Operating Costs
  propertyTax: 15000,
  propertyTaxInflation: 3,
  insurance: 3000,
  insuranceInflation: 3,
  maintenance: 5000,
  maintenanceInflation: 2,
  snowRemoval: 3000,
  garbageCollection: 1200,
  operatingCostsInflation: 2,

  // Business Expenses
  accounting: 3000,
  legal: 1000,
  otherBusinessExpenses: 0,
  businessExpensesInflation: 2,

  // CCA
  ccaEnabled: true,
  ccaRate: 4,
  ccaBuildingPortion: 80,

  // Income
  rentalIncomeTaxRate: 51,
  rentAnnualIncrease: 3,
  isNNNLease: true,

  // Property Value
  appreciationRate: 2,
  investmentReturnRate: 7,
};

export const LANDLORD_DEFAULTS: CalculatorInputs = {
  ...SHARED_DEFAULTS,
  mode: "landlord",
  purchasePrice: 650000,
  downPaymentPercent: 18,
  downPaymentDollar: 117000,
  closingCostsOverride: 33000,
  annualRentalIncome: 59000,
  // Costs avoided zeroed out — not applicable for landlord
  currentRent: 0,
  currentInsurance: 0,
  currentOther: 0,
  costsAvoidedInflation: 2,
};

export const OWNER_OCCUPANT_DEFAULTS: CalculatorInputs = {
  ...SHARED_DEFAULTS,
  mode: "owner-occupant",
  purchasePrice: 750000,
  downPaymentPercent: 20,
  downPaymentDollar: 150000,
  closingCostsOverride: 30000,
  annualRentalIncome: 0,
  // Costs avoided — key benefit of owning vs renting
  currentRent: 36000,
  currentInsurance: 3000,
  currentOther: 1000,
  costsAvoidedInflation: 2,
};

export const DEFAULT_INPUTS: CalculatorInputs = LANDLORD_DEFAULTS;
