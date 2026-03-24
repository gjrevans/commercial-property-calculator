"use client";

import { YearRow } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const hasIncome = schedule.some((row) => row.rentalIncomeGross > 0);
  const hasAvoided = schedule.some((row) => row.costsAvoided > 0);
  const visibleColumns = columns.filter((c) => {
    if (c.group === "Income" && !hasIncome) return false;
    if (c.group === "Avoided" && !hasAvoided) return false;
    return true;
  });

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.map((col) => (
              <TableHead key={col.key} className="text-xs">
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((row) => (
            <TableRow key={row.year}>
              {visibleColumns.map((col) => {
                const value = row[col.key] as number;
                const isNegative = value < 0;
                const isCashFlow =
                  col.key === "netCashFlow" || col.key === "cumulativeCashFlow";

                return (
                  <TableCell
                    key={col.key}
                    className={`text-xs font-mono ${
                      col.key === "year"
                        ? "font-semibold"
                        : isNegative
                        ? "text-destructive"
                        : isCashFlow && value > 0
                        ? "text-green-600"
                        : ""
                    }`}
                  >
                    {col.key === "year"
                      ? value
                      : `${isNegative ? "-" : ""}$${fmt(Math.abs(value))}`}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
