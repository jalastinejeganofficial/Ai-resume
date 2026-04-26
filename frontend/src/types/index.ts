export interface User {
  id: number;
  email: string;
  username: string;
  role: 'candidate' | 'recruiter';
  created_at: string;
}

export interface ResumeParsed {
  name: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  experience: Array<{title_or_company: string; description: string}>;
  education: Array<{degree_or_institution: string; details: string}>;
  raw_text: string;
}

export interface Resume {
  id: number;
  user_id: number;
  file_name: string;
  parsed_data: ResumeParsed;
  uploaded_at: string;
}

export interface ScoreBreakdown {
  skills_score: number;
  experience_score: number;
  education_score: number;
  overall_score: number;
  reasoning: string;
}

export interface CareerIntelligence {
  role_clarity: number;
  skill_depth: number;
  project_intelligence: number;
  achievement_signals: number;
  substance_score: number;
  career_level: "Entry-Level" | "Mid-Level" | "Senior" | "Executive";
  growth_trajectory: "Early Career" | "Lateral Movement" | "Steady Growth" | "Rapid Growth";
}

export interface BiasReport {
  bias_score: number;
  detected_biases: string[];
  recommendations: string[];
  fairness_rating: 'High' | 'Medium' | 'Low';
}

export interface AnalysisResult {
  id: number;
  resume_id: number;
  scores: ScoreBreakdown;
  career_intelligence: CareerIntelligence;
  bias_report: BiasReport;
  feedback: string;
  strengths: string[];
  improvements: string[];
  missing_skills: string[];
  suggestions: string[];
  analyzed_at: string;
}

export interface DashboardResumeItem {
  id: number;
  candidate_name: string;
  overall_score: number;
  skills_match: number;
  bias_flag: boolean;
  analyzed_at: string;
}

export interface CandidateFeedback {
  position: string;
  match_percentage: number;
  strengths: string[];
  improvements: string[];
  missing_skills: string[];
  suggestions: string[];
}
