import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Plus, Play, ArrowRight, Zap, Target, Users } from 'lucide-react';
import heroImage from '../../assets/hero-dashboard.jpg';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

export function HeroSection() {
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();

  const handleCreateCampaign = () => {
    // Navigate to campaigns page or open campaign creation modal
    navigate('/goals'); // For now, we'll navigate to goals page where campaigns can be managed
  };

  const handleWatchDemo = () => {
    setShowDemo(true);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-primary rounded-2xl p-8 text-white">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <Badge className="bg-red-500 text-white border-0 hover:bg-red-600">
              <Zap className="w-3 h-3 mr-1" />
              New Feature
            </Badge>
            <h1 className="text-4xl font-bold leading-tight">
              Unified Marketing 
              <br />
              <span className="text-white/90">Management Platform</span>
            </h1>
            <p className="text-lg text-white/80 max-w-lg">
              Streamline your campaigns, track goals, manage ambassadors, and boost performance with our all-in-one marketing solution.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 font-semibold gap-2"
              onClick={handleCreateCampaign}
            >
              <Plus className="w-5 h-5" />
              Create Campaign
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 gap-2"
              onClick={handleWatchDemo}
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">150+</div>
              <div className="text-sm text-white/70">Campaigns Managed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-300">89%</div>
              <div className="text-sm text-white/70">Goal Achievement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm text-white/70">Active Ambassadors</div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex justify-center">
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-2">
              <Target className="w-8 h-8 text-white/80" />
              <h3 className="font-semibold">Goal Tracking</h3>
              <p className="text-sm text-white/70">Monitor progress in real-time</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-2">
              <Users className="w-8 h-8 text-white/80" />
              <h3 className="font-semibold">Team Collaboration</h3>
              <p className="text-sm text-white/70">Work together seamlessly</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-2 col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Campaign Performance</span>
                <ArrowRight className="w-4 h-4 text-white/60" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Fall Fitness Challenge</span>
                  <span>89%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '89%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Video Dialog */}
      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Platform Demo</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <Play className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold">Demo Video</h3>
                <p className="text-muted-foreground">
                  In a production environment, this would show a video demonstration of the platform features.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}