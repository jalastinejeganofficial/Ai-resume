import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ScoreBreakdown } from '../types';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface ScoreDisplayProps {
  scores: ScoreBreakdown;
}

export default function ScoreDisplay({ scores }: ScoreDisplayProps) {
  const data = {
    labels: ['Skills Match', 'Experience', 'Education', 'Overall Fit'],
    datasets: [
      {
        label: 'Score',
        data: [
          scores.skills_score,
          scores.experience_score,
          scores.education_score,
          scores.overall_score,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-3xl font-bold text-blue-600">{scores.skills_score}%</p>
          <p className="text-sm text-gray-600 mt-1">Skills Match</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-3xl font-bold text-green-600">{scores.experience_score}%</p>
          <p className="text-sm text-gray-600 mt-1">Experience</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-3xl font-bold text-purple-600">{scores.education_score}%</p>
          <p className="text-sm text-gray-600 mt-1">Education</p>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <p className="text-3xl font-bold text-orange-600">{scores.overall_score}%</p>
          <p className="text-sm text-gray-600 mt-1">Overall</p>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <Radar data={data} options={options} />
      </div>

      {scores.reasoning && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Analysis</h4>
          <p className="text-sm text-gray-700">{scores.reasoning}</p>
        </div>
      )}
    </div>
  );
}
