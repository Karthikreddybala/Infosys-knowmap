/**
 * Knowledge Graph Service
 * 
 * This service handles the integration between Node.js backend and Python NLP pipeline.
 * It provides endpoints for text processing and knowledge graph construction.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class KnowledgeGraphService {
    constructor() {
        this.pythonPath = null;
        this.pythonScriptPath = path.join(__dirname, '../../../knowledge_graph/api_server.py');
        this.tempDir = path.join(os.tmpdir(), 'knowmap_temp');
    }

    async initialize() {
        this.pythonPath = await this.findPython();
    }

    /**
     * Find Python executable
     */
    async findPython() {
        // Try common Python paths
        const commonPaths = [
            'python3',
            'python',
            '/usr/bin/python3',
            '/usr/bin/python',
            '/usr/local/bin/python3',
            '/usr/local/bin/python',
            'C:\\Python39\\python.exe',
            'C:\\Python38\\python.exe',
            'C:\\Python37\\python.exe'
        ];

        // Try to find Python using spawnSync
        for (const pythonPath of commonPaths) {
            try {
                const { spawnSync } = await import('child_process');
                const result = spawnSync(pythonPath, ['--version'], { 
                    stdio: 'pipe',
                    encoding: 'utf8'
                });
                
                if (result.status === 0) {
                    console.log(`Found Python at: ${pythonPath}`);
                    return pythonPath;
                }
            } catch (error) {
                // Continue to next path
                continue;
            }
        }

        // If no Python found, return null and fail gracefully downstream.
        console.warn('Python not found. Please install Python 3.7+ and ensure it\'s in your PATH.');
        console.warn('The knowledge graph features will not be available until Python is properly configured.');
        return null;
    }

    /**
     * Ensure temp directory exists
     */
    async ensureTempDir() {
        try {
            await fs.access(this.tempDir);
        } catch (error) {
            await fs.mkdir(this.tempDir, { recursive: true });
        }
    }

    /**
     * Process text and extract knowledge graph
     */
    async processText(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid text input');
        }

        // Check if Python is available
        if (!this.pythonPath) {
            return {
                success: false,
                message: 'Python is not properly configured. Please install Python 3.7+ and ensure it\'s in your PATH.',
                data: null
            };
        }

        await this.ensureTempDir();

        // Create temporary input file
        const inputFileName = `input_${Date.now()}.txt`;
        const inputFilePath = path.join(this.tempDir, inputFileName);
        const outputFileName = `output_${Date.now()}.json`;
        const outputFilePath = path.join(this.tempDir, outputFileName);

        try {
            // Write input text to temporary file
            await fs.writeFile(inputFilePath, text, 'utf-8');

            // Execute Python script
            await this.executePythonScript([
                'process_text',
                inputFilePath,
                outputFilePath
            ]);

            // Read output file
            const outputData = await fs.readFile(outputFilePath, 'utf-8');
            const parsedOutput = JSON.parse(outputData);
            if (parsedOutput && parsedOutput.success === false) {
                return {
                    success: false,
                    message: parsedOutput.message || 'Failed to process text',
                    data: null
                };
            }
            const graphData = parsedOutput?.data ?? parsedOutput;

            return {
                success: true,
                data: graphData,
                message: parsedOutput?.message || 'Text processed successfully'
            };

        } catch (error) {
            console.error('Error processing text:', error);
            return {
                success: false,
                message: `Failed to process text: ${error.message}`,
                data: null
            };
        } finally {
            // Clean up temporary files
            try {
                await fs.unlink(inputFilePath);
                await fs.unlink(outputFilePath);
            } catch (cleanupError) {
                // Ignore cleanup errors
            }
        }
    }

    /**
     * Load existing knowledge graph from file
     */
    async loadGraph(filePath) {
        try {
            const graphData = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(graphData);
        } catch (error) {
            throw new Error(`Failed to load graph from ${filePath}: ${error.message}`);
        }
    }

    /**
     * Save knowledge graph to file
     */
    async saveGraph(graphData, filePath) {
        try {
            await fs.writeFile(filePath, JSON.stringify(graphData, null, 2), 'utf-8');
            return { success: true, message: `Graph saved to ${filePath}` };
        } catch (error) {
            throw new Error(`Failed to save graph to ${filePath}: ${error.message}`);
        }
    }

    /**
     * Execute Python script with given arguments
     */
    executePythonScript(args) {
        return new Promise((resolve, reject) => {
            const pythonProcess = spawn(this.pythonPath, [this.pythonScriptPath, ...args]);

            let stdout = '';
            let stderr = '';

            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(`Python script failed with code ${code}: ${stderr}`));
                }
            });

            pythonProcess.on('error', (error) => {
                reject(new Error(`Failed to start Python process: ${error.message}`));
            });
        });
    }

    /**
     * Get system information for debugging
     */
    getSystemInfo() {
        return {
            pythonPath: this.pythonPath,
            scriptPath: this.pythonScriptPath,
            tempDir: this.tempDir,
            platform: os.platform(),
            nodeVersion: process.version
        };
    }

    /**
     * Check if Python dependencies are installed
     */
    async checkDependencies() {
        try {
            const result = await this.executePythonScript(['check_dependencies']);
            const parsed = JSON.parse(result);
            if (parsed && typeof parsed.success === 'boolean') {
                return parsed;
            }
            return {
                success: true,
                message: 'Dependencies check completed',
                data: parsed
            };
        } catch (error) {
            return {
                success: false,
                message: 'Missing Python dependencies',
                error: error.message
            };
        }
    }
}

// Create and initialize the service
const service = new KnowledgeGraphService();
service.initialize().catch(console.error);

export default service;
