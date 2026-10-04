import pytest
from app.services.nlp.preprocessor import normalize_text, segment_sentences, create_document_chunks
from app.services.nlp.statistics import compute_document_statistics
from app.services.nlp.keywords import extract_tfidf_keywords
from app.services.nlp.ner import extract_named_entities, aggregate_entities_by_category
from app.services.nlp.summarizer import generate_extractive_summary
from app.services.nlp.search import search_document_chunks
from app.services.nlp.qa import answer_question_from_document

SAMPLE_NLP_DOC = (
    "Artificial Intelligence and Natural Language Processing have evolved dramatically since 2020. "
    "Dr. Alan Turing at Cambridge University laid the foundational theory of computing in London. "
    "Google and Microsoft develop sophisticated language intelligence models and tools. "
    "Renewable energy and climate initiatives received $500 million in funding in Paris. "
    "LookinDoc is a document platform that extracts keywords, analyzes statistics, and performs passage search. "
    "TF-IDF measures how important a word is to a document in a collection or corpus. "
    "Extractive summarization selects the most salient sentences without hallucinating new text."
)

def test_nlp_preprocessor_segmentation():
    norm = normalize_text(SAMPLE_NLP_DOC)
    assert len(norm) > 0
    sentences = segment_sentences(norm)
    assert len(sentences) >= 6
    chunks = create_document_chunks(norm, sentences_per_chunk=3, sentence_overlap=1)
    assert len(chunks) >= 2
    assert chunks[0].chunk_index == 0
    assert len(chunks[0].text) > 20

def test_nlp_statistics():
    stats = compute_document_statistics(SAMPLE_NLP_DOC, page_count=2)
    assert stats["word_count"] > 50
    assert stats["sentence_count"] >= 6
    assert stats["page_count"] == 2
    assert stats["avg_sentence_length"] > 0
    assert stats["vocabulary_richness"] > 0
    assert stats["estimated_reading_time_mins"] > 0

def test_nlp_keywords_tfidf():
    keywords = extract_tfidf_keywords(SAMPLE_NLP_DOC, top_n=10)
    assert len(keywords) > 0
    assert keywords[0]["rank"] == 1
    assert "score" in keywords[0]
    # Check that prominent terms like "Language", "Intelligence", "Processing", or "Document" appear
    keyword_texts = [kw["keyword"].lower() for kw in keywords]
    assert any("intelligence" in k or "processing" in k or "language" in k or "document" in k for k in keyword_texts)

def test_nlp_ner_spacy():
    entities = extract_named_entities(SAMPLE_NLP_DOC)
    assert len(entities) > 0
    entity_texts = [e["entity_text"] for e in entities]
    assert any("Google" in t or "Microsoft" in t or "Turing" in t or "London" in t or "Paris" in t or "2020" in t for t in entity_texts)
    
    grouped = aggregate_entities_by_category(entities)
    assert isinstance(grouped, dict)

def test_nlp_extractive_summarization():
    short_sum = generate_extractive_summary(SAMPLE_NLP_DOC, length_mode="short")
    med_sum = generate_extractive_summary(SAMPLE_NLP_DOC, length_mode="medium")
    detailed_sum = generate_extractive_summary(SAMPLE_NLP_DOC, length_mode="detailed")
    
    assert short_sum["sentence_count"] > 0
    assert med_sum["sentence_count"] >= short_sum["sentence_count"]
    assert detailed_sum["sentence_count"] >= med_sum["sentence_count"]
    assert 0.0 < short_sum["compression_ratio"] <= 1.0

def test_nlp_search_chunks():
    chunks = [
        {"chunk_index": 0, "text": "Renewable energy and climate initiatives received 500 million in Paris.", "start_position": 0, "end_position": 60},
        {"chunk_index": 1, "text": "Alan Turing developed computing theories in Cambridge and London.", "start_position": 61, "end_position": 120},
        {"chunk_index": 2, "text": "Natural language processing models analyze document text vectors.", "start_position": 121, "end_position": 180},
    ]
    results = search_document_chunks("renewable energy funding", chunks, top_k=2)
    assert len(results) > 0
    assert results[0]["chunk_index"] == 0
    assert results[0]["relevance_score"] > 0

def test_nlp_qa():
    chunks = [
        {"chunk_index": 0, "text": "Renewable energy received $500 million in funding in Paris.", "start_position": 0, "end_position": 50},
        {"chunk_index": 1, "text": "Alan Turing worked in London and Cambridge on artificial intelligence.", "start_position": 51, "end_position": 110},
    ]
    qa = answer_question_from_document(
        question="Where did Alan Turing work?",
        extracted_text=SAMPLE_NLP_DOC,
        chunks=chunks
    )
    assert qa["relevance_score"] > 0
    assert "Turing" in qa["supporting_passage"] or "London" in qa["supporting_passage"] or "Cambridge" in qa["supporting_passage"]
