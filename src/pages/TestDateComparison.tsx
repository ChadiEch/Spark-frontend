import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestDateComparison() {
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Test date comparison logic
    const tests = [];
    
    // Test 1: Same date objects
    const date1 = new Date('2023-01-15T10:30:00');
    const date2 = new Date('2023-01-15T14:45:00');
    
    // Normalize both dates to remove time component
    const normalizedDate1 = new Date(date1);
    const normalizedDate2 = new Date(date2);
    normalizedDate1.setHours(0, 0, 0, 0);
    normalizedDate2.setHours(0, 0, 0, 0);
    
    const isSameDay = normalizedDate1.getTime() === normalizedDate2.getTime();
    
    tests.push({
      name: 'Same day comparison',
      date1: date1.toString(),
      date2: date2.toString(),
      normalizedDate1: normalizedDate1.toString(),
      normalizedDate2: normalizedDate2.toString(),
      result: isSameDay
    });
    
    // Test 2: Different days
    const date3 = new Date('2023-01-15T10:30:00');
    const date4 = new Date('2023-01-16T10:30:00');
    
    const normalizedDate3 = new Date(date3);
    const normalizedDate4 = new Date(date4);
    normalizedDate3.setHours(0, 0, 0, 0);
    normalizedDate4.setHours(0, 0, 0, 0);
    
    const isDifferentDay = normalizedDate3.getTime() === normalizedDate4.getTime();
    
    tests.push({
      name: 'Different day comparison',
      date3: date3.toString(),
      date4: date4.toString(),
      normalizedDate3: normalizedDate3.toString(),
      normalizedDate4: normalizedDate4.toString(),
      result: isDifferentDay
    });
    
    // Test 3: String date parsing
    const dateString = '2023-01-15T00:00:00.000Z';
    const parsedDate = new Date(dateString);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const normalizedParsedDate = new Date(parsedDate);
    normalizedParsedDate.setHours(0, 0, 0, 0);
    
    const isToday = normalizedParsedDate.getTime() === currentDate.getTime();
    
    tests.push({
      name: 'String date parsing',
      dateString,
      parsedDate: parsedDate.toString(),
      currentDate: currentDate.toString(),
      normalizedParsedDate: normalizedParsedDate.toString(),
      result: isToday
    });
    
    setTestResults(tests);
  }, []);

  return (
    <PageLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold">Date Comparison Test</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.map((test, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <h3 className="font-bold">{test.name}</h3>
                <pre className="bg-muted p-2 rounded mt-2">
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