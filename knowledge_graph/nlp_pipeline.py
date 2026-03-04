"""
NLP Pipeline for Knowledge Graph Construction

This module implements the core NLP pipeline that converts unstructured text
into structured triples for knowledge graph construction.
"""

import re
import spacy
import nltk
from typing import List, Tuple, Dict, Any
from dataclasses import dataclass
from collections import defaultdict
import logging

# Download required NLTK data automatically
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Triple:
    """Represents a knowledge graph triple: (Subject, Relation, Object)"""
    subject: str
    relation: str
    obj: str
    
    def __str__(self):
        return f'("{self.subject}", "{self.relation}", "{self.obj}")'
    
    def to_dict(self):
        return {
            'subject': self.subject,
            'relation': self.relation,
            'object': self.obj
        }

class TextPreprocessor:
    """Handles text preprocessing and cleaning"""
    
    def __init__(self):
        self.stop_words = set(nltk.corpus.stopwords.words('english'))
        
    def clean_text(self, text: str) -> str:
        """Clean and normalize raw text"""
        # Remove special characters and extra whitespace
        text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Convert to lowercase
        text = text.lower()
        
        return text
    
    def segment_sentences(self, text: str) -> List[str]:
        """Split text into sentences"""
        # Simple sentence segmentation using punctuation
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        return sentences
    
    def lemmatize_text(self, text: str) -> str:
        """Perform lemmatization on text"""
        # This is a basic implementation
        # In practice, you'd use spaCy's lemmatization
        return text

class NamedEntityRecognizer:
    """Handles Named Entity Recognition using spaCy"""
    
    def __init__(self, model_name: str = "en_core_web_sm"):
        try:
            self.nlp = spacy.load(model_name)
        except OSError:
            logger.warning(f"Model {model_name} not found. Please install with: python -m spacy download {model_name}")
            self.nlp = None
    
    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract named entities from text"""
        if not self.nlp:
            return []
        
        doc = self.nlp(text)
        entities = []
        
        for ent in doc.ents:
            entities.append({
                'text': ent.text,
                'label': ent.label_,
                'start': ent.start_char,
                'end': ent.end_char
            })
        
        return entities
    
    def get_entity_types(self) -> List[str]:
        """Get list of entity types supported by the model"""
        if not self.nlp:
            return []
        return list(self.nlp.get_pipe("ner").labels)

class RelationExtractor:
    """Extracts relationships between entities using dependency parsing"""
    
    def __init__(self, model_name: str = "en_core_web_sm"):
        try:
            self.nlp = spacy.load(model_name)
        except OSError:
            logger.warning(f"Model {model_name} not found. Please install with: python -m spacy download {model_name}")
            self.nlp = None
    
    def extract_relations(self, text: str, entities: List[Dict]) -> List[Tuple[str, str, str]]:
        """Extract relationships between entities"""
        if not self.nlp:
            return []
        
        doc = self.nlp(text)
        relations = []
        
        # Find verbs and their dependencies
        for token in doc:
            if token.pos_ in ['VERB', 'AUX']:
                # Look for subject-verb-object patterns
                subject = None
                obj = None
                
                # Find subject
                for child in token.children:
                    if child.dep_ in ['nsubj', 'nsubjpass']:
                        subject = self._get_entity_span(child, entities)
                
                # Find object
                for child in token.children:
                    if child.dep_ in ['dobj', 'pobj', 'attr']:
                        obj = self._get_entity_span(child, entities)
                
                if subject and obj:
                    relations.append((subject, token.lemma_, obj))
        
        return relations
    
    def _get_entity_span(self, token, entities: List[Dict]) -> str:
        """Get the entity text that contains the given token"""
        token_start = token.idx
        token_end = token.idx + len(token.text)
        
        for entity in entities:
            if entity['start'] <= token_start and entity['end'] >= token_end:
                return entity['text']
        
        return token.text

class NLPPipeline:
    """Main NLP Pipeline class that orchestrates the entire process"""
    
    def __init__(self, model_name: str = "en_core_web_sm"):
        self.preprocessor = TextPreprocessor()
        self.ner = NamedEntityRecognizer(model_name)
        self.relation_extractor = RelationExtractor(model_name)
        
        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords')
        
        try:
            nltk.data.find('corpora/wordnet')
        except LookupError:
            nltk.download('wordnet')
    
    def process_text(self, text: str) -> List[Triple]:
        """Process raw text and extract knowledge graph triples"""
        logger.info(f"Processing text: {text[:100]}...")
        
        # Step 1: Text preprocessing
        cleaned_text = self.preprocessor.clean_text(text)
        sentences = self.preprocessor.segment_sentences(cleaned_text)
        
        all_triples = []
        
        # Process each sentence
        for sentence in sentences:
            try:
                logger.info(f"Processing sentence: {sentence}")

                # Step 2: Named Entity Recognition
                entities = self.ner.extract_entities(sentence)
                logger.info(f"Found {len(entities)} entities: {[e.get('text') for e in entities]}")

                # Step 3: Relation Extraction
                relations = self.relation_extractor.extract_relations(sentence, entities)
                logger.info(f"Found {len(relations)} relations")

                # Convert to Triples
                for subject, relation, obj in relations:
                    try:
                        triple = Triple(subject=subject, relation=relation, obj=obj)
                        all_triples.append(triple)
                    except Exception as ex:
                        logger.error(f"Failed to build Triple for relation ({subject},{relation},{obj}): {ex}")
                        continue
            except Exception as e:
                logger.error(f"Error processing sentence '{sentence}': {e}")
                # continue processing remaining sentences
                continue
        
        logger.info(f"Extracted {len(all_triples)} triples")
        return all_triples
    
    def get_supported_entities(self) -> List[str]:
        """Get list of supported entity types"""
        return self.ner.get_entity_types()

def main():
    """Example usage of the NLP pipeline"""
    pipeline = NLPPipeline()
    
    # Example text
    text = """
    Apple Inc. is a technology company based in California. 
    Tim Cook is the CEO of Apple. 
    Apple develops innovative products like the iPhone and iPad.
    """
    
    # Process the text
    triples = pipeline.process_text(text)
    
    # Print results
    print("Extracted Triples:")
    for triple in triples:
        print(triple)
    
    print(f"\nSupported Entity Types: {pipeline.get_supported_entities()}")

if __name__ == "__main__":
    main()