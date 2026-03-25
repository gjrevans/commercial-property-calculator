"use client";

import { CalculationResult, OwnerMode } from "@/lib/types";
import SummaryCards from "./SummaryCards";
import ScheduleTable from "./ScheduleTable";
import ComparisonTable from "./ComparisonTable";
import LandlordComparisonTable from "./LandlordComparisonTable";

interface ResultsPanelProps {
  result: CalculationResult;
  projectionYears: number;
  mode: OwnerMode;
  isNNNLease?: boolean;
  investmentReturnRate?: number;
}

export default function ResultsPanel({ result, projectionYears, mode, isNNNLease, investmentReturnRate = 7 }: ResultsPanelProps) {
  const hasRentComparison = result.comparison.some(
    (row) => row.rentCost > 0 || row.ownCost > 0
  );

  return (
    <div className="space-y-6">
      <SummaryCards result={result} projectionYears={projectionYears} mode={mode} />

      {/* Rent vs Own — owner-occupant only */}
      {mode === "owner-occupant" && hasRentComparison && (
        <div>
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">
            Rent vs Own Comparison
          </h2>
          <ComparisonTable comparison={result.comparison} />
        </div>
      )}

      {/* Buy vs Invest — landlord only */}
      {mode === "landlord" && result.landlordComparison.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">
            Buy vs. Invest Comparison
          </h2>
          <LandlordComparisonTable
            rows={result.landlordComparison}
            initialInvestment={result.downPaymentAmount + result.totalClosingCosts}
            returnRate={investmentReturnRate}
          />
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">
          Year-by-Year Schedule
        </h2>
        <ScheduleTable schedule={result.schedule} isNNNLease={isNNNLease} />
      </div>
    </div>
  );
}
