"use client";

import { LandlordInvestmentRow } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LandlordComparisonTableProps {
  rows: LandlordInvestmentRow[];
  initialInvestment: number;
  returnRate: number;
}

function fmt(value: number): string {
  return Math.abs(value).toLocaleString("en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function fmtSigned(value: number): string {
  return (value < 0 ? "-$" : "$") + fmt(value);
}

export default function LandlordComparisonTable({
  rows,
  initialInvestment,
  returnRate,
}: LandlordComparisonTableProps) {
  if (rows.length === 0) return null;

  const lastRow = rows[rows.length - 1];
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
            {owningWins ? "Owning Wins" : "Investing Wins"}
          </Badge>
          <span className="text-sm font-semibold">
            by ${fmt(Math.abs(lastRow.advantage))} at year {lastRow.year}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Landlord wealth: ${fmt(lastRow.landlordWealth)} (property equity + net
          income) vs Investment portfolio: ${fmt(lastRow.investmentBalance)} (
          {returnRate}% return on same cash)
        </p>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Year</TableHead>
              <TableHead className="text-xs">Annual Net Cash Flow</TableHead>
              <TableHead className="text-xs">Investor Contribution</TableHead>
              <TableHead className="text-xs">Portfolio Value</TableHead>
              <TableHead className="text-xs">Landlord Wealth</TableHead>
              <TableHead className="text-xs">Advantage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.year}>
                <TableCell className="text-xs font-semibold">{row.year}</TableCell>
                <TableCell
                  className={`text-xs font-mono ${
                    row.annualNetCashFlow > 0
                      ? "text-green-600"
                      : row.annualNetCashFlow < 0
                      ? "text-destructive"
                      : ""
                  }`}
                >
                  {fmtSigned(row.annualNetCashFlow)}
                </TableCell>
                <TableCell
                  className={`text-xs font-mono ${
                    row.investorContribution > 0
                      ? "text-muted-foreground"
                      : "text-green-600"
                  }`}
                >
                  {fmtSigned(row.investorContribution)}
                </TableCell>
                <TableCell className="text-xs font-mono">
                  ${fmt(row.investmentBalance)}
                </TableCell>
                <TableCell className="text-xs font-mono">
                  ${fmt(row.landlordWealth)}
                </TableCell>
                <TableCell
                  className={`text-xs font-mono font-semibold ${
                    row.advantage > 0
                      ? "text-green-600"
                      : row.advantage < 0
                      ? "text-destructive"
                      : ""
                  }`}
                >
                  {fmtSigned(row.advantage)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Both scenarios start with the same cash (${fmt(initialInvestment)} down + closing).
        Investor mirrors the landlord's net cash flows each year at {returnRate}% return.
        Landlord wealth = property equity + cumulative net rental income.
        Advantage: positive (green) = owning beats investing.
      </p>
    </div>
  );
}
