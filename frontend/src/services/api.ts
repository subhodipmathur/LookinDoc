import axios from 'axios';
import { DocumentListResponse, DocumentDetailResponse, DeleteResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

export const healthApi = {
  checkHealth: async (): Promise<{ status: string }> => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export const documentApi = {
  uploadDocument: async (
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<DocumentDetailResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<DocumentDetailResponse>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return response.data;
  },

  getDocuments: async (): Promise<DocumentListResponse> => {
    const response = await apiClient.get<DocumentListResponse>('/documents');
    return response.data;
  },

  getDocument: async (documentId: string): Promise<DocumentDetailResponse> => {
    const response = await apiClient.get<DocumentDetailResponse>(`/documents/${documentId}`);
    return response.data;
  },

  deleteDocument: async (documentId: string): Promise<DeleteResponse> => {
    const response = await apiClient.delete<DeleteResponse>(`/documents/${documentId}`);
    return response.data;
  },
};
