"use client";

import { CalculatorInputs, OwnerMode } from "@/lib/types";
import { LANDLORD_DEFAULTS, OWNER_OCCUPANT_DEFAULTS } from "@/lib/defaults";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import InputGroup from "./InputGroup";
import NumberInput from "./NumberInput";

interface InputPanelProps {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
}

export default function InputPanel({ inputs, onChange }: InputPanelProps) {
  const update = (partial: Partial<CalculatorInputs>) => {
    const updated = { ...inputs, ...partial };
    // When switching modes, load the full defaults for that mode
    if (partial.mode === "landlord") {
      onChange(LANDLORD_DEFAULTS);
      return;
    } else if (partial.mode === "owner-occupant") {
      onChange(OWNER_OCCUPANT_DEFAULTS);
      return;
    }

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

  const isLandlord = inputs.mode === "landlord";

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex rounded-lg border overflow-hidden">
        {(["owner-occupant", "landlord"] as OwnerMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => update({ mode })}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              inputs.mode === mode
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {mode === "owner-occupant" ? "I\u2019m Using It Myself" : "I\u2019m a Landlord"}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        {isLandlord
          ? "Focus: rental ROI, net income after tax, long-term return"
          : "Focus: total cost of occupancy vs continuing to rent"}
      </p>

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
        <NumberInput
          label="Closing Costs"
          value={inputs.closingCostsOverride ?? 0}
          onChange={(v) => update({ closingCostsOverride: v })}
          prefix="$"
          step={1000}
          min={0}
          hint="Legal, inspection, appraisal, land transfer tax, etc."
        />
      </InputGroup>

      <InputGroup title="Annual Operating Costs">
        {isLandlord && (
          <div className="flex items-center gap-3 mb-1">
            <Switch
              id="nnn-toggle"
              checked={inputs.isNNNLease}
              onCheckedChange={(checked) => update({ isNNNLease: checked })}
            />
            <Label htmlFor="nnn-toggle" className="text-sm font-medium">
              NNN Lease
            </Label>
            <span className="text-xs text-muted-foreground">
              — tenant pays all operating costs
            </span>
          </div>
        )}
        {isLandlord && inputs.isNNNLease ? (
          <p className="text-xs text-muted-foreground py-2">
            All operating costs passed to tenant. These still exist as expenses but are reimbursed (wash for tax purposes).
          </p>
        ) : (
          <>
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
            <div className="grid grid-cols-[1fr,auto] gap-2 items-end">
              <NumberInput
                label="Snow Removal"
                value={inputs.snowRemoval}
                onChange={(v) => update({ snowRemoval: v })}
                prefix="$"
                step={500}
                min={0}
              />
              <NumberInput
                label="Inflation"
                value={inputs.operatingCostsInflation}
                onChange={(v) => update({ operatingCostsInflation: v })}
                suffix="%"
                step={0.5}
                min={0}
              />
            </div>
            <NumberInput
              label="Garbage Collection"
              value={inputs.garbageCollection}
              onChange={(v) => update({ garbageCollection: v })}
              prefix="$"
              step={200}
              min={0}
            />
          </>
        )}
      </InputGroup>

      {/* LANDLORD MODE: Rental income, NNN, business expenses */}
      {isLandlord && (
        <>
          <InputGroup title="Rental Income">
            <NumberInput
              label="Annual Rental Income"
              value={inputs.annualRentalIncome}
              onChange={(v) => update({ annualRentalIncome: v })}
              prefix="$"
              step={1000}
              min={0}
              hint="Base rent collected from tenant"
            />
            <NumberInput
              label="Tax Rate on Net Profit"
              value={inputs.rentalIncomeTaxRate}
              onChange={(v) => update({ rentalIncomeTaxRate: v })}
              suffix="%"
              step={1}
              min={0}
              max={100}
              hint="Applied after deducting interest + biz expenses (NOT principal)"
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

          <InputGroup title="Capital Cost Allowance (CCA)">
            <div className="flex items-center gap-3">
              <Switch
                id="cca-toggle"
                checked={inputs.ccaEnabled}
                onCheckedChange={(checked) => update({ ccaEnabled: checked })}
              />
              <Label htmlFor="cca-toggle" className="text-sm font-medium">
                Claim CCA deduction
              </Label>
            </div>
            {inputs.ccaEnabled && (
              <>
                <NumberInput
                  label="CCA Rate"
                  value={inputs.ccaRate}
                  onChange={(v) => update({ ccaRate: v })}
                  suffix="%"
                  step={1}
                  min={0}
                  hint="Class 1 (most commercial buildings) = 4%"
                />
                <NumberInput
                  label="Building Portion"
                  value={inputs.ccaBuildingPortion}
                  onChange={(v) => update({ ccaBuildingPortion: v })}
                  suffix="%"
                  step={5}
                  min={0}
                  max={100}
                  hint="% of purchase price that is building vs land (typically 75–85%)"
                />
              </>
            )}
          </InputGroup>

          <InputGroup title="Business Expenses (Tax-Deductible)" collapsible defaultOpen={false}>
            <p className="text-xs text-gray-500 -mt-1 mb-1">
              Your expenses as landlord — reduces taxable income. Not passed to tenant.
            </p>
            <NumberInput
              label="Accounting"
              value={inputs.accounting}
              onChange={(v) => update({ accounting: v })}
              prefix="$"
              step={500}
              min={0}
            />
            <NumberInput
              label="Legal"
              value={inputs.legal}
              onChange={(v) => update({ legal: v })}
              prefix="$"
              step={500}
              min={0}
            />
            <NumberInput
              label="Other Expenses"
              value={inputs.otherBusinessExpenses}
              onChange={(v) => update({ otherBusinessExpenses: v })}
              prefix="$"
              step={500}
              min={0}
            />
            <NumberInput
              label="Annual Increase"
              value={inputs.businessExpensesInflation}
              onChange={(v) => update({ businessExpensesInflation: v })}
              suffix="%"
              step={0.5}
              min={0}
            />
          </InputGroup>
        </>
      )}

      {/* OWNER-OCCUPANT MODE: Costs avoided, rent comparison */}
      {!isLandlord && (
        <InputGroup title="Current Costs Avoided">
          <p className="text-xs text-gray-500 -mt-1 mb-1">
            What you currently pay that you&apos;d stop paying by owning. This is money saved — no tax on it.
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
      )}

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
