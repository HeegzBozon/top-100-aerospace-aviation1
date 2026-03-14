import React from 'react';

const stageConfig = {
  FORM: { color: 'bg-amber-100 text-amber-700', label: 'FORM', dot: 'bg-amber-400' },
  STORM: { color: 'bg-orange-100 text-orange-700', label: 'STORM', dot: 'bg-orange-400' },
  NORM: { color: 'bg-blue-100 text-blue-700', label: 'NORM', dot: 'bg-blue-400' },
  PERFORM: { color: 'bg-green-100 text-green-700', label: 'PERFORM', dot: 'bg-green-400' },
};

export default function RRFMessageTag({ stage, messageType = 'message', isOwn = false }) {
  if (!stage) return null;

  const config = stageConfig[stage];
  if (!config) return null;

  return (
    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${config.color} ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
      {messageType !== 'message' && <span className="text-[10px] opacity-75">({messageType})</span>}
    </div>
  );
}