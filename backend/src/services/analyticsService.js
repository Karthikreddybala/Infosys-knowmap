/**
 * Analytics Service
 * 
 * This service handles all analytics data retrieval and feedback storage.
 * Integrates with real metrics from knowledge graph processing.
 */

import fs from 'fs';
import path from 'path';
import metricsTracker from './metricsTracker.js';
import graphStatsService from './graphStatsService.js';

class AnalyticsService {
  constructor() {
    // In production, initialize database connection here
    this.feedbackFile = path.join(process.cwd(), 'data', 'feedback.json');
    this.metricsFile = path.join(process.cwd(), 'data', 'metrics.json');
    this.ensureDataDirectory();
    this.metricsTracker = metricsTracker;
  }

  /**
   * Ensure data directory exists
   */
  ensureDataDirectory() {
    const dataDir = path.dirname(this.feedbackFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  /**
   * Get or initialize feedback data
   */
  getFeedbackData() {
    try {
      if (fs.existsSync(this.feedbackFile)) {
        const data = fs.readFileSync(this.feedbackFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading feedback file:', error);
    }
    return { feedbacks: [], totalCount: 0, averageRating: 0 };
  }

  /**
   * Save feedback to file
   */
  saveFeedback(feedback, rating) {
    try {
      const data = this.getFeedbackData();
      const newFeedback = {
        id: Date.now(),
        feedback,
        rating: parseInt(rating),
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      data.feedbacks.push(newFeedback);
      data.totalCount = data.feedbacks.length;
      
      // Calculate average rating
      const totalRating = data.feedbacks.reduce((sum, f) => sum + f.rating, 0);
      data.averageRating = (totalRating / data.feedbacks.length).toFixed(2);
      data.lastUpdate = new Date().toISOString();

      fs.writeFileSync(this.feedbackFile, JSON.stringify(data, null, 2));
      return newFeedback;
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  }

  /**
   * Get all feedback
   */
  getAllFeedback() {
    return this.getFeedbackData();
  }

  /**
   * Get feedback by rating
   */
  getFeedbackByRating(rating) {
    const data = this.getFeedbackData();
    return data.feedbacks.filter(f => f.rating === parseInt(rating));
  }

  /**
   * Get recent feedback
   */
  getRecentFeedback(limit = 10) {
    const data = this.getFeedbackData();
    return data.feedbacks.slice(-limit).reverse();
  }

  /**
   * Calculate metrics statistics - Real data from knowledge graph
   */
  async getMetricsStatistics() {
    try {
      // Fetch real metrics from tracker
      const allMetrics = await metricsTracker.getAllMetrics();
      const graphStats = graphStatsService.getGraphStats();
      
      return {
        totalEstimate: allMetrics.metrics.documentsProcessedToday || 0,
        totalRelations: allMetrics.metrics.totalRelations || graphStats.data.num_edges,
        queueLength: allMetrics.metrics.queueLength || 0,
        documentsProcessedToday: allMetrics.metrics.documentsProcessedToday || 0,
        lastUpdate: allMetrics.metrics.lastUpdate || new Date().toISOString(),
        totalNodes: graphStats.data.num_nodes || 0,
        graphStatus: allMetrics.metrics.graphStatus || 'idle'
      };
    } catch (error) {
      console.error('Error getting metrics statistics:', error);
      // Fallback to cached metrics
      return {
        totalEstimate: 0,
        totalRelations: 0,
        queueLength: 0,
        documentsProcessedToday: 0,
        lastUpdate: new Date().toISOString(),
        totalNodes: 0,
        graphStatus: 'error'
      };
    }
  }

  /**
   * Get pipeline performance data - Real tracking
   */
  getPipelinePerformance() {
    try {
      return metricsTracker.getPipelinePerformance();
    } catch (error) {
      console.error('Error getting pipeline performance:', error);
      return {
        avgProcessingTime: 0,
        currentThroughput: 0,
        successRate: 0,
        pipelineStages: metricsTracker.getDefaultPipelineStages()
      };
    }
  }

  /**
   * Get data source accuracy - Real validation
   */
  getDataSourceAccuracy() {
    try {
      return metricsTracker.getDataSourceAccuracy();
    } catch (error) {
      console.error('Error getting data source accuracy:', error);
      return {
        overallAccuracy: '0.0',
        sourceAccuracy: [
          { source: 'Wikipedia', accuracy: 0, items_processed: 0 },
          { source: 'arXiv', accuracy: 0, items_processed: 0 },
          { source: 'News API', accuracy: 0, items_processed: 0 },
          { source: 'Custom Uploads', accuracy: 0, items_processed: 0 }
        ]
      };
    }
  }

  /**
   * Get or initialize metrics data
   */
  getMetricsData() {
    try {
      if (fs.existsSync(this.metricsFile)) {
        const data = fs.readFileSync(this.metricsFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading metrics file:', error);
    }
    return { metrics: [], lastUpdate: null };
  }

  /**
   * Save metrics snapshot
   */
  saveMetricsSnapshot(metrics) {
    try {
      const data = this.getMetricsData();
      const snapshot = {
        timestamp: new Date().toISOString(),
        ...metrics
      };

      data.metrics.push(snapshot);
      data.lastUpdate = snapshot.timestamp;

      // Keep only last 1000 snapshots
      if (data.metrics.length > 1000) {
        data.metrics = data.metrics.slice(-1000);
      }

      fs.writeFileSync(this.metricsFile, JSON.stringify(data, null, 2));
      return snapshot;
    } catch (error) {
      console.error('Error saving metrics snapshot:', error);
      throw error;
    }
  }

  /**
   * Get metrics trend (last N hours)
   */
  getMetricsTrend(hours = 24) {
    const data = this.getMetricsData();
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return data.metrics.filter(m => 
      new Date(m.timestamp) > cutoffTime
    );
  }
}

export default new AnalyticsService();
