import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Post, Campaign } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { 
  Eye, 
  Edit, 
  Trash2 
} from 'lucide-react';

// Helper function to safely parse dates
const safeDateParse = (dateValue: any): Date | null => {
  if (!dateValue) return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) return dateValue;
  
  // If it's a string, try to parse it
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  // If it's a number (timestamp)
  if (typeof dateValue === 'number') {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  // If it's an object with nested properties
  if (typeof dateValue === 'object') {
    // Try common date properties
    if (dateValue._seconds && dateValue._nanoseconds) {
      // Firebase timestamp
      return new Date(dateValue._seconds * 1000);
    }
    if (dateValue.$date) {
      // MongoDB date
      return new Date(dateValue.$date);
    }
  }
  
  return null;
};

// Helper function to normalize dates for comparison (strip time part)
const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

// Helper function to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  return d1.getTime() === d2.getTime();
};

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'post' | 'campaign' | 'campaign-end';
  status?: string;
  platform?: string;
  data: Post | Campaign;
}

interface CalendarGridProps {
  currentDate: Date;
  view: 'month' | 'week' | 'day';
  selectedDate: Date | null;
  calendarEvents: CalendarEvent[];
  onViewPost: (postId: string) => void;
  onEditPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onViewCampaign: (campaignId: string) => void;
  onEditCampaign: (campaign: Campaign) => void;
  onDeleteCampaign: (campaignId: string) => void;
  onDateSelect: (date: Date) => void;
  onChangeView: (view: 'month' | 'week' | 'day') => void; // Add this new prop
}

export function CalendarGrid({
  currentDate,
  view,
  selectedDate,
  calendarEvents,
  onViewPost,
  onEditPost,
  onDeletePost,
  onViewCampaign,
  onEditCampaign,
  onDeleteCampaign,
  onDateSelect,
  onChangeView // Destructure the new prop
}: CalendarGridProps) {
  console.log('CalendarGrid props:', {
    currentDate,
    view,
    selectedDate,
    calendarEvents: calendarEvents.length,
    onViewPost: typeof onViewPost,
    onEditPost: typeof onEditPost,
    onDeletePost: typeof onDeletePost,
    onViewCampaign: typeof onViewCampaign,
    onEditCampaign: typeof onEditCampaign,
    onDeleteCampaign: typeof onDeleteCampaign,
    onDateSelect: typeof onDateSelect,
    onChangeView: typeof onChangeView
  });
  const [showEventDetails, setShowEventDetails] = useState<string | null>(null);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    
    return week;
  };

  const getEventsForDate = (date: Date) => {
    console.log('=== GET EVENTS FOR DATE ===');
    console.log('Target date:', date);
    console.log('All calendar events:', calendarEvents);
    console.log('Number of calendar events:', calendarEvents.length);
    const filteredEvents = calendarEvents.filter(event => {
      // Add validation to ensure event has required fields
      if (!event.id || !event.date) {
        console.error('Event is missing required fields:', event);
        return false;
      }
      
      // Safely parse the event date
      const eventDate = safeDateParse(event.date);
      const targetDate = normalizeDate(date);
      
      // If we can't parse the event date, skip this event
      if (!eventDate) {
        console.error('Could not parse event date:', event.date);
        return false;
      }
      
      // Normalize event date for comparison
      const normalizedEventDate = normalizeDate(eventDate);
      
      // Compare dates by year, month, and day only (ignoring time)
      const isMatch = isSameDay(normalizedEventDate, targetDate);
      
      console.log('Comparing event:', event.title, 'Event date:', normalizedEventDate, 'Target date:', targetDate, 'Match:', isMatch);
      return isMatch;
    });
    console.log('Filtered events for date:', date, 'Events:', filteredEvents);
    console.log('Number of filtered events:', filteredEvents.length);
    console.log('=== END GET EVENTS FOR DATE ===');
    return filteredEvents;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const renderCalendarGrid = () => {
    console.log('=== RENDERING CALENDAR GRID ===');
    console.log('Current date for grid:', currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    console.log('Days in month:', daysInMonth, 'First day:', firstDay);
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const events = getEventsForDate(date);
      console.log(`Day ${day} has ${events.length} events`);
      const isToday = isSameDay(date, new Date());
      const isSelected = selectedDate && isSameDay(date, selectedDate);

      days.push(
        <div
          key={day}
          className={`p-2 min-h-24 border border-border hover:bg-accent/50 transition-colors cursor-pointer ${
            isToday ? 'bg-primary/10 border-primary' : ''
          } ${isSelected ? 'ring-2 ring-primary' : ''}`}
          onClick={() => {
            console.log('Day clicked in calendar grid:', date);
            onDateSelect(date);
            // Switch to day view when clicking on a day in month view
            if (view === 'month') {
              console.log('Switching to day view from month view');
              onChangeView('day');
            }
          }}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
            {day}
          </div>
          <div className="space-y-1">
            {events.slice(0, 3).map((event) => (
              <div 
                key={event.id} 
                className={`text-xs px-1 py-0.5 rounded truncate ${
                  event.type === 'post' ? 'bg-primary/20 text-primary' : 
                  event.type === 'campaign' ? 'bg-success/20 text-success' : 
                  'bg-warning/20 text-warning'
                }`}
              >
                {event.title}
              </div>
            ))}
            {events.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{events.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }
    console.log('=== END RENDERING CALENDAR GRID ===');
    return days;
  };

  console.log('Rendering CalendarGrid with view:', view);
  console.log('Calendar events in CalendarGrid:', calendarEvents);

  const renderWeekView = () => {
    console.log('Rendering week view for date:', currentDate);
    const weekDays = getWeekDays(currentDate);
    return (
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {weekDays.map((day, index) => {
          const events = getEventsForDate(day);
          console.log(`Week day ${index} (${day.toDateString()}) has ${events.length} events`);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          return (
            <div 
              key={index} 
              className={`p-2 min-h-32 border border-border hover:bg-accent/50 transition-colors ${
                isToday ? 'bg-primary/10 border-primary' : ''
              } ${isSelected ? 'ring-2 ring-primary' : ''}`}
              onClick={() => {
                console.log('Day clicked in week view:', day);
                onDateSelect(day);
                // Switch to day view when clicking on a day in week view
                if (view === 'week') {
                  console.log('Switching to day view from week view');
                  onChangeView('day');
                }
              }}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                {dayNames[day.getDay()]}
                <span className={`block text-lg ${isToday ? 'text-primary' : ''}`}>{day.getDate()}</span>
              </div>
              <div className="space-y-1">
                {events.map((event) => (
                  <div 
                    key={event.id} 
                    className={`text-xs px-1 py-0.5 rounded truncate ${
                      event.type === 'post' ? 'bg-primary/20 text-primary' : 
                      event.type === 'campaign' ? 'bg-success/20 text-success' : 
                      'bg-warning/20 text-warning'
                    }`}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const date = selectedDate || currentDate;
    console.log('=== RENDER DAY VIEW ===');
    console.log('Selected date:', selectedDate);
    console.log('Current date:', currentDate);
    console.log('Using date for day view:', date);
    const events = getEventsForDate(date);
    console.log('Day view events:', events);
    console.log('Number of day view events:', events.length);
    console.log('=== END RENDER DAY VIEW ===');
    const isToday = isSameDay(date, new Date());
    
    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${isToday ? 'bg-primary/10' : 'bg-muted/50'}`}>
          <h3 className="text-xl font-semibold">
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          {isToday && <p className="text-sm text-muted-foreground">Today</p>}
        </div>
        
        {events.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No events scheduled for this day</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Card key={event.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge 
                        variant={event.type === 'post' ? 'default' : 'secondary'}
                        className={event.type === 'post' ? 'bg-primary' : 'bg-success'}
                      >
                        {event.type}
                      </Badge>
                    </div>
                    
                    {event.type === 'post' && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span className="capitalize">{(event.data as Post).platform?.toLowerCase()}</span>
                        <span>•</span>
                        <span className="capitalize">{event.status?.toLowerCase().replace('_', ' ')}</span>
                      </div>
                    )}
                    
                    {event.type === 'campaign' && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span className="capitalize">{event.status?.toLowerCase().replace('_', ' ')}</span>
                        <span>•</span>
                        <span>
                          {(event.data as Campaign).start ? new Date((event.data as Campaign).start).toLocaleDateString() : 'N/A'} - {(event.data as Campaign).end ? new Date((event.data as Campaign).end).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    )}
                    
                    {/* Thumbnail for posts */}
                    {event.type === 'post' && (event.data as Post).attachments && (event.data as Post).attachments.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        {(event.data as Post).attachments.slice(0, 3).map((attachment) => (
                          <div key={attachment.id} className="w-12 h-12 rounded border overflow-hidden">
                            {attachment.kind === 'IMAGE' ? (
                              <img 
                                src={attachment.url.startsWith('http') ? attachment.url : `${import.meta.env.VITE_API_BASE_URL || ''}${attachment.url}`} 
                                alt={attachment.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                }}
                              />
                            ) : attachment.kind === 'VIDEO' ? (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <svg className="w-6 h-6 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <svg className="w-6 h-6 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                        {(event.data as Post).attachments.length > 3 && (
                          <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center text-xs">
                            +{(event.data as Post).attachments.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    {event.type === 'post' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewPost((event.data as Post).id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPost((event.data as Post).id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePost((event.data as Post).id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {event.type === 'campaign' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewCampaign((event.data as Campaign).id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditCampaign(event.data as Campaign);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCampaign((event.data as Campaign).id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-background rounded-lg border border-border">
      {view === 'month' && (
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground bg-background">
              {day.substring(0, 3)}
            </div>
          ))}
          {renderCalendarGrid()}
        </div>
      )}
      
      {view === 'week' && renderWeekView()}
      
      {view === 'day' && renderDayView()}
    </div>
  );
}