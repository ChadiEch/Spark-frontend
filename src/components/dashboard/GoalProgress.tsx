import { Card } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import { Calendar, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import type { Goal } from '../../types';

interface GoalProgressProps {
  goal: Goal;
  className?: string;
}

export function GoalProgress({ goal, className }: GoalProgressProps) {
  const progressPercent = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  
  // Ensure goal.start and goal.end are Date objects
  // Handle cases where dates might be strings (from localStorage)
  const startDate = new Date(goal.start);
  const endDate = new Date(goal.end);
  
  const timeElapsed = (new Date().getTime() - startDate.getTime()) / 
                      (endDate.getTime() - startDate.getTime()) * 100;
  
  const statusColors = {
    UPCOMING: 'bg-muted text-muted-foreground',
    ACTIVE: 'bg-primary text-primary-foreground',
    AT_RISK: 'bg-warning text-warning-foreground',
    OFF_TRACK: 'bg-danger text-danger-foreground',
    COMPLETE: 'bg-success text-success-foreground',
  };

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'AT_RISK':
      case 'OFF_TRACK':
        return <AlertTriangle className="w-3 h-3" />;
      case 'COMPLETE':
        return <Target className="w-3 h-3" />;
      default:
        return <TrendingUp className="w-3 h-3" />;
    }
  };

  const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className={cn(
      "p-6 bg-gradient-card shadow-card hover:shadow-lg transition-all duration-300 border-0",
      className
    )}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-card-foreground">{goal.title}</h3>
            <p className="text-sm text-muted-foreground">
              Target: {goal.targetValue.toLocaleString()} {goal.targetUnit}
            </p>
          </div>
          <Badge className={cn("flex items-center gap-1", statusColors[goal.status])}>
            {getStatusIcon(goal.status)}
            {goal.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={progressPercent} 
            className="h-2"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{progressPercent.toFixed(1)}% complete</span>
            <span>{daysLeft} days left</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center space-x-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="w-3 h-3" />
            <span>Owner: {goal.owner.name}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}