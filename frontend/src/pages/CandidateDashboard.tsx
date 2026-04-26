import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getUserResumes, analyzeResume, getCandidateDashboard } from '../services/api';
import ResumeUpload from '../components/ResumeUpload';
import CareerIntelligence from '../components/candidate/CareerIntelligence';
import { Upload, CheckCircle, AlertCircle, Lightbulb, TrendingUp, Sparkles } from 'lucide-react';

export default function CandidateDashboard() {
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const [jobDescription, setJobDescription] = useState('');

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

  const handleAnalyze = () => {
    if (selectedResume && jobDescription) {
      analyzeMutation.mutate({ resumeId: selectedResume, jobDesc: jobDescription });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Candidate Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Get personalized feedback and improve your resume</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

                {analyzeMutation.isSuccess && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">Analysis complete! Check your feedback below.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Feedback */}
          <div className="space-y-6">
            {/* Career Intelligence Section */}
            {analyzeMutation.isSuccess && analyzeMutation.data?.career_intelligence && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Career Intelligence</h2>
                </div>
                <CareerIntelligence analysis={analyzeMutation.data} />
              </div>
            )}

            {feedbackData && feedbackData.length > 0 ? (
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
