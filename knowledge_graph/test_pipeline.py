#!/usr/bin/env python3
"""
Test script for the NLP Pipeline and Knowledge Graph Construction
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from nlp_pipeline import NLPPipeline, Triple
from graph_constructor import KnowledgeGraph

def test_nlp_pipeline():
    """Test the NLP pipeline with sample text"""
    print("=== Testing NLP Pipeline ===")
    
    pipeline = NLPPipeline()
    
    # Test text about AI in healthcare
    test_text = """
    Artificial Intelligence (AI) is transforming the healthcare industry. 
    AI helps doctors diagnose diseases more accurately and quickly. 
    Machine learning algorithms can analyze medical images to detect cancer. 
    Google Health develops AI tools for medical professionals. 
    These technologies improve patient outcomes and reduce healthcare costs.
    """
    
    print(f"Input text: {test_text}")
    print("\nProcessing...")
    
    try:
        triples = pipeline.process_text(test_text)
        
        print(f"\nExtracted {len(triples)} triples:")
        for i, triple in enumerate(triples, 1):
            print(f"{i}. {triple}")
        
        return triples
        
    except Exception as e:
        print(f"Error in NLP pipeline: {e}")
        return []

def test_graph_construction(triples):
    """Test the knowledge graph construction"""
    print("\n=== Testing Knowledge Graph Construction ===")
    
    if not triples:
        print("No triples to process")
        return
    
    try:
        # Create knowledge graph
        graph = KnowledgeGraph()
        
        # Add triples to graph
        for triple in triples:
            graph.add_triple(triple)
        
        # Get graph statistics
        stats = graph.get_graph_statistics()
        print(f"Graph Statistics:")
        print(f"- Nodes: {stats.num_nodes}")
        print(f"- Edges: {stats.num_edges}")
        print(f"- Components: {stats.num_connected_components}")
        
        # Get all triples
        all_triples = []
        for source, target, attrs in graph.graph.edges(data=True):
            triple = Triple(subject=source, relation=attrs.get('relation', ''), obj=target)
            all_triples.append(triple)
        
        print(f"\nAll triples in graph ({len(all_triples)}):")
        for i, triple in enumerate(all_triples, 1):
            print(f"{i}. {triple}")
        
        # Test querying
        print(f"\n=== Testing Graph Queries ===")
        
        # Query by subject
        ai_triples = []
        for source, target, attrs in graph.graph.edges(data=True):
            if source.lower() == "ai":
                triple = Triple(subject=source, relation=attrs.get('relation', ''), obj=target)
                ai_triples.append(triple)
        print(f"Triples with subject 'ai' ({len(ai_triples)}):")
        for triple in ai_triples:
            print(f"  {triple}")
        
        # Query by relation
        helps_triples = []
        for source, target, attrs in graph.graph.edges(data=True):
            if attrs.get('relation', '').lower() == "help":
                triple = Triple(subject=source, relation=attrs.get('relation', ''), obj=target)
                helps_triples.append(triple)
        print(f"Triples with relation 'help' ({len(helps_triples)}):")
        for triple in helps_triples:
            print(f"  {triple}")
        
        # Query by object
        doctor_triples = []
        for source, target, attrs in graph.graph.edges(data=True):
            if target.lower() == "doctor":
                triple = Triple(subject=source, relation=attrs.get('relation', ''), obj=target)
                doctor_triples.append(triple)
        print(f"Triples with object 'doctor' ({len(doctor_triples)}):")
        for triple in doctor_triples:
            print(f"  {triple}")
        
        # Export graph data
        print(f"\n=== Testing Graph Export ===")
        
        # Export to JSON
        json_data = graph.to_json()
        print(f"JSON export successful: {len(json_data['nodes'])} nodes, {len(json_data['edges'])} edges")
        
        # Export to CSV (simulate CSV format)
        csv_lines = []
        csv_lines.append("Source,Relation,Target")
        for source, target, attrs in graph.graph.edges(data=True):
            csv_lines.append(f'"{source}","{attrs.get("relation", "")}","{target}"')
        csv_data = '\n'.join(csv_lines)
        line_count = len(csv_data.split('\n'))
        print(f"CSV export successful: {line_count} lines")
        
        return True
        
    except Exception as e:
        print(f"Error in graph construction: {e}")
        return False

def main():
    """Main test function"""
    print("Knowledge Graph NLP Pipeline Test")
    print("=" * 50)
    
    # Test NLP pipeline
    triples = test_nlp_pipeline()
    
    # Test graph construction
    success = test_graph_construction(triples)
    
    if success:
        print("\n✅ All tests passed successfully!")
        print("\nNext steps:")
        print("1. Run 'python api_server.py' to start the web API")
        print("2. Use the API endpoints to process text and build knowledge graphs")
        print("3. Integrate with frontend visualization tools like Cytoscape.js or D3.js")
    else:
        print("\n❌ Some tests failed. Please check the error messages above.")

if __name__ == "__main__":
    main()