"use client";

import { useState, useMemo } from "react";
import { CalculatorInputs } from "@/lib/types";
import { DEFAULT_INPUTS } from "@/lib/defaults";
import { generateSchedule } from "@/lib/calculations";
import InputPanel from "@/components/InputPanel";
import ResultsPanel from "@/components/ResultsPanel";

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  const result = useMemo(() => generateSchedule(inputs), [inputs]);

  return (
    <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Commercial Building Calculator
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Model the true cost and return of owning a commercial building over
          time. All fields have defaults — adjust what you know.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        <div className="lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2">
          <InputPanel inputs={inputs} onChange={setInputs} />
        </div>
        <div>
          <ResultsPanel
            result={result}
            projectionYears={inputs.projectionYears}
          />
        </div>
      </div>
    </main>
  );
}
