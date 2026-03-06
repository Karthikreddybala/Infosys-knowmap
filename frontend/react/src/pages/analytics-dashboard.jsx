import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { TrendingUp, BarChart3, CheckCircle, AlertCircle, MessageSquare, RefreshCw } from 'lucide-react';
import './css/analytics-dashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function AnalyticsDashboard() {
    const [metrics, setMetrics] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [accuracy, setAccuracy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(5);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

    // Fetch data
    const fetchAnalytics = async () => {
        try {
            setRefreshing(true);
            // Prefer combined endpoint
            try {
                const res = await fetch(`${API_BASE_URL}/api/analytics/dashboard`);
                if (res.ok) {
                    const json = await res.json();
                    if (json?.data) {
                        setMetrics(json.data.metrics || {});
                        setPerformance(json.data.performance || {});
                        setAccuracy(json.data.accuracy || {});
                        setLastUpdate(new Date());
                        setError('');
                        setLoading(false);
                        return;
                    }
                }
            } catch (e) {
                // fall through to individual endpoints
            }

            // Fallback: individual endpoints
            const [mRes, pRes, aRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/analytics/metrics`).catch(() => null),
                fetch(`${API_BASE_URL}/api/analytics/performance`).catch(() => null),
                fetch(`${API_BASE_URL}/api/analytics/accuracy`).catch(() => null)
            ]);

            if (mRes?.ok) {
                const j = await mRes.json();
                setMetrics(j.data || {});
            }
            if (pRes?.ok) {
                const j = await pRes.json();
                setPerformance(j.data || {});
            }
            if (aRes?.ok) {
                const j = await aRes.json();
                setAccuracy(j.data || {});
            }

            setLastUpdate(new Date());
            setError('');
        } catch (err) {
            console.error('Analytics fetch error:', err);
            setError('Failed to fetch analytics data. Ensure backend is running.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Manual refresh
    const handleManualRefresh = async () => {
        setRefreshing(true);
        await fetchAnalytics();
    };

    // Feedback submit
    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!feedback.trim()) return alert('Please enter feedback');
        try {
            const res = await fetch(`${API_BASE_URL}/api/analytics/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback, rating })
            });
            if (res.ok) {
                setFeedbackSubmitted(true);
                setFeedback('');
                setRating(5);
                setTimeout(() => setFeedbackSubmitted(false), 3000);
            }
        } catch (err) {
            console.error('Feedback submission error:', err);
        }
    };

    // Auto-refresh effect
    useEffect(() => {
        fetchAnalytics();
        const intervalMs = autoRefreshEnabled ? 10000 : 30000;
        const id = setInterval(fetchAnalytics, intervalMs);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRefreshEnabled]);

    if (loading && !metrics) {
        return (
            <Container className="analytics-container py-5">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading analytics...</p>
                </div>
            </Container>
        );
    }

    const overallAccuracy = Number(accuracy?.overallAccuracy ?? 0).toFixed(1);
    const avgProcessing = Number(performance?.avgProcessingTime ?? 0).toFixed(2);

    return (
        <Container fluid className="analytics-container py-4">
            <div className="analytics-header mb-4">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h2>📊 Knowledge Graph Analytics Dashboard</h2>
                        <p className="text-muted mb-0">Real-time monitoring from knowledge graph processing</p>
                        {lastUpdate && <small className="text-muted">Last updated: {lastUpdate.toLocaleTimeString()}</small>}
                    </div>
                    <div className="header-controls">
                        <Button variant={autoRefreshEnabled ? 'success' : 'outline-secondary'} size="sm" className="me-2" onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}>
                            {autoRefreshEnabled ? '✓ Auto Refresh' : 'Auto Refresh Off'}
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleManualRefresh} disabled={refreshing}>
                            <RefreshCw size={14} className={refreshing ? 'spinning' : ''} />{' '}
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </div>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <Card className="metric-card h-100">
                        <Card.Body>
                            <div className="metric-icon"><TrendingUp size={28} /></div>
                            <h6 className="text-uppercase text-muted">Total Estimate</h6>
                            <h2 className="metric-value">{Number(metrics?.totalEstimate ?? 0).toLocaleString()}</h2>
                            <small className="text-success">Documents processed</small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-3">
                    <Card className="metric-card h-100">
                        <Card.Body>
                            <div className="metric-icon relation-icon"><BarChart3 size={28} /></div>
                            <h6 className="text-uppercase text-muted">Total Relations</h6>
                            <h2 className="metric-value">{Number(metrics?.totalRelations ?? 0).toLocaleString()}</h2>
                            <small className="text-info">Graph nodes: {Number(metrics?.totalNodes ?? 0)}</small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-3">
                    <Card className="metric-card h-100">
                        <Card.Body>
                            <div className="metric-icon accuracy-icon"><CheckCircle size={28} /></div>
                            <h6 className="text-uppercase text-muted">Extraction Accuracy</h6>
                            <h2 className="metric-value">{overallAccuracy}%</h2>
                            <small className="text-primary">Data source quality</small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-3">
                    <Card className="metric-card h-100">
                        <Card.Body>
                            <div className="metric-icon speed-icon"><AlertCircle size={28} /></div>
                            <h6 className="text-uppercase text-muted">Avg Processing Time</h6>
                            <h2 className="metric-value" style={{ fontSize: '1.6rem' }}>{avgProcessing}s</h2>
                            <small className="text-warning">Per document</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col lg={8}>
                    <Card className="performance-card h-100">
                        <Card.Header className="bg-light"><h5 className="mb-0">🔄 Processing Pipeline Performance</h5></Card.Header>
                        <Card.Body>
                            {performance?.pipelineStages?.length ? (
                                performance.pipelineStages.map((stage, idx) => (
                                    <div key={idx} className="pipeline-stage-item mb-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <strong>{stage.name}</strong>
                                            <Badge bg={stage.success_rate >= 95 ? 'success' : stage.success_rate >= 80 ? 'warning' : 'danger'}>{stage.success_rate}%</Badge>
                                        </div>
                                        <div className="stage-bar mt-2">
                                            <div className="stage-progress" style={{ width: `${stage.success_rate}%` }} />
                                        </div>
                                        <small className="text-muted">Time: {stage.avg_time}ms | Count: {stage.processed}</small>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">No pipeline data available.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="sources-card h-100">
                        <Card.Header className="bg-light"><h5 className="mb-0">📊 Data Sources Accuracy</h5></Card.Header>
                        <Card.Body>
                            {accuracy?.sourceAccuracy?.length ? (
                                accuracy.sourceAccuracy.map((src, i) => (
                                    <div key={i} className="source-item mb-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span>{src.source}</span>
                                            <span style={{ color: src.accuracy >= 90 ? '#28a745' : src.accuracy >= 75 ? '#ffc107' : '#dc3545' }}>{src.accuracy}%</span>
                                        </div>
                                        <div className="accuracy-bar mt-1"><div className="accuracy-fill" style={{ width: `${src.accuracy}%` }} /></div>
                                        <small className="text-muted">{src.items_processed} items</small>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted">No accuracy data available.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col lg={8}>
                    <Card className="nlp-status-card h-100">
                        <Card.Header className="bg-light"><h5 className="mb-0">🧠 NLP Pipeline Status & Feedback</h5></Card.Header>
                        <Card.Body>
                            {feedbackSubmitted && <Alert variant="success" onClose={() => setFeedbackSubmitted(false)} dismissible>✓ Thank you for your feedback!</Alert>}
                            <Form onSubmit={handleFeedbackSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Rate Pipeline Performance</Form.Label>
                                    <div className="rating-input mb-2">
                                        {[1,2,3,4,5].map(n => (
                                            <button key={n} type="button" className={`rating-btn ${rating>=n? 'active':''}`} onClick={() => setRating(n)} title={`Rate ${n} star`}>⭐</button>
                                        ))}
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Feedback & Suggestions</Form.Label>
                                    <Form.Control as="textarea" rows={4} placeholder="Share feedback..." value={feedback} onChange={e => setFeedback(e.target.value)} />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100"><MessageSquare size={14} className="me-2" />Submit Feedback</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="status-card h-100">
                        <Card.Header className="bg-light"><h5 className="mb-0">⚙️ Pipeline Status</h5></Card.Header>
                        <Card.Body>
                            <div className="status-container">
                                <div className="status-item d-flex align-items-center mb-2">
                                    <span className="status-indicator status-active me-2" />
                                    <span>Processing Active</span>
                                </div>
                                <div className="status-stat mb-2"><strong>Throughput:</strong> {performance?.currentThroughput ?? '0'} docs/min</div>
                                <div className="status-stat mb-2"><strong>Queue:</strong> {metrics?.queueLength ?? '0'} items</div>
                                <div className="status-stat mb-2"><strong>Success Rate:</strong> <Badge bg={performance?.successRate >= 95 ? 'success' : performance?.successRate >= 80 ? 'warning' : 'danger'} className="ms-2">{performance?.successRate ?? '0'}%</Badge></div>

                                <hr />
                                <h6 className="mt-3 mb-2">Last Update</h6>
                                <small className="text-muted">{metrics?.lastUpdate ? new Date(metrics.lastUpdate).toLocaleString() : 'N/A'}</small>

                                <div className="mt-3 pt-3 border-top">
                                    <Button variant="primary" size="sm" className="w-100 mb-2" onClick={() => window.location.href = '/knowledge-graph'}>📊 Analyze Data</Button>
                                    <Button variant="outline-primary" size="sm" className="w-100" onClick={fetchAnalytics}>🔄 Refresh Data</Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default AnalyticsDashboard;
