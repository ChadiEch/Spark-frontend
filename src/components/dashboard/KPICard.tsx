import { cn } from '../../lib/utils';
import { Card } from '../../components/ui/card';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { KPICard as KPICardType } from '../../types';

interface KPICardProps {
  kpi: KPICardType;
  className?: string;
}

export function KPICard({ kpi, className }: KPICardProps) {
  // Get the icon component dynamically
  const IconComponent = (LucideIcons as any)[kpi.icon] as LucideIcon || LucideIcons.BarChart;
  
  const TrendIcon = kpi.trend === 'UP' ? TrendingUp : kpi.trend === 'DOWN' ? TrendingDown : Minus;

  const statusColors = {
    SUCCESS: 'text-success',
    WARNING: 'text-warning', 
    DANGER: 'text-danger',
    NEUTRAL: 'text-muted-foreground',
  };

  const trendColors = {
    UP: 'text-success',
    DOWN: 'text-danger',
    FLAT: 'text-muted-foreground',
  };

  return (
    <Card className={cn(
      "p-6 bg-gradient-card shadow-card hover:shadow-glow/10 transition-all duration-300 border-0",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
          <div className="flex items-baseline space-x-1">
            <span className={cn("text-2xl font-bold", statusColors[kpi.status])}>
              {kpi.value}
            </span>
            {kpi.unit && (
              <span className="text-sm text-muted-foreground">{kpi.unit}</span>
            )}
          </div>
          {kpi.change !== undefined && (
            <div className="flex items-center space-x-1">
              <TrendIcon className={cn("w-3 h-3", trendColors[kpi.trend])} />
              <span className={cn("text-xs font-medium", trendColors[kpi.trend])}>
                {Math.abs(kpi.change)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary/10",
        )}>
          <IconComponent className={cn("w-6 h-6", statusColors[kpi.status])} />
        </div>
      </div>
    </Card>
  );
}