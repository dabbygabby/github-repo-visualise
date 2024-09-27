// src/components/RawContent.tsx
import React from "react";
import { useStore } from "../store/useStore";

export const RawContent: React.FC = () => {
  const { rawContent } = useStore();

  return (
    rawContent && (
      <div className="mb-4">
        <h3 className="font-bold">Raw Content:</h3>
        <pre className="whitespace-pre-wrap overflow-auto max-h-64 border p-2">
          {rawContent}
        </pre>
      </div>
    )
  );
};
