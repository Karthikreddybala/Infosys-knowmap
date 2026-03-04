#!/usr/bin/env python3
"""
Simple script to process text directly and output JSON to stdout
"""

import sys
import json
import tempfile
import os
from pathlib import Path

# Add the knowledge_graph module to the path
sys.path.append(str(Path(__file__).parent))

from nlp_pipeline import NLPPipeline
from graph_constructor import KnowledgeGraph

def process_text_direct(text):
    """Process text directly and return JSON"""
    try:
        # Create NLP pipeline
        pipeline = NLPPipeline()
        
        # Extract triples
        triples = pipeline.process_text(text)
        
        # Build knowledge graph
        graph = KnowledgeGraph()
        graph.add_triples(triples)
        
        # Get graph data
        graph_data = graph.to_json()
        
        # Add processing metadata
        graph_data['metadata']['source_texts'] = [text]
        graph_data['metadata']['processing_stats'] = {
            'input_length': len(text),
            'triples_extracted': len(triples),
            'nodes_created': graph.graph.number_of_nodes(),
            'edges_created': graph.graph.number_of_edges()
        }
        
        result = {
            'success': True,
            'message': f'Processed {len(triples)} triples',
            'data': graph_data
        }
        
        return result
        
    except Exception as e:
        return {
            'success': False,
            'message': f'Error processing text: {str(e)}',
            'data': None
        }

def main():
    """Main function"""
    if len(sys.argv) != 2:
        print("Usage: python process_text.py \"your text here\"")
        sys.exit(1)
    
    text = sys.argv[1]
    result = process_text_direct(text)
    
    # Output JSON to stdout
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    main()