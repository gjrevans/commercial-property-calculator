"use client";

import { CalculationResult } from "@/lib/types";
import SummaryCards from "./SummaryCards";
import ScheduleTable from "./ScheduleTable";
import ComparisonTable from "./ComparisonTable";

interface ResultsPanelProps {
  result: CalculationResult;
  projectionYears: number;
}

export default function ResultsPanel({ result, projectionYears }: ResultsPanelProps) {
  const hasComparison = result.comparison.some(
    (row) => row.rentCost > 0 || row.ownCost > 0
  );

  return (
    <div className="space-y-6">
      <SummaryCards result={result} projectionYears={projectionYears} />

      {hasComparison && (
        <div>
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">
            Rent vs Own Comparison
          </h2>
          <ComparisonTable comparison={result.comparison} />
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">
          Year-by-Year Schedule
        </h2>
        <ScheduleTable schedule={result.schedule} />
      </div>
    </div>
  );
}
