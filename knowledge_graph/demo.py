#!/usr/bin/env python3
"""
Simple demonstration of the knowledge graph construction process
"""

import sys
from pathlib import Path

# Add the knowledge_graph module to the path
sys.path.append(str(Path(__file__).parent))

from nlp_pipeline import NLPPipeline
from graph_constructor import KnowledgeGraph

def demonstrate_process():
    """Demonstrate the complete process with a simple example"""
    
    # Simple example text
    text = "Apple makes iPhone. Tim Cook leads Apple."
    
    print("🔍 KNOWLEDGE GRAPH CONSTRUCTION DEMO")
    print("=" * 50)
    print(f"\n📝 Input Text: {text}")
    
    # Step 1: NLP Pipeline Processing
    print(f"\n🧠 Step 1: NLP Processing")
    pipeline = NLPPipeline()
    triples = pipeline.process_text(text)
    
    print(f"   Extracted {len(triples)} triples:")
    for i, triple in enumerate(triples, 1):
        print(f"   {i}. {triple}")
    
    # Step 2: Graph Construction
    print(f"\n📊 Step 2: Graph Construction")
    graph = KnowledgeGraph()
    graph.add_triples(triples)
    
    stats = graph.get_graph_statistics()
    print(f"   Graph created:")
    print(f"   - Nodes: {stats.num_nodes}")
    print(f"   - Edges: {stats.num_edges}")
    print(f"   - Components: {stats.num_connected_components}")
    
    # Step 3: Graph Visualization Data
    print(f"\n🌐 Step 3: Graph Data for Visualization")
    json_data = graph.to_json()
    
    print(f"   Nodes for frontend:")
    for node in json_data['nodes']:
        print(f"   - {node['id']} (degree: {node['degree']})")
    
    print(f"   Edges for frontend:")
    for edge in json_data['edges']:
        print(f"   - {edge['source']} --[{edge['relation']}]--> {edge['target']}")
    
    # Step 4: Example Queries
    print(f"\n❓ Step 4: Example Queries")
    
    # Find all relationships involving "apple"
    apple_relations = []
    for source, target, attrs in graph.graph.edges(data=True):
        if 'apple' in source.lower() or 'apple' in target.lower():
            apple_relations.append(f"{source} --[{attrs.get('relation', '')}]--> {target}")
    
    print(f"   Relationships involving 'Apple':")
    for relation in apple_relations:
        print(f"   - {relation}")
    
    print(f"\n✅ Process Complete!")
    print(f"   The graph is ready to be visualized in your frontend!")
    
    return json_data

if __name__ == "__main__":
    result = demonstrate_process()
    
    print(f"\n" + "=" * 50)
    print("🎯 KEY TAKEAWAYS:")
    print("1. Raw text → Structured triples (Subject-Relation-Object)")
    print("2. Triples → NetworkX graph (nodes and edges)")
    print("3. Graph → JSON data for frontend visualization")
    print("4. Ready for tools like Cytoscape.js or D3.js!")
    print("=" * 50)