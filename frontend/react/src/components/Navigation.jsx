import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './css/navigation.css';

function Navigation() {
    return (
        <Navbar bg="dark" expand="lg" sticky="top" className="navbar-custom">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold text-light">
                    📊 Knowledge Graph Platform
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/dashboard" className="nav-link-custom">
                            🔍 Dashboard
                        </Nav.Link>
                        <Nav.Link as={Link} to="/knowledge-graph" className="nav-link-custom">
                            🧠 Knowledge Graph
                        </Nav.Link>
                        <Nav.Link as={Link} to="/analytics" className="nav-link-custom">
                            📈 Analytics
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navigation;
