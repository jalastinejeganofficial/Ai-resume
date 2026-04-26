import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getUserResumes, analyzeResume } from '../services/api';
import ResumeUpload from '../components/ResumeUpload';
import CareerIntelligence from '../components/candidate/CareerIntelligence';
import ScoreDisplay from '../components/ScoreDisplay';
import BiasReportComponent from '../components/BiasReport';
import { Upload, TrendingUp, Sparkles, Target, Zap, Shield, FileText, ChevronRight } from 'lucide-react';
import type { AnalysisResult } from '../types';

export default function UnifiedDashboard() {
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis' | 'intelligence'>('upload');

  const { data: resumes, refetch } = useQuery({
    queryKey: ['user-resumes', 1],
    queryFn: () => getUserResumes(1),
  });

  const analyzeMutation = useMutation({
    mutationFn: ({ resumeId, jobDesc }: { resumeId: number; jobDesc: string }) =>
      analyzeResume(resumeId, jobDesc),
  });

  const handleAnalyze = () => {
    if (selectedResume && jobDescription) {
      analyzeMutation.mutate(
        { resumeId: selectedResume, jobDesc: jobDescription },
        {
          onSuccess: () => {
            setActiveTab('analysis');
          }
        }
      );
    }
  };

  const currentAnalysis = analyzeMutation.data as AnalysisResult | undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              AI Resume Intelligence Platform
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Advanced career analytics, bias detection, and semantic job matching - all in one powerful platform
            </p>
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span className="text-sm font-medium">Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Bias-Free</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-5 w-5" />
              Upload & Analyze
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              disabled={!currentAnalysis}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'analysis'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              Analysis Results
            </button>
            <button
              onClick={() => setActiveTab('intelligence')}
              disabled={!currentAnalysis?.career_intelligence}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'intelligence'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Sparkles className="h-5 w-5" />
              Career Intelligence
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-lg">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Upload Resume</h2>
                    <p className="text-sm text-gray-600">PDF or Word format supported</p>
                  </div>
                </div>
                
                <ResumeUpload userId={1} onUploadComplete={() => refetch()} />
              </div>

              {resumes && resumes.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Your Resumes
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {resumes.map((resume) => (
                      <button
                        key={resume.id}
                        onClick={() => setSelectedResume(resume.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedResume === resume.id
                            ? 'border-indigo-600 bg-indigo-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{resume.file_name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(resume.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Job Description Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Job Description</h2>
                  <p className="text-sm text-gray-600">Paste the job posting to analyze match</p>
                </div>
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here to see how well your resume matches the requirements..."
                className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-700"
              />

              <button
                onClick={handleAnalyze}
                disabled={!jobDescription || !selectedResume || analyzeMutation.isPending}
                className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {analyzeMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing with AI...
                  </span>
                ) : (
                  'Analyze Resume Match'
                )}
              </button>

              {analyzeMutation.isSuccess && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Analysis complete! Check the results tabs above.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analysis' && currentAnalysis && (
          <div className="space-y-6">
            <ScoreDisplay scores={currentAnalysis.scores} />
            
            {currentAnalysis.feedback && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                  AI Feedback
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">{currentAnalysis.feedback}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentAnalysis.strengths && currentAnalysis.strengths.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    Your Strengths
                  </h3>
                  <ul className="space-y-3">
                    {currentAnalysis.strengths.map((strength, idx) => (
                      <li key={idx} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400 text-gray-700">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentAnalysis.improvements && currentAnalysis.improvements.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Areas to Improve
                  </h3>
                  <ul className="space-y-3">
                    {currentAnalysis.improvements.map((improvement, idx) => (
                      <li key={idx} className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400 text-gray-700">
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {currentAnalysis.missing_skills && currentAnalysis.missing_skills.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Missing Skills</h3>
                <div className="flex flex-wrap gap-3">
                  {currentAnalysis.missing_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 rounded-full font-medium border border-red-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <BiasReportComponent report={currentAnalysis.bias_report} />
          </div>
        )}

        {activeTab === 'intelligence' && currentAnalysis?.career_intelligence && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Career Intelligence Report</h2>
                <p className="text-sm text-gray-600">Advanced career analytics powered by AI</p>
              </div>
            </div>
            <CareerIntelligence analysis={currentAnalysis} />
          </div>
        )}
      </div>
    </div>
  );
}
