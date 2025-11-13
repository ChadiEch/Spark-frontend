import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestDateLogic() {
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Test our date logic with sample data
    const tests = [];
    
    // Test 1: Create sample post data with different date formats
    const samplePosts = [
      {
        id: '1',
        title: 'Sample Post 1',
        scheduledAt: new Date('2023-06-15T10:30:00'),
        status: 'SCHEDULED',
        platform: 'Instagram'
      },
      {
        id: '2',
        title: 'Sample Post 2',
        scheduledAt: '2023-06-15T14:45:00',
        status: 'SCHEDULED',
        platform: 'Facebook'
      },
      {
        id: '3',
        title: 'Sample Post 3',
        scheduledAt: new Date('2023-06-16T09:15:00'),
        status: 'SCHEDULED',
        platform: 'Twitter'
      }
    ];
    
    // Test 2: Create sample campaign data
    const sampleCampaigns = [
      {
        id: '1',
        name: 'Sample Campaign 1',
        start: new Date('2023-06-10T00:00:00'),
        end: new Date('2023-06-20T00:00:00'),
        status: 'ACTIVE'
      },
      {
        id: '2',
        name: 'Sample Campaign 2',
        start: '2023-06-15T00:00:00',
        end: '2023-06-25T00:00:00',
        status: 'ACTIVE'
      }
    ];
    
    // Test 3: Process post events
    const processPostEvents = () => {
      const events = [];
      samplePosts.forEach((post, index) => {
        try {
          const scheduledDate = post.scheduledAt instanceof Date ? post.scheduledAt : new Date(post.scheduledAt);
          if (!isNaN(scheduledDate.getTime())) {
            const event = {
              id: `post-${post.id}`,
              title: post.title,
              date: scheduledDate,
              type: 'post',
              status: post.status,
              platform: post.platform,
              data: post
            };
            events.push(event);
          }
        } catch (error) {
          console.error(`Error processing post ${index + 1}:`, error);
        }
      });
      return events;
    };
    
    // Test 4: Process campaign events
    const processCampaignEvents = () => {
      const events = [];
      sampleCampaigns.forEach((campaign, index) => {
        try {
          const startDate = campaign.start instanceof Date ? campaign.start : new Date(campaign.start);
          const endDate = campaign.end instanceof Date ? campaign.end : new Date(campaign.end);
          
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const startEvent = {
              id: `campaign-${campaign.id}`,
              title: campaign.name,
              date: startDate,
              type: 'campaign',
              status: campaign.status,
              data: campaign
            };
            events.push(startEvent);
            
            const endEvent = {
              id: `campaign-end-${campaign.id}`,
              title: `${campaign.name} ends`,
              date: endDate,
              type: 'campaign-end',
              status: campaign.status,
              data: campaign
            };
            events.push(endEvent);
          }
        } catch (error) {
          console.error(`Error processing campaign ${index + 1}:`, error);
        }
      });
      return events;
    };
    
    // Test 5: Date comparison logic
    const testDateComparison = (eventDate: Date, targetDate: Date) => {
      const normalizedEventDate = new Date(eventDate);
      const normalizedTargetDate = new Date(targetDate);
      normalizedEventDate.setHours(0, 0, 0, 0);
      normalizedTargetDate.setHours(0, 0, 0, 0);
      return normalizedEventDate.getTime() === normalizedTargetDate.getTime();
    };
    
    // Run tests
    tests.push({
      name: 'Sample Posts Data',
      data: samplePosts
    });
    
    tests.push({
      name: 'Sample Campaigns Data',
      data: sampleCampaigns
    });
    
    const postEvents = processPostEvents();
    tests.push({
      name: 'Processed Post Events',
      data: postEvents
    });
    
    const campaignEvents = processCampaignEvents();
    tests.push({
      name: 'Processed Campaign Events',
      data: campaignEvents
    });
    
    const allEvents = [...postEvents, ...campaignEvents];
    tests.push({
      name: 'All Events',
      data: allEvents,
      count: allEvents.length
    });
    
    // Test date comparison for a specific date
    const targetDate = new Date('2023-06-15T00:00:00');
    const filteredEvents = allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return testDateComparison(eventDate, targetDate);
    });
    
    tests.push({
      name: 'Events for 2023-06-15',
      targetDate: targetDate.toString(),
      filteredEvents: filteredEvents,
      count: filteredEvents.length
    });
    
    setTestResults(tests);
  }, []);

  return (
    <PageLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">Date Logic Test</h1>
        <p>This test verifies that our date processing and comparison logic works correctly.</p>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.map((test, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <h3 className="font-bold">{test.name}</h3>
                <p>Count: {test.count !== undefined ? test.count : 'N/A'}</p>
                <pre className="bg-muted p-2 rounded mt-2 max-h-60 overflow-auto">
                  {JSON.stringify(test, null, 2)}
                </pre>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}