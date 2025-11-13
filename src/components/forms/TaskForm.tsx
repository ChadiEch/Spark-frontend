import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Flag, Archive } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useUsers } from '@/hooks/useData'; // Import useUsers hook

const taskFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(100),
  description: z.string().max(500).optional(),
  dueDate: z.date().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'TRASH']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  assignees: z.array(z.string()).optional(),
  relatedCampaign: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onSubmit: (data: TaskFormValues) => void;
  onCancel: () => void;
  initialData?: TaskFormValues;
  isLoading?: boolean;
}

export function TaskForm({ onSubmit, onCancel, initialData, isLoading }: TaskFormProps) {
  const { users, loading: usersLoading } = useUsers(); // Use the actual users hook

  const [campaigns] = useState([
    { id: 'camp-1', name: 'Fall Fitness Challenge' },
    { id: 'camp-2', name: 'Holiday Nutrition Series' },
  ]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      status: 'OPEN',
      priority: 'MEDIUM',
    },
  });

  // Real-time validation feedback
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  // Watch form values for real-time validation
  const titleValue = form.watch('title');
  const descriptionValue = form.watch('description');

  // Real-time validation for title
  useEffect(() => {
    if (titleValue && titleValue.length > 100) {
      setTitleError('Title must be less than 100 characters');
    } else if (!titleValue) {
      setTitleError('Title is required');
    } else {
      setTitleError(null);
    }
  }, [titleValue]);

  // Real-time validation for description
  useEffect(() => {
    if (descriptionValue && descriptionValue.length > 500) {
      setDescriptionError('Description must be less than 500 characters');
    } else {
      setDescriptionError(null);
    }
  }, [descriptionValue]);

  async function onFormSubmit(data: TaskFormValues) {
    try {
      await onSubmit(data);
    } catch (error: any) {
      // Handle form submission errors
      console.error('Error submitting task form:', error);
      
      // Show error message to user
      toast({
        title: "Error",
        description: error.message || "Failed to submit task. Please try again.",
        variant: "destructive",
      });
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-blue-500 text-white';
      case 'LOW': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Task title" 
                  {...field} 
                  aria-invalid={!!titleError}
                  aria-describedby={titleError ? "title-error" : undefined}
                />
              </FormControl>
              {titleError && (
                <p id="title-error" className="text-sm font-medium text-destructive">
                  {titleError}
                </p>
              )}
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
                  placeholder="Task description" 
                  className="resize-none" 
                  {...field} 
                  aria-invalid={!!descriptionError}
                  aria-describedby={descriptionError ? "description-error" : undefined}
                />
              </FormControl>
              {descriptionError && (
                <p id="description-error" className="text-sm font-medium text-destructive">
                  {descriptionError}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
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
                    <SelectItem value="OPEN">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                        <span>Open</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="IN_PROGRESS">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <span>In Progress</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="BLOCKED">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span>Blocked</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="DONE">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span>Done</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="TRASH">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                        <span>Trash</span>
                      </div>
                    </SelectItem>
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
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LOW">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                        <span>Low</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <span>Medium</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                        <span>High</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="URGENT">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span>Urgent</span>
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
            name="relatedCampaign"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Campaign</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name="assignees"
          render={() => (
            <FormItem>
              <div className="mb-3">
                <FormLabel className="text-base">Assignees</FormLabel>
              </div>
              {usersLoading ? (
                <p className="text-sm text-muted-foreground">Loading users...</p>
              ) : users && users.length > 0 ? (
                <div className="space-y-2">
                  {users.map((user) => {
                    return (
                      <FormField
                        key={user.id}
                        control={form.control}
                        name="assignees"
                        render={({ field }) => {
                          return (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(user.id) || false}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValue, user.id]);
                                  } else {
                                    field.onChange(currentValue.filter((id: string) => id !== user.id));
                                  }
                                }}
                                id={`assignee-${user.id}`}
                              />
                              <Label 
                                htmlFor={`assignee-${user.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {user.name}
                              </Label>
                            </div>
                          );
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No users available</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !!titleError || !!descriptionError}>
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                Saving...
              </>
            ) : (
              'Save Task'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}