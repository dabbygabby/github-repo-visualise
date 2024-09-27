// src/components/FileUploader.tsx
import React from "react";
import { useDependencyVisualizer } from "../hooks/useDependencyVisualizer";
import { Input } from "@/components/ui/input";

export const FileUploader: React.FC = () => {
  const { loadJsonFile } = useDependencyVisualizer();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadJsonFile(file);
    }
  };

  return (
    <div className="mb-4">
      <Input type="file" accept=".json" onChange={handleFileChange} />
    </div>
  );
};
