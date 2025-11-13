import { Card } from '../../components/ui/card';
import { 
  Target, 
  DollarSign, 
  FileImage, 
  TrendingUp, 
  Users, 
  Heart 
} from 'lucide-react';

interface KPIItem {
  id: string;
  title: string;
  value: string;
  unit?: string;
  change: number;
  trend: 'UP' | 'DOWN';
  status: 'SUCCESS' | 'WARNING' | 'NEUTRAL';
  icon: string;
}

interface KPICardsProps {
  campaignsCount: number;
  postsCount: number;
  activeTasksCount: number;
  goalAchievementPercentage: number;
}

export function KPICards({ 
  campaignsCount, 
  postsCount, 
  activeTasksCount, 
  goalAchievementPercentage 
}: KPICardsProps) {
  const kpiData: KPIItem[] = [
    {
      id: 'kpi-1',
      title: 'Total Engagement',
      value: '127.5K',
      change: 12.5,
      trend: 'UP',
      status: 'SUCCESS',
      icon: 'Heart',
    },
    {
      id: 'kpi-2',
      title: 'Active Campaigns',
      value: campaignsCount.toString(),
      unit: 'campaigns',
      change: -1,
      trend: 'DOWN',
      status: 'NEUTRAL',
      icon: 'Target',
    },
    {
      id: 'kpi-3',
      title: 'Monthly Revenue',
      value: '$89K',
      change: 18.2,
      trend: 'UP',
      status: 'SUCCESS',
      icon: 'DollarSign',
    },
    {
      id: 'kpi-4',
      title: 'Content Published',
      value: postsCount.toString(),
      unit: 'posts',
      change: 5.8,
      trend: 'UP',
      status: 'SUCCESS',
      icon: 'FileImage',
    },
    {
      id: 'kpi-5',
      title: 'Goal Progress',
      value: `${goalAchievementPercentage}%`,
      change: -2.1,
      trend: 'DOWN',
      status: 'WARNING',
      icon: 'TrendingUp',
    },
    {
      id: 'kpi-6',
      title: 'Ambassador Tasks',
      value: activeTasksCount.toString(),
      unit: 'active',
      change: 15.4,
      trend: 'UP',
      status: 'SUCCESS',
      icon: 'Users',
    }
  ];

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Heart': return <Heart className="w-8 h-8 mx-auto text-primary mb-2" />;
      case 'Target': return <Target className="w-8 h-8 mx-auto text-primary mb-2" />;
      case 'DollarSign': return <DollarSign className="w-8 h-8 mx-auto text-primary mb-2" />;
      case 'FileImage': return <FileImage className="w-8 h-8 mx-auto text-primary mb-2" />;
      case 'TrendingUp': return <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />;
      case 'Users': return <Users className="w-8 h-8 mx-auto text-primary mb-2" />;
      default: return <span className="text-primary">❓</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {kpiData.map((kpi, index) => (
        <div 
          key={kpi.id} 
          className="animate-slide-in" 
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Card className="p-6 bg-gradient-card shadow-card border-0 text-center">
            <div className="w-8 h-8 mx-auto mb-2">
              {getIconComponent(kpi.icon)}
            </div>
            <p className="text-2xl font-bold">
              {kpi.value}
              {kpi.unit ? ` ${kpi.unit}` : ''}
            </p>
            <p className="text-sm text-muted-foreground">{kpi.title}</p>
          </Card>
        </div>
      ))}
    </div>
  );
}