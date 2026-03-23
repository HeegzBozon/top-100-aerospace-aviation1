import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Lightbulb, Bug, MessageSquare } from 'lucide-react';

const options = [
  {
    title: 'Suggest a Feature',
    description: 'Have a great idea? We want to hear about it.',
    icon: Lightbulb,
    link: createPageUrl('Feedback?type=idea'),
    color: 'from-blue-500 to-sky-500',
  },
  {
    title: 'Report a Bug',
    description: 'Something not working right? Let us know so we can fix it.',
    icon: Bug,
    link: createPageUrl('Feedback?type=bug'),
    color: 'from-red-500 to-rose-500',
  },
  {
    title: 'Share Feedback',
    description: 'Have other thoughts or general feedback? We are all ears.',
    icon: MessageSquare,
    link: createPageUrl('Feedback?type=feedback'),
    color: 'from-purple-500 to-violet-500',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SubmissionOptions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {options.map((option, index) => (
        <motion.div
          key={option.title}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Link to={option.link}>
            <div className={`group relative p-6 rounded-2xl text-white overflow-hidden bg-gradient-to-br ${option.color} transition-all duration-300 hover:shadow-2xl hover:scale-105`}>
              <div className="relative z-10">
                <div className="bg-white/20 p-3 rounded-xl w-max mb-4">
                  <option.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                <p className="text-sm opacity-80">{option.description}</p>
              </div>
              <div className="absolute -bottom-4 -right-4 text-white/10 group-hover:text-white/20 transition-all duration-300">
                <option.icon className="w-24 h-24" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}