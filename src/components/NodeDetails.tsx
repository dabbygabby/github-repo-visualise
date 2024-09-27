import React from "react";
import { useStore } from "../store/useStore";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export const NodeDetails: React.FC = () => {
  const { selectedNode, analysisResult } = useStore();

  if (!selectedNode || !analysisResult) return null;

  const nodeData = analysisResult[selectedNode];
  const usedBy = Object.entries(analysisResult)
    .filter(([file, data]) => data.imports.includes(selectedNode))
    .map(([file]) => file);

  return (
    <Card className="mb-4">
      <CardHeader>
        <h3 className="text-lg font-semibold">{selectedNode}</h3>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="font-semibold">Imports:</h4>
          <ul className="list-disc pl-5">
            {nodeData?.imports?.map((imp, index) => (
              <li key={index}>{imp}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Used by:</h4>
          <ul className="list-disc pl-5">
            {usedBy.map((file, index) => (
              <li key={index}>{file}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
