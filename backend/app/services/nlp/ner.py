"""
Named Entity Recognition (NER) Service using spaCy.
Detects entities: PERSON, ORG, GPE, LOC, DATE, MONEY, EVENT, PRODUCT, LAW.
Groups and calculates frequencies for structured visualization.
"""
from __future__ import annotations

from typing import List, Dict, Any
from app.services.nlp.preprocessor import get_spacy_model

# Mapping of standard spaCy NER labels to clean human-readable categories
LABEL_CATEGORIES = {
    "PERSON": "People",
    "ORG": "Organizations",
    "GPE": "Locations & Geopolitics",
    "LOC": "Locations",
    "DATE": "Dates & Times",
    "TIME": "Dates & Times",
    "MONEY": "Financial & Money",
    "EVENT": "Events",
    "PRODUCT": "Products",
    "LAW": "Laws & Regulations",
    "NORP": "Groups & Affiliations",
    "FAC": "Facilities",
    "PERCENT": "Percentages",
}

SUPPORTED_LABELS = set(LABEL_CATEGORIES.keys())

def extract_named_entities(text: str) -> List[Dict[str, Any]]:
    """
    Extract named entities with offsets and labels using spaCy.
    Returns list of dicts: entity_text, entity_label, category, start_position, end_position.
    """
    if not text or not text.strip():
        return []

    nlp = get_spacy_model()
    # Process up to 500k characters for NER efficiency
    doc = nlp(text[:500000])
    
    raw_entities = []
    frequency_map = {}

    for ent in doc.ents:
        if ent.label_ in SUPPORTED_LABELS:
            clean_text = ent.text.strip()
            # Filter single character artifacts or punctuation
            if len(clean_text) > 1:
                key = (clean_text, ent.label_)
                frequency_map[key] = frequency_map.get(key, 0) + 1
                raw_entities.append({
                    "entity_text": clean_text,
                    "entity_label": ent.label_,
                    "category": LABEL_CATEGORIES.get(ent.label_, "Other"),
                    "start_position": ent.start_char,
                    "end_position": ent.end_char,
                })

    # Attach frequency count to all entities
    for item in raw_entities:
        key = (item["entity_text"], item["entity_label"])
        item["frequency"] = frequency_map[key]

    return raw_entities

def aggregate_entities_by_category(entities: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Deduplicate entities by text and group them by categorized buckets (People, Orgs, Locations, etc.)
    sorted by frequency.
    """
    grouped: Dict[str, Dict[str, Dict[str, Any]]] = {}

    for ent in entities:
        cat = ent.get("category", "Other")
        if cat not in grouped:
            grouped[cat] = {}
            
        txt = ent["entity_text"]
        if txt not in grouped[cat]:
            grouped[cat][txt] = {
                "entity_text": txt,
                "entity_label": ent["entity_label"],
                "frequency": ent.get("frequency", 1),
                "start_position": ent["start_position"],
                "end_position": ent["end_position"],
            }

    result = {}
    for cat, items in grouped.items():
        sorted_items = sorted(items.values(), key=lambda x: x["frequency"], reverse=True)
        result[cat] = sorted_items

    return result
