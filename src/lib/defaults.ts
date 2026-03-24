import { CalculatorInputs } from "./types";

export const DEFAULT_INPUTS: CalculatorInputs = {
  // Purchase & Financing
  purchasePrice: 500000,
  downPaymentPercent: 20,
  downPaymentDollar: 100000,
  downPaymentMode: "percent",
  interestRate: 5.5,
  amortizationYears: 25,
  projectionYears: 10,

  // Closing Costs
  legalFees: 3000,
  propertyInspection: 1000,
  appraisal: 3000,
  landTransferTax: 0, // auto-calculated
  landTransferTaxOverride: false,
  environmentalAssessment: 0,
  closingCostsOverride: null,

  // Annual Operating Costs
  propertyTax: 20000,
  propertyTaxInflation: 3,
  insurance: 4000,
  insuranceInflation: 3,
  maintenance: 5000,
  maintenanceInflation: 2,

  // Optional Income
  annualRentalIncome: 0,
  rentalIncomeTaxRate: 51,
  rentAnnualIncrease: 2,

  // Current Costs Avoided
  currentRent: 0,
  currentInsurance: 0,
  currentOther: 0,
  costsAvoidedInflation: 2,

  // Property Value
  appreciationRate: 2,

  // Rent vs Own Comparison
  investmentReturnRate: 7,
};
