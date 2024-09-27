// src/components/ErrorInfo.tsx
import React from "react";
import { useStore } from "../store/useStore";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ErrorInfo: React.FC = () => {
  const { errorInfo } = useStore();

  return (
    errorInfo && (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{errorInfo}</AlertDescription>
      </Alert>
    )
  );
};
