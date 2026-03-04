/**
 * Knowledge Graph Routes
 * 
 * API endpoints for knowledge graph functionality including text processing,
 * graph construction, and visualization data.
 */

import express from 'express';
const router = express.Router();
import knowledgeGraphService from '../services/knowledgeGraphServiceSimple.js';

// utilities for file handling
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// paths for metrics and graph stats caches
const metricsFilePath = path.join(__dirname, '../../data/metrics-cache.json');
const graphStatsFilePath = path.join(__dirname, '../../data/graph-stats.json');

/**
 * POST /api/knowledge-graph/process
 * Process text and extract knowledge graph
 */
router.post('/process', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required'
            });
        }
        
        const result = await knowledgeGraphService.processText(text);
        
        // if processing succeeded, update cache files for metrics/graph-stats
        if (result && result.success && result.data) {
            try {
                const graphData = result.data;
                // write graph-stats file
                const nodes = graphData.nodes || [];
                const edges = graphData.edges || [];
                const degreeMap = {};
                edges.forEach(edge => {
                    degreeMap[edge.source] = (degreeMap[edge.source] || 0) + 1;
                    degreeMap[edge.target] = (degreeMap[edge.target] || 0) + 1;
                });
                const avgDegree = nodes.length > 0 ? Object.values(degreeMap).reduce((a,b)=>a+b,0)/nodes.length : 0;
                const density = nodes.length > 1 ? (edges.length * 2) / (nodes.length * (nodes.length - 1)) : 0;
                const graphStatsObj = {
                    nodes,
                    edges,
                    graphStats: {
                        totalNodes: nodes.length,
                        totalEdges: edges.length,
                        density,
                        avgDegree
                    },
                    lastUpdate: new Date().toISOString()
                };
                fs.writeFileSync(graphStatsFilePath, JSON.stringify(graphStatsObj, null, 2), 'utf8');

                // update metrics cache
                let metricsCache = {};
                if (fs.existsSync(metricsFilePath)) {
                    try {
                        metricsCache = JSON.parse(fs.readFileSync(metricsFilePath, 'utf8')).metrics || {};
                    } catch (e) {
                        console.warn('Unable to parse existing metrics file, overwriting', e);
                    }
                }
                metricsCache.totalNodes = nodes.length;
                metricsCache.totalEdges = edges.length;
                metricsCache.totalRelations = edges.length;
                metricsCache.documentsProcessed = (metricsCache.documentsProcessed || 0) + 1;
                metricsCache.lastUpdate = new Date().toISOString();
                // other fields remain untouched (sourceAccuracy, pipelineMetrics, etc.)
                fs.writeFileSync(metricsFilePath, JSON.stringify({ metrics: metricsCache }, null, 2), 'utf8');
            } catch (e) {
                console.error('Failed to update cache files:', e);
            }
        }

        // Always return the result, even if it's a failure due to missing Python
        res.json(result);
        
    } catch (error) {
        console.error('Error in knowledge graph processing:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * GET /api/knowledge-graph/system-info
 * Get system information for debugging
 */
router.get('/system-info', (req, res) => {
    try {
        const systemInfo = knowledgeGraphService.getSystemInfo();
        res.json({
            success: true,
            data: systemInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting system info',
            error: error.message
        });
    }
});

/**
 * GET /api/knowledge-graph/check-dependencies
 * Check if Python dependencies are installed
 */
router.get('/check-dependencies', async (req, res) => {
    try {
        const result = await knowledgeGraphService.checkDependencies();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking dependencies',
            error: error.message
        });
    }
});

/**
 * POST /api/knowledge-graph/save
 * Save knowledge graph to file
 */
router.post('/save', async (req, res) => {
    try {
        const { graphData, filePath } = req.body;
        
        if (!graphData || !filePath) {
            return res.status(400).json({
                success: false,
                message: 'Graph data and file path are required'
            });
        }
        
        const result = await knowledgeGraphService.saveGraph(graphData, filePath);
        res.json(result);
        
    } catch (error) {
        console.error('Error saving graph:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving graph',
            error: error.message
        });
    }
});

/**
 * GET /api/knowledge-graph/load
 * Load knowledge graph from file
 */
router.get('/load', async (req, res) => {
    try {
        const { filePath } = req.query;
        
        if (!filePath) {
            return res.status(400).json({
                success: false,
                message: 'File path is required'
            });
        }
        
        const result = await knowledgeGraphService.loadGraph(filePath);
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Error loading graph:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading graph',
            error: error.message
        });
    }
});

/**
 * POST /api/knowledge-graph/analyze
 * Get detailed analysis of a knowledge graph
 */
router.post('/analyze', (req, res) => {
    try {
        const { graphData } = req.body;
        
        if (!graphData) {
            return res.status(400).json({
                success: false,
                message: 'Graph data is required'
            });
        }
        
        // Extract statistics from graph data
        const nodes = graphData.nodes || [];
        const edges = graphData.edges || [];
        
        // Calculate basic statistics
        const stats = {
            totalNodes: nodes.length,
            totalEdges: edges.length,
            nodeTypes: [...new Set(nodes.map(n => n.type))],
            relationTypes: [...new Set(edges.map(e => e.relation))],
            averageDegree: nodes.length > 0 ? (edges.length * 2) / nodes.length : 0,
            density: nodes.length > 1 ? (edges.length * 2) / (nodes.length * (nodes.length - 1)) : 0
        };
        
        // Find most connected nodes
        const degreeMap = {};
        edges.forEach(edge => {
            degreeMap[edge.source] = (degreeMap[edge.source] || 0) + 1;
            degreeMap[edge.target] = (degreeMap[edge.target] || 0) + 1;
        });
        
        const mostConnected = Object.entries(degreeMap)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([node, degree]) => ({ node, degree }));
        
        // Analyze relation patterns
        const relationStats = {};
        edges.forEach(edge => {
            relationStats[edge.relation] = (relationStats[edge.relation] || 0) + 1;
        });
        
        const analysis = {
            statistics: stats,
            mostConnectedNodes: mostConnected,
            relationDistribution: relationStats,
            suggestions: generateSuggestions(stats, relationStats)
        };
        
        res.json({
            success: true,
            data: analysis
        });
        
    } catch (error) {
        console.error('Error analyzing graph:', error);
        res.status(500).json({
            success: false,
            message: 'Error analyzing graph',
            error: error.message
        });
    }
});

/**
 * POST /api/knowledge-graph/query
 * Query the knowledge graph for specific patterns
 */
router.post('/query', (req, res) => {
    try {
        const { graphData, query } = req.body;
        
        if (!graphData || !query) {
            return res.status(400).json({
                success: false,
                message: 'Graph data and query are required'
            });
        }
        
        const nodes = graphData.nodes || [];
        const edges = graphData.edges || [];
        
        let results = [];
        
        if (query.type === 'nodes_by_type') {
            results = nodes.filter(node => node.type === query.value);
        } else if (query.type === 'edges_by_relation') {
            results = edges.filter(edge => edge.relation === query.value);
        } else if (query.type === 'node_neighbors') {
            const node = query.value;
            const neighbors = {
                incoming: edges.filter(edge => edge.target === node),
                outgoing: edges.filter(edge => edge.source === node)
            };
            results = neighbors;
        } else if (query.type === 'search_nodes') {
            const searchTerm = query.value.toLowerCase();
            results = nodes.filter(node => 
                node.id.toLowerCase().includes(searchTerm) ||
                node.label.toLowerCase().includes(searchTerm)
            );
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid query type'
            });
        }
        
        res.json({
            success: true,
            data: results,
            query: query
        });
        
    } catch (error) {
        console.error('Error querying graph:', error);
        res.status(500).json({
            success: false,
            message: 'Error querying graph',
            error: error.message
        });
    }
});

/**
 * Generate suggestions based on graph analysis
 */
function generateSuggestions(stats, relationStats) {
    const suggestions = [];
    
    if (stats.totalNodes < 10) {
        suggestions.push('Consider adding more entities to create a richer knowledge graph');
    }
    
    if (stats.totalEdges < stats.totalNodes) {
        suggestions.push('The graph appears sparse. Try to identify more relationships between entities');
    }
    
    if (stats.density < 0.1) {
        suggestions.push('Low graph density detected. This might indicate disconnected components');
    }
    
    const mostCommonRelation = Object.entries(relationStats)
        .sort(([,a], [,b]) => b - a)[0];
    
    if (mostCommonRelation) {
        suggestions.push(`Most common relationship: "${mostCommonRelation[0]}" (${mostCommonRelation[1]} occurrences)`);
    }
    
    if (Object.keys(relationStats).length < 3) {
        suggestions.push('Consider diversifying the types of relationships in your knowledge graph');
    }
    
    return suggestions;
}

export default router;
