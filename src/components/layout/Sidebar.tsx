import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Target, 
  Zap, 
  CheckSquare, 
  Users, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  Crown,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigationItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Calendar, label: 'Content Calendar', href: '/calendar' },
  { icon: FileText, label: 'Posts', href: '/posts' },
  { icon: Target, label: 'Goals & Campaigns', href: '/goals' },
  { icon: Zap, label: 'Activities', href: '/activities' },
  { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
  { icon: Users, label: 'Ambassadors', href: '/ambassadors' },
  { icon: FolderOpen, label: 'Asset Library', href: '/assets' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Handle navigation item click (for mobile)
  const handleNavigationClick = () => {
    if (onClose) {
      onClose();
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const names = user.name.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[names.length - 1][0]}` 
      : names[0][0];
  };

  return (
    <div className={cn(
      "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-lg">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground  md:block">Winnerforce</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
                isActive && "bg-gradient-primary text-primary-foreground hover:bg-gradient-primary/90",
                isCollapsed && "px-2"
              )}
              asChild
            >
              <Link to={item.href} onClick={handleNavigationClick}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="truncate  md:block">{item.label}</span>}
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* User Profile - Fixed at bottom */}
      <div className="p-4 border-t border-sidebar-border sticky bottom-0 bg-sidebar">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <span className="text-sm font-semibold text-white">{getUserInitials()}</span>
          </div>
          {!isCollapsed && user && (
            <div className="flex-1 min-w-0  md:block">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate capitalize">{user.role?.toLowerCase() || 'user'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}