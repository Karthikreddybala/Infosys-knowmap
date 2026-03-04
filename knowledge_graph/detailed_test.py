#!/usr/bin/env python3
"""
Detailed test script showing the complete knowledge graph construction process
"""

import sys
import os
from pathlib import Path

# Add the knowledge_graph module to the path
sys.path.append(str(Path(__file__).parent))

from nlp_pipeline import NLPPipeline, TextPreprocessor, NamedEntityRecognizer, RelationExtractor, Triple
from graph_constructor import KnowledgeGraph

def test_complete_process():
    """Test the complete knowledge graph construction process"""
    
    # Sample input text
    input_text = """
    Apple Inc. is a technology company based in California. 
    Tim Cook is the CEO of Apple. 
    Apple develops innovative products like the iPhone and iPad.
    Google is a competitor to Apple in the technology sector.
    Sundar Pichai leads Google as its CEO.
    """
    
    print("=" * 80)
    print("KNOWLEDGE GRAPH CONSTRUCTION PROCESS TEST")
    print("=" * 80)
    
    print(f"\n1. USER INPUT:")
    print(f"Raw text: {input_text.strip()}")
    
    # Step 1: Text Preprocessing
    print(f"\n2. TEXT PREPROCESSING:")
    preprocessor = TextPreprocessor()
    cleaned_text = preprocessor.clean_text(input_text)
    sentences = preprocessor.segment_sentences(cleaned_text)
    
    print(f"Cleaned text: {cleaned_text}")
    print(f"Sentences ({len(sentences)}):")
    for i, sentence in enumerate(sentences, 1):
        print(f"  {i}. {sentence}")
    
    # Step 2: Named Entity Recognition
    print(f"\n3. NAMED ENTITY RECOGNITION:")
    ner = NamedEntityRecognizer()
    
    all_entities = []
    for sentence in sentences:
        entities = ner.extract_entities(sentence)
        all_entities.extend(entities)
        if entities:
            print(f"Sentence: '{sentence}'")
            for entity in entities:
                print(f"  Entity: '{entity['text']}' (Type: {entity['label']})")
    
    print(f"Total entities found: {len(all_entities)}")
    
    # Step 3: Relation Extraction
    print(f"\n4. RELATION EXTRACTION:")
    relation_extractor = RelationExtractor()
    
    all_relations = []
    for sentence in sentences:
        entities = ner.extract_entities(sentence)
        relations = relation_extractor.extract_relations(sentence, entities)
        all_relations.extend(relations)
        if relations:
            print(f"Sentence: '{sentence}'")
            for subject, relation, obj in relations:
                print(f"  Relation: '{subject}' -> '{relation}' -> '{obj}'")
    
    print(f"Total relations found: {len(all_relations)}")
    
    # Step 4: Triple Generation
    print(f"\n5. TRIPLE GENERATION:")
    pipeline = NLPPipeline()
    triples = pipeline.process_text(input_text)
    
    print(f"Generated {len(triples)} triples:")
    for i, triple in enumerate(triples, 1):
        print(f"  {i}. {triple}")
    
    # Step 5: Graph Construction
    print(f"\n6. GRAPH CONSTRUCTION:")
    graph = KnowledgeGraph()
    graph.add_triples(triples)
    
    stats = graph.get_graph_statistics()
    print(f"Graph Statistics:")
    print(f"  Nodes: {stats.num_nodes}")
    print(f"  Edges: {stats.num_edges}")
    print(f"  Connected Components: {stats.num_connected_components}")
    print(f"  Average Degree: {stats.average_degree:.2f}")
    print(f"  Density: {stats.density:.4f}")
    
    # Step 6: Graph Analysis
    print(f"\n7. GRAPH ANALYSIS:")
    
    # Show nodes
    nodes = list(graph.graph.nodes())
    print(f"Nodes ({len(nodes)}): {nodes}")
    
    # Show edges
    edges = list(graph.graph.edges(data=True))
    print(f"Edges ({len(edges)}):")
    for source, target, attrs in edges:
        print(f"  {source} --[{attrs.get('relation', '')}]--> {target}")
    
    # Show most connected nodes
    most_connected = graph.get_most_connected_nodes(3)
    print(f"Most Connected Nodes:")
    for node, degree in most_connected:
        print(f"  {node}: degree {degree}")
    
    # Step 7: Graph Export
    print(f"\n8. GRAPH EXPORT:")
    
    # Export to JSON
    json_data = graph.to_json()
    print(f"JSON Export:")
    print(f"  Nodes: {len(json_data['nodes'])}")
    print(f"  Edges: {len(json_data['edges'])}")
    print(f"  Metadata: {len(json_data['metadata'])} fields")
    
    # Show sample node data
    if json_data['nodes']:
        sample_node = json_data['nodes'][0]
        print(f"  Sample node: {sample_node}")
    
    # Show sample edge data
    if json_data['edges']:
        sample_edge = json_data['edges'][0]
        print(f"  Sample edge: {sample_edge}")
    
    print(f"\n" + "=" * 80)
    print("PROCESS COMPLETED SUCCESSFULLY!")
    print("=" * 80)
    
    return {
        'input_text': input_text,
        'sentences': sentences,
        'entities': all_entities,
        'relations': all_relations,
        'triples': triples,
        'graph_stats': stats,
        'json_export': json_data
    }

def test_simple_example():
    """Test with a simple example"""
    print("\n" + "=" * 50)
    print("SIMPLE EXAMPLE TEST")
    print("=" * 50)
    
    simple_text = "Apple is a company. Tim Cook leads Apple."
    print(f"Input: {simple_text}")
    
    pipeline = NLPPipeline()
    triples = pipeline.process_text(simple_text)
    
    print(f"Triples extracted ({len(triples)}):")
    for triple in triples:
        print(f"  {triple}")
    
    graph = KnowledgeGraph()
    graph.add_triples(triples)
    
    print(f"Graph: {graph.graph.number_of_nodes()} nodes, {graph.graph.number_of_edges()} edges")
    
    # Show the graph structure
    print("Graph structure:")
    for source, target, attrs in graph.graph.edges(data=True):
        print(f"  {source} --[{attrs.get('relation', '')}]--> {target}")

if __name__ == "__main__":
    # Run detailed test
    result = test_complete_process()
    
    # Run simple example
    test_simple_example()
    
    print(f"\n" + "=" * 80)
    print("SUMMARY:")
    print(f"- Input text processed successfully")
    print(f"- {len(result['triples'])} triples extracted")
    print(f"- Knowledge graph created with {result['graph_stats'].num_nodes} nodes and {result['graph_stats'].num_edges} edges")
    print(f"- Graph exported to JSON format")
    print(f"- Ready for frontend visualization!")
    print("=" * 80)