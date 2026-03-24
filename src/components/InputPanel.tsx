"use client";

import { CalculatorInputs } from "@/lib/types";
import { calculateBCLandTransferTax } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import InputGroup from "./InputGroup";
import NumberInput from "./NumberInput";

interface InputPanelProps {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
}

export default function InputPanel({ inputs, onChange }: InputPanelProps) {
  const update = (partial: Partial<CalculatorInputs>) => {
    const updated = { ...inputs, ...partial };
    // Sync down payment dollar/percent
    if ("downPaymentPercent" in partial) {
      updated.downPaymentDollar = Math.round(
        updated.purchasePrice * (updated.downPaymentPercent / 100)
      );
    } else if ("downPaymentDollar" in partial) {
      updated.downPaymentPercent =
        updated.purchasePrice > 0
          ? Math.round((updated.downPaymentDollar / updated.purchasePrice) * 10000) / 100
          : 0;
    } else if ("purchasePrice" in partial && updated.downPaymentMode === "percent") {
      updated.downPaymentDollar = Math.round(
        updated.purchasePrice * (updated.downPaymentPercent / 100)
      );
    }
    onChange(updated);
  };

  const autoLTT = calculateBCLandTransferTax(inputs.purchasePrice);

  return (
    <div className="space-y-4">
      <InputGroup title="Purchase & Financing">
        <NumberInput
          label="Purchase Price"
          value={inputs.purchasePrice}
          onChange={(v) => update({ purchasePrice: v })}
          prefix="$"
          step={10000}
          min={0}
        />
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium leading-none">Down Payment</label>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs"
              onClick={() =>
                update({
                  downPaymentMode:
                    inputs.downPaymentMode === "percent" ? "dollar" : "percent",
                })
              }
            >
              {inputs.downPaymentMode === "percent" ? "Switch to $" : "Switch to %"}
            </Button>
          </div>
          {inputs.downPaymentMode === "percent" ? (
            <NumberInput
              label=""
              value={inputs.downPaymentPercent}
              onChange={(v) => update({ downPaymentPercent: v })}
              suffix="%"
              step={1}
              min={0}
              max={100}
              hint={`= $${Math.round(inputs.purchasePrice * (inputs.downPaymentPercent / 100)).toLocaleString()}`}
            />
          ) : (
            <NumberInput
              label=""
              value={inputs.downPaymentDollar}
              onChange={(v) => update({ downPaymentDollar: v })}
              prefix="$"
              step={5000}
              min={0}
              hint={`= ${inputs.purchasePrice > 0 ? ((inputs.downPaymentDollar / inputs.purchasePrice) * 100).toFixed(1) : 0}%`}
            />
          )}
        </div>
        <NumberInput
          label="Interest Rate"
          value={inputs.interestRate}
          onChange={(v) => update({ interestRate: v })}
          suffix="%"
          step={0.25}
          min={0}
        />
        <NumberInput
          label="Amortization Period"
          value={inputs.amortizationYears}
          onChange={(v) => update({ amortizationYears: v })}
          suffix="years"
          step={1}
          min={1}
          max={40}
        />
        <NumberInput
          label="Projection Period"
          value={inputs.projectionYears}
          onChange={(v) => update({ projectionYears: v })}
          suffix="years"
          step={1}
          min={1}
          max={40}
          hint="Number of years to show in the schedule"
        />
      </InputGroup>

      <InputGroup title="Closing Costs" collapsible defaultOpen={false}>
        {inputs.closingCostsOverride === null ? (
          <>
            <NumberInput
              label="Legal Fees"
              value={inputs.legalFees}
              onChange={(v) => update({ legalFees: v })}
              prefix="$"
              step={500}
              min={0}
            />
            <NumberInput
              label="Property Inspection"
              value={inputs.propertyInspection}
              onChange={(v) => update({ propertyInspection: v })}
              prefix="$"
              step={100}
              min={0}
            />
            <NumberInput
              label="Appraisal"
              value={inputs.appraisal}
              onChange={(v) => update({ appraisal: v })}
              prefix="$"
              step={100}
              min={0}
            />
            <div>
              <NumberInput
                label="Land Transfer Tax"
                value={inputs.landTransferTaxOverride ? inputs.landTransferTax : autoLTT}
                onChange={(v) =>
                  update({ landTransferTax: v, landTransferTaxOverride: true })
                }
                prefix="$"
                step={100}
                min={0}
                hint={
                  inputs.landTransferTaxOverride
                    ? "Manual override active"
                    : `Auto-calculated (BC schedule)`
                }
              />
              {inputs.landTransferTaxOverride && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 mt-1 text-xs"
                  onClick={() => update({ landTransferTaxOverride: false })}
                >
                  Reset to auto-calculate (${autoLTT.toLocaleString()})
                </Button>
              )}
            </div>
            <NumberInput
              label="Environmental Assessment"
              value={inputs.environmentalAssessment}
              onChange={(v) => update({ environmentalAssessment: v })}
              prefix="$"
              step={500}
              min={0}
            />
            <div className="pt-2 border-t">
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground"
                onClick={() =>
                  update({
                    closingCostsOverride:
                      inputs.legalFees +
                      inputs.propertyInspection +
                      inputs.appraisal +
                      (inputs.landTransferTaxOverride
                        ? inputs.landTransferTax
                        : autoLTT) +
                      inputs.environmentalAssessment,
                  })
                }
              >
                Or enter a total override instead →
              </Button>
            </div>
          </>
        ) : (
          <>
            <NumberInput
              label="Total Closing Costs (Override)"
              value={inputs.closingCostsOverride}
              onChange={(v) => update({ closingCostsOverride: v })}
              prefix="$"
              step={500}
              min={0}
            />
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => update({ closingCostsOverride: null })}
            >
              ← Back to itemized costs
            </Button>
          </>
        )}
      </InputGroup>

      <InputGroup title="Annual Operating Costs">
        <div className="grid grid-cols-[1fr,auto] gap-2 items-end">
          <NumberInput
            label="Property Tax"
            value={inputs.propertyTax}
            onChange={(v) => update({ propertyTax: v })}
            prefix="$"
            step={1000}
            min={0}
          />
          <NumberInput
            label="Inflation"
            value={inputs.propertyTaxInflation}
            onChange={(v) => update({ propertyTaxInflation: v })}
            suffix="%"
            step={0.5}
            min={0}
          />
        </div>
        <div className="grid grid-cols-[1fr,auto] gap-2 items-end">
          <NumberInput
            label="Insurance"
            value={inputs.insurance}
            onChange={(v) => update({ insurance: v })}
            prefix="$"
            step={500}
            min={0}
          />
          <NumberInput
            label="Inflation"
            value={inputs.insuranceInflation}
            onChange={(v) => update({ insuranceInflation: v })}
            suffix="%"
            step={0.5}
            min={0}
          />
        </div>
        <div className="grid grid-cols-[1fr,auto] gap-2 items-end">
          <NumberInput
            label="Maintenance / Repairs"
            value={inputs.maintenance}
            onChange={(v) => update({ maintenance: v })}
            prefix="$"
            step={500}
            min={0}
          />
          <NumberInput
            label="Inflation"
            value={inputs.maintenanceInflation}
            onChange={(v) => update({ maintenanceInflation: v })}
            suffix="%"
            step={0.5}
            min={0}
          />
        </div>
      </InputGroup>

      <InputGroup title="Rental Income (Optional)">
        <NumberInput
          label="Annual Rental Income"
          value={inputs.annualRentalIncome}
          onChange={(v) => update({ annualRentalIncome: v })}
          prefix="$"
          step={1000}
          min={0}
          hint="Leave at $0 if occupying the building yourself"
        />
        <NumberInput
          label="Tax Rate on Rental Income"
          value={inputs.rentalIncomeTaxRate}
          onChange={(v) => update({ rentalIncomeTaxRate: v })}
          suffix="%"
          step={1}
          min={0}
          max={100}
          hint="Canadian corporate tax rate ~51%"
        />
        <NumberInput
          label="Annual Rent Increase"
          value={inputs.rentAnnualIncrease}
          onChange={(v) => update({ rentAnnualIncrease: v })}
          suffix="%"
          step={0.5}
          min={0}
        />
      </InputGroup>

      <InputGroup title="Current Costs Avoided">
        <p className="text-xs text-gray-500 -mt-1 mb-1">
          What you currently pay that you&apos;d stop paying by owning. This is tax-free savings — not the same as rental income.
        </p>
        <NumberInput
          label="Rent You Currently Pay"
          value={inputs.currentRent}
          onChange={(v) => update({ currentRent: v })}
          prefix="$"
          step={1000}
          min={0}
          hint="Annual amount"
        />
        <NumberInput
          label="Insurance You Currently Pay"
          value={inputs.currentInsurance}
          onChange={(v) => update({ currentInsurance: v })}
          prefix="$"
          step={500}
          min={0}
          hint="Annual amount (tenant insurance, etc.)"
        />
        <NumberInput
          label="Other Costs Avoided"
          value={inputs.currentOther}
          onChange={(v) => update({ currentOther: v })}
          prefix="$"
          step={500}
          min={0}
          hint="Annual amount (CAM fees, parking, etc.)"
        />
        <NumberInput
          label="Annual Increase"
          value={inputs.costsAvoidedInflation}
          onChange={(v) => update({ costsAvoidedInflation: v })}
          suffix="%"
          step={0.5}
          min={0}
          hint="How much these costs would have gone up each year"
        />
        <NumberInput
          label="Investment Return Rate"
          value={inputs.investmentReturnRate}
          onChange={(v) => update({ investmentReturnRate: v })}
          suffix="%"
          step={0.5}
          min={0}
          hint="If renting is cheaper, what return on invested savings?"
        />
      </InputGroup>

      <InputGroup title="Property Value">
        <NumberInput
          label="Annual Appreciation Rate"
          value={inputs.appreciationRate}
          onChange={(v) => update({ appreciationRate: v })}
          suffix="%"
          step={0.5}
        />
      </InputGroup>
    </div>
  );
}
