// src/pages/index.tsx
import React from 'react';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AnalysisForm } from '../components/AnalysisForm';
import { FileUploader } from '../components/FileUploader';
import { SearchBar } from '../components/SearchBar';
import { Graph } from '../components/Graph';
import { FileInfo } from '../components/FileInfo';
import { ErrorInfo } from '../components/ErrorInfo';
import { RawContent } from '../components/RawContent';

const queryClient = new QueryClient();

const DependencyVisualizer: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Dependency Visualizer</title>
        <meta name="description" content="Visualize code dependencies" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dependency Visualizer</h1>
        <AnalysisForm />
        <FileUploader />
        <SearchBar />
        <Graph />
        <FileInfo />
        <ErrorInfo />
        <RawContent />
      </div>
    </QueryClientProvider>
  );
};

export default DependencyVisualizer;