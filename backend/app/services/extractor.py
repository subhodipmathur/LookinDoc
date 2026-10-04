"""
Document text extraction and metadata parser.
Supports PDF (PyMuPDF), DOCX (python-docx), and TXT (multi-encoding).
"""
import io
import re
from typing import NamedTuple, Tuple
import fitz  # PyMuPDF
import docx

class DocumentExtractionError(Exception):
    """Raised when document parsing or extraction fails."""
    pass

class ExtractedDocument(NamedTuple):
    extracted_text: str
    page_count: int
    word_count: int
    sentence_count: int
    character_count: int
    file_type: str

def _count_words_and_sentences(text: str) -> Tuple[int, int, int]:
    """Calculate character count, word count, and basic sentence count."""
    char_count = len(text)
    # Tokenize words using whitespace/alphanumeric
    words = re.findall(r"\b\w+\b", text)
    word_count = len(words)
    # Simple regex sentence splitting on .!? followed by whitespace or end of string
    sentences = [s.strip() for s in re.split(r"[.!?]+(?:\s+|$)", text) if s.strip()]
    sentence_count = max(1, len(sentences)) if word_count > 0 else 0
    return char_count, word_count, sentence_count

def extract_pdf(file_bytes: bytes) -> Tuple[str, int]:
    """Extract text and page count from PDF bytes using PyMuPDF."""
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        page_count = len(doc)
        text_parts = []
        
        for page_idx in range(page_count):
            page = doc[page_idx]
            page_text = page.get_text("text")
            if page_text:
                text_parts.append(page_text.strip())
                
        doc.close()
        full_text = "\n\n".join(text_parts).strip()
        return full_text, page_count
    except Exception as e:
        raise DocumentExtractionError(f"Failed to extract text from PDF: {str(e)}") from e

def extract_docx(file_bytes: bytes) -> Tuple[str, int]:
    """Extract text from DOCX bytes using python-docx."""
    try:
        doc_stream = io.BytesIO(file_bytes)
        document = docx.Document(doc_stream)
        text_parts = []
        
        # Extract paragraph text
        for p in document.paragraphs:
            if p.text.strip():
                text_parts.append(p.text.strip())
                
        # Also extract table text
        for table in document.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    text_parts.append(row_text)
                    
        full_text = "\n\n".join(text_parts).strip()
        # Estimate pages based on word count (~350 words per page standard)
        words = re.findall(r"\b\w+\b", full_text)
        page_count = max(1, (len(words) + 349) // 350)
        return full_text, page_count
    except Exception as e:
        raise DocumentExtractionError(f"Failed to extract text from DOCX: {str(e)}") from e

def extract_txt(file_bytes: bytes) -> Tuple[str, int]:
    """Extract text from TXT bytes with multi-encoding fallback."""
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252", "iso-8859-1"]
    decoded_text = None
    
    for enc in encodings:
        try:
            decoded_text = file_bytes.decode(enc)
            break
        except UnicodeDecodeError:
            continue
            
    if decoded_text is None:
        raise DocumentExtractionError("Could not decode TXT file with standard UTF-8 or Latin encodings.")
        
    full_text = decoded_text.strip()
    words = re.findall(r"\b\w+\b", full_text)
    page_count = max(1, (len(words) + 349) // 350)
    return full_text, page_count

def extract_document(file_bytes: bytes, filename: str) -> ExtractedDocument:
    """
    Main extraction pipeline for any supported document.
    Validates file content, extracts text, calculates metrics, and verifies readable text.
    """
    if not file_bytes or len(file_bytes) == 0:
        raise DocumentExtractionError("The uploaded file is empty (0 bytes).")
        
    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
    
    if ext == ".pdf":
        file_type = "pdf"
        text, page_count = extract_pdf(file_bytes)
    elif ext in [".docx", ".doc"]:
        file_type = "docx"
        text, page_count = extract_docx(file_bytes)
    elif ext in [".txt", ".text"]:
        file_type = "txt"
        text, page_count = extract_txt(file_bytes)
    else:
        raise DocumentExtractionError(f"Unsupported file format: {ext}. Only PDF, DOCX, and TXT are supported.")
        
    if not text or not text.strip():
        raise DocumentExtractionError(
            "The document contains no readable text. It may be an image-only scanned document or empty."
        )
        
    char_count, word_count, sentence_count = _count_words_and_sentences(text)
    
    return ExtractedDocument(
        extracted_text=text,
        page_count=page_count,
        word_count=word_count,
        sentence_count=sentence_count,
        character_count=char_count,
        file_type=file_type
    )
