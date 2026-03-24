"use client";

import { YearRow } from "@/lib/types";

interface ScheduleTableProps {
  schedule: YearRow[];
}

function fmt(value: number): string {
  return value.toLocaleString("en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

const columns: { key: keyof YearRow; label: string; group: string }[] = [
  { key: "year", label: "Year", group: "" },
  { key: "mortgagePayment", label: "Mortgage", group: "Costs" },
  { key: "principalPaid", label: "Principal", group: "Costs" },
  { key: "interestPaid", label: "Interest", group: "Costs" },
  { key: "propertyTax", label: "Prop. Tax", group: "Costs" },
  { key: "insurance", label: "Insurance", group: "Costs" },
  { key: "maintenance", label: "Maint.", group: "Costs" },
  { key: "totalCosts", label: "Total Costs", group: "Costs" },
  { key: "rentalIncomeGross", label: "Rent (Gross)", group: "Income" },
  { key: "rentalIncomeTax", label: "Rent Tax", group: "Income" },
  { key: "rentalIncomeNet", label: "Rent (Net)", group: "Income" },
  { key: "costsAvoided", label: "Costs Saved", group: "Avoided" },
  { key: "netCashFlow", label: "Cash Flow", group: "Flow" },
  { key: "cumulativeCashFlow", label: "Cumulative", group: "Flow" },
  { key: "remainingBalance", label: "Balance", group: "Equity" },
  { key: "equityBuilt", label: "Equity", group: "Equity" },
  { key: "estimatedPropertyValue", label: "Prop. Value", group: "Equity" },
  { key: "netWorthPosition", label: "Net Worth", group: "Equity" },
];

export default function ScheduleTable({ schedule }: ScheduleTableProps) {
  // Hide income/avoided columns if not used
  const hasIncome = schedule.some((row) => row.rentalIncomeGross > 0);
  const hasAvoided = schedule.some((row) => row.costsAvoided > 0);
  const visibleColumns = columns.filter((c) => {
    if (c.group === "Income" && !hasIncome) return false;
    if (c.group === "Avoided" && !hasAvoided) return false;
    return true;
  });

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="bg-gray-50">
            {visibleColumns.map((col) => (
              <th
                key={col.key}
                className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap border-b border-gray-200"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => (
            <tr
              key={row.year}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              {visibleColumns.map((col) => {
                const value = row[col.key] as number;
                const isNegative = value < 0;
                const isCashFlow =
                  col.key === "netCashFlow" || col.key === "cumulativeCashFlow";

                return (
                  <td
                    key={col.key}
                    className={`px-3 py-2 whitespace-nowrap font-mono ${
                      col.key === "year"
                        ? "font-semibold text-gray-700"
                        : isNegative
                        ? "text-red-600"
                        : isCashFlow && value > 0
                        ? "text-green-600"
                        : "text-gray-700"
                    }`}
                  >
                    {col.key === "year"
                      ? value
                      : `${isNegative ? "-" : ""}$${fmt(Math.abs(value))}`}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
