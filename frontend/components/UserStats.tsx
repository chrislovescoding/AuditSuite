'use client';

import React from 'react';
import { Users, UserCheck, Clock, AlertTriangle, BarChart3 } from 'lucide-react';

interface UserStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  byRole: {
    [key: string]: number;
  };
}

interface UserStatsProps {
  stats: UserStats;
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
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Users',
      value: stats.active,
      icon: UserCheck,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Approval',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Suspended',
      value: stats.suspended,
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.title} className={`${stat.bgColor} rounded-lg p-6 border`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <IconComponent className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Distribution */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Users by Role</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stats.byRole).map(([role, count]) => (
            <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                {getRoleDisplayName(role)}
              </span>
              <span className="text-sm font-bold text-gray-900 bg-white px-2 py-1 rounded">
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