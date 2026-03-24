"use client";

import { ComparisonRow } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ComparisonTableProps {
  comparison: ComparisonRow[];
}

function fmt(value: number): string {
  return Math.abs(value).toLocaleString("en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
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
            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
            : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={owningWins ? "default" : "secondary"}>
            {owningWins ? "Owning Wins" : "Renting Wins"}
          </Badge>
          <span className="text-sm font-semibold">
            by ${fmt(Math.abs(lastRow.advantage))} at year {lastRow.year}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Own net worth: ${fmt(lastRow.ownNetWorth)} (property − mortgage) vs
          Rent net position: ${fmt(lastRow.rentNetPosition)} (savings invested)
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Year</TableHead>
              <TableHead className="text-xs">Rent Cost</TableHead>
              <TableHead className="text-xs">Own Cost</TableHead>
              <TableHead className="text-xs">Annual Savings</TableHead>
              <TableHead className="text-xs">Renter Investments</TableHead>
              <TableHead className="text-xs">Owner Net Worth</TableHead>
              <TableHead className="text-xs">Advantage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparison.map((row) => (
              <TableRow key={row.year}>
                <TableCell className="text-xs font-semibold">{row.year}</TableCell>
                <TableCell className="text-xs font-mono">
                  ${fmt(row.rentCost)}
                </TableCell>
                <TableCell className="text-xs font-mono">
                  ${fmt(row.ownCost)}
                </TableCell>
                <TableCell
                  className={`text-xs font-mono ${
                    row.annualSavings > 0
                      ? "text-green-600"
                      : row.annualSavings < 0
                      ? "text-destructive"
                      : ""
                  }`}
                >
                  {row.annualSavings < 0 ? "-" : ""}${fmt(row.annualSavings)}
                </TableCell>
                <TableCell className="text-xs font-mono">
                  ${fmt(row.rentNetPosition)}
                </TableCell>
                <TableCell className="text-xs font-mono">
                  ${fmt(row.ownNetWorth)}
                </TableCell>
                <TableCell
                  className={`text-xs font-mono ${
                    row.advantage > 0
                      ? "text-green-600"
                      : row.advantage < 0
                      ? "text-destructive"
                      : ""
                  }`}
                >
                  {row.advantage < 0 ? "-" : ""}${fmt(row.advantage)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Annual Savings: positive (green) = owning is cheaper that year. Advantage:
        positive (green) = owning is ahead overall. Renter investments assume the
        difference is invested at the return rate. Year 1 own cost includes down
        payment + closing costs.
      </p>
    </div>
  );
}
