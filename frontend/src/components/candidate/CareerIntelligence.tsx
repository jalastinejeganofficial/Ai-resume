import React from 'react';
import { AnalysisResult } from '../../types';

interface CareerIntelligenceProps {
  analysis: AnalysisResult;
}

const CareerIntelligence: React.FC<CareerIntelligenceProps> = ({ analysis }) => {
  const { career_intelligence } = analysis;

  // Handle missing or incomplete career_intelligence data
  if (!career_intelligence || typeof career_intelligence !== 'object' || Object.keys(career_intelligence).length === 0) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
        <p className="text-yellow-800">Career intelligence data not yet available. Re-run the analysis or check back later.</p>
      </div>
    );
  }

  // Provide default values for missing fields
  const ci = {
    substance_score: career_intelligence.substance_score ?? 0,
    role_clarity: career_intelligence.role_clarity ?? 0,
    skill_depth: career_intelligence.skill_depth ?? 0,
    project_intelligence: career_intelligence.project_intelligence ?? 0,
    achievement_signals: career_intelligence.achievement_signals ?? 0,
    career_level: career_intelligence.career_level ?? 'Unknown',
    growth_trajectory: career_intelligence.growth_trajectory ?? 'Unknown',
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Exceptional';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Strong';
    if (score >= 60) return 'Competitive';
    if (score >= 50) return 'Moderate';
    if (score >= 40) return 'Developing';
    return 'Needs Work';
  };

  return (
    <div className="space-y-6">
      {/* Substance Score Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">🎯 SubstanceScore™</h3>
          <div className="text-6xl font-bold mb-2">{ci.substance_score}</div>
          <div className="text-xl font-medium">
            {getScoreLabel(ci.substance_score)}
          </div>
          <p className="text-sm mt-2 opacity-90">
            Measures actual career substance, not resume design
          </p>
        </div>
      </div>

      {/* Career Level & Trajectory */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow border">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Career Level</h4>
          <div className="text-2xl font-bold text-indigo-600">
            {ci.career_level}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Growth Trajectory</h4>
          <div className="text-xl font-bold text-green-600">
            {ci.growth_trajectory}
          </div>
        </div>
      </div>

      {/* Intelligence Dimensions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Intelligence Dimensions</h3>
        <div className="space-y-4">
          {/* Role Clarity */}
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">Role Clarity</h4>
                <p className="text-sm text-gray-600">How clear is your career direction?</p>
              </div>
              <div className="text-2xl font-bold" style={{ color: getScoreColor(ci.role_clarity) }}>
                {ci.role_clarity}%
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{ width: `${ci.role_clarity}%`, backgroundColor: getScoreColor(ci.role_clarity) }}
              ></div>
            </div>
          </div>

          {/* Skill Depth */}
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">Skill Depth</h4>
                <p className="text-sm text-gray-600">Applied expertise vs keyword listing</p>
              </div>
              <div className="text-2xl font-bold" style={{ color: getScoreColor(ci.skill_depth) }}>
                {ci.skill_depth}%
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{ width: `${ci.skill_depth}%`, backgroundColor: getScoreColor(ci.skill_depth) }}
              ></div>
            </div>
          </div>

          {/* Project Intelligence */}
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">Project Intelligence</h4>
                <p className="text-sm text-gray-600">Complexity, ownership, and impact</p>
              </div>
              <div className="text-2xl font-bold" style={{ color: getScoreColor(ci.project_intelligence) }}>
                {ci.project_intelligence}%
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{ width: `${ci.project_intelligence}%`, backgroundColor: getScoreColor(ci.project_intelligence) }}
              ></div>
            </div>
          </div>

          {/* Achievement Signals */}
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">Achievement Signals</h4>
                <p className="text-sm text-gray-600">Quantified achievements and metrics</p>
              </div>
              <div className="text-2xl font-bold" style={{ color: getScoreColor(ci.achievement_signals) }}>
                {ci.achievement_signals}%
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{ width: `${ci.achievement_signals}%`, backgroundColor: getScoreColor(ci.achievement_signals) }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Career Insights</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          {ci.substance_score >= 70 && (
            <li>✅ Your resume demonstrates strong career substance</li>
          )}
          {ci.role_clarity < 60 && (
            <li>⚠️ Consider clarifying your career direction with a focused objective</li>
          )}
          {career_intelligence.skill_depth < 60 && (
            <li>⚠️ Add more context to how you've applied your skills in projects</li>
          )}
          {career_intelligence.project_intelligence < 60 && (
            <li>⚠️ Highlight leadership and complex projects you've worked on</li>
          )}
          {career_intelligence.achievement_signals < 60 && (
            <li>⚠️ Add quantifiable achievements (%, $, numbers) to your experience</li>
          )}
          {career_intelligence.growth_trajectory === 'Rapid Growth' && (
            <li>🚀 Your career shows excellent progression!</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CareerIntelligence;
