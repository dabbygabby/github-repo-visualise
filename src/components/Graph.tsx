// src/components/Graph.tsx
import React from "react";
import dynamic from "next/dynamic";
import { useStore } from "../store/useStore";
import { useDependencyVisualizer } from "../hooks/useDependencyVisualizer";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export const Graph: React.FC = () => {
  const { graphData } = useStore();
  const { handleNodeClick } = useDependencyVisualizer();

  return (
    <div style={{ width: "100%", height: "600px" }} className="mb-4">
      {graphData.nodes.length > 0 && (
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="id"
          nodeAutoColorBy="id"
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          onNodeClick={handleNodeClick}
        />
      )}
    </div>
  );
};
