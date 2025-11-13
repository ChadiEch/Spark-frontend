import { Card } from '../../components/ui/card';
import { 
  FileImage, 
  CheckCircle, 
  AlertCircle, 
  Target 
} from 'lucide-react';

interface ActivityItem {
  id: number;
  type: string;
  message: string;
  time: string;
  user: string;
  icon: React.ComponentType<any>;
  color: string;
}

export function RecentActivity() {
  const recentActivities: ActivityItem[] = [
    {
      id: 1,
      type: 'POST_PUBLISHED',
      message: 'Published "Healthy Breakfast Ideas" to Instagram',
      time: '2 hours ago',
      user: 'Ammar Khan',
      icon: FileImage,
      color: 'text-success',
    },
    {
      id: 2,
      type: 'TASK_COMPLETED',
      message: 'Completed video editing for Fall Fitness Challenge',
      time: '4 hours ago',
      user: 'Micha Rodriguez',
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      id: 3,
      type: 'GOAL_AT_RISK',
      message: 'Brand Awareness Campaign goal is at risk',
      time: '6 hours ago',
      user: 'System',
      icon: AlertCircle,
      color: 'text-warning',
    },
    {
      id: 4,
      type: 'CAMPAIGN_STARTED',
      message: 'Fall Fitness Challenge campaign launched',
      time: '1 day ago',
      user: 'Jad Al-Hassan',
      icon: Target,
      color: 'text-primary',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Recent Activity</h2>
      <Card className="p-6 bg-gradient-card shadow-card border-0">
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-card-foreground">{activity.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">{activity.user}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}