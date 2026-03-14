import React from 'react';
import { Button } from '@/components/ui/button';
import {
  X,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PlayCircle,
  Hash,
  Type,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

const StepResultIcon = ({ status }) => {
  switch (status) {
    case 'passed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'failed':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'blocked':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    default:
      return <div className="w-5 h-5 bg-gray-200 rounded-full" />;
  }
};

const StatusBadge = ({ status }) => {
  const statusStyles = {
    passed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    blocked: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
};

export default function TestSessionViewModal({ sessionData, onClose }) {
  if (!sessionData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Test Session Details</h2>
            <p className="text-sm text-gray-600 truncate">{sessionData.test_case_title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-xs text-gray-500">Tester</div>
                <div className="font-medium text-gray-800">{sessionData.tester_name}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-xs text-gray-500">Started</div>
                <div className="font-medium text-gray-800">{format(new Date(sessionData.start_time), 'Pp')}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <StatusBadge status={sessionData.status} />
              </div>
            </div>
            {sessionData.end_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                <div>
                  <div className="text-xs text-gray-500">Completed</div>
                  <div className="font-medium text-gray-800">{format(new Date(sessionData.end_time), 'Pp')}</div>
                </div>
              </div>
            )}
          </div>
          
          {sessionData.overall_notes && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Overall Session Notes
              </h4>
              <p className="text-yellow-800 whitespace-pre-wrap">{sessionData.overall_notes}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Test Steps & Results</h3>
            <div className="space-y-4">
              {sessionData.test_steps.map((step, index) => {
                const result = sessionData.step_results?.find(r => r.step_number === step.step_number);
                return (
                  <div key={index} className="flex gap-4 p-4 border rounded-lg bg-white">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                        {step.step_number}
                      </div>
                      {result && <StepResultIcon status={result.status} />}
                    </div>
                    <div className="flex-1">
                      <div className="mb-3">
                        <h5 className="font-medium text-gray-700 mb-1">Instruction</h5>
                        <p className="text-gray-600">{step.instruction}</p>
                      </div>
                      <div className="mb-3">
                        <h5 className="font-medium text-gray-700 mb-1">Expected Outcome</h5>
                        <p className="text-gray-600">{step.expected_outcome}</p>
                      </div>
                      {result?.notes && (
                        <div className="p-3 bg-gray-50 border rounded-md">
                           <h5 className="font-medium text-gray-700 mb-1">Tester Notes</h5>
                           <p className="text-sm text-gray-600 whitespace-pre-wrap">{result.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}