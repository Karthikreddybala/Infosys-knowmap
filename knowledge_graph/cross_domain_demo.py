#!/usr/bin/env python3
"""
Cross-Domain Knowledge Graph Demonstration

This script demonstrates how the NLP pipeline can extract and link entities
and relationships across different domains (Technology, Healthcare, Finance).
"""

import sys
from pathlib import Path

# Add the knowledge_graph module to the path
sys.path.append(str(Path(__file__).parent))

from nlp_pipeline import NLPPipeline
from graph_constructor import KnowledgeGraph

def create_cross_domain_text():
    """Create sample text with cross-domain content"""
    
    cross_domain_text = """
    Technology Domain:
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
    AI algorithms analyze financial markets while also improving medical image analysis.
    """
    
    return cross_domain_text

def analyze_cross_domain_connections(graph, triples):
    """Analyze and identify cross-domain connections in the graph"""
    
    # Define domain keywords
    domains = {
        'Technology': ['apple', 'google', 'microsoft', 'ai', 'artificial intelligence', 
                      'machine learning', 'cloud computing', 'blockchain', 'technology'],
        'Healthcare': ['health', 'medical', 'doctor', 'patient', 'diagnose', 'disease', 
                      'cancer', 'telemedicine', 'healthcare', 'medical images'],
        'Finance': ['finance', 'financial', 'cryptocurrency', 'investment', 'transactions', 
                   'markets', 'institutions', 'secure', 'data management']
    }
    
    # Categorize nodes by domain
    node_domains = {}
    for node in graph.graph.nodes():
        node_lower = node.lower()
        node_domains[node] = []
        
        for domain, keywords in domains.items():
            for keyword in keywords:
                if keyword in node_lower:
                    node_domains[node].append(domain)
                    break
    
    # Find cross-domain relationships
    cross_domain_edges = []
    for source, target, attrs in graph.graph.edges(data=True):
        source_domains = node_domains.get(source, [])
        target_domains = node_domains.get(target, [])
        
        # Check if this edge connects different domains
        for s_domain in source_domains:
            for t_domain in target_domains:
                if s_domain != t_domain:
                    cross_domain_edges.append({
                        'source': source,
                        'relation': attrs.get('relation', ''),
                        'target': target,
                        'source_domain': s_domain,
                        'target_domain': t_domain
                    })
    
    return node_domains, cross_domain_edges

def demonstrate_cross_domain_linking():
    """Main demonstration of cross-domain knowledge graph linking"""
    
    print("🌐 CROSS-DOMAIN KNOWLEDGE GRAPH DEMONSTRATION")
    print("=" * 80)
    
    # Step 1: Create cross-domain text
    print("\n📝 Step 1: Cross-Domain Input Text")
    text = create_cross_domain_text()
    print(f"Text spans Technology, Healthcare, and Finance domains")
    print(f"Text length: {len(text)} characters")
    
    # Step 2: Process with NLP Pipeline
    print("\n🧠 Step 2: NLP Processing")
    pipeline = NLPPipeline()
    triples = pipeline.process_text(text)
    
    print(f"Extracted {len(triples)} triples:")
    for i, triple in enumerate(triples, 1):
        print(f"  {i:2d}. {triple}")
    
    # Step 3: Build Knowledge Graph
    print("\n📊 Step 3: Graph Construction")
    graph = KnowledgeGraph()
    graph.add_triples(triples)
    
    stats = graph.get_graph_statistics()
    print(f"Graph created:")
    print(f"  - Nodes: {stats.num_nodes}")
    print(f"  - Edges: {stats.num_edges}")
    print(f"  - Connected Components: {stats.num_connected_components}")
    
    # Step 4: Cross-Domain Analysis
    print("\n🔍 Step 4: Cross-Domain Analysis")
    node_domains, cross_domain_edges = analyze_cross_domain_connections(graph, triples)
    
    # Show domain distribution
    domain_counts = {'Technology': 0, 'Healthcare': 0, 'Finance': 0, 'Mixed': 0}
    for node, domains in node_domains.items():
        if len(domains) == 0:
            continue
        elif len(domains) == 1:
            domain_counts[domains[0]] += 1
        else:
            domain_counts['Mixed'] += 1
    
    print("Node distribution by domain:")
    for domain, count in domain_counts.items():
        if count > 0:
            print(f"  - {domain}: {count} nodes")
    
    # Step 5: Cross-Domain Relationships
    print(f"\n🔗 Step 5: Cross-Domain Relationships")
    print(f"Found {len(cross_domain_edges)} cross-domain connections:")
    
    # Group by domain pairs
    domain_pairs = {}
    for edge in cross_domain_edges:
        pair = f"{edge['source_domain']} → {edge['target_domain']}"
        if pair not in domain_pairs:
            domain_pairs[pair] = []
        domain_pairs[pair].append(edge)
    
    for pair, edges in domain_pairs.items():
        print(f"\n  {pair} ({len(edges)} connections):")
        for edge in edges[:3]:  # Show first 3 examples
            print(f"    {edge['source']} --[{edge['relation']}]--> {edge['target']}")
        if len(edges) > 3:
            print(f"    ... and {len(edges) - 3} more")
    
    # Step 6: Key Cross-Domain Entities
    print(f"\n🎯 Step 6: Key Cross-Domain Entities")
    print("Entities that bridge multiple domains:")
    
    multi_domain_nodes = {node: domains for node, domains in node_domains.items() 
                         if len(domains) > 1}
    
    for node, domains in multi_domain_nodes.items():
        print(f"  - {node}: {', '.join(domains)}")
    
    # Step 7: Graph Visualization Data
    print(f"\n🌐 Step 7: Graph Data for Visualization")
    json_data = graph.to_json()
    
    print(f"JSON export ready for frontend visualization:")
    print(f"  - {len(json_data['nodes'])} nodes with domain metadata")
    print(f"  - {len(json_data['edges'])} edges with relationship types")
    
    # Add domain information to nodes for visualization
    for node in json_data['nodes']:
        domains = node_domains.get(node['id'], [])
        if domains:
            node['domains'] = domains
            node['color'] = get_domain_color(domains[0])  # Use first domain for color
    
    # Step 8: Example Queries
    print(f"\n❓ Step 8: Example Cross-Domain Queries")
    
    # Query 1: All relationships involving AI
    ai_relations = []
    for source, target, attrs in graph.graph.edges(data=True):
        if 'ai' in source.lower() or 'ai' in target.lower() or 'intelligence' in source.lower() or 'intelligence' in target.lower():
            ai_relations.append(f"{source} --[{attrs.get('relation', '')}]--> {target}")
    
    print(f"  AI-related relationships ({len(ai_relations)}):")
    for relation in ai_relations[:5]:  # Show first 5
        print(f"    {relation}")
    if len(ai_relations) > 5:
        print(f"    ... and {len(ai_relations) - 5} more")
    
    print(f"\n✅ Cross-Domain Analysis Complete!")
    print(f"   The graph reveals connections between Technology, Healthcare, and Finance domains!")
    
    return {
        'graph': graph,
        'triples': triples,
        'node_domains': node_domains,
        'cross_domain_edges': cross_domain_edges,
        'json_data': json_data
    }

def get_domain_color(domain):
    """Get color for domain visualization"""
    colors = {
        'Technology': '#3498db',    # Blue
        'Healthcare': '#e74c3c',    # Red
        'Finance': '#f1c40f',       # Yellow
        'Mixed': '#9b59b6'          # Purple
    }
    return colors.get(domain, '#95a5a6')  # Grey default

def show_cross_domain_insights():
    """Show insights from cross-domain analysis"""
    print(f"\n" + "=" * 80)
    print("🎯 CROSS-DOMAIN INSIGHTS")
    print("=" * 80)
    
    insights = [
        "1. 🔄 **Domain Bridging**: AI serves as a key bridge between Technology and Healthcare",
        "2. 🏦 **Financial Integration**: Blockchain connects Technology with Finance applications",
        "3. ☁️ **Infrastructure Sharing**: Cloud computing supports both Healthcare and Finance",
        "4. 🎯 **Multi-Domain Entities**: Some concepts (like 'data management') span multiple domains",
        "5. 📈 **Innovation Flow**: Technology innovations rapidly spread to Healthcare and Finance",
        "6. 🔗 **Relationship Patterns**: Common verbs like 'uses', 'provides', 'enables' create cross-domain links"
    ]
    
    for insight in insights:
        print(insight)
    
    print(f"\n💡 **Visualization Tips**:")
    print("   - Use different colors for each domain")
    print("   - Highlight cross-domain edges with special styling")
    print("   - Create domain-specific node clusters")
    print("   - Show multi-domain entities with mixed colors")
    print("=" * 80)

if __name__ == "__main__":
    # Run the cross-domain demonstration
    result = demonstrate_cross_domain_linking()
    
    # Show insights
    show_cross_domain_insights()
    
    print(f"\n🚀 **Ready for Frontend Integration!**")
    print("   Use the JSON data to create interactive cross-domain visualizations!")