import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Modal } from 'react-bootstrap';
import AppPreview from './app-preview.jsx';
import './css/dashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function Dashboard() {
    const [sources, setSources] = useState([]);
    const [selectedSource, setSelectedSource] = useState('');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [textContent, setTextContent] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    
    // NLP Processing State
    const [nlpResults, setNLPResults] = useState(null);
    const [nlpError, setNLPError] = useState('');
    const [activeTab, setActiveTab] = useState('triples');

    // App Preview State
    const [currentPage, setCurrentPage] = useState('dashboard');

    // Cross-domain graph map view state
    const [mapNodeSearch, setMapNodeSearch] = useState('');
    const [mapSelectedNode, setMapSelectedNode] = useState(null);
    const [showMapNodeEditor, setShowMapNodeEditor] = useState(false);
    const [mapEditingNode, setMapEditingNode] = useState({ label: '', type: '' });
    const [mapHoverInfo, setMapHoverInfo] = useState(null);
    const mapGraphRef = useRef(null);

    // Fetch available data sources on component mount
    useEffect(() => {
        fetchSources();
    }, []);

    const fetchSources = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/sources`);
            const data = await response.json();
            if (data.success) {
                setSources(data.data.sources);
            }
        } catch (err) {
            console.error('Error fetching sources:', err);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!selectedSource || !query.trim()) {
            setError('Please select a source and enter a search query');
            return;
        }

        setLoading(true);
        setError('');
        setResults(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source: selectedSource,
                    query: query.trim()
                })
            });

            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setUploadedFiles(files);
    };

    const renderResults = () => {
        if (!results) return null;
        if (loading) return <Spinner animation="border" />;
        if (error) return <Alert variant="danger">{error}</Alert>;

        if (!results.success) {
            return <Alert variant="warning">{results.message}</Alert>;
        }

        return (
            <div className="results-container">
                <h4>Search Results from {results.source}</h4>
                <div className="results-content">
                    {renderSourceSpecificResults(results)}
                </div>
            </div>
        );
    };

    const renderSourceSpecificResults = (data) => {
        switch (data.source.toLowerCase()) {
            case 'wikipedia':
                return renderWikipediaResults(data.data);
            case 'arxiv':
                return renderArxivResults(data.data);
            case 'news':
            case 'newsapi':
                return renderNewsResults(data.data);
            default:
                return <p>No results available</p>;
        }
    };

    const renderWikipediaResults = (data) => {
        return (
            <Card>
                <Card.Body>
                    <Card.Title>{data.title}</Card.Title>
                    <Card.Text>{data.extract}</Card.Text>
                    {data.imageUrl && (
                        <Card.Img src={data.imageUrl} alt={data.title} style={{ maxWidth: '300px', marginBottom: '1rem' }} />
                    )}
                    <a href={data.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        Read Full Article
                    </a>
                </Card.Body>
            </Card>
        );
    };

    const renderArxivResults = (data) => {
        return (
            <div>
                {data.papers.map((paper, index) => (
                    <Card key={index} className="mb-3">
                        <Card.Body>
                            <Card.Title>{paper.title}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                                Authors: {paper.authors.join(', ')}
                            </Card.Subtitle>
                            <Card.Text>{paper.summary}</Card.Text>
                            <div className="d-flex gap-2">
                                {paper.pdfLink && (
                                    <a href={paper.pdfLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                        Download PDF
                                    </a>
                                )}
                                {paper.url && (
                                    <a href={paper.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                                        View on arXiv
                                    </a>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        );
    };

    const renderNewsResults = (data) => {
        return (
            <div>
                {data.articles.map((article, index) => (
                    <Card key={index} className="mb-3">
                        {article.imageUrl && (
                            <Card.Img variant="top" src={article.imageUrl} style={{ maxHeight: '200px', objectFit: 'cover' }} />
                        )}
                        <Card.Body>
                            <Card.Title>{article.title}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                                {article.source.name} • {new Date(article.publishedAt).toLocaleDateString()}
                            </Card.Subtitle>
                            <Card.Text>{article.description}</Card.Text>
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                Read Full Article
                            </a>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        );
    };

    // NLP Processing Functions
    const handleNLPProcess = async () => {
        if (!textContent.trim()) {
            setNLPError('Please enter some text to process');
            return;
        }

        setLoading(true);
        setNLPError('');
        setNLPResults(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/knowledge-graph/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: textContent.trim() })
            });

            // Check if response is OK before parsing JSON
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Log NLP response to console for observation
            console.log('NLP Processing Response:', result);

            if (result.success) {
                setNLPResults(result.data);
                setNLPError('');
                try {
                    window.dispatchEvent(new CustomEvent('nlpResultsUpdated', { detail: result.data }));
                } catch (e) {
                    console.warn('Failed to dispatch nlpResultsUpdated event', e);
                }
            } else {
                setNLPError(result.message || 'Failed to process text');
            }
        } catch (err) {
            console.error('NLP Processing Error:', err);
            
            // Check if it's a network error or HTML response
            if (err.message.includes('Unexpected token') && err.message.includes('<')) {
                setNLPError('Server is not responding properly. Please check if the backend server is running on http://localhost:5000');
            } else {
                setNLPError('Error connecting to server: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

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
        setTextContent(sampleText);
    };

    // Cross-domain analysis functions
    const calculateCrossDomainConnections = (graphData) => {
        if (!graphData || !graphData.nodes || !graphData.edges) {
            return 0;
        }

        const domains = {
            'Technology': ['apple', 'google', 'microsoft', 'ai', 'artificial intelligence', 'machine learning', 'cloud computing', 'blockchain', 'technology'],
            'Healthcare': ['health', 'medical', 'doctor', 'patient', 'diagnose', 'disease', 'cancer', 'telemedicine', 'healthcare', 'medical images'],
            'Finance': ['finance', 'financial', 'cryptocurrency', 'investment', 'transactions', 'markets', 'institutions', 'secure', 'data management']
        };

        // Categorize nodes by domain
        const nodeDomains = {};
        graphData.nodes.forEach(node => {
            const nodeLower = node.id.toLowerCase();
            nodeDomains[node.id] = [];
            
            Object.entries(domains).forEach(([domain, keywords]) => {
                keywords.forEach(keyword => {
                    if (nodeLower.includes(keyword)) {
                        nodeDomains[node.id].push(domain);
                    }
                });
            });
        });

        // Count cross-domain relationships
        let crossDomainCount = 0;
        graphData.edges.forEach(edge => {
            const sourceDomains = nodeDomains[edge.source] || [];
            const targetDomains = nodeDomains[edge.target] || [];
            
            sourceDomains.forEach(sDomain => {
                targetDomains.forEach(tDomain => {
                    if (sDomain !== tDomain) {
                        crossDomainCount++;
                    }
                });
            });
        });

        return crossDomainCount;
    };

    const getDomainDistribution = (graphData) => {
        if (!graphData || !graphData.nodes) {
            return [];
        }

        const domains = {
            'Technology': ['apple', 'google', 'microsoft', 'ai', 'artificial intelligence', 'machine learning', 'cloud computing', 'blockchain', 'technology'],
            'Healthcare': ['health', 'medical', 'doctor', 'patient', 'diagnose', 'disease', 'cancer', 'telemedicine', 'healthcare', 'medical images'],
            'Finance': ['finance', 'financial', 'cryptocurrency', 'investment', 'transactions', 'markets', 'institutions', 'secure', 'data management']
        };

        const domainCounts = { 'Technology': 0, 'Healthcare': 0, 'Finance': 0 };

        graphData.nodes.forEach(node => {
            const nodeLower = node.id.toLowerCase();
            
            Object.entries(domains).forEach(([domainName, keywords]) => {
                keywords.forEach(keyword => {
                    if (nodeLower.includes(keyword)) {
                        domainCounts[domainName]++;
                    }
                });
            });
        });

        return Object.entries(domainCounts)
            // .filter(([domain, count]) => count > 0)
            .map(([name, count]) => ({ name, count }));
    };

    const getCrossDomainBridges = (graphData) => {
        if (!graphData || !graphData.nodes) {
            return [];
        }

        const domains = {
            'Technology': ['apple', 'google', 'microsoft', 'ai', 'artificial intelligence', 'machine learning', 'cloud computing', 'blockchain', 'technology'],
            'Healthcare': ['health', 'medical', 'doctor', 'patient', 'diagnose', 'disease', 'cancer', 'telemedicine', 'healthcare', 'medical images'],
            'Finance': ['finance', 'financial', 'cryptocurrency', 'investment', 'transactions', 'markets', 'institutions', 'secure', 'data management']
        };

        const bridges = [];

        graphData.nodes.forEach(node => {
            const nodeLower = node.id.toLowerCase();
            const nodeDomains = [];
            
            Object.entries(domains).forEach(([domain, keywords]) => {
                keywords.forEach(keyword => {
                    if (nodeLower.includes(keyword)) {
                        nodeDomains.push(domain);
                    }
                });
            });

            if (nodeDomains.length > 1) {
                bridges.push({
                    name: node.id,
                    domains: nodeDomains
                });
            }
        });

        return bridges;
    };

    const getDomainsForNode = (nodeId) => {
        if (!nlpResults || !nlpResults.nodes) return [];
        const node = nlpResults.nodes.find((n) => n.id === nodeId);
        if (!node) return [];

        const domains = {
            Technology: ['apple', 'google', 'microsoft', 'ai', 'artificial intelligence', 'machine learning', 'cloud computing', 'blockchain', 'technology'],
            Healthcare: ['health', 'medical', 'doctor', 'patient', 'diagnose', 'disease', 'cancer', 'telemedicine', 'healthcare', 'medical images'],
            Finance: ['finance', 'financial', 'cryptocurrency', 'investment', 'transactions', 'markets', 'institutions', 'secure', 'data management'],
        };

        const nodeLower = (node.id || '').toLowerCase();
        const nodeDomains = [];

        Object.entries(domains).forEach(([domainName, keywords]) => {
            keywords.forEach((keyword) => {
                if (nodeLower.includes(keyword)) {
                    if (!nodeDomains.includes(domainName)) {
                        nodeDomains.push(domainName);
                    }
                }
            });
        });

        return nodeDomains;
    };

    const filteredMapNodes = useMemo(() => {
        if (!nlpResults?.nodes) return [];
        const term = mapNodeSearch.trim().toLowerCase();
        if (!term) return nlpResults.nodes;
        return nlpResults.nodes.filter((n) =>
            (n.label || n.id || '').toLowerCase().includes(term) ||
            (n.type || '').toLowerCase().includes(term),
        );
    }, [nlpResults, mapNodeSearch]);

    const initializeCrossDomainGraph = (graphData, { highlightTerm = '', selectedNodeId = null } = {}) => {
        if (!graphData || !graphData.nodes || !graphData.edges) return;

        const container = mapGraphRef.current;
        if (!container) return;

        container.innerHTML = '';

        const width = container.clientWidth || 600;
        const height = container.clientHeight || 360;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        const nodes = graphData.nodes.map((n) => ({
            ...n,
            x: Math.random() * width,
            y: Math.random() * height,
        }));
        const edges = graphData.edges || [];

        const adjacency = {};
        edges.forEach((edge) => {
            const list = adjacency[edge.source] || [];
            list.push(edge);
            adjacency[edge.source] = list;
            const listTarget = adjacency[edge.target] || [];
            listTarget.push(edge);
            adjacency[edge.target] = listTarget;
        });

        edges.forEach((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', sourceNode.x);
            line.setAttribute('y1', sourceNode.y);
            line.setAttribute('x2', targetNode.x);
            line.setAttribute('y2', targetNode.y);
            line.setAttribute('stroke', '#94a3b8');
            line.setAttribute('stroke-width', '1.5');
            line.setAttribute('opacity', '0.8');
            svg.appendChild(line);
        });

        nodes.forEach((node) => {
            const isMatch =
                highlightTerm &&
                ((node.label || node.id || '').toLowerCase().includes(highlightTerm) ||
                    (node.type || '').toLowerCase().includes(highlightTerm));
            const isSelected = selectedNodeId && node.id === selectedNodeId;

            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.style.cursor = 'pointer';

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', isSelected ? 18 : 12);
            circle.setAttribute('fill', isSelected ? '#0ea5e9' : isMatch ? '#22c55e' : '#6366f1');
            circle.setAttribute('stroke', isSelected ? '#f97316' : '#e5e7eb');
            circle.setAttribute('stroke-width', isSelected ? '3' : '2');

            group.addEventListener('mouseenter', () => {
                circle.setAttribute('r', isSelected ? 20 : 14);

                const nodeDomains = getDomainsForNode(node.id);
                const relatedEdges = adjacency[node.id] || [];

                const connections = relatedEdges.slice(0, 6).map((edge) => {
                    const otherId = edge.source === node.id ? edge.target : edge.source;
                    const otherNode = nodes.find((n) => n.id === otherId);
                    const otherLabel = otherNode?.label || otherId;
                    return {
                        relation: edge.relation,
                        otherLabel,
                    };
                });

                setMapHoverInfo({
                    nodeLabel: node.label || node.id,
                    nodeType: node.type || '',
                    domains: nodeDomains,
                    source: selectedSource || 'Cross-domain text',
                    connections,
                });
            });
            group.addEventListener('mouseleave', () => {
                circle.setAttribute('r', isSelected ? 18 : 12);
            });

            group.addEventListener('click', () => {
                setMapSelectedNode(node);
                setMapEditingNode({ label: node.label || node.id, type: node.type || '' });
                setShowMapNodeEditor(true);
            });

            group.appendChild(circle);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', node.x + 16);
            label.setAttribute('y', node.y + 4);
            label.setAttribute('font-size', '11');
            label.setAttribute('fill', '#0f172a');
            label.textContent = node.label || node.id;
            group.appendChild(label);

            svg.appendChild(group);
        });

        container.appendChild(svg);
    };

    useEffect(() => {
        if (nlpResults && nlpResults.nodes && nlpResults.edges) {
            const term = mapNodeSearch.trim().toLowerCase();
            const selectedId = mapSelectedNode?.id ?? null;
            initializeCrossDomainGraph(nlpResults, { highlightTerm: term, selectedNodeId: selectedId });
        }
    }, [nlpResults, mapNodeSearch, mapSelectedNode]);

    const handleSaveMapNode = () => {
        if (!mapSelectedNode || !nlpResults) {
            setShowMapNodeEditor(false);
            return;
        }

        const updatedNodes = (nlpResults.nodes || []).map((n) =>
            n.id === mapSelectedNode.id
                ? {
                      ...n,
                      label: mapEditingNode.label || n.label,
                      type: mapEditingNode.type || n.type,
                  }
                : n,
        );

        const updatedGraph = { ...nlpResults, nodes: updatedNodes };
        setNLPResults(updatedGraph);
        setMapSelectedNode(updatedNodes.find((n) => n.id === mapSelectedNode.id) || null);
        setShowMapNodeEditor(false);
    };

    const exportMapAsImage = () => {
        if (!mapGraphRef.current) return;
        const svg = mapGraphRef.current.querySelector('svg');
        if (!svg) return;

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const image = new Image();
        const width = parseInt(svg.getAttribute('width') || '800', 10);
        const height = parseInt(svg.getAttribute('height') || '600', 10);
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(image, 0, 0);

            canvas.toBlob((canvasBlob) => {
                if (!canvasBlob) return;
                const pngUrl = URL.createObjectURL(canvasBlob);
                const link = document.createElement('a');
                link.href = pngUrl;
                link.download = 'cross-domain-graph.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(pngUrl);
                URL.revokeObjectURL(url);
            });
        };
        image.src = url;
    };

    const renderNLPResults = () => {
        if (!nlpResults) return null;

        switch (activeTab) {
            case 'triples':
                return (
                    <div className="triples-section">
                        <h5>Extracted Triples</h5>
                        {nlpResults.nodes && nlpResults.edges ? (
                            <div className="triples-list">
                                {nlpResults.edges.map((edge, index) => (
                                    <div key={index} className="triple-item">
                                        <span className="triple-subject">{edge.source}</span>
                                        <span className="triple-relation">→ {edge.relation} →</span>
                                        <span className="triple-object">{edge.target}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No triples extracted</p>
                        )}
                    </div>
                );
            
            case 'entities':
                return (
                    <div className="entities-section">
                        <h5>Extracted Entities</h5>
                        {nlpResults.nodes ? (
                            <div className="entities-list">
                                {nlpResults.nodes.map((node, index) => (
                                    <div key={index} className="entity-item">
                                        <strong>{node.label}</strong>
                                        <span className="entity-type">({node.type})</span>
                                        <span className="entity-degree">Degree: {node.degree}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No entities extracted</p>
                        )}
                    </div>
                );
            
            case 'relations':
                return (
                    <div className="relations-section">
                        <h5>Relationship Types</h5>
                        {nlpResults.edges ? (
                            <div className="relations-list">
                                {Object.entries(
                                    nlpResults.edges.reduce((acc, edge) => {
                                        acc[edge.relation] = (acc[edge.relation] || 0) + 1;
                                        return acc;
                                    }, {})
                                ).map(([relation, count], index) => (
                                    <div key={index} className="relation-item">
                                        <span className="relation-name">{relation}</span>
                                        <span className="relation-count">({count} occurrences)</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No relationships extracted</p>
                        )}
                    </div>
                );
            
            case 'raw':
                return (
                    <div className="raw-response-section">
                        <h5>Raw NLP Response</h5>
                        <pre className="raw-response">
                            {JSON.stringify(nlpResults, null, 2)}
                        </pre>
                    </div>
                );
            
            default:
                return <p>Select a tab to view results</p>;
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo"></div>
                    <h2>KnowMap</h2>
                </div>

                <nav className="sidebar-nav">
                    <a href="#dashboard" className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
                        <span className="icon"></span>
                        <span>Dashboard</span>
                    </a>
                    <a href="#preview" className={`nav-item ${currentPage === 'preview' ? 'active' : ''}`} onClick={() => setCurrentPage('preview')}>
                        <span className="icon"></span>
                        <span>App Preview</span>
                    </a>
                    <a href="#sources" className="nav-item">
                        <span className="icon"></span>
                        <span>Data Sources</span>
                    </a>
                    <a href="#maps" className="nav-item">
                        <span className="icon"></span>
                        <span>My Knowledge Maps</span>
                    </a>
                    <a href="#settings" className="nav-item">
                        <span className="icon"></span>
                        <span>Settings</span>
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <button id="logoutBtn" className="btn-logout">Logout</button>
                </div>
            </aside>

            <main className="main-content">
                <header className="main-header">
                    <div className="header-left">
                        <h1 id="pageTitle">Welcome to KnowMap</h1>
                        <p id="pageSubtitle">Select your data sources and create knowledge maps</p>
                        <div className="preview-link" style={{marginTop: '8px'}}>
                            <Button variant="outline-primary" size="sm" onClick={() => setCurrentPage('preview')}>
                                Open App Preview
                            </Button>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="user-profile">
                            <span id="userName">User</span>
                            <div className="avatar">👤</div>
                        </div>
                    </div>
                </header>
                <div className="content">
                    {currentPage === 'preview' && <AppPreview />}
                    {currentPage === 'dashboard' && (
                    <>
                    <section id="dashboardSection" className="section active">
                        <div className="section-header">
                            <h2>Dataset Selection</h2>
                            <p>Choose your preferred data sources to create comprehensive knowledge maps</p>
                        </div>

                        <div className="sources-container">
                            <div id="sourcesGrid" className="sources-grid">
                                {sources.map((source, index) => (
                                    <div key={index} className="source-card">
                                        <h4>{source.charAt(0).toUpperCase() + source.slice(1)}</h4>
                                        <p>Available for search</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="quick-load">
                            <h3>Quick Select Source</h3>
                            <Form.Select 
                                value={selectedSource} 
                                onChange={(e) => setSelectedSource(e.target.value)}
                                className="quick-select"
                            >
                                <option value="">-- Select a source --</option>
                                {sources.map((source, index) => (
                                    <option key={index} value={source}>{source.charAt(0).toUpperCase() + source.slice(1)}</option>
                                ))}
                            </Form.Select>
                        </div>

                        <div className="selected-sources">
                            <h3>Selected Sources</h3>
                            <div id="selectedSourcesList" className="selected-list">
                                {selectedSource ? (
                                    <span className="badge bg-primary">{selectedSource}</span>
                                ) : (
                                    <p>No sources selected yet</p>
                                )}
                            </div>
                        </div>

                        <div className="content-input-section">
                            <h3>Content Source</h3>
                            <div className="content-input-container">
                                <div className="text-input-group">
                                    <Form.Label htmlFor="textContent">Enter Text Content:</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        id="textContent" 
                                        placeholder="Paste or type your content here..." 
                                        rows={6}
                                        value={textContent}
                                        onChange={(e) => setTextContent(e.target.value)}
                                    />
                                </div>
                                <div className="file-upload-group">
                                    <Form.Label htmlFor="fileUpload">Upload Files:</Form.Label>
                                    <Form.Control 
                                        type="file" 
                                        id="fileUpload" 
                                        multiple 
                                        accept=".pdf,.txt,.doc,.docx"
                                        onChange={handleFileUpload}
                                    />
                                    <small>Supported formats: PDF, TXT, DOC, DOCX</small>
                                    <div id="uploadedFilesList" className="uploaded-files-list">
                                        {uploadedFiles.length > 0 ? (
                                            <ul>
                                                {uploadedFiles.map((file, index) => (
                                                    <li key={index}>{file.name}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>No files uploaded yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="search-section">
                            <h3>Search Query</h3>
                            <Form onSubmit={handleSearch}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Enter your search query:</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="e.g., Artificial Intelligence, Climate Change, Quantum Computing"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit" disabled={loading || !selectedSource}>
                                    {loading ? 'Searching...' : 'Search'}
                                </Button>
                            </Form>
                        </div>

                        {error && <Alert variant="danger">{error}</Alert>}
                        {renderResults()}

                        <div className="action-buttons">
                            <Button id="createMapBtn" className="btn-primary" disabled={!results || !results.success}>
                                Create Knowledge Map
                            </Button>
                            <Button 
                                id="resetBtn" 
                                className="btn-secondary"
                                onClick={() => {
                                    setSelectedSource('');
                                    setQuery('');
                                    setResults(null);
                                    setError('');
                                    setTextContent('');
                                    setUploadedFiles([]);
                                }}
                            >
                                Reset Selection
                            </Button>
                        </div>

                        {/* Knowledge Graph Processing Section */}
                        <section id="knowledgeGraphSection" className="knowledge-graph-section">
                            <h2>Cross-Domain Knowledge Graph</h2>
                            <p>Convert your text content into structured, cross-domain knowledge graphs using NLP</p>
                            
                            <div className="nlp-actions">
                                <Button 
                                    variant="success" 
                                    onClick={handleNLPProcess}
                                    disabled={loading || !textContent.trim()}
                                    className="me-2"
                                >
                                    {loading ? 'Processing...' : 'Generate Knowledge Graph'}
                                </Button>
                                <Button 
                                    variant="info" 
                                    onClick={loadSampleText}
                                    className="me-2"
                                >
                                    Load Cross-Domain Sample
                                </Button>
                                <Button 
                                    variant="secondary"
                                    onClick={() => {
                                        const crossDomainText = `Technology Domain:
Apple Inc. develops innovative products like the iPhone and iPad. 
Google Health uses Artificial Intelligence to improve medical diagnostics. 
Microsoft Azure provides cloud computing services for healthcare organizations.

Healthcare Domain:
Artificial Intelligence helps doctors diagnose diseases more accurately and quickly. 
Machine learning algorithms can analyze medical images to detect cancer. 
Telemedicine platforms connect patients with healthcare providers remotely.

Finance Domain:
Blockchain technology enables secure financial transactions and data management. 
Cryptocurrency markets are influenced by technology company performance and news. 
Investment in AI startups is growing rapidly as institutions seek innovation.

Cross-Domain Connections:
Tech companies are investing heavily in healthcare AI applications and solutions. 
Financial institutions use blockchain for secure patient data management and transactions. 
Healthcare providers adopt cloud computing services to store and manage patient records. 
AI algorithms analyze financial markets while also improving medical image analysis.`;
                                        setTextContent(crossDomainText);
                                    }}
                                    className="me-2"
                                >
                                    Load Full Cross-Domain Example
                                </Button>
                            </div>

                            {nlpError && <Alert variant="danger">{nlpError}</Alert>}
                            
                            {nlpResults && (
                                <div className="nlp-results">
                                    <h4>Cross-Domain Knowledge Graph Results</h4>
                                    
                                    {/* Graph Statistics */}
                                    <div className="graph-stats">
                                        <div className="stat-card">
                                            <h5>Nodes</h5>
                                            <span className="stat-value">{nlpResults.nodes ? nlpResults.nodes.length : 0}</span>
                                        </div>
                                        <div className="stat-card">
                                            <h5>Edges</h5>
                                            <span className="stat-value">{nlpResults.edges ? nlpResults.edges.length : 0}</span>
                                        </div>
                                        <div className="stat-card">
                                            <h5>Cross-Domain Connections</h5>
                                            <span className="stat-value">{calculateCrossDomainConnections(nlpResults)}</span>
                                        </div>
                                    </div>

                                    {/* Map View Section */}
                                    <div className="map-view-section">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="mb-0">Graph Map View</h5>
                                            <Button
                                                size="sm"
                                                variant="outline-secondary"
                                                onClick={exportMapAsImage}
                                            >
                                                Export as Image
                                            </Button>
                                        </div>
                                        <Row>
                                            <Col md={7}>
                                                <div
                                                    ref={mapGraphRef}
                                                    className="map-graph-canvas"
                                                >
                                                    {!nlpResults.nodes?.length && (
                                                        <div className="map-graph-empty">
                                                            Run processing to visualize the graph.
                                                        </div>
                                                    )}
                                                </div>
                                            </Col>
                                            <Col md={5}>
                                                <div className="map-node-panel">
                                                    <div className="map-node-panel-header">
                                                        <span className="map-node-title">Nodes</span>
                                                        <span className="map-node-count">
                                                            {filteredMapNodes.length} of{' '}
                                                            {nlpResults.nodes ? nlpResults.nodes.length : 0}
                                                        </span>
                                                    </div>
                                                    <Form.Control
                                                        size="sm"
                                                        type="text"
                                                        value={mapNodeSearch}
                                                        onChange={(e) => setMapNodeSearch(e.target.value)}
                                                        placeholder="Search nodes by label, id, or type..."
                                                        className="mb-2"
                                                    />
                                                    <div className="map-node-list">
                                                        {filteredMapNodes.length === 0 && (
                                                            <div className="text-muted small">
                                                                No nodes match your search.
                                                            </div>
                                                        )}
                                                        {filteredMapNodes.map((node) => (
                                                            <button
                                                                key={node.id}
                                                                type="button"
                                                                className={`map-node-item ${
                                                                    mapSelectedNode?.id === node.id
                                                                        ? 'map-node-item-active'
                                                                        : ''
                                                                }`}
                                                                onClick={() => {
                                                                    setMapSelectedNode(node);
                                                                    setMapEditingNode({
                                                                        label: node.label || node.id,
                                                                        type: node.type || '',
                                                                    });
                                                                    setShowMapNodeEditor(true);
                                                                }}
                                                            >
                                                                <div className="map-node-item-content">
                                                                    <div className="map-node-label">
                                                                        {node.label || node.id}
                                                                    </div>
                                                                    <div className="map-node-meta">
                                                                        {node.type || 'Node'}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {mapSelectedNode && (
                                                        <div className="map-node-hint">
                                                            Click a node again to edit its details.
                                                        </div>
                                                    )}
                                                    {mapHoverInfo && (
                                                        <div className="map-node-hover-info">
                                                            <div className="map-node-hover-title">
                                                                {mapHoverInfo.nodeLabel}
                                                                {mapHoverInfo.nodeType && (
                                                                    <span className="map-node-hover-type">
                                                                        ({mapHoverInfo.nodeType})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="map-node-hover-source">
                                                                Source:{' '}
                                                                <strong>{mapHoverInfo.source}</strong>
                                                            </div>
                                                            {mapHoverInfo.domains?.length > 0 && (
                                                                <div className="map-node-hover-domains">
                                                                    Domains:{' '}
                                                                    {mapHoverInfo.domains.join(', ')}
                                                                </div>
                                                            )}
                                                            {mapHoverInfo.connections?.length > 0 && (
                                                                <div className="map-node-hover-connections">
                                                                    <div className="map-node-hover-connections-title">
                                                                        Example relations:
                                                                    </div>
                                                                    <ul>
                                                                        {mapHoverInfo.connections.map(
                                                                            (c, idx) => (
                                                                                <li key={idx}>
                                                                                    {c.relation} →{' '}
                                                                                    {c.otherLabel}
                                                                                </li>
                                                                            ),
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Cross-Domain Analysis */}
                                    <div className="cross-domain-analysis">
                                        <h5>Domain Distribution</h5>
                                        <div className="domain-chips">
                                            {getDomainDistribution(nlpResults).map((domain, index) => (
                                                <span key={index} className={`domain-chip ${domain.name.toLowerCase()}`}>
                                                    {domain.name}: {domain.count} entities
                                                </span>
                                            ))}
                                        </div>
                                        
                                        <h5 className="mt-3">Cross-Domain Bridges</h5>
                                        <div className="bridge-entities">
                                            {getCrossDomainBridges(nlpResults).map((entity, index) => (
                                                <span key={index} className="bridge-entity">
                                                    {entity.name} ({entity.domains.join(', ')})
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="results-tabs">
                                        <Button 
                                            variant={activeTab === 'triples' ? 'primary' : 'secondary'}
                                            onClick={() => setActiveTab('triples')}
                                        >
                                            Extracted Triples
                                        </Button>
                                        <Button 
                                            variant={activeTab === 'entities' ? 'primary' : 'secondary'}
                                            onClick={() => setActiveTab('entities')}
                                        >
                                            Entities
                                        </Button>
                                        <Button 
                                            variant={activeTab === 'relations' ? 'primary' : 'secondary'}
                                            onClick={() => setActiveTab('relations')}
                                        >
                                            Relations
                                        </Button>
                                        <Button 
                                            variant={activeTab === 'cross-domain' ? 'primary' : 'secondary'}
                                            onClick={() => setActiveTab('cross-domain')}
                                        >
                                            Cross-Domain Analysis
                                        </Button>
                                        <Button 
                                            variant={activeTab === 'raw' ? 'primary' : 'secondary'}
                                            onClick={() => setActiveTab('raw')}
                                        >
                                            Raw Response
                                        </Button>
                                    </div>
                                    
                                    <div className="results-content">
                                        {renderNLPResults()}
                                    </div>
                                </div>
                            )}
                        </section>
                    </section>
                    <section id="sourcesSection" className="section">
                        <h2>Data Sources Management</h2>
                        <p>Manage your connected data sources</p>
                    </section>

                    <section id="mapsSection" className="section">
                        <h2>My Knowledge Maps</h2>
                        <p>View and manage your knowledge maps</p>
                    </section>

                    <section id="settingsSection" className="section">
                        <h2>Settings</h2>
                        <p>Manage your account settings</p>
                    </section>
                    </>
                    )}
                </div>
            </main>

            {/* Map node editor modal */}
            <Modal show={showMapNodeEditor} onHide={() => setShowMapNodeEditor(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Node</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {mapSelectedNode && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Label</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={mapEditingNode.label}
                                    onChange={(e) =>
                                        setMapEditingNode((prev) => ({
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
                                    value={mapEditingNode.type}
                                    onChange={(e) =>
                                        setMapEditingNode((prev) => ({
                                            ...prev,
                                            type: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g., Technology, Healthcare, Finance"
                                />
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowMapNodeEditor(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveMapNode}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Dashboard;
