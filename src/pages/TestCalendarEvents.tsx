import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestCalendarEvents() {
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Test our calendar events logic
    const tests = [];
    
    // Create sample events with different date formats
    const sampleEvents = [
      {
        id: 'post-1',
        title: 'Sample Post 1',
        date: new Date('2023-06-15T10:30:00'),
        type: 'post',
        status: 'SCHEDULED',
        platform: 'Instagram'
      },
      {
        id: 'post-2',
        title: 'Sample Post 2',
        date: new Date('2023-06-15T14:45:00'),
        type: 'post',
        status: 'SCHEDULED',
        platform: 'Facebook'
      },
      {
        id: 'campaign-1',
        title: 'Sample Campaign 1',
        date: new Date('2023-06-10T00:00:00'),
        type: 'campaign',
        status: 'ACTIVE'
      },
      {
        id: 'campaign-end-1',
        title: 'Sample Campaign 1 ends',
        date: new Date('2023-06-20T00:00:00'),
        type: 'campaign-end',
        status: 'ACTIVE'
      }
    ];
    
    tests.push({
      name: 'Sample Events',
      data: sampleEvents
    });
    
    // Test date filtering logic
    const targetDate = new Date('2023-06-15T00:00:00');
    console.log('Target date for filtering:', targetDate);
    
    const filteredEvents = sampleEvents.filter(event => {
      // Create date objects for comparison
      const eventDate = new Date(event.date);
      const targetDateObj = new Date(targetDate);
      
      // Normalize both dates to remove time component
      eventDate.setHours(0, 0, 0, 0);
      targetDateObj.setHours(0, 0, 0, 0);
      
      // Compare dates
      const isMatch = eventDate.getTime() === targetDateObj.getTime();
      console.log('Comparing event:', event.title, 'Event date:', eventDate, 'Target date:', targetDateObj, 'Match:', isMatch);
      
      return isMatch;
    });
    
    tests.push({
      name: 'Filtered Events for 2023-06-15',
      targetDate: targetDate.toString(),
      filteredEvents: filteredEvents,
      count: filteredEvents.length
    });
    
    // Test with different target date
    const targetDate2 = new Date('2023-06-10T00:00:00');
    console.log('Target date 2 for filtering:', targetDate2);
    
    const filteredEvents2 = sampleEvents.filter(event => {
      // Create date objects for comparison
      const eventDate = new Date(event.date);
      const targetDateObj = new Date(targetDate2);
      
      // Normalize both dates to remove time component
      eventDate.setHours(0, 0, 0, 0);
      targetDateObj.setHours(0, 0, 0, 0);
      
      // Compare dates
      const isMatch = eventDate.getTime() === targetDateObj.getTime();
      console.log('Comparing event:', event.title, 'Event date:', eventDate, 'Target date:', targetDateObj, 'Match:', isMatch);
      
      return isMatch;
    });
    
    tests.push({
      name: 'Filtered Events for 2023-06-10',
      targetDate: targetDate2.toString(),
      filteredEvents: filteredEvents2,
      count: filteredEvents2.length
    });
    
    setTestResults(tests);
  }, []);

  return (
    <PageLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">Calendar Events Test</h1>
        <p>This test verifies that our calendar events filtering logic works correctly.</p>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.map((test, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <h3 className="font-bold">{test.name}</h3>
                <p>Count: {test.count !== undefined ? test.count : 'N/A'}</p>
                <p>Target Date: {test.targetDate || 'N/A'}</p>
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