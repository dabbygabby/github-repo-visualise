import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface FileAnalysis {
  imports: string[];
  exports: string[];
}

interface AnalysisResult {
  [filePath: string]: FileAnalysis;
}

interface PackageJson {
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
}

function analyzeFile(filePath: string, program: ts.Program): FileAnalysis {
  const sourceFile = program.getSourceFile(filePath);
  const imports: string[] = [];
  const exports: string[] = [];

  if (sourceFile) {
    ts.forEachChild(sourceFile, node => {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier;
        if (ts.isStringLiteral(moduleSpecifier)) {
          imports.push(moduleSpecifier.text);
        }
      } else if (ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          exports.push(node.moduleSpecifier.text);
        }
      } else if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isVariableStatement(node)) {
        if (node.modifiers && node.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
          if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
            if (node.name) {
              exports.push(node.name.text);
            }
          } else if (ts.isVariableStatement(node)) {
            node.declarationList.declarations.forEach(declaration => {
              if (ts.isIdentifier(declaration.name)) {
                exports.push(declaration.name.text);
              }
            });
          }
        }
      }
    });
  }
  return { imports, exports };
}

function getThirdPartyLibraries(projectPath: string): string[] {
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.warn('package.json not found. Third-party libraries will not be included.');
    return [];
  }

  const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  return Object.keys(dependencies);
}

export function analyzeProject(projectPath: string): AnalysisResult {
  const configPath = ts.findConfigFile(projectPath, ts.sys.fileExists, "tsconfig.json");
  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }

  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsedCommandLine = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
  const program = ts.createProgram(parsedCommandLine.fileNames, parsedCommandLine.options);

  const result: AnalysisResult = {};
  const thirdPartyLibraries = getThirdPartyLibraries(projectPath);

  parsedCommandLine.fileNames.forEach(fileName => {
    if (!fileName.includes('node_modules') && !fileName.endsWith('.d.ts')) {
      const relativePath = path.relative(projectPath, fileName);
      result[relativePath] = analyzeFile(fileName, program);
    }
  });

  // Add nodes for third-party libraries
  thirdPartyLibraries.forEach(lib => {
    result[`node_modules/${lib}`] = { imports: [], exports: [] };
  });

  return result;
}

export function saveAnalysisResult(result: AnalysisResult, outputPath: string) {
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
}

function resolvePath(inputPath: string): string {
  if (inputPath.startsWith('~')) {
    return path.join(os.homedir(), inputPath.slice(2));
  }
  return path.resolve(inputPath);
}

function main() {
  const projectPath = resolvePath('~/Desktop/withub.nosync/infra-frontend/');
  const outputFolder = resolvePath('~/Desktop/withub.nosync/analyser-output/');
  console.log(`Project path: ${projectPath}`);
  console.log(`Output folder: ${outputFolder}`);

  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  const analysisResult = analyzeProject(projectPath);
  const outputPath = path.join(outputFolder, 'analysis_result.json');
  saveAnalysisResult(analysisResult, outputPath);
  console.log(`Analysis complete. Results saved in ${outputPath}`);
}

main();