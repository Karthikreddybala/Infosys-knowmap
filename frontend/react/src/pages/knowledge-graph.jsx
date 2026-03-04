import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Button, Form, Row, Col, Container, Alert, Spinner, Modal, Badge } from 'react-bootstrap';
import {
    PlayCircle, 
    Save, 
    Upload, 
    Download, 
    Search, 
    BarChart3, 
    HelpCircle,
    FileText,
    Database,
    Network,
    XCircle,
    Edit3
} from 'lucide-react';
import './css/knowledge-graph.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const KnowledgeGraphPage = () => {
    const [text, setText] = useState('');
    const [graphData, setGraphData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [query, setQuery] = useState({ type: 'nodes_by_type', value: '' });
    const [queryResults, setQueryResults] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [nodeSearch, setNodeSearch] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);
    const [showNodeEditor, setShowNodeEditor] = useState(false);
    const [editingNode, setEditingNode] = useState({ label: '', type: '' });
    const [viewMode, setViewMode] = useState('graph'); // 'graph' | 'list' | 'split'

    const graphRef = useRef(null);
    const [graphInitialized, setGraphInitialized] = useState(false);

    // Load sample text
    const loadSampleText = () => {
        const sampleText = `Apple Inc. is a technology company based in California. 
Tim Cook is the CEO of Apple. 
Apple develops innovative products like the iPhone and iPad.
Google is a competitor to Apple in the technology sector.
Sundar Pichai leads Google as its CEO.
Microsoft is another major technology company founded by Bill Gates.
Amazon was founded by Jeff Bezos and is a leader in e-commerce.
Tesla is an electric vehicle company led by Elon Musk.
Facebook, now Meta, was founded by Mark Zuckerberg.
These companies are shaping the future of technology and innovation.`;
        setText(sampleText);
    };

    // Process text to extract knowledge graph
    const processText = async () => {
        if (!text.trim()) {
            setError('Please enter some text to process');
            return;
        }

        setLoading(true);
        setError('');
        // notify preview that pipeline started
        try {
            window.dispatchEvent(new CustomEvent('nlpPipelineStarted'));
        } catch (e) {
            console.warn('Failed to dispatch nlpPipelineStarted event', e);
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/knowledge-graph/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text.trim() })
            });

            const result = await response.json();

            if (result.success) {
                setGraphData(result.data);
                setError('');
                // dispatch global event so preview can update if visible
                try {
                    window.dispatchEvent(new CustomEvent('nlpResultsUpdated', { detail: result.data }));
                } catch (e) {
                    console.warn('Failed to dispatch nlpResultsUpdated event from knowledge-graph page', e);
                }
                // Initialize graph visualization
                setTimeout(() => {
                    initializeGraph(result.data);
                }, 100);
            } else {
                setError(result.message || 'Failed to process text');
            }
        } catch (err) {
            setError('Error connecting to server: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Initialize graph visualization
    const initializeGraph = (data, { highlightTerm = '', selectedNodeId = null } = {}) => {
        if (!data || !data.nodes || !data.edges) return;

        const container = graphRef.current;
        if (!container) return;

        // Clean up previous graph
        container.innerHTML = '';

        // Create SVG for graph visualization
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        
        // Simple force-directed layout simulation
        const nodes = data.nodes.map(n => ({
            ...n,
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0,
            vy: 0
        }));
        
        const edges = data.edges;

        // Draw edges with relation labels
        edges.forEach(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            
            if (sourceNode && targetNode) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', sourceNode.x);
                line.setAttribute('y1', sourceNode.y);
                line.setAttribute('x2', targetNode.x);
                line.setAttribute('y2', targetNode.y);
                line.setAttribute('stroke', '#666');
                line.setAttribute('stroke-width', '2');
                line.setAttribute('opacity', '0.5');
                svg.appendChild(line);

                // Edge label at midpoint
                if (edge.relation) {
                    const midX = (sourceNode.x + targetNode.x) / 2;
                    const midY = (sourceNode.y + targetNode.y) / 2;
                    const edgeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    edgeLabel.setAttribute('x', midX);
                    edgeLabel.setAttribute('y', midY - 4);
                    edgeLabel.setAttribute('font-size', '10');
                    edgeLabel.setAttribute('fill', '#6c757d');
                    edgeLabel.setAttribute('text-anchor', 'middle');
                    edgeLabel.textContent = edge.relation;
                    svg.appendChild(edgeLabel);
                }
            }
        });

        // Draw nodes
        nodes.forEach(node => {
            const isMatch =
                highlightTerm &&
                (node.label?.toLowerCase().includes(highlightTerm) ||
                    node.id?.toLowerCase().includes(highlightTerm));
            const isSelected = selectedNodeId && node.id === selectedNodeId;

            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('data-node-id', node.id);
            group.style.cursor = 'pointer';

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', isSelected ? 22 : 16);
            circle.setAttribute('fill', isSelected ? '#0d6efd' : isMatch ? '#20c997' : '#007bff');
            circle.setAttribute('stroke', isSelected ? '#ffc107' : '#fff');
            circle.setAttribute('stroke-width', isSelected ? '3' : '2');

            // Add hover effect
            group.addEventListener('mouseenter', () => {
                circle.setAttribute('r', isSelected ? 24 : 20);
            });
            group.addEventListener('mouseleave', () => {
                circle.setAttribute('r', isSelected ? 22 : 16);
            });

            group.addEventListener('click', () => {
                setSelectedNode(node);
                setEditingNode({ label: node.label || node.id, type: node.type || '' });
                setShowNodeEditor(true);
            });

            group.appendChild(circle);

            // Add label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', node.x + 22);
            label.setAttribute('y', node.y + 5);
            label.setAttribute('font-size', '12');
            label.setAttribute('fill', '#212529');
            label.textContent = node.label;

            group.appendChild(label);
            svg.appendChild(group);
        });

        container.appendChild(svg);
        setGraphInitialized(true);
    };

    // Analyze graph
    const analyzeGraph = async () => {
        if (!graphData) {
            setError('Please process text first to create a graph');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/knowledge-graph/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ graphData })
            });

            const result = await response.json();
            if (result.success) {
                setAnalysis(result.data);
            } else {
                setError('Failed to analyze graph');
            }
        } catch (err) {
            setError('Error analyzing graph: ' + err.message);
        }
    };

    // Query graph
    const queryGraph = async () => {
        if (!graphData) {
            setError('Please process text first to create a graph');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/knowledge-graph/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    graphData,
                    query: {
                        type: query.type,
                        value: query.value
                    }
                })
            });

            const result = await response.json();
            if (result.success) {
                setQueryResults(result.data);
            } else {
                setError('Failed to query graph');
            }
        } catch (err) {
            setError('Error querying graph: ' + err.message);
        }
    };

    // Check dependencies
    const checkDependencies = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/knowledge-graph/check-dependencies`);
            const result = await response.json();
            if (!result.success) {
                setError('Python dependencies not available. Please install required packages.');
            }
        } catch (err) {
            console.error('Error checking dependencies:', err);
        }
    };

    useEffect(() => {
        checkDependencies();
    }, []);

    useEffect(() => {
        if (graphData && graphInitialized) {
            const term = nodeSearch.trim().toLowerCase();
            const selectedId = selectedNode?.id ?? null;
            initializeGraph(graphData, { highlightTerm: term, selectedNodeId: selectedId });
        }
    }, [graphData, graphInitialized, nodeSearch, selectedNode]);

    const filteredNodes = useMemo(() => {
        if (!graphData?.nodes) return [];
        const term = nodeSearch.trim().toLowerCase();
        if (!term) return graphData.nodes;
        return graphData.nodes.filter(
            (n) =>
                n.label?.toLowerCase().includes(term) ||
                n.id?.toLowerCase().includes(term) ||
                n.type?.toLowerCase().includes(term),
        );
    }, [graphData, nodeSearch]);

    const handleOpenNodeEditor = (node) => {
        setSelectedNode(node);
        setEditingNode({ label: node.label || node.id, type: node.type || '' });
        setShowNodeEditor(true);
    };

    const handleSaveNode = () => {
        if (!selectedNode || !graphData) {
            setShowNodeEditor(false);
            return;
        }

        const updatedNodes = graphData.nodes.map((n) =>
            n.id === selectedNode.id
                ? {
                      ...n,
                      label: editingNode.label || n.label,
                      type: editingNode.type || n.type,
                  }
                : n,
        );

        const updatedGraph = { ...graphData, nodes: updatedNodes };
        setGraphData(updatedGraph);
        setSelectedNode(
            updatedNodes.find((n) => n.id === selectedNode.id) || null,
        );
        setShowNodeEditor(false);
    };

    return (
        <Container fluid className="knowledge-graph-container">
            <Row className="mb-4">
                <Col>
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
                        <div>
                            <h1 className="text-primary mb-1">
                                <Network size={32} className="mb-2 me-2" />
                                Knowledge Graph Studio
                            </h1>
                            <p className="text-muted mb-0">
                                Convert unstructured text into interactive knowledge graphs, then
                                search and refine the nodes.
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                variant={viewMode === 'graph' ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => setViewMode('graph')}
                            >
                                Graph View
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                            >
                                Node List
                            </Button>
                            <Button
                                variant={viewMode === 'split' ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => setViewMode('split')}
                            >
                                Split View
                            </Button>
                        </div>
                    </div>
                </Col>
                <Col xs="auto">
                    <Button 
                        variant="outline-primary" 
                        onClick={() => setShowHelp(true)}
                        className="d-flex align-items-center gap-2"
                    >
                        <HelpCircle size={18} />
                        Help
                    </Button>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            )}

            <Row>
                {/* Input Section */}
                <Col lg={viewMode === 'graph' ? 5 : 4}>
                    <Card className="h-100">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">
                                <FileText size={20} className="me-2" />
                                Input Text
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Enter text to process</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={8}
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Enter unstructured text here..."
                                    />
                                </Form.Group>
                                
                                <div className="d-flex gap-2">
                                    <Button 
                                        variant="primary" 
                                        onClick={loadSampleText}
                                        className="d-flex align-items-center gap-2"
                                    >
                                        <Upload size={18} />
                                        Load Sample
                                    </Button>
                                    
                                    <Button 
                                        variant="success" 
                                        onClick={processText}
                                        disabled={loading}
                                        className="d-flex align-items-center gap-2 flex-grow-1"
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner size="sm" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <PlayCircle size={18} />
                                                Process Text
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Graph Visualization & Node Explorer */}
                <Col lg={viewMode === 'graph' ? 7 : 8}>
                    <Card className="h-100">
                        <Card.Header className="bg-info text-white">
                            <h5 className="mb-0">
                                <Database size={20} className="me-2" />
                                Knowledge Graph
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div
                                ref={graphRef}
                                className="graph-visualization mb-3"
                                style={{
                                    width: '100%',
                                    height: viewMode === 'split' ? '320px' : '420px',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '8px',
                                    backgroundColor: '#f8f9fa',
                                }}
                            >
                                {graphData ? (
                                    <div className="text-center text-muted p-5">
                                        Graph visualization will appear here
                                    </div>
                                ) : (
                                    <div className="text-center text-muted p-5">
                                        Process text to generate a knowledge graph
                                    </div>
                                )}
                            </div>

                            {graphData && (
                                <div className="d-flex flex-column flex-lg-row gap-3">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <h6 className="mb-0 d-flex align-items-center gap-2">
                                                <Search size={16} />
                                                Nodes
                                            </h6>
                                            <Badge bg="light" text="dark">
                                                {filteredNodes.length} of {graphData.nodes.length}
                                            </Badge>
                                        </div>
                                        <Form.Control
                                            size="sm"
                                            type="text"
                                            value={nodeSearch}
                                            onChange={(e) => setNodeSearch(e.target.value)}
                                            placeholder="Search nodes by label, id, or type..."
                                            className="mb-2"
                                        />
                                        <div className="node-list">
                                            {filteredNodes.length === 0 && (
                                                <div className="text-muted small">
                                                    No nodes match your search.
                                                </div>
                                            )}
                                            {filteredNodes.map((node) => (
                                                <button
                                                    key={node.id}
                                                    type="button"
                                                    className={`node-list-item ${
                                                        selectedNode?.id === node.id
                                                            ? 'node-list-item-active'
                                                            : ''
                                                    }`}
                                                    onClick={() => handleOpenNodeEditor(node)}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <div className="fw-semibold">
                                                                {node.label || node.id}
                                                            </div>
                                                            <div className="text-muted small">
                                                                {node.type || 'Node'}
                                                            </div>
                                                        </div>
                                                        <Edit3 size={16} className="text-primary" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column gap-2 flex-shrink-0">
                                        <Button
                                            variant="outline-secondary"
                                            onClick={analyzeGraph}
                                            className="d-flex align-items-center gap-2"
                                        >
                                            <BarChart3 size={18} />
                                            Analyze
                                        </Button>

                                        <Button
                                            variant="outline-secondary"
                                            onClick={queryGraph}
                                            className="d-flex align-items-center gap-2"
                                        >
                                            <Search size={18} />
                                            Advanced Query
                                        </Button>

                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => {
                                                setNodeSearch('');
                                                setSelectedNode(null);
                                            }}
                                            className="d-flex align-items-center gap-2"
                                        >
                                            <XCircle size={18} />
                                            Clear Selection
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Analysis and Query Results */}
            {(analysis || queryResults) && (
                <Row className="mt-4">
                    {analysis && (
                        <Col lg={6}>
                            <Card>
                                <Card.Header className="bg-warning text-dark">
                                    <h6 className="mb-0">
                                        <BarChart3 size={18} className="me-2" />
                                        Graph Analysis
                                    </h6>
                                </Card.Header>
                                <Card.Body>
                                    <div className="analysis-stats">
                                        <div className="stat-item">
                                            <strong>Total Nodes:</strong> {analysis.statistics.totalNodes}
                                        </div>
                                        <div className="stat-item">
                                            <strong>Total Edges:</strong> {analysis.statistics.totalEdges}
                                        </div>
                                        <div className="stat-item">
                                            <strong>Average Degree:</strong> {analysis.statistics.averageDegree.toFixed(2)}
                                        </div>
                                        <div className="stat-item">
                                            <strong>Graph Density:</strong> {analysis.statistics.density.toFixed(3)}
                                        </div>
                                        
                                        <div className="mt-3">
                                            <strong>Node Types:</strong>
                                            <ul className="list-unstyled ms-3">
                                                {analysis.statistics.nodeTypes.map(type => (
                                                    <li key={type}>{type}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                        <div className="mt-3">
                                            <strong>Relation Types:</strong>
                                            <ul className="list-unstyled ms-3">
                                                {analysis.statistics.relationTypes.map(relation => (
                                                    <li key={relation}>{relation}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                        {analysis.suggestions.length > 0 && (
                                            <div className="mt-3">
                                                <strong>Suggestions:</strong>
                                                <ul className="list-unstyled ms-3">
                                                    {analysis.suggestions.map((suggestion, index) => (
                                                        <li key={index} className="text-muted">{suggestion}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    )}
                    
                    {queryResults && (
                        <Col lg={6}>
                            <Card>
                                <Card.Header className="bg-secondary text-white">
                                    <h6 className="mb-0">
                                        <Search size={18} className="me-2" />
                                        Query Results
                                    </h6>
                                </Card.Header>
                                <Card.Body>
                                    <pre className="query-results">
                                        {JSON.stringify(queryResults, null, 2)}
                                    </pre>
                                </Card.Body>
                            </Card>
                        </Col>
                    )}
                </Row>
            )}

            {/* Query Form */}
            {graphData && (
                <Row className="mt-4">
                    <Col>
                        <Card>
                            <Card.Header>
                                <h6 className="mb-0">Advanced Query</h6>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label>Query Type</Form.Label>
                                            <Form.Select 
                                                value={query.type} 
                                                onChange={(e) => setQuery({...query, type: e.target.value})}
                                            >
                                                <option value="nodes_by_type">Nodes by Type</option>
                                                <option value="edges_by_relation">Edges by Relation</option>
                                                <option value="node_neighbors">Node Neighbors</option>
                                                <option value="search_nodes">Search Nodes</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label>Value</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={query.value}
                                                onChange={(e) => setQuery({...query, value: e.target.value})}
                                                placeholder="Enter query value..."
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label>Actions</Form.Label>
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    variant="primary" 
                                                    onClick={queryGraph}
                                                    className="w-100"
                                                >
                                                    Execute Query
                                                </Button>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Help Modal */}
            <Modal show={showHelp} onHide={() => setShowHelp(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Knowledge Graph Builder Help</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h6>How it works:</h6>
                    <ol>
                        <li><strong>Input Text:</strong> Enter unstructured text containing entities and relationships</li>
                        <li><strong>Process:</strong> The system uses NLP to extract entities (people, organizations, etc.) and relationships</li>
                        <li><strong>Graph:</strong> Entities become nodes, relationships become edges in a knowledge graph</li>
                        <li><strong>Analyze:</strong> Get insights about graph structure and connectivity</li>
                        <li><strong>Query:</strong> Search for specific patterns in the knowledge graph</li>
                    </ol>
                    
                    <h6>Example Text:</h6>
                    <p>"Apple Inc. is a technology company. Tim Cook is the CEO of Apple. Apple develops the iPhone."</p>
                    
                    <h6>Expected Output:</h6>
                    <ul>
                        <li>Nodes: Apple Inc., Tim Cook, iPhone</li>
                        <li>Edges: (Apple Inc., is, technology company), (Tim Cook, is CEO of, Apple), (Apple, develops, iPhone)</li>
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowHelp(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Node Editor Modal */}
            <Modal show={showNodeEditor} onHide={() => setShowNodeEditor(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Node</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedNode && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Label</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editingNode.label}
                                    onChange={(e) =>
                                        setEditingNode((prev) => ({
                                            ...prev,
                                            label: e.target.value,
                                        }))
                                    }
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Type</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editingNode.type}
                                    onChange={(e) =>
                                        setEditingNode((prev) => ({
                                            ...prev,
                                            type: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g., Organization, Person, Concept"
                                />
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowNodeEditor(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveNode}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default KnowledgeGraphPage;
