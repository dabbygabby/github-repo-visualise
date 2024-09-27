// src/types.ts
export interface AnalysisResult {
    [key: string]: {
      imports: string[];
      exports: string[];
    };
  }
  
  export interface GraphData {
    nodes: { id: string }[];
    links: { source: string; target: string }[];
  }