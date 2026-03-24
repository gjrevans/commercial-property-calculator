"use client";

import { CalculationResult } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardsProps {
  result: CalculationResult;
  projectionYears: number;
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted =
    abs >= 1000000
      ? `$${(abs / 1000000).toFixed(2)}M`
      : `$${abs.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return value < 0 ? `-${formatted}` : formatted;
}

export default function SummaryCards({ result, projectionYears }: SummaryCardsProps) {
  const principalPaid = result.summary.totalEquityBuilt - result.downPaymentAmount;
  const remainingMortgage =
    result.schedule.length > 0
      ? result.schedule[result.schedule.length - 1].remainingBalance
      : result.mortgageAmount;

  const cards = [
    {
      label: "Total Out-of-Pocket",
      value: formatCurrency(result.summary.totalCostOverPeriod),
      sublabel: `All cash spent over ${projectionYears} yrs (down payment + closing + costs − income)`,
      color: "text-destructive",
    },
    {
      label: `Equity Built (Year ${projectionYears})`,
      value: formatCurrency(result.summary.totalEquityBuilt),
      sublabel: `${formatCurrency(result.downPaymentAmount)} down payment + ${formatCurrency(principalPaid)} principal paid over ${projectionYears} yrs`,
      color: "text-blue-600",
    },
    {
      label: `Est. Property Value (Year ${projectionYears})`,
      value: formatCurrency(result.summary.estimatedPropertyValue),
      sublabel: `Started at ${formatCurrency(result.downPaymentAmount + result.mortgageAmount)} — grew ${formatCurrency(result.summary.estimatedPropertyValue - result.downPaymentAmount - result.mortgageAmount)} over ${projectionYears} yrs`,
      color: "text-green-600",
    },
    {
      label: `Net Worth (Year ${projectionYears})`,
      value: formatCurrency(result.summary.netWorthPosition),
      sublabel: `${formatCurrency(result.summary.estimatedPropertyValue)} property − ${formatCurrency(remainingMortgage)} mortgage at year ${projectionYears}`,
      color: "text-emerald-600",
    },
    {
      label: "Effective Monthly Cost",
      value: formatCurrency(result.summary.effectiveMonthlyCost),
      sublabel: "Average net cash out per month over the period",
      color: "text-orange-600",
    },
    {
      label: "Monthly Mortgage",
      value: formatCurrency(result.monthlyPayment),
      sublabel: `On ${formatCurrency(result.mortgageAmount)} mortgage`,
      color: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((card) => (
        <Card key={card.label} size="sm">
          <CardContent>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {card.label}
            </p>
            <p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sublabel}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
