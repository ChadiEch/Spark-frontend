import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, ArrowLeft, Save } from 'lucide-react';
import { useActivities, useCampaigns, useGoals, useAmbassadors, usePosts } from '@/hooks/useData';
import { toast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define the Activity type
interface Activity {
  id?: string;
  type?: 'POST' | 'AD' | 'AMBASSADOR_TASK';
  campaign?: string | { id: string; name: string };
  goal?: string | { id: string; title: string };
  ambassador?: string | { id: string; name: string };
  post?: string | { id: string; title: string };
  title?: string;
  description?: string;
  metrics?: {
    reach?: number;
    impressions?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    clicks?: number;
    conversions?: number;
    spendCents?: number;
    revenueCents?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

const activityFormSchema = z.object({
  type: z.enum(['POST', 'AD', 'AMBASSADOR_TASK'], {
    required_error: "Please select an activity type."
  }),
  campaign: z.string().optional(),
  goal: z.string().optional(),
  ambassador: z.string().optional(),
  post: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  metrics: z.object({
    reach: z.number().optional(),
    impressions: z.number().optional(),
    likes: z.number().optional(),
    comments: z.number().optional(),
    shares: z.number().optional(),
    saves: z.number().optional(),
    clicks: z.number().optional(),
    conversions: z.number().optional(),
    spendCents: z.number().optional(),
    revenueCents: z.number().optional()
  }).optional()
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

const EditActivity = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getActivityById, updateActivity, loading: activityLoading } = useActivities();
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { goals, loading: goalsLoading } = useGoals();
  const { ambassadors, loading: ambassadorsLoading } = useAmbassadors();
  const { data: postsData, loading: postsLoading } = usePosts();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  const posts = postsData || [];

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      type: 'POST',
      campaign: undefined,
      goal: undefined,
      ambassador: undefined,
      post: undefined,
      title: '',
      description: '',
      metrics: {
        reach: 0,
        impressions: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        clicks: 0,
        conversions: 0,
        spendCents: 0,
        revenueCents: 0
      }
    },
  });

  useEffect(() => {
    const fetchActivity = async () => {
      if (id) {
        try {
          const fetchedActivityData: any = await getActivityById(id);
          // Type assertion to our Activity interface
          const fetchedActivity = fetchedActivityData as Activity;
          setActivity(fetchedActivity);
          
          if (fetchedActivity) {
            form.reset({
              type: fetchedActivity.type || 'POST',
              campaign: fetchedActivity.campaign ? (typeof fetchedActivity.campaign === 'string' ? fetchedActivity.campaign : fetchedActivity.campaign.id) : undefined,
              goal: fetchedActivity.goal ? (typeof fetchedActivity.goal === 'string' ? fetchedActivity.goal : fetchedActivity.goal.id) : undefined,
              ambassador: fetchedActivity.ambassador ? (typeof fetchedActivity.ambassador === 'string' ? fetchedActivity.ambassador : fetchedActivity.ambassador.id) : undefined,
              post: fetchedActivity.post ? (typeof fetchedActivity.post === 'string' ? fetchedActivity.post : fetchedActivity.post.id) : undefined,
              title: fetchedActivity.title || '',
              description: fetchedActivity.description || '',
              metrics: {
                reach: fetchedActivity.metrics?.reach || 0,
                impressions: fetchedActivity.metrics?.impressions || 0,
                likes: fetchedActivity.metrics?.likes || 0,
                comments: fetchedActivity.metrics?.comments || 0,
                shares: fetchedActivity.metrics?.shares || 0,
                saves: fetchedActivity.metrics?.saves || 0,
                clicks: fetchedActivity.metrics?.clicks || 0,
                conversions: fetchedActivity.metrics?.conversions || 0,
                spendCents: fetchedActivity.metrics?.spendCents || 0,
                revenueCents: fetchedActivity.metrics?.revenueCents || 0
              }
            });
          }
        } catch (error) {
          console.error('Error fetching activity:', error);
        }
      }
      setLoading(false);
    };

    fetchActivity();
  }, [id, getActivityById, form]);

  const loadingData = activityLoading || campaignsLoading || goalsLoading || ambassadorsLoading || postsLoading || loading;

  const onSubmit = async (data: ActivityFormValues) => {
    if (!id) return;

    try {
      const activityData = {
        ...data,
        campaign: data.campaign || undefined,
        goal: data.goal || undefined,
        ambassador: data.ambassador || undefined,
        post: data.post || undefined
      };

      const updatedActivity = await updateActivity(id, activityData);
      if (updatedActivity) {
        toast({
          title: "Activity Updated",
          description: "The activity has been updated successfully.",
        });
        navigate(`/activities/view/${id}`);
      } else {
        throw new Error('Failed to update activity');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loadingData) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading activity...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!activity) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Activity Not Found</h2>
            <p className="text-red-700 mb-4">
              The activity you're trying to edit doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/activities')}>
              Back to Activities
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/activities')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold gradient-text">Edit Activity</h1>
              <p className="text-muted-foreground">
                Update activity information
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <Card className="p-6 bg-gradient-card shadow-card border-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter activity title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="POST">Post</SelectItem>
                          <SelectItem value="AD">Ad</SelectItem>
                          <SelectItem value="AMBASSADOR_TASK">Ambassador Task</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="campaign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select campaign" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {campaigns.map((campaign) => (
                            <SelectItem key={campaign.id} value={campaign.id}>
                              {campaign.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {goals.map((goal) => (
                            <SelectItem key={goal.id} value={goal.id}>
                              {goal.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ambassador"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ambassador</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ambassador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ambassadors.map((ambassador) => (
                            <SelectItem key={ambassador.id} value={ambassador.id}>
                              {ambassador.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="post"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select post" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {posts.map((post) => (
                            <SelectItem key={post.id} value={post.id}>
                              {post.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter activity description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Metrics Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="metrics.reach"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reach</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metrics.likes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Likes</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metrics.comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comments</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metrics.shares"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shares</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metrics.saves"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saves</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metrics.clicks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clicks</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metrics.spendCents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spend ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metrics.revenueCents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Revenue ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => navigate('/activities')}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary hover:bg-gradient-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </PageLayout>
  );
};

export default EditActivity;