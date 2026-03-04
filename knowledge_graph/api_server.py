#!/usr/bin/env python3
"""
Knowledge Graph API Server

This script provides a command-line interface to the NLP pipeline and knowledge graph
construction system. It can be called from the Node.js backend to process text
and return structured knowledge graphs.
"""

import sys
import json
import argparse
import logging

# Attempt to import spaCy with clear error guidance if missing
try:
    import spacy
except ImportError as ie:
    sys.stderr.write("Error: spaCy is not installed.\n")
    sys.stderr.write("Please run `pip install -r requirements.txt` and then\n")
    sys.stderr.write("`python -m spacy download en_core_web_sm` to obtain the default model.\n")
    sys.stderr.write(f"Original import error: {ie}\n")
    sys.exit(1)

from pathlib import Path

# Add the knowledge_graph module to the path
sys.path.append(str(Path(__file__).parent))

from nlp_pipeline import NLPPipeline
from graph_constructor import KnowledgeGraph

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class KnowledgeGraphAPI:
    """API for knowledge graph processing"""
    
    def __init__(self):
        self.pipeline = NLPPipeline()
        self.graph = KnowledgeGraph()
    
    def process_text(self, text: str) -> dict:
        """Process text and return knowledge graph"""
        try:
            logger.info(f"Processing text: {text[:100000]}...")
            
            # Extract triples using NLP pipeline
            triples = self.pipeline.process_text(text)
            
            # Build knowledge graph
            self.graph.clear()
            self.graph.add_triples(triples)
            
            # Get graph data for frontend
            graph_data = self.graph.to_json()
            
            # Add processing metadata
            graph_data['metadata']['source_texts'] = [text]
            graph_data['metadata']['processing_stats'] = {
                'input_length': len(text),
                'triples_extracted': len(triples),
                'nodes_created': self.graph.graph.number_of_nodes(),
                'edges_created': self.graph.graph.number_of_edges()
            }
            
            result = {
                'success': True,
                'message': f'Processed {len(triples)} triples',
                'data': graph_data
            }
            
            logger.info(f"Successfully processed text. Created {len(triples)} triples.")
            return result
            
        except Exception as e:
            logger.error(f"Error processing text: {str(e)}")
            return {
                'success': False,
                'message': f'Error processing text: {str(e)}',
                'data': None
            }
    
    def check_dependencies(self) -> dict:
        """Check if all required dependencies are available"""
        try:
            # Test spaCy model
            try:
                nlp = spacy.load("en_core_web_sm")
                spacy_status = "Available"
            except OSError:
                spacy_status = "Model 'en_core_web_sm' not found. Install with: python -m spacy download en_core_web_sm"
            except ImportError:
                spacy_status = "spaCy not installed. Install with: pip install spacy"
            
            # Test other dependencies
            dependencies = {
                'spacy': spacy_status,
                'networkx': self._check_import('networkx'),
                'nltk': self._check_import('nltk'),
                'transformers': self._check_import('transformers'),
                'torch': self._check_import('torch')
            }
            
            all_available = all(status == "Available" for status in dependencies.values())
            
            return {
                'success': all_available,
                'message': 'Dependencies check completed',
                'data': dependencies
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Error checking dependencies: {str(e)}',
                'data': None
            }
    
    def _check_import(self, module_name: str) -> str:
        """Check if a module can be imported"""
        try:
            __import__(module_name)
            return "Available"
        except ImportError:
            return f"{module_name} not installed. Install with: pip install {module_name}"
    
    def load_graph_from_file(self, file_path: str) -> dict:
        """Load a knowledge graph from a JSON file"""
        try:
            self.graph.load_from_file(file_path)
            graph_data = self.graph.to_json()
            
            return {
                'success': True,
                'message': f'Loaded graph from {file_path}',
                'data': graph_data
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Error loading graph: {str(e)}',
                'data': None
            }
    
    def save_graph_to_file(self, graph_data: dict, file_path: str) -> dict:
        """Save a knowledge graph to a JSON file"""
        try:
            # Create a new graph and populate it with data
            kg = KnowledgeGraph()
            
            # Add nodes
            for node_data in graph_data.get('nodes', []):
                kg.graph.add_node(node_data['id'], **node_data)
            
            # Add edges
            for edge_data in graph_data.get('edges', []):
                kg.graph.add_edge(edge_data['source'], edge_data['target'], **edge_data)
            
            # Save to file
            kg.save_to_file(file_path)
            
            return {
                'success': True,
                'message': f'Graph saved to {file_path}',
                'data': None
            }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Error saving graph: {str(e)}',
                'data': None
            }

def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(description='Knowledge Graph API Server')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Process text command
    process_parser = subparsers.add_parser('process_text', help='Process text and extract knowledge graph')
    # Allow either an input file or inline text via --text. Output file is optional when --text is used,
    # but we still accept positional args for backward compatibility.
    process_parser.add_argument('input_file', nargs='?', help='Path to input text file (optional if --text is used)')
    process_parser.add_argument('output_file', nargs='?', help='Path to output JSON file')
    process_parser.add_argument('--text', dest='text', help='Direct text input to process (use quotes)')
    
    # Check dependencies command
    check_parser = subparsers.add_parser('check_dependencies', help='Check if all dependencies are available')

    # Install dependencies command
    install_parser = subparsers.add_parser('install_dependencies', help='Attempt to install required Python packages and models')
    
    # Load graph command
    load_parser = subparsers.add_parser('load_graph', help='Load graph from file')
    load_parser.add_argument('input_file', help='Path to input JSON file')
    load_parser.add_argument('output_file', help='Path to output JSON file')
    
    # Save graph command
    save_parser = subparsers.add_parser('save_graph', help='Save graph to file')
    save_parser.add_argument('input_file', help='Path to input JSON file with graph data')
    save_parser.add_argument('output_file', help='Path to output JSON file')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    api = KnowledgeGraphAPI()
    
    if args.command == 'process_text':
        try:
            # Determine source of text: --text takes precedence
            if getattr(args, 'text', None):
                text = args.text
                if not getattr(args, 'output_file', None):
                    print("Error: output_file is required when using --text", file=sys.stderr)
                    sys.exit(1)
                out_path = args.output_file
            else:
                # Fallback to reading from input_file
                if not getattr(args, 'input_file', None) or not getattr(args, 'output_file', None):
                    print("Error: input_file and output_file are required when --text is not provided", file=sys.stderr)
                    sys.exit(1)

                input_path = args.input_file
                out_path = args.output_file

                # Read input text from file
                try:
                    with open(input_path, 'r', encoding='utf-8') as f:
                        text = f.read()
                except FileNotFoundError:
                    print(f"Error: Input file not found: {input_path}", file=sys.stderr)
                    sys.exit(1)

            # Process text
            result = api.process_text(text)

            # Write output
            try:
                with open(out_path, 'w', encoding='utf-8') as f:
                    json.dump(result, f, indent=2, ensure_ascii=False)
                print(f"Successfully processed text and saved to {out_path}")
            except Exception as e:
                print(f"Error writing output file {out_path}: {e}", file=sys.stderr)
                sys.exit(1)

        except Exception as e:
            print(f"Error: {str(e)}", file=sys.stderr)
            sys.exit(1)
    
    elif args.command == 'check_dependencies':
        result = api.check_dependencies()
        print(json.dumps(result, indent=2, ensure_ascii=False))
    
    elif args.command == 'install_dependencies':
        # try to install requirements and spaCy model
        print('Installing Python dependencies...')
        try:
            import subprocess
            # install packages
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', str(Path(__file__).parent.parent / 'requirements.txt')])
            print('Python packages installed successfully.')
            print('Downloading spaCy English model...')
            subprocess.check_call([sys.executable, '-m', 'spacy', 'download', 'en_core_web_sm'])
            print('spaCy model installation complete.')
        except Exception as e:
            print(f'Error during installation: {e}', file=sys.stderr)
            sys.exit(1)
    
    elif args.command == 'load_graph':
        result = api.load_graph_from_file(args.input_file)
        with open(args.output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"Graph loaded and saved to {args.output_file}")
    
    elif args.command == 'save_graph':
        try:
            # Read graph data
            with open(args.input_file, 'r', encoding='utf-8') as f:
                graph_data = json.load(f)
            
            # Save graph
            result = api.save_graph_to_file(graph_data, args.output_file)
            
            # Write result
            with open(args.output_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            
            print(f"Graph saved to {args.output_file}")
            
        except Exception as e:
            print(f"Error: {str(e)}", file=sys.stderr)
            sys.exit(1)

if __name__ == '__main__':
    main()