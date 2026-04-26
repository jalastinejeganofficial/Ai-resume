import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { BiasReport } from '../types';

interface BiasReportProps {
  report: BiasReport;
}

export default function BiasReportComponent({ report }: BiasReportProps) {
  const getSeverityColor = (rating: string) => {
    switch (rating) {
      case 'High':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getIcon = (rating: string) => {
    switch (rating) {
      case 'High':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Medium':
        return <Info className="h-5 w-5 text-yellow-600" />;
      case 'Low':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Fairness & Bias Report</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(report.fairness_rating)}`}>
          {report.fairness_rating} Fairness
        </span>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Bias Score</span>
          <span className="text-sm font-bold text-gray-900">{report.bias_score.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              report.bias_score < 20
                ? 'bg-green-500'
                : report.bias_score < 50
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${report.bias_score}%` }}
          ></div>
        </div>
      </div>

      {report.detected_biases.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Detected Biases
          </h4>
          <ul className="space-y-2">
            {report.detected_biases.map((bias, index) => (
              <li key={index} className="text-sm text-gray-700 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                {bias}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {report.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-700 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.detected_biases.length === 0 && report.recommendations.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">No significant bias detected. Analysis appears fair and balanced.</p>
        </div>
      )}
    </div>
  );
}
