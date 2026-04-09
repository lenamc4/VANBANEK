
import React from 'react';
import { Assignment, TaskStatus } from '../types';
import { DocumentDuplicateIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

interface Props {
  tasks: Assignment[];
}

export const DashboardStats: React.FC<Props> = ({ tasks }) => {
  const total = tasks.length;
  const pending = tasks.filter(t => t.status === TaskStatus.PENDING).length;
  const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const overdue = tasks.filter(t => t.status === TaskStatus.OVERDUE).length;

  const StatCard = ({ title, value, icon: Icon, colorClass, textColor, delay }: any) => (
      <div 
        className={`bg-white rounded-lg p-6 shadow-portal hover:shadow-portal-hover transition-all duration-300 border-b-4 ${colorClass} animate-fade-in`}
        style={{animationDelay: delay}}
      >
          <div className="flex items-center justify-between">
              <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
                  <h3 className={`text-4xl font-black ${textColor}`}>{value}</h3>
              </div>
              <Icon className={`w-12 h-12 opacity-20 ${textColor}`} />
          </div>
      </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Văn bản đến" 
        value={total} 
        icon={DocumentDuplicateIcon} 
        colorClass="border-blue-600"
        textColor="text-blue-600"
        delay="0ms"
      />
      <StatCard 
        title="Đang xử lý" 
        value={pending} 
        icon={ClockIcon} 
        colorClass="border-eakar-accent"
        textColor="text-eakar-accent"
        delay="100ms"
      />
      <StatCard 
        title="Hoàn thành" 
        value={completed} 
        icon={CheckCircleIcon} 
        colorClass="border-green-600"
        textColor="text-green-600"
        delay="200ms"
      />
      <StatCard 
        title="Quá hạn" 
        value={overdue} 
        icon={ExclamationCircleIcon} 
        colorClass="border-eakar-primary"
        textColor="text-eakar-primary"
        delay="300ms"
      />
    </div>
  );
};
