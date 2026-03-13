
import React from 'react';
import { CheckCircle, XCircle, Play, Pause, Award, Eye, BarChartHorizontal, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NomineeStatsCard = ({ nominee, onClick, processingId, onApprove, onReject, onActivate, onDeactivate, onSetWinner }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' };
      case 'approved': return { color: 'bg-blue-100 text-blue-800', text: 'Approved' };
      case 'active': return { color: 'bg-green-100 text-green-800', text: 'Active' };
      case 'winner': return { color: 'bg-purple-100 text-purple-800', text: 'Winner' };
      case 'rejected': return { color: 'bg-red-100 text-red-800', text: 'Rejected' };
      default: return { color: 'bg-gray-100 text-gray-800', text: status };
    }
  };

  const statusInfo = getStatusInfo(nominee.status);

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1 cursor-pointer" onClick={() => onClick(nominee)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 truncate">{nominee.name}</h3>
              {nominee.is_on_fire && <Flame className="w-5 h-5 text-red-500 shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                <BarChartHorizontal className="h-3 w-3" />
                <span>{(nominee.starpower_score * 100 || 0).toFixed(1)}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 truncate">{nominee.title}</p>
          <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>
        <Button size="icon" variant="ghost" className="ml-2 shrink-0" onClick={() => onClick(nominee)}>
          <Eye className="h-4 w-4 text-gray-500" />
        </Button>
      </div>

      <p className="my-3 flex-1 text-sm text-gray-600 line-clamp-3">{nominee.description}</p>
      
      <div className="mt-auto">
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500">ELO</p>
            <p className="font-bold text-purple-600">{nominee.elo_rating || 1200}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Borda</p>
            <p className="font-bold text-green-600">{nominee.borda_score || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Direct</p>
            <p className="font-bold text-red-600">{nominee.direct_vote_count || 0}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {nominee.status === 'pending' && (
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => onApprove(nominee)} disabled={processingId === nominee.id}>
                <CheckCircle className="mr-1 h-4 w-4" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onReject(nominee)} disabled={processingId === nominee.id}>
                <XCircle className="mr-1 h-4 w-4" /> Reject
              </Button>
            </div>
          )}
          {nominee.status === 'approved' && (
            <Button size="sm" className="w-full" onClick={() => onActivate(nominee)} disabled={processingId === nominee.id}>
              <Play className="mr-1 h-4 w-4" /> Activate for Voting
            </Button>
          )}
          {nominee.status === 'active' && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onDeactivate(nominee)} disabled={processingId === nominee.id}>
                <Pause className="mr-1 h-4 w-4" /> Deactivate
              </Button>
              <Button size="sm" className="flex-1" onClick={() => onSetWinner(nominee)} disabled={processingId === nominee.id}>
                <Award className="mr-1 h-4 w-4" /> Set as Winner
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NomineeStatsCard;
