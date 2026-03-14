import React from 'react';

const stageColors = {
  FORM: 'bg-amber-400',
  STORM: 'bg-orange-400',
  NORM: 'bg-blue-400',
  PERFORM: 'bg-green-400',
};

export default function RRFSidebarContact({ stage, unreadCount }) {
  const dotColor = stageColors[stage] || 'bg-gray-300';

  return (
    <div className="absolute top-0 right-0 flex gap-1">
      {unreadCount > 0 && (
        <div className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
      {stage && <div className={`w-2 h-2 rounded-full ${dotColor}`} />}
    </div>
  );
}