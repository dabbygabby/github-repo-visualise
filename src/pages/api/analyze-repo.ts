// pages/api/analyze-repo.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import * as ts from 'typescript';

// Import your analyzer functions here
import { analyzeProject, saveAnalysisResult } from '../../utils/analyzer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { repoUrl, accessToken } = req.body;

  if (!repoUrl || !accessToken) {
    return res.status(400).json({ error: 'Missing repoUrl or accessToken' });
  }

  try {
    // Create a temporary directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));

    // Clone the repository
    execSync(`git clone https://${accessToken}@${repoUrl.replace('https://', '')} ${tempDir}`, { stdio: 'pipe' });

    // Run the analysis
    const analysisResult = analyzeProject(tempDir);

    // Save the analysis result
    const outputPath = path.join(tempDir, 'analysis_result.json');
    saveAnalysisResult(analysisResult, outputPath);

    // Read the result file
    const result = fs.readFileSync(outputPath, 'utf-8');

    // Clean up: remove the temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Send the result
    res.status(200).json({ result: JSON.parse(result) });
  } catch (error) {
    console.error('Error during analysis:', error);
    res.status(500).json({ error: 'An error occurred during analysis' });
  }
}