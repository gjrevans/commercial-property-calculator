"use client";

import { ComparisonRow } from "@/lib/types";

interface ComparisonTableProps {
  comparison: ComparisonRow[];
}

function fmt(value: number): string {
  return Math.abs(value).toLocaleString("en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function cell(value: number, invert = false) {
  const isNeg = invert ? value > 0 : value < 0;
  const isPos = invert ? value < 0 : value > 0;
  return (
    <td
      className={`px-3 py-2 whitespace-nowrap font-mono ${
        isNeg ? "text-red-600" : isPos ? "text-green-600" : "text-gray-700"
      }`}
    >
      {value < 0 ? "-" : ""}${fmt(value)}
    </td>
  );
}

export default function ComparisonTable({ comparison }: ComparisonTableProps) {
  if (comparison.length === 0) return null;

  const lastRow = comparison[comparison.length - 1];
  const owningWins = lastRow.advantage > 0;

  return (
    <div className="space-y-4">
      <div
        className={`rounded-lg border p-4 ${
          owningWins
            ? "border-green-200 bg-green-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <p className="text-sm font-semibold">
          {owningWins ? (
            <span className="text-green-700">
              Owning wins by ${fmt(lastRow.advantage)} at year {lastRow.year}
            </span>
          ) : (
            <span className="text-amber-700">
              Renting + investing wins by ${fmt(Math.abs(lastRow.advantage))} at
              year {lastRow.year}
            </span>
          )}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Own net worth: ${fmt(lastRow.ownNetWorth)} (property − mortgage) vs
          Rent net position: ${fmt(lastRow.rentNetPosition)} (savings invested)
        </p>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200">
                Year
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200">
                Rent Cost
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200">
                Own Cost
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200">
                Annual Savings
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200">
                Renter Investments
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200">
                Owner Net Worth
              </th>
              <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200">
                Advantage
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr
                key={row.year}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-3 py-2 font-semibold text-gray-700">
                  {row.year}
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-mono text-gray-700">
                  ${fmt(row.rentCost)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-mono text-gray-700">
                  ${fmt(row.ownCost)}
                </td>
                {cell(row.annualSavings)}
                <td className="px-3 py-2 whitespace-nowrap font-mono text-gray-700">
                  ${fmt(row.rentNetPosition)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-mono text-gray-700">
                  ${fmt(row.ownNetWorth)}
                </td>
                {cell(row.advantage)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">
        Annual Savings: positive (green) = owning is cheaper that year. Advantage: positive (green) = owning is ahead overall.
        Renter investments assume the difference is invested at the return rate. Year 1 own cost includes down payment + closing costs.
      </p>
    </div>
  );
}
