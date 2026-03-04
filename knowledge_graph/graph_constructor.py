"""
Knowledge Graph Constructor

This module handles the construction and management of knowledge graphs
using NetworkX. It converts extracted triples into a structured graph
that can be visualized and queried.
"""

import networkx as nx
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import json
import logging
from collections import defaultdict

from nlp_pipeline import Triple

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class GraphStats:
    """Statistics about the knowledge graph"""
    num_nodes: int
    num_edges: int
    num_connected_components: int
    average_degree: float
    density: float
    most_connected_nodes: List[Tuple[str, float]]

class KnowledgeGraph:
    """Main Knowledge Graph class using NetworkX"""
    
    def __init__(self):
        self.graph = nx.DiGraph()  # Directed graph for semantic relationships
        self.node_types = {}  # Track node types (entities)
        self.relation_types = set()  # Track relation types
        self.metadata = {
            'created_at': None,
            'source_texts': [],
            'processing_stats': {}
        }
    
    def add_triple(self, triple: Triple) -> None:
        """Add a single triple to the graph"""
        # Allow either Triple dataclass instances or plain dicts
        try:
            if isinstance(triple, dict):
                subj = triple.get('subject') or triple.get('source') or triple.get('s')
                obj = triple.get('object') or triple.get('target') or triple.get('o')
                rel = triple.get('relation') or triple.get('rel') or triple.get('predicate')
            else:
                subj = getattr(triple, 'subject', None)
                obj = getattr(triple, 'obj', None)
                rel = getattr(triple, 'relation', None)

            if not subj or not obj:
                logger.warning(f"Skipping invalid triple (missing subject/object): {triple}")
                return

            # Add nodes (entities)
            self.graph.add_node(subj, type='entity')
            self.graph.add_node(obj, type='entity')

            # Add edge (relationship)
            self.graph.add_edge(
                subj,
                obj,
                relation=rel or '',
                weight=1.0
            )

            # Track relation types
            if rel:
                self.relation_types.add(rel)

            logger.debug(f"Added triple: ({subj}, {rel}, {obj})")
        except Exception as e:
            logger.error(f"Failed to add triple {triple}: {e}")
    
    def add_triples(self, triples: List[Triple]) -> None:
        """Add multiple triples to the graph"""
        for triple in triples:
            self.add_triple(triple)
        
        logger.info(f"Added {len(triples)} triples to the graph")
    
    def get_nodes(self) -> List[str]:
        """Get all nodes in the graph"""
        return list(self.graph.nodes())
    
    def get_edges(self) -> List[Tuple[str, str, Dict]]:
        """Get all edges in the graph with their attributes"""
        return list(self.graph.edges(data=True))
    
    def get_neighbors(self, node: str) -> Dict[str, List[str]]:
        """Get neighbors of a node (both incoming and outgoing)"""
        neighbors = {
            'successors': list(self.graph.successors(node)),
            'predecessors': list(self.graph.predecessors(node))
        }
        return neighbors
    
    def get_shortest_path(self, source: str, target: str) -> Optional[List[str]]:
        """Find shortest path between two nodes"""
        try:
            path = nx.shortest_path(self.graph, source, target)
            return path
        except nx.NetworkXNoPath:
            return None
        except nx.NodeNotFound:
            return None
    
    def get_connected_components(self) -> List[List[str]]:
        """Get all connected components in the graph"""
        return list(nx.connected_components(self.graph.to_undirected()))
    
    def get_node_degree(self, node: str) -> Dict[str, int]:
        """Get in-degree and out-degree of a node"""
        return {
            'in_degree': self.graph.in_degree(node),
            'out_degree': self.graph.out_degree(node),
            'total_degree': self.graph.degree(node)
        }
    
    def get_most_connected_nodes(self, top_n: int = 10) -> List[Tuple[str, int]]:
        """Get the most connected nodes in the graph"""
        degrees = dict(self.graph.degree())
        sorted_nodes = sorted(degrees.items(), key=lambda x: x[1], reverse=True)
        return sorted_nodes[:top_n]
    
    def get_relation_statistics(self) -> Dict[str, int]:
        """Get statistics about different relation types"""
        relation_counts = defaultdict(int)
        for _, _, data in self.graph.edges(data=True):
            relation = data.get('relation', 'unknown')
            relation_counts[relation] += 1
        return dict(relation_counts)
    
    def get_graph_statistics(self) -> GraphStats:
        """Get comprehensive statistics about the graph"""
        num_nodes = self.graph.number_of_nodes()
        num_edges = self.graph.number_of_edges()
        num_components = nx.number_connected_components(self.graph.to_undirected())
        average_degree = sum(dict(self.graph.degree()).values()) / num_nodes if num_nodes > 0 else 0
        density = nx.density(self.graph)
        most_connected = self.get_most_connected_nodes(5)
        
        return GraphStats(
            num_nodes=num_nodes,
            num_edges=num_edges,
            num_connected_components=num_components,
            average_degree=average_degree,
            density=density,
            most_connected_nodes=most_connected
        )
    
    def to_json(self) -> Dict[str, Any]:
        """Convert graph to JSON format for frontend visualization"""
        nodes_data = []
        for node in self.graph.nodes():
            node_data = {
                'id': node,
                'label': node,
                'type': self.graph.nodes[node].get('type', 'entity'),
                'degree': self.graph.degree(node),
                'in_degree': self.graph.in_degree(node),
                'out_degree': self.graph.out_degree(node)
            }
            nodes_data.append(node_data)
        
        edges_data = []
        for source, target, data in self.graph.edges(data=True):
            edge_data = {
                'source': source,
                'target': target,
                'relation': data.get('relation', ''),
                'weight': data.get('weight', 1.0)
            }
            edges_data.append(edge_data)
        
        return {
            'nodes': nodes_data,
            'edges': edges_data,
            'metadata': self.metadata,
            'statistics': asdict(self.get_graph_statistics())
        }
    
    def save_to_file(self, filename: str) -> None:
        """Save graph to a file in JSON format"""
        graph_data = self.to_json()
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(graph_data, f, indent=2, ensure_ascii=False)
        logger.info(f"Graph saved to {filename}")
    
    def load_from_file(self, filename: str) -> None:
        """Load graph from a JSON file"""
        with open(filename, 'r', encoding='utf-8') as f:
            graph_data = json.load(f)
        
        # Clear existing graph
        self.graph.clear()
        self.node_types.clear()
        self.relation_types.clear()
        
        # Add nodes
        for node_data in graph_data['nodes']:
            self.graph.add_node(node_data['id'], **node_data)
        
        # Add edges
        for edge_data in graph_data['edges']:
            self.graph.add_edge(
                edge_data['source'], 
                edge_data['target'], 
                **edge_data
            )
        
        # Update metadata
        self.metadata = graph_data.get('metadata', {})
        
        logger.info(f"Graph loaded from {filename}")
    
    def merge_with(self, other_graph: 'KnowledgeGraph') -> None:
        """Merge this graph with another graph"""
        # Add all nodes from the other graph
        for node, attrs in other_graph.graph.nodes(data=True):
            if node not in self.graph:
                self.graph.add_node(node, **attrs)
        
        # Add all edges from the other graph
        for source, target, attrs in other_graph.graph.edges(data=True):
            if not self.graph.has_edge(source, target):
                self.graph.add_edge(source, target, **attrs)
            else:
                # If edge exists, increment weight
                current_weight = self.graph[source][target].get('weight', 1.0)
                self.graph[source][target]['weight'] = current_weight + attrs.get('weight', 1.0)
        
        # Update relation types
        self.relation_types.update(other_graph.relation_types)
        
        logger.info("Graphs merged successfully")
    
    def query_nodes_by_type(self, node_type: str) -> List[str]:
        """Query nodes by their type"""
        return [node for node, attrs in self.graph.nodes(data=True) 
                if attrs.get('type') == node_type]
    
    def query_edges_by_relation(self, relation: str) -> List[Tuple[str, str]]:
        """Query edges by their relation type"""
        return [(source, target) for source, target, attrs in self.graph.edges(data=True) 
                if attrs.get('relation') == relation]
    
    def get_subgraph(self, nodes: List[str]) -> 'KnowledgeGraph':
        """Get a subgraph containing only the specified nodes"""
        subgraph = self.graph.subgraph(nodes)
        new_graph = KnowledgeGraph()
        new_graph.graph = subgraph
        return new_graph
    
    def clear(self) -> None:
        """Clear all data from the graph"""
        self.graph.clear()
        self.node_types.clear()
        self.relation_types.clear()
        self.metadata = {
            'created_at': None,
            'source_texts': [],
            'processing_stats': {}
        }
        logger.info("Graph cleared")

def main():
    """Example usage of the Knowledge Graph"""
    from nlp_pipeline import NLPPipeline, Triple
    
    # Create NLP pipeline
    pipeline = NLPPipeline()
    
    # Sample text
    text = """
    Apple Inc. is a technology company based in California. 
    Tim Cook is the CEO of Apple. 
    Apple develops innovative products like the iPhone and iPad.
    Google is a competitor to Apple in the technology sector.
    Sundar Pichai leads Google as its CEO.
    """
    
    # Process text and extract triples
    triples = pipeline.process_text(text)
    
    # Create knowledge graph
    kg = KnowledgeGraph()
    kg.add_triples(triples)
    
    # Print graph statistics
    stats = kg.get_graph_statistics()
    print(f"Graph Statistics:")
    print(f"Nodes: {stats.num_nodes}")
    print(f"Edges: {stats.num_edges}")
    print(f"Connected Components: {stats.num_connected_components}")
    
    # Print relation statistics
    relation_stats = kg.get_relation_statistics()
    print(f"\nRelation Statistics: {relation_stats}")
    
    # Print most connected nodes
    most_connected = kg.get_most_connected_nodes(3)
    print(f"\nMost Connected Nodes: {most_connected}")
    
    # Save to file
    kg.save_to_file('sample_graph.json')
    print("Graph saved to sample_graph.json")

if __name__ == "__main__":
    main()