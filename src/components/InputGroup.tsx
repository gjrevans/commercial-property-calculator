"use client";

import { useState } from "react";

interface InputGroupProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export default function InputGroup({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
}: InputGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => collapsible && setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-left ${
          collapsible ? "cursor-pointer hover:bg-gray-100" : "cursor-default"
        }`}
      >
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
          {title}
        </h3>
        {collapsible && (
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}
