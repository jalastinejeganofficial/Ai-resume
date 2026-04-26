import { useState } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Zap } from 'lucide-react';

export default function BulkAnalysisPage() {
  const [selectedCompany, setSelectedCompany] = useState('google');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumes, setResumes] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const companies = [
    { id: 'google', name: 'Google', logo: '🔍', color: 'from-blue-600 to-red-600' },
    { id: 'microsoft', name: 'Microsoft', logo: '⬜', color: 'from-blue-600 to-cyan-600' },
    { id: 'amazon', name: 'Amazon', logo: '🔶', color: 'from-orange-600 to-yellow-600' },
    { id: 'apple', name: 'Apple', logo: '🍎', color: 'from-gray-600 to-black' },
    { id: 'meta', name: 'Meta', logo: 'f', color: 'from-blue-600 to-blue-800' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResumes(Array.from(e.target.files));
    }
  };

  const handleAnalyze = async () => {
    if (!selectedCompany || !jobTitle || !jobDescription || resumes.length === 0) {
      alert('Please fill in all fields and select resumes');
      return;
    }

    setAnalyzing(true);
    
    // Simulate bulk analysis
    const mockResults = resumes.map((file, idx) => ({
      name: file.name,
      company: selectedCompany,
      jobTitle: jobTitle,
      score: Math.floor(Math.random() * 40 + 50),
      skills_match: Math.floor(Math.random() * 100),
      experience_match: Math.floor(Math.random() * 100),
      bias_flag: Math.random() > 0.8,
    }));

    setTimeout(() => {
      setResults(mockResults);
      setShowResults(true);
      setAnalyzing(false);
    }, 2000);
  };

  const handleDownloadResults = () => {
    const csv = [
      ['Resume', 'Company', 'Job Title', 'Overall Score', 'Skills Match', 'Experience Match', 'Bias Flag'],
      ...results.map(r => [
        r.name,
        r.company,
        r.jobTitle,
        r.score,
        r.skills_match,
        r.experience_match,
        r.bias_flag ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-analysis-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const topCandidates = results
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Zap className="h-6 w-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">Bulk Resume Analysis</h1>
          </div>
          <p className="text-sm sm:text-base text-purple-100">Analyze multiple resumes at once for company-specific roles</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!showResults ? (
          <>
            {/* Company Selection */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Target Company</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => setSelectedCompany(company.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      selectedCompany === company.id
                        ? `border-purple-600 bg-purple-50 shadow-lg`
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-3xl mb-2">{company.logo}</div>
                    <p className={`font-semibold text-sm ${
                      selectedCompany === company.id
                        ? 'text-purple-600'
                        : 'text-gray-700'
                    }`}>
                      {company.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Title</h3>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Number of Resumes</h3>
                <div className="text-3xl font-bold text-purple-600">{resumes.length}</div>
                <p className="text-sm text-gray-600 mt-2">resumes selected</p>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description..."
                className="w-full h-40 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Resumes</h3>
              <label className="block">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer">
                  <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-base sm:text-lg font-medium text-gray-700 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">PDF or DOCX files</p>
                </div>
              </label>
              {resumes.length > 0 && (
                <div className="mt-4 space-y-2">
                  {resumes.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                      <FileText className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={analyzing || resumes.length === 0}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing {resumes.length} Resumes...
                </span>
              ) : (
                'Start Bulk Analysis'
              )}
            </button>
          </>
        ) : (
          <>
            {/* Results */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
                <button
                  onClick={handleDownloadResults}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download CSV
                </button>
              </div>

              {/* Top Candidates */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top {Math.min(10, topCandidates.length)} Candidates</h3>
                <div className="space-y-3">
                  {topCandidates.map((candidate, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <p className="font-medium text-gray-900">{candidate.name}</p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          <span>Skills: {candidate.skills_match}%</span>
                          <span>Experience: {candidate.experience_match}%</span>
                          {candidate.bias_flag && (
                            <span className="text-orange-600 font-medium flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Bias Detected
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-600">{candidate.score}%</div>
                        <p className="text-xs text-gray-600">Match Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Results Table */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 overflow-x-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Results ({results.length} total)</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Resume</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Score</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Skills</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Experience</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900">Bias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700 truncate">{result.name}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                            {result.score}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">{result.skills_match}%</td>
                        <td className="py-3 px-4 text-center text-gray-600">{result.experience_match}%</td>
                        <td className="py-3 px-4 text-center">
                          {result.bias_flag ? (
                            <span className="text-orange-600 font-medium">⚠️ Yes</span>
                          ) : (
                            <span className="text-green-600 font-medium">✓ No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Back Button */}
              <button
                onClick={() => {
                  setShowResults(false);
                  setResults([]);
                  setResumes([]);
                }}
                className="mt-8 w-full py-3 px-6 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Analyze More Resumes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
