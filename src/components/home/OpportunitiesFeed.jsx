import React, { useState, useEffect } from 'react';
import { Job } from '@/entities/Job';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Briefcase, MapPin, Clock, ArrowRight, Building, Loader2, Lock } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function OpportunitiesFeed({ user, limit = 3 }) {
  // Hidden for now - Coming Soon feature
  return null;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const activeJobs = await Job.filter({ status: 'active' }, '-created_date', limit);
        setJobs(activeJobs);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [limit]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border shadow-sm" style={{ borderColor: `${brandColors.navyDeep}10` }}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: brandColors.goldPrestige }} />
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 border shadow-sm"
        style={{ borderColor: `${brandColors.navyDeep}10` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
          <h3 className="font-semibold" style={{ color: brandColors.navyDeep }}>Opportunities</h3>
        </div>
        <div className="text-center py-6 text-gray-500">
          <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No active opportunities right now</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border shadow-sm relative overflow-hidden"
      style={{ borderColor: `${brandColors.navyDeep}10` }}
    >
      {/* Locked Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-10 h-10 mx-auto mb-2" style={{ color: brandColors.goldPrestige }} />
          <p className="font-semibold text-sm" style={{ color: brandColors.navyDeep }}>Coming Soon</p>
          <p className="text-xs text-gray-500 mt-1">Opportunities will be available soon</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
          <h3 className="font-semibold" style={{ color: brandColors.navyDeep }}>Opportunities</h3>
        </div>
        <Link 
          to={createPageUrl('TalentExchange')}
          className="text-sm font-medium flex items-center gap-1 hover:underline"
          style={{ color: brandColors.goldPrestige }}
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={createPageUrl(`JobDetail?id=${job.id}`)}>
              <div 
                className="p-3 rounded-xl border hover:shadow-md transition-all group"
                style={{ borderColor: `${brandColors.navyDeep}10` }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${brandColors.skyBlue}15` }}
                  >
                    <Building className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-semibold text-sm truncate group-hover:underline"
                      style={{ color: brandColors.navyDeep }}
                    >
                      {job.title}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{job.company_name || 'Company'}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location || 'Remote'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.job_type?.replace('_', ' ') || 'Full-time'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight 
                    className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: brandColors.goldPrestige }}
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}