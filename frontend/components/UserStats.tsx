'use client';

import React from 'react';
import { Users, UserCheck, Clock, AlertTriangle, BarChart3 } from 'lucide-react';

interface UserStatsData {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  byRole: {
    [key: string]: number;
  };
}

interface UserStatsProps {
  stats: UserStatsData;
}

const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
  const getRoleDisplayName = (role: string) => {
    return role.split('_').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total,
      icon: Users,
      color: 'text-blue-200',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-300/30',
    },
    {
      title: 'Active Users',
      value: stats.active,
      icon: UserCheck,
      color: 'text-green-200',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-300/30',
    },
    {
      title: 'Pending Approval',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-200',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-300/30',
    },
    {
      title: 'Suspended',
      value: stats.suspended,
      icon: AlertTriangle,
      color: 'text-red-200',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-300/30',
    },
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.title} className={`${stat.bgColor} backdrop-blur-sm rounded-lg p-6 border ${stat.borderColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-light text-white/90">{stat.title}</p>
                  <p className="text-2xl font-light text-white">{stat.value}</p>
                </div>
                <div className={`bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Distribution */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-white/80" />
          <h3 className="text-lg font-light text-white italic">Users by Role</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stats.byRole).map(([role, count]) => (
            <div key={role} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <span className="text-sm font-light text-white/90">
                {getRoleDisplayName(role)}
              </span>
              <span className="text-sm font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-1 rounded border border-white/30">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserStats; 