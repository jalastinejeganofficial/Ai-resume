import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getUserResumes, analyzeResume, getCandidateDashboard } from '../services/api';
import ResumeUpload from '../components/ResumeUpload';
import CareerIntelligence from '../components/candidate/CareerIntelligence';
import { Upload, CheckCircle, AlertCircle, Lightbulb, TrendingUp, Sparkles, Loader } from 'lucide-react';
import type { AnalysisResult } from '../types';

export default function CandidateDashboard() {
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: resumes, refetch } = useQuery({
    queryKey: ['user-resumes', 1],
    queryFn: () => getUserResumes(1),
  });

  const { data: feedbackData } = useQuery({
    queryKey: ['candidate-feedback', 1],
    queryFn: () => getCandidateDashboard(1),
  });

  const analyzeMutation = useMutation({
    mutationFn: ({ resumeId, jobDesc }: { resumeId: number; jobDesc: string }) =>
      analyzeResume(resumeId, jobDesc),
  });

  // Auto-show results when analysis completes
  useEffect(() => {
    if (analyzeMutation.isSuccess && analyzeMutation.data) {
      setShowResults(true);
    }
  }, [analyzeMutation.isSuccess, analyzeMutation.data]);

  const handleAnalyze = () => {
    if (selectedResume && jobDescription) {
      analyzeMutation.mutate({ resumeId: selectedResume, jobDesc: jobDescription });
    }
  };

  const currentAnalysis = analyzeMutation.data as AnalysisResult | undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Your Resume Profile</h1>
          <p className="text-sm sm:text-base text-blue-100">Get personalized feedback and track your career growth</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column - Upload & Analysis */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Upload Your Resume</h2>
              </div>
              
              <ResumeUpload
                userId={1}
                onUploadComplete={() => {
                  refetch();
                }}
              />
            </div>

            {resumes && resumes.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Resumes</h3>
                <div className="space-y-3">
                  {resumes.map((resume) => (
                    <button
                      key={resume.id}
                      onClick={() => setSelectedResume(resume.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedResume === resume.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{resume.file_name}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedResume && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Check Match Against Job
                </h3>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste a job description to see how well your resume matches..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={!jobDescription || analyzeMutation.isPending}
                  className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {analyzeMutation.isPending ? 'Analyzing...' : 'Check Match'}
                </button>

                {analyzeMutation.isPending && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                    <Loader className="h-4 w-4 text-blue-600 animate-spin" />
                    <p className="text-sm text-blue-800 font-medium">Analyzing your resume...</p>
                  </div>
                )}

                {analyzeMutation.isSuccess && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">Analysis complete! Check your feedback below.</p>
                  </div>
                )}

                {analyzeMutation.isError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-800 font-medium">Analysis failed. Please try again.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Feedback & Results */}
          <div className="space-y-6">
            {/* Current Analysis Results */}
            {showResults && currentAnalysis ? (
              <>
                {/* Match Score */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Match Score</h2>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="text-3xl font-bold text-blue-600">{currentAnalysis.scores.overall_score}%</span>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Skills Match</span>
                        <span className="text-sm font-semibold text-gray-900">{currentAnalysis.scores.skills_score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${currentAnalysis.scores.skills_score}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Experience Match</span>
                        <span className="text-sm font-semibold text-gray-900">{currentAnalysis.scores.experience_score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-600"
                          style={{ width: `${currentAnalysis.scores.experience_score}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Education Match</span>
                        <span className="text-sm font-semibold text-gray-900">{currentAnalysis.scores.education_score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-purple-600"
                          style={{ width: `${currentAnalysis.scores.education_score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                {currentAnalysis.feedback && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      Feedback
                    </h3>
                    <p className="text-gray-700">{currentAnalysis.feedback}</p>
                  </div>
                )}

                {/* Strengths */}
                {currentAnalysis.strengths.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Your Strengths
                    </h3>
                    <ul className="space-y-2">
                      {currentAnalysis.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-gray-700 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Areas for Improvement */}
                {currentAnalysis.improvements.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      Areas to Improve
                    </h3>
                    <ul className="space-y-2">
                      {currentAnalysis.improvements.map((improvement, idx) => (
                        <li key={idx} className="text-sm text-gray-700 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing Skills */}
                {currentAnalysis.missing_skills.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Missing Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentAnalysis.missing_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 rounded-full text-sm font-medium border border-red-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {currentAnalysis.suggestions.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      Suggestions
                    </h3>
                    <ul className="space-y-2">
                      {currentAnalysis.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-sm text-gray-700 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Career Intelligence Section */}
                {currentAnalysis.career_intelligence && Object.keys(currentAnalysis.career_intelligence).length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Career Intelligence</h2>
                    </div>
                    <CareerIntelligence analysis={currentAnalysis} />
                  </div>
                )}
              </>
            ) : feedbackData && feedbackData.length > 0 ? (
              feedbackData.map((feedback, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{feedback.position}</h3>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-600">{feedback.match_percentage}%</span>
                    </div>
                  </div>

                  {/* Strengths */}
                  {feedback.strengths.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Your Strengths
                      </h4>
                      <ul className="space-y-2">
                        {feedback.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm text-gray-700 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {feedback.improvements.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        Areas to Improve
                      </h4>
                      <ul className="space-y-2">
                        {feedback.improvements.map((improvement, idx) => (
                          <li key={idx} className="text-sm text-gray-700 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {feedback.missing_skills.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Missing Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {feedback.missing_skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {feedback.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600" />
                        Suggestions
                      </h4>
                      <ul className="space-y-2">
                        {feedback.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm text-gray-700 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No feedback yet</p>
                <p className="text-sm text-gray-500">Upload your resume and analyze it against a job to get personalized feedback</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
