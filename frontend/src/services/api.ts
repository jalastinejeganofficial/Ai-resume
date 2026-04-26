import axios from 'axios';
import type { Resume, AnalysisResult, DashboardResumeItem, CandidateFeedback } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resume API
export const uploadResume = async (file: File, userId: number): Promise<Resume> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId.toString());
  
  const response = await api.post('/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getResume = async (resumeId: number): Promise<Resume> => {
  const response = await api.get(`/resumes/${resumeId}`);
  return response.data;
};

export const getUserResumes = async (userId: number): Promise<Resume[]> => {
  const response = await api.get(`/resumes/user/${userId}`);
  return response.data;
};

// Analysis API
export const analyzeResume = async (
  resumeId: number,
  jobDescription: string
): Promise<AnalysisResult> => {
  const response = await api.post('/analysis/analyze', {
    resume_id: resumeId,
    job_description: jobDescription,
  });
  return response.data;
};

export const checkBias = async (
  resumeId: number,
  jobDescription: string
): Promise<any> => {
  const response = await api.post('/analysis/bias-check', null, {
    params: {
      resume_id: resumeId,
      job_description: jobDescription,
    },
  });
  return response.data;
};

// Dashboard API
export const getRecruiterDashboard = async (): Promise<DashboardResumeItem[]> => {
  const response = await api.get('/dashboard/recruiter');
  return response.data;
};

export const getResumeDetail = async (resumeId: number): Promise<any> => {
  const response = await api.get(`/dashboard/resume/${resumeId}`);
  return response.data;
};

export const getCandidateDashboard = async (userId: number): Promise<CandidateFeedback[]> => {
  const response = await api.get(`/dashboard/candidate/${userId}`);
  return response.data;
};

export default api;
