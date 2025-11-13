import { Card } from '../../components/ui/card';
import { Users, FileImage, CheckCircle, TrendingUp } from 'lucide-react';

interface QuickStatsProps {
  usersCount: number;
  postsCount: number;
  completedTasksCount: number;
  goalAchievementPercentage: number;
}

export function QuickStats({ 
  usersCount, 
  postsCount, 
  completedTasksCount, 
  goalAchievementPercentage 
}: QuickStatsProps) {
  const statsData = [
    {
      id: 'users',
      title: 'Active Users',
      value: usersCount,
      icon: Users,
      color: 'text-primary',
    },
    {
      id: 'posts',
      title: 'Posts This Week',
      value: postsCount,
      icon: FileImage,
      color: 'text-primary',
    },
    {
      id: 'tasks',
      title: 'Tasks Completed',
      value: completedTasksCount,
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      id: 'goals',
      title: 'Goal Achievement',
      value: `${goalAchievementPercentage}%`,
      icon: TrendingUp,
      color: 'text-success',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.id} className="p-6 bg-gradient-card shadow-card border-0 text-center">
            <div className="space-y-2">
              <Icon className={`w-8 h-8 mx-auto ${stat.color}`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}