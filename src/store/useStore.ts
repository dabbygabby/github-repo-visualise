// src/store/useStore.ts
import { create } from 'zustand'
import { AnalysisResult, GraphData } from '../types'

interface Store {
    analysisResult: AnalysisResult | null
    setAnalysisResult: (result: AnalysisResult | null) => void
    graphData: GraphData
    setGraphData: (data: GraphData) => void
    fileInfo: string
    setFileInfo: (info: string) => void
    errorInfo: string
    setErrorInfo: (info: string) => void
    rawContent: string
    setRawContent: (content: string) => void
    searchTerm: string
    setSearchTerm: (term: string) => void
    repoUrl: string
    setRepoUrl: (url: string) => void
    accessToken: string
    setAccessToken: (token: string) => void
}

export const useStore = create<Store>((set) => ({
    analysisResult: null,
    setAnalysisResult: (result) => set({ analysisResult: result }),
    graphData: { nodes: [], links: [] },
    setGraphData: (data) => set({ graphData: data }),
    fileInfo: '',
    setFileInfo: (info) => set({ fileInfo: info }),
    errorInfo: '',
    setErrorInfo: (info) => set({ errorInfo: info }),
    rawContent: '',
    setRawContent: (content) => set({ rawContent: content }),
    searchTerm: '',
    setSearchTerm: (term) => set({ searchTerm: term }),
    repoUrl: '',
    setRepoUrl: (url) => set({ repoUrl: url }),
    accessToken: '',
    setAccessToken: (token) => set({ accessToken: token }),
}))