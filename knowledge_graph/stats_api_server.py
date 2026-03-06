#!/usr/bin/env python3
"""
Knowledge Graph Statistics API Server
Exposes graph statistics and processing metrics via REST API for real-time analytics
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import logging
from pathlib import Path
from datetime import datetime
from graph_constructor import KnowledgeGraph
from nlp_pipeline import NLPPipeline

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global instances
kg = KnowledgeGraph()
nlp = NLPPipeline()

# Cache for statistics
stats_cache = {
    'graph_stats': None,
    'last_update': None,
    'metrics': {}
}

def get_graph_statistics():
    """Get current graph statistics"""
    try:
        nodes = kg.get_nodes()
        edges = kg.get_edges()
        
        stats = {
            'num_nodes': len(nodes),
            'num_edges': len(edges),
            'nodes': [{'id': node, 'type': 'entity'} for node in nodes],
            'edges': [{'source': e[0], 'target': e[1], 'relation': e[2].get('relation', 'unknown')} 
                     for e in edges],
            'last_updated': datetime.now().isoformat()
        }
        
        # Calculate additional metrics
        if len(nodes) > 0:
            total_degree = sum(len(kg.get_neighbors(node)['outgoing']) + 
                             len(kg.get_neighbors(node)['incoming']) 
                             for node in nodes)
            stats['average_degree'] = total_degree / len(nodes)
        
        # Calculate density
        if len(nodes) > 1:
            max_edges = len(nodes) * (len(nodes) - 1)
            stats['density'] = len(edges) / max_edges if max_edges > 0 else 0
        
        return stats
    except Exception as e:
        logger.error(f"Error calculating graph statistics: {e}")
        return {
            'num_nodes': 0,
            'num_edges': 0,
            'nodes': [],
            'edges': [],
            'last_updated': datetime.now().isoformat(),
            'error': str(e)
        }

@app.route('/api/graph/stats', methods=['GET'])
def graph_stats():
    """Endpoint to get knowledge graph statistics"""
    try:
        stats = get_graph_statistics()
        stats_cache['graph_stats'] = stats
        stats_cache['last_update'] = datetime.now().isoformat()
        
        return jsonify({
            'success': True,
            'data': stats
        })
    except Exception as e:
        logger.error(f"Error in graph_stats endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'data': None
        }), 500

@app.route('/api/graph/nodes', methods=['GET'])
def get_nodes():
    """Get all nodes in the knowledge graph"""
    try:
        nodes = kg.get_nodes()
        return jsonify({
            'success': True,
            'data': {
                'nodes': nodes,
                'count': len(nodes)
            }
        })
    except Exception as e:
        logger.error(f"Error getting nodes: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/graph/edges', methods=['GET'])
def get_edges():
    """Get all edges/relations in the knowledge graph"""
    try:
        edges = kg.get_edges()
        edge_list = [
            {
                'source': e[0],
                'target': e[1],
                'relation': e[2].get('relation', 'unknown'),
                'weight': e[2].get('weight', 1.0)
            }
            for e in edges
        ]
        return jsonify({
            'success': True,
            'data': {
                'edges': edge_list,
                'count': len(edge_list)
            }
        })
    except Exception as e:
        logger.error(f"Error getting edges: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/graph/relations', methods=['GET'])
def get_relations():
    """Get all relation types in the knowledge graph"""
    try:
        edges = kg.get_edges()
        relations = set()
        for e in edges:
            relation = e[2].get('relation', 'unknown')
            relations.add(relation)
        
        return jsonify({
            'success': True,
            'data': {
                'relations': list(relations),
                'count': len(relations)
            }
        })
    except Exception as e:
        logger.error(f"Error getting relations: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/graph/process', methods=['POST'])
def process_graph():
    """Process text and update knowledge graph"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        source = data.get('source', 'unknown')
        
        if not text:
            return jsonify({
                'success': False,
                'error': 'Text is required'
            }), 400
        
        # Process text through NLP pipeline
        triples = nlp.process_text(text)
        
        # Add triples to knowledge graph
        kg.clear()
        kg.add_triples(triples)
        
        # Get updated statistics
        stats = get_graph_statistics()
        stats['triples_added'] = len(triples)
        stats['source'] = source
        
        # Update cache
        stats_cache['graph_stats'] = stats
        stats_cache['last_update'] = datetime.now().isoformat()
        
        return jsonify({
            'success': True,
            'data': {
                'stats': stats,
                'triples_count': len(triples)
            }
        })
    except Exception as e:
        logger.error(f"Error processing graph: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/graph/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'cached_stats': stats_cache['graph_stats'] is not None,
        'last_update': stats_cache['last_update']
    })

@app.route('/api/metrics', methods=['GET'])
def metrics():
    """Get processing metrics"""
    try:
        stats = get_graph_statistics()
        
        # Calculate processing metrics
        metrics_data = {
            'total_nodes': stats.get('num_nodes', 0),
            'total_edges': stats.get('num_edges', 0),
            'average_degree': stats.get('average_degree', 0),
            'density': stats.get('density', 0),
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'data': metrics_data
        })
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/', methods=['GET'])
def index():
    """API documentation"""
    return jsonify({
        'name': 'Knowledge Graph Statistics API',
        'version': '1.0.0',
        'endpoints': {
            '/api/graph/stats': 'GET - Full graph statistics',
            '/api/graph/nodes': 'GET - All nodes in graph',
            '/api/graph/edges': 'GET - All edges/relations in graph',
            '/api/graph/relations': 'GET - All relation types',
            '/api/graph/process': 'POST - Process text and update graph',
            '/api/metrics': 'GET - Processing metrics',
            '/api/graph/health': 'GET - Health check'
        }
    })

if __name__ == '__main__':
    logger.info("Starting Knowledge Graph Statistics API Server on port 5001")
    app.run(debug=True, host='0.0.0.0', port=5001)
