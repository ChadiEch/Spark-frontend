import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestCalendarLogic() {
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Test our calendar logic with sample data
    const tests = [];
    
    // Test 1: Create sample post data
    const samplePost = {
      id: '1',
      title: 'Sample Post',
      scheduledAt: new Date('2023-06-15T10:30:00'),
      status: 'SCHEDULED',
      platform: 'Instagram'
    };
    
    // Test 2: Create sample campaign data
    const sampleCampaign = {
      id: '1',
      name: 'Sample Campaign',
      start: new Date('2023-06-10T00:00:00'),
      end: new Date('2023-06-20T00:00:00'),
      status: 'ACTIVE'
    };
    
    // Test 3: Process post event
    const processPostEvent = () => {
      try {
        const scheduledDate = samplePost.scheduledAt instanceof Date ? samplePost.scheduledAt : new Date(samplePost.scheduledAt);
        const event = {
          id: `post-${samplePost.id}`,
          title: samplePost.title,
          date: scheduledDate,
          type: 'post',
          status: samplePost.status,
          platform: samplePost.platform,
          data: samplePost
        };
        return event;
      } catch (error) {
        return { error: error.message };
      }
    };
    
    // Test 4: Process campaign events
    const processCampaignEvents = () => {
      try {
        const startDate = sampleCampaign.start instanceof Date ? sampleCampaign.start : new Date(sampleCampaign.start);
        const endDate = sampleCampaign.end instanceof Date ? sampleCampaign.end : new Date(sampleCampaign.end);
        
        const startEvent = {
          id: `campaign-${sampleCampaign.id}`,
          title: sampleCampaign.name,
          date: startDate,
          type: 'campaign',
          status: sampleCampaign.status,
          data: sampleCampaign
        };
        
        const endEvent = {
          id: `campaign-end-${sampleCampaign.id}`,
          title: `${sampleCampaign.name} ends`,
          date: endDate,
          type: 'campaign-end',
          status: sampleCampaign.status,
          data: sampleCampaign
        };
        
        return [startEvent, endEvent];
      } catch (error) {
        return { error: error.message };
      }
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
    const postEvent = processPostEvent();
    const campaignEvents = processCampaignEvents();
    
    tests.push({
      name: 'Sample Post Data',
      data: samplePost
    });
    
    tests.push({
      name: 'Sample Campaign Data',
      data: sampleCampaign
    });
    
    tests.push({
      name: 'Processed Post Event',
      data: postEvent
    });
    
    tests.push({
      name: 'Processed Campaign Events',
      data: campaignEvents
    });
    
    // Test date comparison
    const targetDate = new Date('2023-06-15T00:00:00');
    const eventDate = new Date('2023-06-15T10:30:00');
    const isSameDay = testDateComparison(eventDate, targetDate);
    
    tests.push({
      name: 'Date Comparison Test',
      targetDate: targetDate.toString(),
      eventDate: eventDate.toString(),
      isSameDay: isSameDay
    });
    
    setTestResults(tests);
  }, []);

  return (
    <PageLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">Calendar Logic Test</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.map((test, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <h3 className="font-bold">{test.name}</h3>
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