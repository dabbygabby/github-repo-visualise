import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface AnalysisResult {
  [key: string]: {
    imports: string[];
    exports: string[];
  };
}

interface GraphData {
  nodes: { id: string }[];
  links: { source: string; target: string }[];
}

const DependencyVisualizer: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const [fileInfo, setFileInfo] = useState<string>("");
  const [errorInfo, setErrorInfo] = useState<string>("");
  const [rawContent, setRawContent] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const analyzeRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorInfo("");

    try {
      const response = await fetch("/api/analyze-repo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl, accessToken }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      const result = data.result as AnalysisResult;
      setAnalysisResult(result);
      setGraphData(createGraphData(result));
      setRawContent(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Error during analysis:", error);
      setErrorInfo(`Error during analysis: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadJsonFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const content = e.target?.result as string;
          setRawContent(content);
          const result = JSON.parse(content) as AnalysisResult;
          setAnalysisResult(result);
          setGraphData(createGraphData(result));
          setErrorInfo("");
        } catch (error) {
          console.error("Error parsing JSON:", error);
          setErrorInfo(`Error Details: ${(error as Error).message}`);
          setAnalysisResult(null);
        }
      };
      reader.readAsText(file);
    } else {
      setErrorInfo("Please select a JSON file to upload.");
    }
  };

  const createGraphData = (data: AnalysisResult): GraphData => {
    const nodes = new Set<string>();
    const links: { source: string; target: string }[] = [];

    Object.keys(data).forEach((file) => {
      nodes.add(file);
      data[file].imports.forEach((imp) => {
        nodes.add(imp);
        links.push({ source: file, target: imp });
      });
    });

    return {
      nodes: Array.from(nodes).map((id) => ({ id })),
      links,
    };
  };

  const handleNodeClick = useCallback(
    (node: { id: string }) => {
      if (analysisResult) {
        const fileName = node.id;
        const fileData = analysisResult[fileName];
        if (fileData) {
          const { imports, exports } = fileData;
          const importedBy = Object.entries(analysisResult)
            .filter(([_, data]) => data.imports.includes(fileName))
            .map(([file]) => file);

          setFileInfo(`
          <h2>${fileName}</h2>
          <h3>Imports:</h3>
          <ul>${imports.map((imp) => `<li>${imp}</li>`).join("")}</ul>
          <h3>Exports:</h3>
          <ul>${exports.map((exp) => `<li>${exp}</li>`).join("")}</ul>
          <h3>Imported by:</h3>
          <ul>${importedBy.map((file) => `<li>${file}</li>`).join("")}</ul>
        `);
        } else {
          setFileInfo(`<p>File not found in analysis result: ${fileName}</p>`);
        }
      }
    },
    [analysisResult]
  );

  const searchFile = () => {
    if (analysisResult && searchTerm) {
      const node = graphData.nodes.find((n) => n.id === searchTerm);
      if (node) {
        handleNodeClick(node);
      } else {
        setFileInfo(`<p>File not found: ${searchTerm}</p>`);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Dependency Visualizer</title>
        <meta name="description" content="Visualize code dependencies" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dependency Visualizer</h1>

        <form onSubmit={analyzeRepo} className="mb-4">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="Enter repository URL"
            className="mr-2 p-1 border rounded"
            required
          />
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Enter personal access token"
            className="mr-2 p-1 border rounded"
            required
          />
          <button
            type="submit"
            className="px-2 py-1 bg-blue-500 text-white rounded"
            disabled={isLoading}
          >
            {isLoading ? "Analyzing..." : "Analyze Repository"}
          </button>
        </form>

        <div className="mb-4">
          <input
            type="file"
            accept=".json"
            onChange={loadJsonFile}
            className="mr-2"
          />
        </div>

        {analysisResult && (
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter file name"
              className="mr-2 p-1 border rounded"
            />
            <button
              onClick={searchFile}
              className="px-2 py-1 bg-blue-500 text-white rounded"
            >
              Search
            </button>
          </div>
        )}

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

        <div
          dangerouslySetInnerHTML={{ __html: fileInfo }}
          className="mb-4"
        ></div>

        {errorInfo && <div className="text-red-500 mb-4">{errorInfo}</div>}

        {rawContent && (
          <div className="mb-4">
            <h3 className="font-bold">Raw Content:</h3>
            <pre className="whitespace-pre-wrap overflow-auto max-h-64 border p-2">
              {rawContent}
            </pre>
          </div>
        )}
      </div>
    </>
  );
};

export default DependencyVisualizer;
