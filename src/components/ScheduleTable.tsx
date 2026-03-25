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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScheduleTableProps {
  schedule: YearRow[];
  isNNNLease?: boolean;
  hasIncome?: boolean;
  hasAvoided?: boolean;
}

function fmt(value: number): string {
  return Math.abs(value).toLocaleString("en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// Column groups define sections with a header label and accent colour
type ColGroup = "income" | "mortgage" | "opCosts" | "tax" | "cashflow" | "building";

interface ColDef {
  key: keyof YearRow;
  label: string;
  tip?: string;
  group: ColGroup | "year";
  showWhen?: "income" | "nnn-costs" | "avoided";
  isNegativeGood?: boolean;
  isCashFlow?: boolean;
}

const GROUP_META: Record<ColGroup, { label: string; headerClass: string; cellBorder: string }> = {
  income:    { label: "Income",        headerClass: "bg-emerald-50 text-emerald-800",  cellBorder: "border-l-2 border-emerald-200" },
  mortgage:  { label: "Mortgage",      headerClass: "bg-blue-50 text-blue-800",        cellBorder: "border-l-2 border-blue-200" },
  opCosts:   { label: "Op. Costs",     headerClass: "bg-orange-50 text-orange-800",    cellBorder: "border-l-2 border-orange-200" },
  tax:       { label: "Tax Calc",      headerClass: "bg-purple-50 text-purple-800",    cellBorder: "border-l-2 border-purple-200" },
  cashflow:  { label: "Cash Flow",     headerClass: "bg-slate-100 text-slate-800",     cellBorder: "border-l-2 border-slate-300" },
  building:  { label: "Building",      headerClass: "bg-indigo-50 text-indigo-800",    cellBorder: "border-l-2 border-indigo-200" },
};

const COLUMNS: ColDef[] = [
  // ── Income ─────────────────────────────────────────────
  { key: "rentalIncomeGross",  label: "Income (Rent)",  group: "income",   showWhen: "income",
    tip: "Base rent collected from tenant. Does not include NNN reimbursements — those are a wash (collected and paid out)." },

  // ── Mortgage ───────────────────────────────────────────
  { key: "mortgagePayment",    label: "Payment",        group: "mortgage",
    tip: "Total mortgage payment (principal + interest). This is your fixed monthly obligation × 12." },
  { key: "principalPaid",      label: "Principal",      group: "mortgage",
    tip: "Equity-building portion of your mortgage payment. Reduces your loan balance — this is yours. NOT tax-deductible." },
  { key: "interestPaid",       label: "Interest",       group: "mortgage",
    tip: "Cost-of-borrowing portion of your mortgage payment. This money is gone — but it IS tax-deductible against rental income." },

  // ── Operating Costs (shown only in gross lease) ────────
  { key: "propertyTax",        label: "Prop. Tax",      group: "opCosts",  showWhen: "nnn-costs",
    tip: "Annual property tax. In a gross lease you pay this directly. In NNN the tenant reimburses you." },
  { key: "insurance",          label: "Insurance",      group: "opCosts",  showWhen: "nnn-costs",
    tip: "Building insurance. In NNN the tenant reimburses you." },
  { key: "maintenance",        label: "Maint.",         group: "opCosts",  showWhen: "nnn-costs",
    tip: "Maintenance & repairs budget. In NNN the tenant reimburses you." },

  // ── Tax Calculation ────────────────────────────────────
  { key: "businessExpenses",   label: "Biz Exp.",       group: "tax",      showWhen: "income",
    tip: "Tax-deductible business expenses: accounting, legal, other. Reduces your taxable income." },
  { key: "ccaDeduction",       label: "CCA",            group: "tax",      showWhen: "income",
    tip: "Capital Cost Allowance (Class 1, 4% declining balance). Canadian tax depreciation on the building portion. Reduces taxable income — year 1 is half-rate due to the CRA half-year rule." },
  { key: "taxableIncome",      label: "Taxable",        group: "tax",      showWhen: "income",
    tip: "Taxable income = Gross Rent − Mortgage Interest − Business Expenses − CCA.\n\nNote: principal is NOT deductible. You pay tax on income used to pay down the mortgage." },
  { key: "rentalIncomeTax",    label: "Tax Paid",       group: "tax",      showWhen: "income", isNegativeGood: true,
    tip: "Tax owed on net rental profit (not gross rent). Applied at the rate you set — default 51% reflects the Canadian small business / corporate rate." },
  { key: "rentalIncomeNet",    label: "After-Tax",      group: "tax",      showWhen: "income",
    tip: "What you actually keep from rent: Gross Rent − Tax − Business Expenses. This is real cash in your pocket." },

  // ── Costs Avoided (owner-occupant) ─────────────────────
  { key: "costsAvoided",       label: "Costs Saved",    group: "cashflow", showWhen: "avoided",
    tip: "Money you no longer pay by owning instead of renting (rent, insurance, other). Unlike rental income, this is not taxed — it's simply money you stop spending." },

  // ── Cash Flow ──────────────────────────────────────────
  { key: "netCashFlow",        label: "Net Cash Flow",  group: "cashflow", isCashFlow: true,
    tip: "Net cash in or out for the year: After-Tax Income − Mortgage Payment (NNN operating costs wash out). Positive = building puts money in your pocket. Negative = you're topping it up." },
  { key: "cumulativeCashFlow", label: "Cumulative",     group: "cashflow", isCashFlow: true,
    tip: "Running total of all cash flows since purchase, including the down payment and closing costs as a negative starting balance. Turns positive when the building has returned your full initial investment." },

  // ── Building Position ──────────────────────────────────
  { key: "remainingBalance",   label: "Mtg. Balance",   group: "building",
    tip: "Outstanding mortgage balance at year end. Declining as principal is paid." },
  { key: "estimatedPropertyValue", label: "Prop. Value", group: "building",
    tip: "Estimated property value based on your appreciation rate input. Used to calculate equity and net worth." },
  { key: "equityBuilt",        label: "Equity Paid In", group: "building",
    tip: "Down payment + all principal paid to date. This is the cash you've put into building ownership — does not include appreciation." },
  { key: "netWorthPosition",   label: "Prop. Equity",   group: "building",
    tip: "Property Value − Remaining Mortgage. What you'd pocket if you sold today (before selling costs). Includes appreciation gains." },
];

export default function ScheduleTable({ schedule, isNNNLease, hasAvoided }: ScheduleTableProps) {
  const hasIncome = schedule.some((r) => r.rentalIncomeGross > 0);
  const showAvoided = hasAvoided ?? schedule.some((r) => r.costsAvoided > 0);
  const hideNNNCosts = isNNNLease && hasIncome;

  const visible = COLUMNS.filter((c) => {
    if (c.showWhen === "income"    && !hasIncome)    return false;
    if (c.showWhen === "nnn-costs" && hideNNNCosts)  return false;
    if (c.showWhen === "avoided"   && !showAvoided)  return false;
    return true;
  });

  // Build contiguous group spans for the header row
  const groupSpans: { group: ColGroup | "year"; label: string; span: number }[] = [];
  for (const col of visible) {
    const last = groupSpans[groupSpans.length - 1];
    if (last && last.group === col.group) {
      last.span++;
    } else {
      groupSpans.push({ group: col.group, label: col.group === "year" ? "" : GROUP_META[col.group as ColGroup].label, span: 1 });
    }
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          {/* Group header row */}
          <TableRow className="border-b-0">
            <TableHead className="text-xs font-bold text-center py-1 px-2 w-10" />
            {groupSpans.filter(g => g.group !== "year").map((g, i) => (
              <TableHead
                key={i}
                colSpan={g.span}
                className={`text-xs font-semibold text-center py-1 px-2 ${
                  GROUP_META[g.group as ColGroup].headerClass
                } ${GROUP_META[g.group as ColGroup].cellBorder}`}
              >
                {g.label}
              </TableHead>
            ))}
          </TableRow>
          {/* Column label row */}
          <TableRow>
            <TableHead className="text-xs font-semibold py-2 px-2 w-10">Yr</TableHead>
            {visible.map((col) => (
              <TableHead
                key={col.key}
                className={`text-xs py-2 px-2 whitespace-nowrap ${
                  col.group !== "year"
                    ? GROUP_META[col.group as ColGroup].cellBorder
                    : ""
                }`}
              >
                {col.tip ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        {col.label}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs whitespace-pre-line">
                      {col.tip}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  col.label
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {schedule.map((row) => (
            <TableRow key={row.year}>
              <TableCell className="text-xs font-semibold px-2 py-1.5">{row.year}</TableCell>
              {visible.map((col) => {
                const value = row[col.key] as number;
                const isNeg = value < 0;
                let colorClass = "";

                if (col.isCashFlow) {
                  colorClass = value > 0 ? "text-green-600" : value < 0 ? "text-destructive" : "";
                } else if (col.key === "rentalIncomeNet" || col.key === "rentalIncomeGross") {
                  colorClass = "text-emerald-700";
                } else if (col.isNegativeGood) {
                  // tax — no special colour, just show the number
                  colorClass = "";
                } else if (isNeg) {
                  colorClass = "text-destructive";
                }

                return (
                  <TableCell
                    key={col.key}
                    className={`text-xs font-mono px-2 py-1.5 ${colorClass} ${
                      GROUP_META[col.group as ColGroup]?.cellBorder ?? ""
                    }`}
                  >
                    {`${isNeg ? "-" : ""}$${fmt(value)}`}
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
