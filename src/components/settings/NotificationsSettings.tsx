import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Save } from 'lucide-react';

interface NotificationSettings {
  campaignUpdates: boolean;
  goalProgress: boolean;
  teamActivity: boolean;
  weeklyReports: boolean;
  mentions: boolean;
  taskAssignments: boolean;
  urgentAlerts: boolean;
}

interface NotificationsSettingsProps {
  notifications: NotificationSettings;
  onUpdateNotifications: (settings: NotificationSettings) => void;
}

export function NotificationsSettings({ notifications, onUpdateNotifications }: NotificationsSettingsProps) {
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when notifications prop changes
  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const handleToggle = (setting: keyof NotificationSettings) => {
    setLocalNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateNotifications(localNotifications);
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAll = (value: boolean) => {
    setLocalNotifications({
      campaignUpdates: value,
      goalProgress: value,
      teamActivity: value,
      weeklyReports: value,
      mentions: value,
      taskAssignments: value,
      urgentAlerts: value,
    });
  };

  // Check if all notifications are enabled or disabled for button states
  const allEnabled = Object.values(localNotifications).every(value => value);
  const allDisabled = Object.values(localNotifications).every(value => !value);

  // Fix the enable/disable all buttons to properly reflect the state
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notification Settings</h2>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Email Notifications</h3>
            <p className="text-muted-foreground">Manage which notifications you receive via email</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleToggleAll(false)}
              disabled={allDisabled}
            >
              Disable All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleToggleAll(true)}
              disabled={allEnabled}
            >
              Enable All
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Campaign Updates</Label>
              <p className="text-sm text-muted-foreground">Receive updates about campaign progress</p>
            </div>
            <Switch
              checked={localNotifications.campaignUpdates}
              onCheckedChange={() => handleToggle('campaignUpdates')}
              aria-label="Toggle campaign updates notifications"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Goal Progress</Label>
              <p className="text-sm text-muted-foreground">Weekly updates on goal achievements</p>
            </div>
            <Switch
              checked={localNotifications.goalProgress}
              onCheckedChange={() => handleToggle('goalProgress')}
              aria-label="Toggle goal progress notifications"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Team Activity</Label>
              <p className="text-sm text-muted-foreground">Notifications about team member activities</p>
            </div>
            <Switch
              checked={localNotifications.teamActivity}
              onCheckedChange={() => handleToggle('teamActivity')}
              aria-label="Toggle team activity notifications"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">Receive weekly performance reports</p>
            </div>
            <Switch
              checked={localNotifications.weeklyReports}
              onCheckedChange={() => handleToggle('weeklyReports')}
              aria-label="Toggle weekly reports notifications"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Mentions</Label>
              <p className="text-sm text-muted-foreground">When someone mentions you in comments</p>
            </div>
            <Switch
              checked={localNotifications.mentions}
              onCheckedChange={() => handleToggle('mentions')}
              aria-label="Toggle mentions notifications"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Task Assignments</Label>
              <p className="text-sm text-muted-foreground">When you are assigned to a new task</p>
            </div>
            <Switch
              checked={localNotifications.taskAssignments}
              onCheckedChange={() => handleToggle('taskAssignments')}
              aria-label="Toggle task assignments notifications"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Urgent Alerts</Label>
              <p className="text-sm text-muted-foreground">Critical system alerts and notifications</p>
            </div>
            <Switch
              checked={localNotifications.urgentAlerts}
              onCheckedChange={() => handleToggle('urgentAlerts')}
              aria-label="Toggle urgent alerts notifications"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}