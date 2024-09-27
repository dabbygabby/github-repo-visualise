import { useCallback } from 'react';
import { useMutation } from 'react-query';
import { useStore } from '../store/useStore';
import { AnalysisResult, GraphData } from '../types';

export const useDependencyVisualizer = () => {
    const {
        setAnalysisResult,
        setGraphData,
        setFileInfo,
        setErrorInfo,
        setRawContent,
        setSelectedNode,
        repoUrl,
        accessToken,
        searchTerm,
        graphData,
        analysisResult,
    } = useStore();

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

    const { mutate: analyzeRepo, isLoading } = useMutation(
        async () => {
            const response = await fetch('/api/analyze-repo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ repoUrl, accessToken }),
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            return response.json();
        },
        {
            onSuccess: (data) => {
                const result = data.result as AnalysisResult;
                setAnalysisResult(result);
                setGraphData(createGraphData(result));
                setRawContent(JSON.stringify(result, null, 2));
                setErrorInfo('');
            },
            onError: (error: Error) => {
                console.error('Error during analysis:', error);
                setErrorInfo(`Error during analysis: ${error.message}`);
            },
        }
    );

    const loadJsonFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            try {
                const content = e.target?.result as string;
                setRawContent(content);
                const result = JSON.parse(content) as AnalysisResult;
                setAnalysisResult(result);
                setGraphData(createGraphData(result));
                setErrorInfo('');
            } catch (error) {
                console.error('Error parsing JSON:', error);
                setErrorInfo(`Error Details: ${(error as Error).message}`);
                setAnalysisResult(null);
            }
        };
        reader.readAsText(file);
    };

    const handleNodeClick = useCallback(
        (node: { id: string }) => {
            if (analysisResult) {
                const fileName = node.id;
                setSelectedNode(fileName);
                const fileData = analysisResult[fileName];
                if (fileData) {
                    const { imports, exports } = fileData;
                    const importedBy = Object.entries(analysisResult)
                        .filter(([_, data]) => data.imports.includes(fileName))
                        .map(([file]) => file);

                    setFileInfo(`
                        <h2>${fileName}</h2>
                        <h3>Imports:</h3>
                        <ul>${imports.map((imp) => `<li>${imp}</li>`).join('')}</ul>
                        <h3>Exports:</h3>
                        <ul>${exports.map((exp) => `<li>${exp}</li>`).join('')}</ul>
                        <h3>Imported by:</h3>
                        <ul>${importedBy.map((file) => `<li>${file}</li>`).join('')}</ul>
                    `);
                } else {
                    setFileInfo(`<p>File not found in analysis result: ${fileName}</p>`);
                }
            }
        },
        [analysisResult, setFileInfo, setSelectedNode]
    );

    const searchFile = () => {
        if (analysisResult && searchTerm) {
            const node = graphData.nodes.find((n) => n.id === searchTerm);
            if (node) {
                handleNodeClick(node);
            } else {
                setFileInfo(`<p>File not found: ${searchTerm}</p>`);
                setSelectedNode(null);
            }
        }
    };

    return {
        analyzeRepo,
        loadJsonFile,
        handleNodeClick,
        searchFile,
        isLoading,
    };
};