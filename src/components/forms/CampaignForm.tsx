import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, DollarSign, AlertCircle } from 'lucide-react';
import { useGoals, useUsers } from '@/hooks/useData';
import { integrationService } from '@/services/integrationService';
import { IntegrationConnection } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const campaignFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED', 'ARCHIVED']),
  startDate: z.date(),
  endDate: z.date(),
  budget: z.number().min(0).optional(),
  channels: z.array(z.string()).min(1, { message: 'Select at least one channel' }),
  createdBy: z.string().min(1, { message: 'Creator is required' }),
  goals: z.array(z.string()).optional(),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

interface CampaignFormProps {
  onSubmit: (data: CampaignFormValues) => void;
  onCancel: () => void;
  initialData?: CampaignFormValues;
}

export function CampaignForm({ onSubmit, onCancel, initialData }: CampaignFormProps) {
  const { users, loading: usersLoading } = useUsers();
  const { goals } = useGoals();
  const navigate = useNavigate();
  
  const [connectedIntegrations, setConnectedIntegrations] = useState<IntegrationConnection[]>([]);
  const [integrationsLoading, setIntegrationsLoading] = useState(true);
  const [integrationError, setIntegrationError] = useState(false);

  // Static channel definitions with integration mapping
  const allChannels = [
    { id: 'INSTAGRAM', name: 'Instagram', integrationKey: 'instagram' },
    { id: 'TIKTOK', name: 'TikTok', integrationKey: 'tiktok' },
    { id: 'FACEBOOK', name: 'Facebook', integrationKey: 'facebook' },
    { id: 'PINTEREST', name: 'Pinterest', integrationKey: 'pinterest' },
    { id: 'X', name: 'X (Twitter)', integrationKey: 'twitter' },
    { id: 'YOUTUBE', name: 'YouTube', integrationKey: 'youtube' },
  ];

  // Filter channels based on connected integrations
  const availableChannels = allChannels.filter(channel => {
    // For channels that require integration, check if connected
    if (channel.integrationKey) {
      return connectedIntegrations.some(conn => 
        conn.integrationId === channel.integrationKey || 
        (conn as any).integration?.key === channel.integrationKey
      );
    }
    // Channels without integration requirements are always available
    return true;
  });

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      status: 'UPCOMING',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      budget: 0,
      channels: [],
      createdBy: '', // Use empty string as default
      goals: [],
    },
  });

  // Fetch connected integrations
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        setIntegrationsLoading(true);
        const connections = await integrationService.getUserConnections();
        setConnectedIntegrations(connections);
      } catch (error) {
        console.error('Error fetching integrations:', error);
        setIntegrationError(true);
        toast({
          title: "Error",
          description: "Failed to load connected integrations. Some platform options may not be available.",
          variant: "destructive",
        });
      } finally {
        setIntegrationsLoading(false);
      }
    };

    fetchIntegrations();
  }, []);

  // If we have users and no creator is selected, set the first user as default
  useEffect(() => {
    if (users && users.length > 0 && !form.getValues('createdBy')) {
      form.setValue('createdBy', users[0].id);
    }
  }, [users, form]);

  function onFormSubmit(data: CampaignFormValues) {
    // Convert budget to cents if it exists
    const dataWithCents = {
      ...data,
      budgetCents: data.budget ? Math.round(data.budget * 100) : 0,
      // Map form field names to backend expected names
      start: data.startDate,
      end: data.endDate
    };
    // Remove the budget and date fields as we're sending the converted versions
    delete (dataWithCents as any).budget;
    delete (dataWithCents as any).startDate;
    delete (dataWithCents as any).endDate;
    
    // The parent component will handle formatting the createdBy field and goals
    onSubmit(dataWithCents);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Name</FormLabel>
              <FormControl>
                <Input placeholder="Campaign name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Campaign description" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="UPCOMING">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span>Upcoming</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ACTIVE">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span>Active</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="COMPLETED">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <span>Completed</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ARCHIVED">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                        <span>Archived</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="createdBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Created By</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || undefined}
                  disabled={usersLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select creator" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {usersLoading ? (
                      <SelectItem value="loading" disabled>Loading users...</SelectItem>
                    ) : users && users.length > 0 ? (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No users available</SelectItem>
                    )}
                  </SelectContent>

                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget (USD)</FormLabel>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    className="pl-10" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goals"
          render={() => (
            <FormItem>
              <div className="mb-3">
                <FormLabel className="text-base">Goals</FormLabel>
                <FormDescription>
                  Select the goals associated with this campaign
                </FormDescription>
              </div>
              {goals && goals.length > 0 ? (
                goals.map((goal) => (
                  <FormField
                    key={goal.id}
                    control={form.control}
                    name="goals"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={goal.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(goal.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), goal.id])
                                  : field.onChange(
                                      field.value?.filter((value) => value !== goal.id)
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {goal.title}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No goals available. Create goals first.</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="channels"
          render={() => (
            <FormItem>
              <div className="mb-3">
                <FormLabel className="text-base">Channels</FormLabel>
                <FormDescription>
                  Select the social media channels for this campaign
                </FormDescription>
              </div>
              
              {/* Integration connection alert */}
              {integrationError && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Unable to load integration status. Some platform options may not be available.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* No integrations connected message */}
              {connectedIntegrations.length === 0 && !integrationsLoading && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        No social media accounts connected. Connect your accounts in{' '}
                        <button
                          type="button"
                          className="font-medium text-blue-700 underline hover:text-blue-600"
                          onClick={() => navigate('/settings?tab=integrations')}
                        >
                          Settings
                        </button>{' '}
                        to enable platform options.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading state */}
              {integrationsLoading ? (
                <p className="text-sm text-muted-foreground">Loading connected platforms...</p>
              ) : availableChannels.length > 0 ? (
                availableChannels.map((channel) => (
                  <FormField
                    key={channel.id}
                    control={form.control}
                    name="channels"
                    render={({ field }) => {
                      // Get color based on channel
                      const getChannelColor = (channelId: string) => {
                        switch (channelId) {
                          case 'INSTAGRAM': return 'bg-gradient-to-r from-purple-500 to-pink-500';
                          case 'TIKTOK': return 'bg-black text-white';
                          case 'FACEBOOK': return 'bg-blue-600 text-white';
                          case 'PINTEREST': return 'bg-red-600 text-white';
                          case 'X': return 'bg-black text-white';
                          case 'YOUTUBE': return 'bg-red-600 text-white';
                          default: return 'bg-gray-500 text-white';
                        }
                      };

                      return (
                        <FormItem
                          key={channel.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(channel.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), channel.id])
                                  : field.onChange(
                                      field.value?.filter((value) => value !== channel.id)
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center">
                            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getChannelColor(channel.id)}`}></span>
                            {channel.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No connected platforms available. Connect platforms in{' '}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => navigate('/settings?tab=integrations')}
                  >
                    Settings
                  </button>{' '}
                  to enable options.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 sticky bottom-0 bg-white pt-4 pb-2 -mx-4 px-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-primary hover:bg-gradient-primary/90"
            disabled={integrationsLoading}
          >
            Save Campaign
          </Button>
        </div>
      </form>
    </Form>
  );
}