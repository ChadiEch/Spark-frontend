import { useNavigate } from 'react-router-dom';
// Import our data hooks instead of direct mock data
import { useUsers, useGoals, useCampaigns, usePosts, useTasks } from '../../hooks/useData';
import { HeroSection } from './HeroSection';
import { KPICards } from './KPICards';
import { RecentActivity } from './RecentActivity';
import { CampaignOverview } from './CampaignOverview';
import { QuickStats } from './QuickStats';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export function Dashboard() {
  const navigate = useNavigate();
  
  // Use our data hooks instead of direct mock data
  const { users, loading: usersLoading } = useUsers();
  const { goals, loading: goalsLoading } = useGoals();
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { posts: postsData, loading: postsLoading } = usePosts();
  const { data: tasksData, loading: tasksLoading } = useTasks();
   
  const posts = postsData || [];
  const tasks = tasksData || [];

  const handleViewAllGoals = () => {
    navigate('/goals');
  };

  const handleViewAllCampaigns = () => {
    // For now, we'll navigate to goals page where campaigns are also managed
    navigate('/goals');
  };

  // Ensure we have valid data before trying to access properties
  const validCampaigns = Array.isArray(campaigns) ? campaigns.filter(c => c !== undefined) : [];
  const validPosts = Array.isArray(posts) ? posts.filter(p => p !== undefined) : [];
  const validTasks = Array.isArray(tasks) ? tasks.filter(t => t !== undefined) : [];
  const validUsers = Array.isArray(users) ? users.filter(u => u !== undefined) : [];
  const validGoals = Array.isArray(goals) ? goals.filter(g => g !== undefined) : [];

  // Calculate task counts safely
  const activeTasksCount = validTasks.filter(t => t && (t.status === 'OPEN' || t.status === 'IN_PROGRESS')).length || 0;
  const completedTasksCount = validTasks.filter(t => t && t.status === 'DONE').length || 0;
  
  // Calculate goal achievement percentage safely
  const totalGoals = validGoals.length || 0;
  const completedGoals = validGoals.filter(g => g && g.status === 'COMPLETE').length || 0;
  const goalAchievementPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Show a simple message if still loading
  if (usersLoading || goalsLoading || campaignsLoading || postsLoading || tasksLoading) {
    return (
      <div className="p-6 space-y-8 bg-background">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-background animate-fade-in">
      {/* Hero Section */}
      <HeroSection />

      {/* KPI Cards */}
      <KPICards 
        campaignsCount={validCampaigns.length || 0}
        postsCount={validPosts.length || 0}
        activeTasksCount={activeTasksCount}
        goalAchievementPercentage={goalAchievementPercentage}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Goals Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Goals</h2>
            <Button variant="outline" size="sm" onClick={handleViewAllGoals}>
              View All Goals
            </Button>
          </div>
          <div className="grid gap-6">
            {validGoals.length > 0 ? (
              validGoals.map((goal) => (
                goal ? (
                  <Card key={goal.id} className="p-6 bg-gradient-card shadow-card border-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-card-foreground">{goal.title}</h3>
                      <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {goal.status}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round((goal.currentValue / goal.targetValue) * 100)}%</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  </Card>
                ) : null
              ))
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No active goals yet</p>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>

      {/* Campaign Overview */}
      <CampaignOverview 
        campaigns={validCampaigns} 
        onViewAll={handleViewAllCampaigns} 
      />

      {/* Quick Stats Row */}
      <QuickStats 
        usersCount={validUsers.length || 0}
        postsCount={validPosts.length || 0}
        completedTasksCount={completedTasksCount}
        goalAchievementPercentage={goalAchievementPercentage}
      />
    </div>
  );
}