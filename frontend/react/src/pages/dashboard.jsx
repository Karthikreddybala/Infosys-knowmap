import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import './css/dashboard.css';

function Dashboard() {
    const [sources, setSources] = useState([]);
    const [selectedSource, setSelectedSource] = useState('');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [textContent, setTextContent] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // Fetch available data sources on component mount
    useEffect(() => {
        fetchSources();
    }, []);

    const fetchSources = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/sources');
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
            const response = await fetch('http://localhost:5000/api/search', {
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

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo"></div>
                    <h2>KnowMap</h2>
                </div>

                <nav className="sidebar-nav">
                    <a href="#dashboard" className="nav-item active">
                        <span className="icon"></span>
                        <span>Dashboard</span>
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
                    </div>
                    <div className="header-right">
                        <div className="user-profile">
                            <span id="userName">User</span>
                            <div className="avatar">👤</div>
                        </div>
                    </div>
                </header>
                <div className="content">
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
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
