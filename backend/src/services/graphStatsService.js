/**
 * Graph Statistics API Service
 * 
 * This module provides endpoints to fetch data from the knowledge graph
 * and convert it into analytics metrics.
 */

import fs from 'fs';
import path from 'path';

class GraphStatsService {
  constructor() {
    this.graphStatsCachePath = path.join(process.cwd(), 'data', 'graph-stats.json');
    this.ensureCache();
  }

  ensureCache() {
    const dir = path.dirname(this.graphStatsCachePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.graphStatsCachePath)) {
      fs.writeFileSync(this.graphStatsCachePath, JSON.stringify({
        nodes: [],
        edges: [],
        stats: {
          num_nodes: 0,
          num_edges: 0,
          last_updated: new Date().toISOString()
        }
      }, null, 2));
    }
  }

  /**
   * Get current graph statistics
   */
  getGraphStats() {
    try {
      if (fs.existsSync(this.graphStatsCachePath)) {
        const data = JSON.parse(fs.readFileSync(this.graphStatsCachePath, 'utf8'));
        return {
          success: true,
          data: {
            num_nodes: data.stats?.num_nodes || 0,
            num_edges: data.stats?.num_edges || 0,
            nodes_count: data.nodes?.length || 0,
            edges_count: data.edges?.length || 0,
            last_updated: data.stats?.last_updated || new Date().toISOString()
          }
        };
      }
    } catch (error) {
      console.error('Error reading graph stats cache:', error);
    }

    return {
      success: true,
      data: {
        num_nodes: 0,
        num_edges: 0,
        nodes_count: 0,
        edges_count: 0,
        last_updated: new Date().toISOString()
      }
    };
  }

  /**
   * Update graph statistics from Python backend
   */
  updateGraphStats(stats) {
    try {
      const data = {
        nodes: stats.nodes || [],
        edges: stats.edges || [],
        stats: {
          num_nodes: stats.num_nodes || stats.nodes?.length || 0,
          num_edges: stats.num_edges || stats.edges?.length || 0,
          num_connected_components: stats.num_connected_components || 0,
          average_degree: stats.average_degree || 0,
          density: stats.density || 0,
          last_updated: new Date().toISOString()
        }
      };

      fs.writeFileSync(this.graphStatsCachePath, JSON.stringify(data, null, 2));
      return { success: true };
    } catch (error) {
      console.error('Error updating graph stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get relation types from graph
   */
  getRelationTypes() {
    try {
      const data = JSON.parse(fs.readFileSync(this.graphStatsCachePath, 'utf8'));
      const relations = new Set();
      
      if (data.edges && Array.isArray(data.edges)) {
        data.edges.forEach(edge => {
          if (edge.relation) {
            relations.add(edge.relation);
          }
        });
      }

      return {
        success: true,
        data: {
          relation_types: Array.from(relations),
          count: relations.size
        }
      };
    } catch (error) {
      console.error('Error getting relation types:', error);
      return {
        success: true,
        data: {
          relation_types: [],
          count: 0
        }
      };
    }
  }

  /**
   * Get node types (entities)
   */
  getNodeTypes() {
    try {
      const data = JSON.parse(fs.readFileSync(this.graphStatsCachePath, 'utf8'));
      const types = {};
      
      if (data.nodes && Array.isArray(data.nodes)) {
        data.nodes.forEach(node => {
          const type = node.type || 'unknown';
          types[type] = (types[type] || 0) + 1;
        });
      }

      return {
        success: true,
        data: {
          node_types: types,
          total_types: Object.keys(types).length
        }
      };
    } catch (error) {
      console.error('Error getting node types:', error);
      return {
        success: true,
        data: {
          node_types: {},
          total_types: 0
        }
      };
    }
  }
}

export default new GraphStatsService();
