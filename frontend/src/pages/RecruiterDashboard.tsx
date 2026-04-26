import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getRecruiterDashboard, getResumeDetail, analyzeResume } from '../services/api';
import ResumeUpload from '../components/ResumeUpload';
import ScoreDisplay from '../components/ScoreDisplay';
import BiasReportComponent from '../components/BiasReport';
import { Flag, Eye, Upload } from 'lucide-react';

export default function RecruiterDashboard() {
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  const { data: dashboardData, refetch } = useQuery({
    queryKey: ['recruiter-dashboard'],
    queryFn: getRecruiterDashboard,
  });

  const { data: resumeDetail } = useQuery({
    queryKey: ['resume-detail', selectedResume],
    queryFn: () => getResumeDetail(selectedResume!),
    enabled: !!selectedResume,
  });

  const analyzeMutation = useMutation({
    mutationFn: ({ resumeId, jobDesc }: { resumeId: number; jobDesc: string }) =>
      analyzeResume(resumeId, jobDesc),
    onSuccess: () => {
      refetch();
      setShowAnalysis(true);
    },
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
          <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Analyze and compare candidate resumes</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Resume List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Resumes</h2>
                <Upload className="h-5 w-5 text-gray-500" />
              </div>
              
              <ResumeUpload
                userId={1}
                onUploadComplete={() => refetch()}
              />

              <div className="mt-6 space-y-3">
                {dashboardData?.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedResume(item.id);
                      setShowAnalysis(false);
                    }}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedResume === item.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.candidate_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(item.analyzed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{item.overall_score}%</p>
                        {item.bias_flag && (
                          <span className="inline-flex items-center gap-1 text-xs text-orange-600">
                            <Flag className="h-3 w-3" />
                            Bias
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                {(!dashboardData || dashboardData.length === 0) && (
                  <p className="text-center text-gray-500 py-8">No resumes uploaded yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedResume ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a resume to view detailed analysis</p>
              </div>
            ) : (
              <>
                {/* Job Description Input */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Job Description
                  </h3>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here to analyze resume match..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <button
                    onClick={handleAnalyze}
                    disabled={!jobDescription || analyzeMutation.isPending}
                    className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze Resume'}
                  </button>
                </div>

                {/* Analysis Results */}
                {showAnalysis && resumeDetail?.analysis && (
                  <>
                    <ScoreDisplay scores={resumeDetail.analysis.scores} />
                    <BiasReportComponent report={resumeDetail.analysis.bias_report} />

                    {resumeDetail.analysis.feedback && (
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Feedback</h3>
                        <p className="text-gray-700">{resumeDetail.analysis.feedback}</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
