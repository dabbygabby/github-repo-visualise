// src/components/AnalysisForm.tsx
import React from "react";
import { useStore } from "../store/useStore";
import { useDependencyVisualizer } from "../hooks/useDependencyVisualizer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const AnalysisForm: React.FC = () => {
  const { repoUrl, setRepoUrl, accessToken, setAccessToken } = useStore();
  const { analyzeRepo, isLoading } = useDependencyVisualizer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeRepo();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-4 flex flex-col w-1/2">
      <Input
        type="text"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        placeholder="Enter repository URL"
        required
      />
      <Input
        type="password"
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
        placeholder="Enter personal access token"
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Analyzing..." : "Analyze Repository"}
      </Button>
    </form>
  );
};
