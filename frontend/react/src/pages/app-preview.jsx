import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar, Alert, Spinner, Badge } from 'react-bootstrap';
import './css/app-preview.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function AppPreview() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [graphStats, setGraphStats] = useState(null);
    const [pipelineStatus, setPipelineStatus] = useState('idle');
    const [feedback, setFeedback] = useState([]);

    // Fetch metrics data
    const fetchMetrics = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/metrics`);
            const data = await response.json();
            if (data.success) {
                setMetrics(data.data);
                // use backend-provided status if available
                const status = data.data.graphStatus || 'active';
                setPipelineStatus(status);
                setError('');
            }
        } catch (err) {
            console.error('Error fetching metrics:', err);
            setError('Failed to fetch metrics');
        }
    };

    // Fetch graph stats
    const fetchGraphStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/graph-stats`);
            const data = await response.json();
            if (data.success) {
                setGraphStats(data.data);
            }
        } catch (err) {
            console.error('Error fetching graph stats:', err);
        }
    };

    // Fetch pipeline feedback/logs
    const fetchPipelineFeedback = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/pipeline-feedback`);
            const data = await response.json();
            if (data.success) {
                setFeedback(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching pipeline feedback:', err);
        }
    };

    // Initialize and setup real-time updates
    useEffect(() => {
        const loadInitialData = async () => {
            await Promise.all([
                fetchMetrics(),
                fetchGraphStats(),
                fetchPipelineFeedback()
            ]);
            setLoading(false);
        };

        loadInitialData();

        // Real-time updates every 5 seconds
        const interval = setInterval(() => {
            fetchMetrics();
            fetchGraphStats();
            fetchPipelineFeedback();
        }, 5000);

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, []);

    useEffect(() => {
        const handler = (e) => {
            const nlp = e?.detail;
            if (!nlp) return;
            const totalNodes = nlp.nodes?.length || 0;
            const totalEdges = nlp.edges?.length || 0;
            setMetrics((prev) => ({
                ...(prev || {}),
                totalNodes,
                totalRelations: totalEdges,
                documentsProcessed: (prev?.documentsProcessed || 0)
            }));
            setGraphStats({
                graphStats: {
                    totalNodes,
                    totalEdges,
                    density: (totalNodes > 1 ? (totalEdges / (totalNodes * (totalNodes - 1))) : 0),
                    avgDegree: totalNodes ? (totalEdges * 2 / totalNodes) : 0
                }
            });
            setPipelineStatus('active');
            setFeedback((prev) => {
                const incoming = Array.isArray(nlp.feedback) ? nlp.feedback : (nlp.events || []);
                if (!incoming || incoming.length === 0) return prev || [];
                return [...incoming, ...(prev || [])].slice(0, 50);
            });
        };

        const startHandler = () => {
            setPipelineStatus('processing');
        };

        window.addEventListener('nlpResultsUpdated', handler);
        window.addEventListener('nlpPipelineStarted', startHandler);
        return () => {
            window.removeEventListener('nlpResultsUpdated', handler);
            window.removeEventListener('nlpPipelineStarted', startHandler);
        };
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge bg="success">Active</Badge>;
            case 'processing':
                return <Badge bg="warning">Processing</Badge>;
            case 'error':
                return <Badge bg="danger">Error</Badge>;
            default:
                return <Badge bg="secondary">Idle</Badge>;
        }
    };

    if (loading && !metrics) {
        return (
            <div className="app-preview-container">
                <div className="loading-container">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            </div>
        );
    }

    const totalEstimate = metrics?.totalNodes || 0;
    const totalRelations = metrics?.totalRelations || 0;
    const documentsProcessed = metrics?.documentsProcessed || 0;
    const sourceAccuracy = metrics?.sourceAccuracy || {};

    return (
        <div className="app-preview-container">
            <header className="app-preview-header">
                <div className="header-content">
                    <h1>Web Application Preview</h1>
                    <p>Real-time NLP Pipeline & Knowledge Graph Analytics</p>
                    <div className="status-badge">
                        {getStatusBadge(pipelineStatus)}
                        <span className="last-updated">
                            Last updated: {new Date().toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            </header>

            {error && <Alert variant="danger" className="mx-3">{error}</Alert>}

            <Container fluid className="app-preview-content">
                {/* Key Metrics Section */}
                <section className="metrics-section">
                    <h2 className="section-title">Key Performance Metrics</h2>
                    <Row className="metrics-grid">
                        {/* Total Estimate Card */}
                        <Col lg={4} md={6} className="mb-4">
                            <Card className="metric-card metric-card-primary">
                                <Card.Body>
                                    <div className="metric-header">
                                        <span className="metric-label">Total Entities Extracted</span>
                                        <span className="metric-icon">📊</span>
                                    </div>
                                    <div className="metric-value">{totalEstimate}</div>
                                    <div className="metric-description">
                                        Unique entities identified in knowledge graph
                                    </div>
                                    <ProgressBar 
                                        now={(totalEstimate / Math.max(totalEstimate, 100)) * 100} 
                                        className="mt-3"
                                        variant="info"
                                    />
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Total Relations Card */}
                        <Col lg={4} md={6} className="mb-4">
                            <Card className="metric-card metric-card-success">
                                <Card.Body>
                                    <div className="metric-header">
                                        <span className="metric-label">Total Relations</span>
                                        <span className="metric-icon">🔗</span>
                                    </div>
                                    <div className="metric-value">{totalRelations}</div>
                                    <div className="metric-description">
                                        Relationship connections discovered
                                    </div>
                                    <ProgressBar 
                                        now={(totalRelations / Math.max(totalRelations, 100)) * 100} 
                                        className="mt-3"
                                        variant="success"
                                    />
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Documents Processed Card */}
                        <Col lg={4} md={6} className="mb-4">
                            <Card className="metric-card metric-card-warning">
                                <Card.Body>
                                    <div className="metric-header">
                                        <span className="metric-label">Documents Processed</span>
                                        <span className="metric-icon">📄</span>
                                    </div>
                                    <div className="metric-value">{documentsProcessed}</div>
                                    <div className="metric-description">
                                        Total documents analyzed
                                    </div>
                                    <ProgressBar 
                                        now={(documentsProcessed / Math.max(documentsProcessed, 100)) * 100} 
                                        className="mt-3"
                                        variant="warning"
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </section>

                {/* Data Sources Extraction Accuracy Section */}
                <section className="accuracy-section">
                    <h2 className="section-title">Data Sources Extraction Accuracy</h2>
                    <Row className="accuracy-grid">
                        {Object.entries(sourceAccuracy).length > 0 ? (
                            Object.entries(sourceAccuracy).map(([source, accuracy], index) => (
                                <Col lg={4} md={6} key={index} className="mb-4">
                                    <Card className="accuracy-card">
                                        <Card.Body>
                                            <div className="accuracy-header">
                                                <span className="source-name">
                                                    {source.charAt(0).toUpperCase() + source.slice(1)}
                                                </span>
                                                <span className="accuracy-percentage">
                                                    {accuracy}%
                                                </span>
                                            </div>
                                            <ProgressBar 
                                                now={accuracy} 
                                                className="accuracy-bar"
                                                variant={accuracy >= 80 ? 'success' : accuracy >= 60 ? 'warning' : 'danger'}
                                            />
                                            <div className="accuracy-detail">
                                                <small>
                                                    {accuracy >= 80 ? '✓ Excellent' : accuracy >= 60 ? '⚠ Good' : '✗ Needs Improvement'}
                                                </small>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col lg={12}>
                                <Alert variant="info">
                                    No accuracy data available yet. Process some text to see accuracy metrics.
                                </Alert>
                            </Col>
                        )}
                    </Row>
                </section>

                {/* Processing Pipeline Performance */}
                <section className="performance-section">
                    <h2 className="section-title">Processing Pipeline Performance</h2>
                    <Row>
                        <Col lg={6} className="mb-4">
                            <Card className="performance-card">
                                <Card.Body>
                                    <h5>Pipeline Execution Time</h5>
                                    <div className="performance-chart">
                                        <div className="chart-placeholder">
                                            <div className="chart-bar chart-bar-1" style={{height: '60%'}}></div>
                                            <div className="chart-bar chart-bar-2" style={{height: '75%'}}></div>
                                            <div className="chart-bar chart-bar-3" style={{height: '45%'}}></div>
                                            <div className="chart-bar chart-bar-4" style={{height: '85%'}}></div>
                                            <div className="chart-bar chart-bar-5" style={{height: '55%'}}></div>
                                        </div>
                                    </div>
                                    <div className="performance-stats">
                                        <div className="stat">
                                            <span>Avg Time:</span>
                                            <strong>{metrics?.pipelineMetrics?.avgProcessingTime || 'N/A'}</strong>
                                        </div>
                                        <div className="stat">
                                            <span>Max Time:</span>
                                            <strong>{metrics?.pipelineMetrics?.maxProcessingTime || 'N/A'}</strong>
                                        </div>
                                        <div className="stat">
                                            <span>Min Time:</span>
                                            <strong>{metrics?.pipelineMetrics?.minProcessingTime || 'N/A'}</strong>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={6} className="mb-4">
                            <Card className="performance-card">
                                <Card.Body>
                                    <h5>Graph Construction Performance</h5>
                                    <div className="performance-metrics">
                                        <div className="metric-row">
                                            <span className="label">Entity Extraction Rate:</span>
                                            <div className="metric-bar">
                                                <ProgressBar 
                                                    now={85} 
                                                    variant="success"
                                                    label="85%"
                                                />
                                            </div>
                                        </div>
                                        <div className="metric-row">
                                            <span className="label">Relation Detection Rate:</span>
                                            <div className="metric-bar">
                                                <ProgressBar 
                                                    now={78} 
                                                    variant="info"
                                                    label="78%"
                                                />
                                            </div>
                                        </div>
                                        <div className="metric-row">
                                            <span className="label">Graph Density:</span>
                                            <div className="metric-bar">
                                                <ProgressBar 
                                                    now={graphStats?.graphStats?.density || 0} 
                                                    variant="warning"
                                                    label={`${(graphStats?.graphStats?.density || 0).toFixed(2)}`}
                                                />
                                            </div>
                                        </div>
                                        <div className="metric-row">
                                            <span className="label">Average Node Degree:</span>
                                            <div className="metric-bar">
                                                <ProgressBar 
                                                    now={Math.min(100, (graphStats?.graphStats?.avgDegree || 0) * 10)} 
                                                    variant="success"
                                                    label={`${(graphStats?.graphStats?.avgDegree || 0).toFixed(2)}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </section>

                {/* NLP Pipeline Status & Feedback Section */}
                <section className="feedback-section">
                    <h2 className="section-title">NLP Pipeline Status & Feedback</h2>
                    <Row>
                        <Col lg={12}>
                            <Card className="feedback-card">
                                <Card.Body>
                                    <div className="feedback-header">
                                        <h5>Pipeline Activity Log</h5>
                                        <span className="feedback-count">
                                            {feedback.length} events
                                        </span>
                                    </div>
                                    
                                    {feedback.length > 0 ? (
                                        <div className="feedback-list">
                                            {feedback.slice(0, 10).map((log, index) => (
                                                <div 
                                                    key={index} 
                                                    className={`feedback-item feedback-${log.status || 'info'}`}
                                                >
                                                    <div className="feedback-timestamp">
                                                        {new Date(log.timestamp || new Date().getTime()).toLocaleTimeString()}
                                                    </div>
                                                    <div className="feedback-content">
                                                        <div className="feedback-message">
                                                            {log.message || 'No message'}
                                                        </div>
                                                        {log.details && (
                                                            <div className="feedback-details">
                                                                {log.details}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="feedback-status">
                                                        {getStatusBadge(log.status || 'info')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Alert variant="info" className="mb-0">
                                            No pipeline activity yet. Process some text to see feedback logs.
                                        </Alert>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </section>

                {/* Graph Statistics Section */}
                <section className="graph-section">
                    <h2 className="section-title">Knowledge Graph Statistics</h2>
                    <Row>
                        <Col lg={12}>
                            <Card className="graph-stats-card">
                                <Card.Body>
                                    <Row>
                                        <Col md={3} className="mb-3">
                                            <div className="graph-stat-item">
                                                <span className="graph-stat-label">Total Nodes</span>
                                                <span className="graph-stat-value">
                                                    {graphStats?.graphStats?.totalNodes || 0}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <div className="graph-stat-item">
                                                <span className="graph-stat-label">Total Edges</span>
                                                <span className="graph-stat-value">
                                                    {graphStats?.graphStats?.totalEdges || 0}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <div className="graph-stat-item">
                                                <span className="graph-stat-label">Graph Density</span>
                                                <span className="graph-stat-value">
                                                    {(graphStats?.graphStats?.density || 0).toFixed(3)}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <div className="graph-stat-item">
                                                <span className="graph-stat-label">Avg Node Degree</span>
                                                <span className="graph-stat-value">
                                                    {(graphStats?.graphStats?.avgDegree || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </section>
            </Container>
        </div>
    );
}

export default AppPreview;
