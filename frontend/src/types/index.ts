export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface DocumentListItem {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  processing_status: DocumentStatus | string;
  word_count?: number | null;
  page_count?: number | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentDetail extends DocumentListItem {
  storage_path?: string | null;
  extracted_text?: string | null;
  sentence_count?: number | null;
  character_count?: number | null;
}

export interface DocumentListResponse {
  documents: DocumentListItem[];
  total: number;
}

export interface DocumentDetailResponse {
  document: DocumentDetail;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface DocumentStatistics {
  character_count: number;
  word_count: number;
  sentence_count: number;
  paragraph_count: number;
  page_count: number;
  avg_sentence_length: number;
  avg_word_length: number;
  vocabulary_richness: number;
  estimated_reading_time_mins: number;
}

export interface KeywordItem {
  keyword: string;
  score: number;
  rank: number;
}

export interface EntityItem {
  entity_text: string;
  entity_label: string;
  category?: string;
  frequency?: number;
  start_position?: number;
  end_position?: number;
}

export interface ExtractiveSummary {
  summary_text: string;
  sentence_count: number;
  original_sentence_count: number;
  compression_ratio: number;
  selected_sentences?: string[];
}

export interface DocumentAnalysisResponse {
  document_id: string;
  statistics: DocumentStatistics;
  keywords: KeywordItem[];
  entities: Record<string, EntityItem[]>;
  summary: ExtractiveSummary;
}

export interface SearchResult {
  chunk_index: number;
  text: string;
  relevance_score: number;
  start_position?: number;
  end_position?: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total_results: number;
}

export interface QAResult {
  question: string;
  answer: string;
  supporting_passage: string;
  relevance_score: number;
}
