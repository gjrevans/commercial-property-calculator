"use client";

import { CalculationResult, OwnerMode } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardsProps {
  result: CalculationResult;
  projectionYears: number;
  mode: OwnerMode;
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted =
    abs >= 1000000
      ? `$${(abs / 1000000).toFixed(2)}M`
      : `$${abs.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return value < 0 ? `-${formatted}` : formatted;
}

export default function SummaryCards({ result, projectionYears, mode }: SummaryCardsProps) {
  const principalPaid = result.summary.totalEquityBuilt - result.downPaymentAmount;
  const remainingMortgage =
    result.schedule.length > 0
      ? result.schedule[result.schedule.length - 1].remainingBalance
      : result.mortgageAmount;

  const lastYear = result.schedule[result.schedule.length - 1];
  const totalNetIncome = result.schedule.reduce((sum, row) => sum + row.rentalIncomeNet, 0);
  const totalTaxPaid = result.schedule.reduce((sum, row) => sum + row.rentalIncomeTax, 0);
  const totalNetCashFlow = result.schedule.reduce((sum, row) => sum + row.netCashFlow, 0);
  const totalUpfront = result.downPaymentAmount + result.totalClosingCosts;

  const sharedCards = [
    {
      label: `Equity Built (Year ${projectionYears})`,
      value: formatCurrency(result.summary.totalEquityBuilt),
      sublabel: `${formatCurrency(result.downPaymentAmount)} down + ${formatCurrency(principalPaid)} principal paid`,
      color: "text-blue-600",
    },
    {
      label: `Net Worth (Year ${projectionYears})`,
      value: formatCurrency(result.summary.netWorthPosition),
      sublabel: `${formatCurrency(result.summary.estimatedPropertyValue)} property − ${formatCurrency(remainingMortgage)} mortgage`,
      color: "text-emerald-600",
    },
    {
      label: "Monthly Mortgage",
      value: formatCurrency(result.monthlyPayment),
      sublabel: `On ${formatCurrency(result.mortgageAmount)} mortgage`,
      color: "text-foreground",
    },
  ];

  const landlordCards = [
    {
      label: `Net Income (${projectionYears} yrs)`,
      value: formatCurrency(totalNetIncome),
      sublabel: `After ${formatCurrency(totalTaxPaid)} in tax (on net profit, not gross)`,
      color: totalNetIncome >= 0 ? "text-green-600" : "text-destructive",
    },
    {
      label: `Cash-on-Cash Return`,
      value: `${totalUpfront > 0 ? ((totalNetIncome / totalUpfront) * 100 / projectionYears).toFixed(1) : 0}%`,
      sublabel: `Annual avg net income ÷ ${formatCurrency(totalUpfront)} (down + closing)`,
      color: "text-blue-600",
    },
    {
      label: `Net Cash-on-Cash Return`,
      value: `${totalUpfront > 0 ? (((totalNetCashFlow + principalPaid) / totalUpfront) * 100 / projectionYears).toFixed(1) : 0}%`,
      sublabel: `Annual avg (net cash flow + principal paid) ÷ ${formatCurrency(totalUpfront)}`,
      color: "text-blue-600",
    },
    {
      label: `Total ROI (Year ${projectionYears})`,
      value: `${result.downPaymentAmount > 0 ? (((result.summary.netWorthPosition + totalNetIncome - result.downPaymentAmount - result.totalClosingCosts) / (result.downPaymentAmount + result.totalClosingCosts)) * 100).toFixed(0) : 0}%`,
      sublabel: `(Net worth + income − cash invested) ÷ cash invested`,
      color: "text-emerald-600",
    },
    ...sharedCards,
    {
      label: `Tax Paid (${projectionYears} yrs)`,
      value: formatCurrency(totalTaxPaid),
      sublabel: lastYear ? `Year ${projectionYears} taxable: ${formatCurrency(lastYear.taxableIncome)} (rent − interest − expenses)` : "",
      color: "text-orange-600",
    },
  ];

  const occupantCards = [
    {
      label: "Total Cost of Ownership",
      value: formatCurrency(result.summary.totalCostOverPeriod),
      sublabel: `All cash over ${projectionYears} yrs (down + closing + mortgage + tax + insurance + maint.)`,
      color: "text-destructive",
    },
    {
      label: "Effective Monthly Cost",
      value: formatCurrency(result.summary.effectiveMonthlyCost),
      sublabel: `True all-in avg per month — mortgage + operating costs`,
      color: "text-orange-600",
    },
    ...sharedCards,
  ];

  const cards = mode === "landlord" ? landlordCards : occupantCards;

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
