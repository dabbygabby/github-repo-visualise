// src/components/SearchBar.tsx
import React from "react";
import { useStore } from "../store/useStore";
import { useDependencyVisualizer } from "../hooks/useDependencyVisualizer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const SearchBar: React.FC = () => {
  const { searchTerm, setSearchTerm, analysisResult } = useStore();
  const { searchFile } = useDependencyVisualizer();

  return (
    analysisResult && (
      <div className="mb-4 flex space-x-2">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter file name"
        />
        <Button onClick={searchFile}>Search</Button>
      </div>
    )
  );
};
